/**
 * @function send-confirmation
 * @description Sends an order confirmation email to the customer after tickets
 *   are generated. Reads order, items, tickets and the notification template,
 *   then dispatches the email via the configured provider (Resend or SMTP).
 *   Failures are logged but never block the transactional flow.
 * @trigger HTTP POST — invoked server-side from generate-ticket
 *
 * @input {Object} payload
 * @input {string} payload.orderId - ID of the paid order
 *
 * @output {Object} { ok: true, data: { sent: true } }
 *
 * @errors
 * - 400 ERR_CONFIRM_MISSING_ORDER   — orderId not provided
 * - 404 ERR_CONFIRM_ORDER_NOT_FOUND — order does not exist
 * - 412 ERR_CONFIRM_ORDER_NOT_PAID  — order is not in paid/confirmed state
 * - 422 ERR_CONFIRM_NO_TEMPLATE     — notification template not found or inactive
 * - 500 ERR_CONFIRM_SEND_FAILED     — email dispatch failed (logged, non-blocking)
 * - 500 ERR_CONFIRM_INTERNAL        — unexpected error
 *
 * @idempotent No — sending the same orderId twice will send two emails.
 *   Callers should guard against duplicate invocations.
 *
 * @entities
 * - Reads: orders, order_items, tickets, notification_templates, user_profiles
 *
 * @envVars
 * - APPWRITE_FUNCTION_API_ENDPOINT (built-in)
 * - APPWRITE_FUNCTION_PROJECT_ID   (built-in)
 * - x-appwrite-key header          (runtime)
 * - APPWRITE_DATABASE_ID
 * - APPWRITE_COLLECTION_ORDERS
 * - APPWRITE_COLLECTION_ORDER_ITEMS
 * - APPWRITE_COLLECTION_TICKETS
 * - APPWRITE_COLLECTION_NOTIFICATION_TEMPLATES
 * - APPWRITE_COLLECTION_USER_PROFILES
 * - EMAIL_PROVIDER  (resend | smtp)
 * - EMAIL_FROM
 * - RESEND_API_KEY  (if provider=resend)
 * - SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS (if provider=smtp)
 */

import { Client, Databases, Query, Users } from "node-appwrite";
import QRCode from "qrcode";
import nodemailer from "nodemailer";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function normalizeLanguage(value) {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toLowerCase();
  return normalized.startsWith("es")
    ? "es"
    : normalized.startsWith("en")
      ? "en"
      : null;
}

function extractLanguageFromSnapshot(snapshotJson) {
  if (!snapshotJson) return null;
  try {
    const snapshot = JSON.parse(snapshotJson);
    return normalizeLanguage(
      snapshot.customerLanguage || snapshot.language || snapshot.locale,
    );
  } catch {
    return null;
  }
}

function buildQrContentId(text) {
  const suffix =
    String(text || "ticket")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "ticket";
  return `ticket-qr-${suffix}@omzone`;
}

/** Build an inline PNG attachment so email clients can render the QR via cid:. */
async function buildInlineQrAttachment(text) {
  const contentId = buildQrContentId(text);
  const pngBase64 = (
    await QRCode.toBuffer(text, {
      type: "png",
      width: 220,
      margin: 2,
    })
  ).toString("base64");

  return {
    qrImageSrc: `cid:${contentId}`,
    attachments: [
      {
        filename: `${text}.png`,
        content: pngBase64,
        contentType: "image/png",
        contentId,
      },
    ],
  };
}

function initClient(req) {
  let endpoint = process.env.APPWRITE_FUNCTION_API_ENDPOINT;
  if (endpoint && endpoint.startsWith("http://")) {
    endpoint = endpoint.replace("http://", "https://");
  }
  return new Client()
    .setEndpoint(endpoint)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setSelfSigned(true)
    .setKey(req.headers["x-appwrite-key"]);
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Escape HTML to prevent injection via placeholder values. */
function escapeHtml(str) {
  if (typeof str !== "string") return String(str ?? "");
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Replace {{placeholder}} tokens in a template string. */
function renderTemplate(template, vars) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const val = vars[key];
    return val !== undefined ? escapeHtml(val) : `{{${key}}}`;
  });
}

function formatCurrency(amount, currency) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
}

function formatDatetime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── Email senders ────────────────────────────────────────────────────────────

