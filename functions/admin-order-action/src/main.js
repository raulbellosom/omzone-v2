import { Client, Databases, Functions, ID, Query, Users } from "node-appwrite";
import nodemailer from "nodemailer";

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

async function assertAdmin(users, userId) {
  if (!userId) {
    const err = new Error("Authentication required");
    err.status = 401;
    throw err;
  }

  const user = await users.get(userId);
  const labels = user.labels || [];
  if (!labels.includes("admin") && !labels.includes("root")) {
    const err = new Error("Only admin users can manage order actions");
    err.status = 403;
    throw err;
  }
}

async function trigger(functions, functionId, payload, log, error) {
  try {
    await functions.createExecution(functionId, JSON.stringify(payload), true);
    log(`Triggered ${functionId} for order ${payload.orderId}`);
  } catch (err) {
    error(`Failed to trigger ${functionId}: ${err.message}`);
  }
}

async function createManualPayment(db, DB, COL_PAYMENTS, order, actorUserId) {
  await db.createDocument(DB, COL_PAYMENTS, ID.unique(), {
    orderId: order.$id,
    amount: Number(order.totalAmount || 0),
    currency: (order.currency || "MXN").toUpperCase(),
    status: "succeeded",
    method: "manual",
    metadata: JSON.stringify({
      eventType: "admin_manual_payment",
      orderId: order.$id,
      orderNumber: order.orderNumber,
      actorUserId,
      registeredAt: new Date().toISOString(),
    }),
  });
}

/** Escape HTML to prevent injection in email templates. */
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

function formatCurrencyAdmin(amount, currency) {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
}

/**
 * Re-send the Stripe payment link email. Fire-and-forget; never throws.
 */
async function sendPaymentLinkEmailAdmin({
  db,
  DB,
  customerEmail,
  customerName,
  orderNumber,
  experienceName,
  totalAmount,
  currency,
  paymentLinkUrl,
  expiresAt,
  log,
  error,
}) {
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!customerEmail || !EMAIL_RE.test(customerEmail)) {
    log(`sendPaymentLinkEmailAdmin: no valid email — skipping`);
    return;
  }
  try {
    const COL_TEMPLATES =
      process.env.APPWRITE_COLLECTION_NOTIFICATION_TEMPLATES ||
      "notification_templates";

    const tplRes = await db.listDocuments(DB, COL_TEMPLATES, [
      Query.equal("key", "payment-link"),
      Query.equal("type", "email"),
      Query.equal("isActive", true),
      Query.limit(1),
    ]);
    if (tplRes.documents.length === 0) {
      log(`sendPaymentLinkEmailAdmin: no active payment-link template — skipping`);
      return;
    }
    const tpl = tplRes.documents[0];
    const subject = tpl.subject;
    const bodyTpl = tpl.body;
    if (!subject || !bodyTpl) {
      log(`sendPaymentLinkEmailAdmin: template has empty subject/body — skipping`);
      return;
    }

    const vars = {
      customerName: customerName || "",
      orderNumber: orderNumber || "",
      experienceName: experienceName || "",
      totalAmount: formatCurrencyAdmin(totalAmount, currency),
      paymentLinkUrl: paymentLinkUrl || "",
      expiresAt: expiresAt || "",
    };
    const renderedSubject = renderTemplate(subject, vars);
    const renderedBody = renderTemplate(bodyTpl, vars);

    const emailFrom = process.env.EMAIL_FROM || "OMZONE <noreply@omzone.com>";
    const provider = (process.env.EMAIL_PROVIDER || "resend").toLowerCase();

    if (provider === "resend") {
      const apiKey = process.env.RESEND_API_KEY;
      if (!apiKey) throw new Error("RESEND_API_KEY not configured");
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: emailFrom,
          to: [customerEmail],
          subject: renderedSubject,
          html: renderedBody,
        }),
      });
      if (!response.ok) {
        const errBody = await response.text();
        throw new Error(`Resend ${response.status}: ${errBody}`);
      }
      const data = await response.json();
      log(`Payment link email resent via Resend id=${data.id} to ${customerEmail}`);
    } else if (provider === "smtp") {
      const host = process.env.SMTP_HOST;
      const port = parseInt(process.env.SMTP_PORT || "465", 10);
      const user = process.env.SMTP_USER;
      const pass = process.env.SMTP_PASS;
      if (!host || !user || !pass)
        throw new Error("SMTP credentials not configured");
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
      const info = await transporter.sendMail({
        from: emailFrom,
        to: customerEmail,
        subject: renderedSubject,
        html: renderedBody,
      });
      log(`Payment link email resent via SMTP messageId=${info.messageId} to ${customerEmail}`);
    } else {
      throw new Error(`EMAIL_PROVIDER="${provider}" not supported`);
    }
  } catch (err) {
    error(`sendPaymentLinkEmailAdmin failed (non-blocking): ${err.message}`);
  }
}

