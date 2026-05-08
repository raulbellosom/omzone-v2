/**
 * seed-notification-templates.mjs
 *
 * Upserts all transactional email templates into the `notification_templates`
 * Appwrite collection.
 *
 * HTML source files live in docs/email-templates/{key}.{lang}.html
 * Subject is extracted from the comment line:  Subject: <text>
 *
 * Usage:
 *   APPWRITE_API_KEY=<key> node scripts/seed-notification-templates.mjs
 */

import { Client, Databases } from "node-appwrite";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const TPL_DIR = join(__dirname, "..", "docs", "email-templates");

const client = new Client()
  .setEndpoint("https://aprod.racoondevs.com/v1")
  .setProject("omzone-dev")
  .setKey(process.env.APPWRITE_API_KEY || "");

const db = new Databases(client);
const DB = "omzone_db";
const COL = "notification_templates";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function loadHtml(filename) {
  return readFileSync(join(TPL_DIR, filename), "utf8");
}

function extractSubject(html) {
  const match = html.match(/Subject:\s*(.+)/);
  return match ? match[1].trim() : "";
}

async function upsert(id, data) {
  try {
    await db.createDocument(DB, COL, id, data, []);
    console.log(`  created: ${data.key}`);
  } catch (e) {
    if (e.code === 409) {
      try {
        await db.updateDocument(DB, COL, id, data);
        console.log(`  updated: ${data.key}`);
      } catch (updateErr) {
        console.error(`  failed to update ${data.key}: ${updateErr.message}`);
      }
    } else {
      console.error(`  failed to create ${data.key}: ${e.message}`);
    }
  }
}

// ─── Template definitions ─────────────────────────────────────────────────────

const templates = [
  {
    id: "tpl-order-pending",
    key: "order-pending",
    en: "order-pending.en.html",
    es: "order-pending.es.html",
  },
  {
    id: "tpl-order-confirmation",
    key: "order-confirmation",
    en: "order-confirmation.en.html",
    es: "order-confirmation.es.html",
  },
  {
    id: "tpl-order-cancelled",
    key: "order-cancelled",
    en: "order-cancelled.en.html",
    es: "order-cancelled.es.html",
  },
  {
    id: "tpl-order-refunded",
    key: "order-refunded",
    en: "order-refunded.en.html",
    es: "order-refunded.es.html",
  },
  {
    id: "tpl-booking-request-received",
    key: "booking-request-received",
    en: "booking-request-received.en.html",
    es: "booking-request-received.es.html",
  },
  {
    id: "tpl-booking-request-quoted",
    key: "booking-request-quoted",
    en: "booking-request-quoted.en.html",
    es: "booking-request-quoted.es.html",
  },
  {
    id: "tpl-booking-request-declined",
    key: "booking-request-declined",
    en: "booking-request-declined.en.html",
    es: "booking-request-declined.es.html",
  },
  {
    id: "tpl-pass-purchased",
    key: "pass-purchased",
    en: "pass-purchased.en.html",
    es: "pass-purchased.es.html",
  },
  {
    id: "tpl-event-reminder",
    key: "event-reminder",
    en: "event-reminder.en.html",
    es: "event-reminder.es.html",
  },
];

// ─── Inline fallback: payment-link ────────────────────────────────────────────

const paymentLinkEnBody = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f2ede6;font-family:ui-sans-serif,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#2c2c2c;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f2ede6;">
<tr><td align="center" style="padding:32px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:#faf8f5;border:1px solid #e8dfd3;border-radius:4px;">
  <tr><td align="center" style="padding:40px 32px 24px 32px;border-bottom:1px solid #e8dfd3;">
    <div style="font-family:Georgia,'Times New Roman',serif;font-size:24px;letter-spacing:0.32em;color:#2c2c2c;font-weight:400;">OMZONE</div>
    <div style="margin-top:8px;font-size:11px;letter-spacing:0.24em;text-transform:uppercase;color:#7c8c6e;">Wellness · Puerto Vallarta</div>
  </td></tr>
  <tr><td style="padding:40px 32px 16px 32px;">
    <h1 style="margin:0 0 16px 0;font-family:Georgia,'Times New Roman',serif;font-size:26px;line-height:1.3;font-weight:400;color:#2c2c2c;">Hello {{customerName}},</h1>
    <p style="margin:0 0 32px 0;font-size:15px;line-height:1.65;color:#3d3d3d;">Your reservation for <strong>{{experienceName}}</strong> is ready. Complete your payment securely using the button below.</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f0ece6;border-radius:4px;margin:0 0 32px 0;">
      <tr><td style="padding:12px 16px;border-bottom:1px solid #e8dfd3;"><span style="font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#7c8c6e;">Order</span></td><td style="padding:12px 16px;border-bottom:1px solid #e8dfd3;text-align:right;font-size:14px;color:#2c2c2c;">{{orderNumber}}</td></tr>
      <tr><td style="padding:12px 16px;border-bottom:1px solid #e8dfd3;"><span style="font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#7c8c6e;">Experience</span></td><td style="padding:12px 16px;border-bottom:1px solid #e8dfd3;text-align:right;font-size:14px;color:#2c2c2c;">{{experienceName}}</td></tr>
      <tr><td style="padding:12px 16px;"><span style="font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#7c8c6e;">Total</span></td><td style="padding:12px 16px;text-align:right;font-size:15px;font-weight:600;color:#2c2c2c;">{{totalAmount}}</td></tr>
    </table>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto 32px auto;"><tr><td align="center" bgcolor="#2c2c2c" style="border-radius:2px;"><a href="{{paymentLinkUrl}}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:14px 36px;font-size:13px;letter-spacing:0.18em;text-transform:uppercase;color:#faf8f5;text-decoration:none;font-weight:500;">Complete payment</a></td></tr></table>
    <p style="margin:0 0 8px 0;font-size:13px;line-height:1.6;color:#6b6b6b;">If the button doesn't work, copy and paste this link:<br><a href="{{paymentLinkUrl}}" style="color:#5c6b4f;word-break:break-all;">{{paymentLinkUrl}}</a></p>
    <p style="margin:24px 0 0;font-size:15px;line-height:1.65;color:#3d3d3d;">See you soon,<br>The OMZONE Team</p>
  </td></tr>
  <tr><td align="center" style="padding:24px 32px 32px 32px;background:#f0ece6;border-top:1px solid #e8dfd3;">
    <p style="margin:0 0 6px 0;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#7c8c6e;">With calm · With intention</p>
    <p style="margin:0;font-size:11px;color:#9b9b9b;">© OMZONE · Bahía de Banderas, México</p>
  </td></tr>