async function sendViaResend({
  to,
  from,
  subject,
  html,
  attachments = [],
  idempotencyKey,
  log,
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY is not configured");

  const payload = {
    from,
    to: [to],
    subject,
    html,
  };
  if (attachments.length > 0) payload.attachments = attachments;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`Resend API ${response.status}: ${errBody}`);
  }

  const data = await response.json();
  log(`Email sent via Resend: id=${data.id}`);
  return data;
}

async function sendViaSmtp({ to, from, subject, html, attachments = [], log }) {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "465", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass)
    throw new Error(
      "SMTP credentials not configured (SMTP_HOST, SMTP_USER, SMTP_PASS)",
    );

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  // Map attachment format: Resend uses contentId, nodemailer uses cid
  const mailAttachments = attachments.map((a) => ({
    filename: a.filename,
    content: Buffer.from(a.content, "base64"),
    contentType: a.contentType,
    cid: a.contentId || a.cid,
  }));

  const info = await transporter.sendMail({
    from,
    to,
    subject,
    html,
    attachments: mailAttachments.length > 0 ? mailAttachments : undefined,
  });

  log(`Email sent via SMTP: messageId=${info.messageId} to=${to}`);
  return info;
}

async function sendEmail({
  to,
  from,
  subject,
  html,
  attachments = [],
  idempotencyKey,
  log,
}) {
  const provider = (process.env.EMAIL_PROVIDER || "resend").toLowerCase();
  if (provider === "resend")
    return sendViaResend({
      to,
      from,
      subject,
      html,
      attachments,
      idempotencyKey,
      log,
    });
  if (provider === "smtp")
    return sendViaSmtp({ to, from, subject, html, attachments, log });
  throw new Error(`Unknown EMAIL_PROVIDER: ${provider}`);
}

async function resolveOrderLanguage({
  db,
  databaseId,
  profilesCollection,
  order,
}) {
  const direct = normalizeLanguage(order.customerLanguage || order.language);
  if (direct) return direct;

  const snapshotLanguage = extractLanguageFromSnapshot(order.snapshot);
  if (snapshotLanguage) return snapshotLanguage;

  if (!order.userId) return "en";

  try {
    const profile = await db.getDocument(
      databaseId,
      profilesCollection,
      order.userId,
    );
    const profileLanguage = normalizeLanguage(
      profile.language || profile.locale,
    );
    if (profileLanguage) return profileLanguage;
  } catch {
    try {
      const profilesRes = await db.listDocuments(
        databaseId,
        profilesCollection,
        [Query.equal("userId", order.userId), Query.limit(1)],
      );
      if (profilesRes.documents.length > 0) {
        const profileLanguage = normalizeLanguage(
          profilesRes.documents[0].language || profilesRes.documents[0].locale,
        );
        if (profileLanguage) return profileLanguage;
      }
    } catch {
      // No profile — default EN
    }
  }

  return "en";
}

// ─── Main handler ─────────────────────────────────────────────────────────────

