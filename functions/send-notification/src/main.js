/**
 * @function send-notification
 * @description Generic transactional email dispatcher. Loads a template from
 *   notification_templates by key, renders {{placeholder}} tokens with the
 *   provided vars, and sends via the configured email provider (Resend or SMTP).
 *   Called server-side from other Functions — never directly from the client.
 *
 * @trigger HTTP POST — server-side only, requires x-appwrite-key header
 *
 * @input {Object} payload
 * @input {string}  payload.templateKey      - notification_templates.key value
 * @input {string}  payload.recipientEmail   - destination email address
 * @input {string}  [payload.recipientName]  - used in {{customerName}} if not in vars
 * @input {string}  [payload.language]       - "en" | "es" | "auto" (default "auto")
 * @input {string}  [payload.userId]         - preferred user ID to resolve language automatically
 * @input {string}  [payload.orderId]        - preferred order ID to resolve language automatically
 * @input {Object}  [payload.vars]           - template variable overrides
 *
 * @output {Object} { ok: true, data: { sent: true } }
 *
 * @errors
 * - 400 ERR_NOTIF_MISSING_TEMPLATE_KEY - templateKey not provided
 * - 400 ERR_NOTIF_INVALID_EMAIL        - recipientEmail is not a valid address
 * - 404 ERR_NOTIF_TEMPLATE_NOT_FOUND   - no active template with the given key
 * - 500 ERR_NOTIF_SEND_FAILED          - email dispatch failed (non-blocking, logged)
 * - 500 ERR_NOTIF_INTERNAL             - unexpected error
 *
 * @envVars
 * - APPWRITE_FUNCTION_API_ENDPOINT (built-in)
 * - APPWRITE_FUNCTION_PROJECT_ID   (built-in)
 * - x-appwrite-key header          (runtime)
 * - APPWRITE_DATABASE_ID
 * - APPWRITE_COLLECTION_NOTIFICATION_TEMPLATES
 * - EMAIL_PROVIDER  (resend | smtp)
 * - EMAIL_FROM
 * - RESEND_API_KEY  (if provider=resend)
 * - SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS (if provider=smtp)
 * - FRONTEND_URL  (used as {{portalUrl}} fallback)
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

function escapeHtml(str) {
  if (typeof str !== "string") return String(str ?? "");
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderTemplate(template, vars) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const val = vars[key];
    return val !== undefined ? escapeHtml(val) : `{{${key}}}`;
  });
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

async function resolveNotificationLanguage({
  db,
  databaseId,
  profilesCollection,
  ordersCollection,
  explicitLanguage,
  userId,
  orderId,
}) {
  const normalizedExplicit = normalizeLanguage(explicitLanguage);
  if (normalizedExplicit) return normalizedExplicit;

  let resolvedUserId = userId || null;
  if (orderId) {
    try {
      const order = await db.getDocument(databaseId, ordersCollection, orderId);
      resolvedUserId = resolvedUserId || order.userId || null;

      const direct = normalizeLanguage(
        order.customerLanguage || order.language,
      );
      if (direct) return direct;

      const fromSnapshot = extractLanguageFromSnapshot(order.snapshot);
      if (fromSnapshot) return fromSnapshot;
    } catch {
      // Order lookup is optional for auto mode.
    }
  }

  if (!resolvedUserId) return "en";

  try {
    const profile = await db.getDocument(
      databaseId,
      profilesCollection,
      resolvedUserId,
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
        [Query.equal("userId", resolvedUserId), Query.limit(1)],
      );
      if (profilesRes.documents.length > 0) {
        const profileLanguage = normalizeLanguage(
          profilesRes.documents[0].language || profilesRes.documents[0].locale,
        );
        if (profileLanguage) return profileLanguage;
      }
    } catch {
      // No profile — default EN.
    }
  }

  return "en";
}

// ─── Main handler ─────────────────────────────────────────────────────────────

export default async ({ req, res, log, error }) => {
  if (req.method !== "POST") {
    return res.json(
      { ok: false, error: { code: "ERR_NOTIF_METHOD", message: "POST only" } },
      405,
    );
  }

  const client = initClient(req);
  const db = new Databases(client);

  const DB = process.env.APPWRITE_DATABASE_ID || "omzone_db";
  const COL_ORDERS = process.env.APPWRITE_COLLECTION_ORDERS || "orders";
  const COL_USER_PROFILES =
    process.env.APPWRITE_COLLECTION_USER_PROFILES || "user_profiles";
  const COL_TEMPLATES =
    process.env.APPWRITE_COLLECTION_NOTIFICATION_TEMPLATES ||
    "notification_templates";
  const executionId = req.headers["x-appwrite-execution-id"] || "unknown";
  const trigger = req.headers["x-appwrite-trigger"] || "http";
  const callerUserId = req.headers["x-appwrite-user-id"] || null;

  try {
    // ── 1. Parse and validate input ─────────────────────────────────────────
    let body;
    try {
      body =
        typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    } catch {
      body = {};
    }

    const {
      templateKey,
      recipientEmail,
      recipientName = "",
      language = "auto",
      userId = null,
      orderId = null,
      vars: inputVars = {},
    } = body;

    log(
      `send-notification invoked for template ${templateKey || "unknown"} ` +
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
              code: "ERR_NOTIF_UNAUTHORIZED",
              message: "Insufficient permissions",
            },
          },
          403,
        );
      }
    }

    if (!templateKey || typeof templateKey !== "string") {
      return res.json(
        {
          ok: false,
          error: {
            code: "ERR_NOTIF_MISSING_TEMPLATE_KEY",
            message: "templateKey is required",
          },
        },
        400,
      );
    }

    if (!recipientEmail || !EMAIL_RE.test(recipientEmail)) {
      return res.json(
        {
          ok: false,
          error: {
            code: "ERR_NOTIF_INVALID_EMAIL",
            message: "recipientEmail must be a valid email address",
          },
        },
        400,
      );
    }

    const resolvedLanguage = await resolveNotificationLanguage({
      db,
      databaseId: DB,
      profilesCollection: COL_USER_PROFILES,
      ordersCollection: COL_ORDERS,
      explicitLanguage: language,
      userId,
      orderId,
    });
    const useSpanish = resolvedLanguage.startsWith("es");

    // ── 2. Load template ────────────────────────────────────────────────────
    const tplRes = await db.listDocuments(DB, COL_TEMPLATES, [
      Query.equal("key", templateKey),
      Query.equal("type", "email"),
      Query.equal("isActive", true),
      Query.limit(1),
    ]);

    if (tplRes.documents.length === 0) {
      log(`WARN: No active template found for key="${templateKey}"`);
      return res.json(
        {
          ok: false,
          error: {
            code: "ERR_NOTIF_TEMPLATE_NOT_FOUND",
            message: `Template "${templateKey}" not found or inactive`,
          },
        },
        404,
      );
    }

    const tpl = tplRes.documents[0];
    const subject = useSpanish && tpl.subjectEs ? tpl.subjectEs : tpl.subject;
    const bodyTpl = useSpanish && tpl.bodyEs ? tpl.bodyEs : tpl.body;

    // ── 3. Build vars ───────────────────────────────────────────────────────
    // Generate QR if ticketCode is provided in vars
    let qrDataUrl = inputVars.qrDataUrl || "";
    let qrAttachments = [];
    if (!qrDataUrl && inputVars.ticketCode) {
      try {
        const qrAsset = await buildInlineQrAttachment(inputVars.ticketCode);
        qrDataUrl = qrAsset.qrImageSrc;
        qrAttachments = qrAsset.attachments;
      } catch (qrErr) {
        log(`WARN: QR generation failed: ${qrErr.message}`);
      }
    }

    const vars = {
      customerName: recipientName,
      portalUrl: process.env.FRONTEND_URL || "https://omzone.com",
      ...inputVars,
      qrDataUrl,
      qrImageSrc: qrDataUrl,
    };

    const renderedSubject = renderTemplate(subject, vars);
    const renderedBody = renderTemplate(bodyTpl, vars);

    // ── 4. Send ─────────────────────────────────────────────────────────────
    const emailFrom = process.env.EMAIL_FROM || "OMZONE <noreply@omzone.com>";

    try {
      await sendEmail({
        to: recipientEmail,
        from: emailFrom,
        subject: renderedSubject,
        html: renderedBody,
        attachments: qrAttachments,
        idempotencyKey: `${templateKey}-${orderId || recipientEmail}`,
        log,
      });

      log(
        `Notification "${templateKey}" sent to ${recipientEmail} ` +
          `(execution: ${executionId})`,
      );
      return res.json({ ok: true, data: { sent: true } });
    } catch (sendErr) {
      error(
        `Email send failed for template="${templateKey}" to ${recipientEmail} ` +
          `(execution: ${executionId}): ${sendErr.message}`,
      );
      return res.json({
        ok: true,
        data: { sent: false, reason: sendErr.message },
      });
    }
  } catch (err) {
    error(
      `send-notification failed (execution: ${executionId}): ${err.message}`,
    );
    return res.json(
      {
        ok: false,
        error: { code: "ERR_NOTIF_INTERNAL", message: "Internal error" },
      },
      500,
    );
  }
};