</table></td></tr></table></body></html>`;

const paymentLinkEsBody = `<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f2ede6;font-family:ui-sans-serif,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#2c2c2c;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f2ede6;">
<tr><td align="center" style="padding:32px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:#faf8f5;border:1px solid #e8dfd3;border-radius:4px;">
  <tr><td align="center" style="padding:40px 32px 24px 32px;border-bottom:1px solid #e8dfd3;">
    <div style="font-family:Georgia,'Times New Roman',serif;font-size:24px;letter-spacing:0.32em;color:#2c2c2c;font-weight:400;">OMZONE</div>
    <div style="margin-top:8px;font-size:11px;letter-spacing:0.24em;text-transform:uppercase;color:#7c8c6e;">Wellness · Puerto Vallarta</div>
  </td></tr>
  <tr><td style="padding:40px 32px 16px 32px;">
    <h1 style="margin:0 0 16px 0;font-family:Georgia,'Times New Roman',serif;font-size:26px;line-height:1.3;font-weight:400;color:#2c2c2c;">Hola {{customerName}},</h1>
    <p style="margin:0 0 32px 0;font-size:15px;line-height:1.65;color:#3d3d3d;">Tu reservación para <strong>{{experienceName}}</strong> está lista. Completa tu pago de forma segura con el botón de abajo.</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f0ece6;border-radius:4px;margin:0 0 32px 0;">
      <tr><td style="padding:12px 16px;border-bottom:1px solid #e8dfd3;"><span style="font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#7c8c6e;">Orden</span></td><td style="padding:12px 16px;border-bottom:1px solid #e8dfd3;text-align:right;font-size:14px;color:#2c2c2c;">{{orderNumber}}</td></tr>
      <tr><td style="padding:12px 16px;border-bottom:1px solid #e8dfd3;"><span style="font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#7c8c6e;">Experiencia</span></td><td style="padding:12px 16px;border-bottom:1px solid #e8dfd3;text-align:right;font-size:14px;color:#2c2c2c;">{{experienceName}}</td></tr>
      <tr><td style="padding:12px 16px;"><span style="font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#7c8c6e;">Total</span></td><td style="padding:12px 16px;text-align:right;font-size:15px;font-weight:600;color:#2c2c2c;">{{totalAmount}}</td></tr>
    </table>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto 32px auto;"><tr><td align="center" bgcolor="#2c2c2c" style="border-radius:2px;"><a href="{{paymentLinkUrl}}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:14px 36px;font-size:13px;letter-spacing:0.18em;text-transform:uppercase;color:#faf8f5;text-decoration:none;font-weight:500;">Completar pago</a></td></tr></table>
    <p style="margin:0 0 8px 0;font-size:13px;line-height:1.6;color:#6b6b6b;">Si el botón no funciona, copia y pega este enlace:<br><a href="{{paymentLinkUrl}}" style="color:#5c6b4f;word-break:break-all;">{{paymentLinkUrl}}</a></p>
    <p style="margin:24px 0 0;font-size:15px;line-height:1.65;color:#3d3d3d;">Te esperamos,<br>El equipo OMZONE</p>
  </td></tr>
  <tr><td align="center" style="padding:24px 32px 32px 32px;background:#f0ece6;border-top:1px solid #e8dfd3;">
    <p style="margin:0 0 6px 0;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#7c8c6e;">Con calma · Con intención</p>
    <p style="margin:0;font-size:11px;color:#9b9b9b;">© OMZONE · Bahía de Banderas, México</p>
  </td></tr>
</table></td></tr></table></body></html>`;

// ─── Seed runner ──────────────────────────────────────────────────────────────

async function seed() {
  console.log("Seeding notification templates...\n");

  for (const tpl of templates) {
    let bodyEn, bodyEs;
    try {
      bodyEn = loadHtml(tpl.en);
      bodyEs = loadHtml(tpl.es);
    } catch (e) {
      console.error(`  could not load HTML files for ${tpl.key}: ${e.message}`);
      continue;
    }

    const subject = extractSubject(bodyEn);
    const subjectEs = extractSubject(bodyEs);

    await upsert(tpl.id, {
      key: tpl.key,
      type: "email",
      subject: subject || `OMZONE — ${tpl.key}`,
      subjectEs: subjectEs || subject || `OMZONE — ${tpl.key}`,
      body: bodyEn,
      bodyEs: bodyEs,
      isActive: true,
    });
  }

  await upsert("tpl-payment-link", {
    key: "payment-link",
    type: "email",
    subject: "Your OMZONE Payment Link — {{orderNumber}}",
    subjectEs: "Tu link de pago OMZONE — {{orderNumber}}",
    body: paymentLinkEnBody,
    bodyEs: paymentLinkEsBody,
    isActive: true,
  });

  console.log("\nDone.");
}

seed().catch((e) => {
  console.error("Fatal error:", e.message);
  process.exit(1);
});