export default async ({ req, res, log, error }) => {
  if (req.method !== "POST") {
    return res.json(
      {
        ok: false,
        error: { code: "ERR_METHOD_NOT_ALLOWED", message: "Only POST allowed" },
      },
      405,
    );
  }

  const client = initClient(req);
  const db = new Databases(client);
  const users = new Users(client);
  const functions = new Functions(client);

  const DB = process.env.APPWRITE_DATABASE_ID || "omzone_db";
  const COL_ORDERS = process.env.APPWRITE_COLLECTION_ORDERS || "orders";
  const COL_PAYMENTS = process.env.APPWRITE_COLLECTION_PAYMENTS || "payments";
  const FUNC_GENERATE_TICKET =
    process.env.APPWRITE_FUNCTION_GENERATE_TICKET || "generate-ticket";
  const FUNC_SEND_CONFIRMATION =
    process.env.APPWRITE_FUNCTION_SEND_CONFIRMATION || "send-confirmation";
  const FUNC_SEND_NOTIFICATION =
    process.env.APPWRITE_FUNCTION_SEND_NOTIFICATION || "send-notification";

  try {
    await assertAdmin(users, req.headers["x-appwrite-user-id"]);

    const body = JSON.parse(req.bodyText ?? req.body ?? "{}");
    const { orderId, action } = body;
    if (!orderId || typeof orderId !== "string") {
      return res.json(
        {
          ok: false,
          error: { code: "ERR_MISSING_ORDER", message: "orderId is required" },
        },
        400,
      );
    }
    if (
      ![
        "record_manual_payment",
        "confirm_order",
        "cancel_order",
        "mark_refunded",
        "retry_ticket_generation",
        "resend_confirmation",
        "resend_payment_link",
      ].includes(action)
    ) {
      return res.json(
        {
          ok: false,
          error: { code: "ERR_INVALID_ACTION", message: "Invalid action" },
        },
        400,
      );
    }

    const order = await db.getDocument(DB, COL_ORDERS, orderId);
    const actorUserId = req.headers["x-appwrite-user-id"];

    if (action === "record_manual_payment") {
      if (["cancelled", "refunded"].includes(order.status)) {
        return res.json(
          {
            ok: false,
            error: {
              code: "ERR_ORDER_CLOSED",
              message: "Closed orders cannot be manually paid",
            },
          },
          409,
        );
      }
      await createManualPayment(db, DB, COL_PAYMENTS, order, actorUserId);
      const updated = await db.updateDocument(DB, COL_ORDERS, orderId, {
        status: "confirmed",
        paymentStatus: "succeeded",
        paidAt: order.paidAt || new Date().toISOString(),
      });
      await trigger(functions, FUNC_GENERATE_TICKET, { orderId }, log, error);
      return res.json({ ok: true, data: { order: updated } });
    }

    if (action === "confirm_order") {
      if (order.paymentStatus !== "succeeded") {
        return res.json(
          {
            ok: false,
            error: {
              code: "ERR_PAYMENT_REQUIRED",
              message: "Payment must be succeeded before confirmation",
            },
          },
          409,
        );
      }
      const updated = await db.updateDocument(DB, COL_ORDERS, orderId, {
        status: "confirmed",
      });
      await trigger(functions, FUNC_GENERATE_TICKET, { orderId }, log, error);
      return res.json({ ok: true, data: { order: updated } });
    }

    if (action === "cancel_order") {
      if (["confirmed", "refunded"].includes(order.status)) {
        return res.json(
          {
            ok: false,
            error: {
              code: "ERR_INVALID_CANCEL",
              message: "Confirmed or refunded orders cannot be cancelled here",
            },
          },
          409,
        );
      }
      const updated = await db.updateDocument(DB, COL_ORDERS, orderId, {
        status: "cancelled",
        paymentStatus:
          order.paymentStatus === "succeeded" ? order.paymentStatus : "failed",
        cancelledAt: new Date().toISOString(),
      });

      // Notify customer
      if (order.customerEmail) {
        const experienceName = (() => {
          try {
            return JSON.parse(order.snapshot || "{}").experienceName || "";
          } catch {
            return "";
          }
        })();
        await trigger(
          functions,
          FUNC_SEND_NOTIFICATION,
          {
            templateKey: "order-cancelled",
            orderId,
            userId: order.userId || null,
            recipientEmail: order.customerEmail,
            recipientName: order.customerName || "",
            vars: {
              orderNumber: order.orderNumber || orderId,
              customerName: order.customerName || "",
              experienceName: experienceName || "—",
              adminNote: body.note || "",
            },
          },
          log,
          error,
        );
      }

      return res.json({ ok: true, data: { order: updated } });
    }

    if (action === "mark_refunded") {
      const updated = await db.updateDocument(DB, COL_ORDERS, orderId, {
        status: "refunded",
        paymentStatus: "refunded",
      });

      // Notify customer
      if (order.customerEmail) {
        const experienceName = (() => {
          try {
            return JSON.parse(order.snapshot || "{}").experienceName || "";
          } catch {
            return "";
          }
        })();
        await trigger(
          functions,
          FUNC_SEND_NOTIFICATION,
          {
            templateKey: "order-refunded",
            orderId,
            userId: order.userId || null,
            recipientEmail: order.customerEmail,
            recipientName: order.customerName || "",
            vars: {
              orderNumber: order.orderNumber || orderId,
              customerName: order.customerName || "",
              experienceName: experienceName || "—",
              adminNote: body.note || "",
            },
          },
          log,
          error,
        );
      }

      return res.json({ ok: true, data: { order: updated } });
    }

    if (action === "retry_ticket_generation") {
      await trigger(functions, FUNC_GENERATE_TICKET, { orderId }, log, error);
      return res.json({ ok: true, data: { triggered: FUNC_GENERATE_TICKET } });
    }

    if (action === "resend_payment_link") {
      if (order.orderType !== "request-conversion") {
        return res.json(
          {
            ok: false,
            error: {
              code: "ERR_INVALID_ORDER_TYPE",
              message: "resend_payment_link is only for request-conversion orders",
            },
          },
          400,
        );
      }
      if (order.paymentStatus === "succeeded") {
        return res.json(
          {
            ok: false,
            error: {
              code: "ERR_ALREADY_PAID",
              message: "Order is already paid",
            },
          },
          409,
        );
      }
      if (!order.stripePaymentLinkUrl) {
        return res.json(
          {
            ok: false,
            error: {
              code: "ERR_NO_PAYMENT_LINK",
              message: "No payment link found for this order",
            },
          },
          400,
        );
      }
      // Check expiry
      if (
        order.paymentLinkExpiresAt &&
        new Date(order.paymentLinkExpiresAt) < new Date()
      ) {
        return res.json(
          {
            ok: false,
            error: {
              code: "ERR_PAYMENT_LINK_EXPIRED",
              message: "Payment link has expired. Cancel the order and create a new one.",
            },
          },
          409,
        );
      }

      // Re-send the existing payment link email
      const resendEmail = order.customerEmail;
      if (resendEmail) {
        const snapshotData = (() => {
          try {
            return JSON.parse(order.snapshot || "{}");
          } catch {
            return {};
          }
        })();
        const experienceName = snapshotData.experienceName || "";
        const expiresAtFormatted = order.paymentLinkExpiresAt
          ? new Date(order.paymentLinkExpiresAt).toLocaleDateString("en-US", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : "";

        await sendPaymentLinkEmailAdmin({
          db,
          DB,
          customerEmail: resendEmail,
          customerName: order.customerName || "",
          orderNumber: order.orderNumber,
          experienceName,
          totalAmount: order.totalAmount,
          currency: order.currency || "MXN",
          paymentLinkUrl: order.stripePaymentLinkUrl,
          expiresAt: expiresAtFormatted,
          log,
          error,
        });
      }

      // Log activity
      try {
        const COL_ACTIVITY_LOGS =
          process.env.APPWRITE_COLLECTION_ADMIN_ACTIVITY_LOGS ||
          "admin_activity_logs";
        await db.createDocument(DB, COL_ACTIVITY_LOGS, ID.unique(), {
          userId: actorUserId,
          action: "order.payment_link_resent",
          entityType: "order",
          entityId: orderId,
          details: JSON.stringify({
            orderNumber: order.orderNumber,
            sentTo: order.customerEmail,
            paymentLinkUrl: order.stripePaymentLinkUrl,
            resentAt: new Date().toISOString(),
          }),
        });
      } catch (logErr) {
        error("Activity log failed: " + logErr.message);
      }

      return res.json({ ok: true, data: { resentTo: order.customerEmail } });
    }

    await trigger(functions, FUNC_SEND_CONFIRMATION, { orderId }, log, error);
    return res.json({ ok: true, data: { triggered: FUNC_SEND_CONFIRMATION } });
  } catch (err) {
    error(`admin-order-action failed: ${err.message}`);
    return res.json(
      {
        ok: false,
        error: {
          code: "ERR_ADMIN_ORDER_ACTION",
          message: err.message || "Order action failed",
        },
      },
      err.status || 500,
    );
  }
};