export default async ({ req, res, log, error }) => {
  if (req.method !== "POST") {
    return res.json(
      {
        ok: false,
        error: { code: "ERR_CONFIRM_METHOD", message: "POST only" },
      },
      405,
    );
  }

  const client = initClient(req);
  const db = new Databases(client);

  const DB = process.env.APPWRITE_DATABASE_ID || "omzone_db";
  const COL_ORDERS = process.env.APPWRITE_COLLECTION_ORDERS || "orders";
  const COL_ORDER_ITEMS =
    process.env.APPWRITE_COLLECTION_ORDER_ITEMS || "order_items";
  const COL_TICKETS = process.env.APPWRITE_COLLECTION_TICKETS || "tickets";
  const COL_TEMPLATES =
    process.env.APPWRITE_COLLECTION_NOTIFICATION_TEMPLATES ||
    "notification_templates";
  const COL_USER_PROFILES =
    process.env.APPWRITE_COLLECTION_USER_PROFILES || "user_profiles";
  const COL_LOCATIONS =
    process.env.APPWRITE_COLLECTION_LOCATIONS || "locations";
  const executionId = req.headers["x-appwrite-execution-id"] || "unknown";
  const trigger = req.headers["x-appwrite-trigger"] || "http";
  const callerUserId = req.headers["x-appwrite-user-id"] || null;

  try {
    // ── 1. Parse input ──────────────────────────────────────────────────────
    let body;
    try {
      body = JSON.parse(req.body || "{}");
    } catch {
      return res.json(
        {
          ok: false,
          error: {
            code: "ERR_CONFIRM_INVALID_JSON",
            message: "Request body must be valid JSON",
          },
        },
        400,
      );
    }

    const { orderId } = body;

    if (!orderId || typeof orderId !== "string") {
      return res.json(
        {
          ok: false,
          error: {
            code: "ERR_CONFIRM_MISSING_ORDER",
            message: "orderId is required",
          },
        },
        400,
      );
    }

    log(
      `send-confirmation invoked for order ${orderId} ` +
        `(execution: ${executionId}, trigger: ${trigger}, caller: ${callerUserId || "server"})`,
    );

    if (callerUserId) {
      const users = new Users(client);
      const caller = await users.get(callerUserId);
      const labels = caller.labels || [];

      if (!labels.includes("admin") && !labels.includes("root")) {
        return res.json(
          {
            ok: false,
            error: {
              code: "ERR_CONFIRM_UNAUTHORIZED",
              message: "Insufficient permissions",
            },
          },
          403,
        );
      }
    }

    // ── 2. Fetch order ──────────────────────────────────────────────────────
    let order;
    try {
      order = await db.getDocument(DB, COL_ORDERS, orderId);
    } catch {
      return res.json(
        {
          ok: false,
          error: {
            code: "ERR_CONFIRM_ORDER_NOT_FOUND",
            message: "Order not found",
          },
        },
        404,
      );
    }

    // ── 3. Verify order is paid/confirmed ───────────────────────────────────
    if (order.status !== "paid" && order.status !== "confirmed") {
      return res.json(
        {
          ok: false,
          error: {
            code: "ERR_CONFIRM_ORDER_NOT_PAID",
            message: "Order is not paid",
          },
        },
        412,
      );
    }

    const customerEmail = order.customerEmail;
    if (!customerEmail || !EMAIL_RE.test(customerEmail)) {
      log(`WARN: Order ${orderId} has no valid customerEmail — skipping send`);
      return res.json({
        ok: true,
        data: { sent: false, reason: "no_valid_email" },
      });
    }

    // ── 4. Fetch order items ────────────────────────────────────────────────
    const itemsRes = await db.listDocuments(DB, COL_ORDER_ITEMS, [
      Query.equal("orderId", orderId),
      Query.limit(50),
    ]);
    const items = itemsRes.documents;

    // ── 5. Fetch tickets for this order ─────────────────────────────────────
    const ticketsRes = await db.listDocuments(DB, COL_TICKETS, [
      Query.equal("orderId", orderId),
      Query.limit(100),
    ]);
    const tickets = ticketsRes.documents;

    // ── 5a. Generate QR code from first ticket ──────────────────────────────
    let qrDataUrl = "";
    let qrAttachments = [];
    if (tickets.length > 0 && tickets[0].ticketCode) {
      try {
        const qrAsset = await buildInlineQrAttachment(tickets[0].ticketCode);
        qrDataUrl = qrAsset.qrImageSrc;
        qrAttachments = qrAsset.attachments;
      } catch (qrErr) {
        log(`WARN: QR generation failed: ${qrErr.message}`);
      }
    }
    // TODO: multi-QR pending decision — currently only first ticket QR is embedded

    // ── 6. Determine user language ──────────────────────────────────────────
    const language = await resolveOrderLanguage({
      db,
      databaseId: DB,
      profilesCollection: COL_USER_PROFILES,
      order,
    });

    const useSpanish = language.startsWith("es");

    // ── 7. Fetch email template ─────────────────────────────────────────────
    const templatesRes = await db.listDocuments(DB, COL_TEMPLATES, [
      Query.equal("key", "order-confirmation"),
      Query.equal("type", "email"),
      Query.equal("isActive", true),
      Query.limit(1),
    ]);

    if (templatesRes.documents.length === 0) {
      log(
        "WARN: No active order-confirmation email template found — skipping send",
      );
      return res.json(
        {
          ok: false,
          error: {
            code: "ERR_CONFIRM_NO_TEMPLATE",
            message: "Template not found",
          },
        },
        422,
      );
    }

    const tpl = templatesRes.documents[0];

    // Select localized version, fall back to EN if ES is empty
    const subject = useSpanish && tpl.subjectEs ? tpl.subjectEs : tpl.subject;
    const bodyTpl = useSpanish && tpl.bodyEs ? tpl.bodyEs : tpl.body;

    if (!subject || !bodyTpl) {
      log("WARN: Template has empty subject or body — skipping send");
      return res.json(
        {
          ok: false,
          error: {
            code: "ERR_CONFIRM_NO_TEMPLATE",
            message: "Template body is empty",
          },
        },
        422,
      );
    }

    // ── 8. Build template variables ─────────────────────────────────────────
    // Extract experience names and slot dates from order snapshot or items
    const experienceNames = [];
    const slotDates = [];
    const locationNames = [];
    let firstSlotId = null;

    for (const item of items) {
      try {
        const snap = JSON.parse(item.itemSnapshot || "{}");
        if (snap.experienceName) experienceNames.push(snap.experienceName);
        if (snap.slotStartDatetime)
          slotDates.push(formatDatetime(snap.slotStartDatetime));
        if (snap.locationName) locationNames.push(snap.locationName);
        if (!firstSlotId && snap.slotId) firstSlotId = snap.slotId;
        if (!firstSlotId && snap.locationId) {
          // Try to fetch location by ID from snapshot
          try {
            const locDoc = await db.getDocument(
              DB,
              COL_LOCATIONS,
              snap.locationId,
            );
            if (locDoc.name && !locationNames.includes(locDoc.name)) {
              locationNames.push(locDoc.name);
            }
          } catch {
            /* location fetch failed — non-critical */
          }
        }
      } catch {
        // Snapshot parse failed — skip
      }
    }

    // Fallback: try order-level snapshot
    if (experienceNames.length === 0) {
      try {
        const orderSnap = JSON.parse(order.snapshot || "{}");
        if (orderSnap.items) {
          orderSnap.items.forEach((i) => {
            if (i.name) experienceNames.push(i.name);
          });
        }
      } catch {
        // Ignore
      }
    }

    const ticketCodes = tickets.map((t) => t.ticketCode).join(", ");

    const vars = {
      orderNumber: order.orderNumber,
      customerName: order.customerName || "",
      experienceName: experienceNames.join(", ") || "—",
      date: slotDates.length > 0 ? slotDates[0] : "",
      time: "",
      location: locationNames.length > 0 ? locationNames[0] : "",
      ticketCodes: ticketCodes || "—",
      ticketCode: tickets.length > 0 ? tickets[0].ticketCode : "—",
      totalAmount: formatCurrency(order.totalAmount, order.currency || "MXN"),
      currency: order.currency || "MXN",
      qrDataUrl,
      qrImageSrc: qrDataUrl,
      portalUrl: process.env.FRONTEND_URL || "https://omzone.com",
    };

    const renderedSubject = renderTemplate(subject, vars);
    const renderedBody = renderTemplate(bodyTpl, vars);

    // ── 9. Send email ───────────────────────────────────────────────────────
    const emailFrom = process.env.EMAIL_FROM || "OMZONE <noreply@omzone.com>";

    try {
      await sendEmail({
        to: customerEmail,
        from: emailFrom,
        subject: renderedSubject,
        html: renderedBody,
        attachments: qrAttachments,
        idempotencyKey: `order-confirmation-${orderId}`,
        log,
      });

      log(
        `Confirmation email sent for order ${orderId} to ${customerEmail} ` +
          `(execution: ${executionId})`,
      );
      return res.json({ ok: true, data: { sent: true } });
    } catch (sendErr) {
      // Email failure must NOT block the transactional flow
      error(
        `Email send failed for order ${orderId} ` +
          `(execution: ${executionId}): ${sendErr.message}`,
      );
      return res.json({
        ok: true,
        data: { sent: false, reason: sendErr.message },
      });
    }
  } catch (err) {
    error(
      `send-confirmation failed (execution: ${executionId}): ${err.message}`,
    );
    return res.json(
      {
        ok: false,
        error: { code: "ERR_CONFIRM_INTERNAL", message: "Internal error" },
      },
      500,
    );
  }
};
