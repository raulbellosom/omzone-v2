import { Client, Databases } from "node-appwrite";

const client = new Client()
  .setEndpoint("https://aprod.racoondevs.com/v1")
  .setProject("omzone-dev")
  .setKey(process.env.APPWRITE_API_KEY || "");

const db = new Databases(client);
const DB = "omzone_db";

const subjectEN = "Your OMZONE Order {{orderNumber}} — Confirmation";
const subjectES = "Tu Orden OMZONE {{orderNumber}} — Confirmación";

const bodyEN = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f7f5f2;font-family:Georgia,'Times New Roman',serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f5f2;padding:32px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;">
  <tr><td style="background:#4a6741;padding:32px 40px;text-align:center;">
    <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:600;letter-spacing:0.5px;">OMZONE</h1>
    <p style="color:#c5d5b8;margin:8px 0 0;font-size:14px;">Order Confirmation</p>
  </td></tr>
  <tr><td style="padding:40px;">
    <p style="color:#2c2c2c;font-size:16px;line-height:1.6;margin:0 0 24px;">
      Hi {{customerName}},
    </p>
    <p style="color:#2c2c2c;font-size:16px;line-height:1.6;margin:0 0 24px;">
      Thank you for your purchase. Your order has been confirmed and your tickets are ready.
    </p>
    <table width="100%" cellpadding="12" cellspacing="0" style="background:#f7f5f2;border-radius:8px;margin:0 0 24px;">
      <tr><td style="color:#6b6b6b;font-size:13px;border-bottom:1px solid #e8e4df;">Order Number</td>
          <td style="color:#2c2c2c;font-size:14px;font-weight:600;border-bottom:1px solid #e8e4df;text-align:right;">{{orderNumber}}</td></tr>
      <tr><td style="color:#6b6b6b;font-size:13px;border-bottom:1px solid #e8e4df;">Experience</td>
          <td style="color:#2c2c2c;font-size:14px;border-bottom:1px solid #e8e4df;text-align:right;">{{experienceName}}</td></tr>
      <tr><td style="color:#6b6b6b;font-size:13px;border-bottom:1px solid #e8e4df;">Date</td>
          <td style="color:#2c2c2c;font-size:14px;border-bottom:1px solid #e8e4df;text-align:right;">{{date}}</td></tr>
      <tr><td style="color:#6b6b6b;font-size:13px;border-bottom:1px solid #e8e4df;">Ticket Code(s)</td>
          <td style="color:#2c2c2c;font-size:14px;font-weight:600;border-bottom:1px solid #e8e4df;text-align:right;">{{ticketCodes}}</td></tr>
      <tr><td style="color:#6b6b6b;font-size:13px;">Total Paid</td>
          <td style="color:#2c2c2c;font-size:16px;font-weight:700;text-align:right;">{{totalAmount}}</td></tr>
    </table>
    <p style="color:#6b6b6b;font-size:14px;line-height:1.6;margin:0 0 24px;">
      Present your ticket code(s) at the venue. You can also view your tickets in your
      <a href="https://omzone.com/portal/tickets" style="color:#4a6741;">customer portal</a>.
    </p>
    <p style="color:#2c2c2c;font-size:16px;line-height:1.6;margin:0;">
      See you soon,<br>The OMZONE Team
    </p>
  </td></tr>
  <tr><td style="background:#f7f5f2;padding:24px 40px;text-align:center;">
    <p style="color:#9b9b9b;font-size:12px;margin:0;">&copy; 2026 OMZONE. All rights reserved.</p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`;

const bodyES = `<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f7f5f2;font-family:Georgia,'Times New Roman',serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f5f2;padding:32px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;">
  <tr><td style="background:#4a6741;padding:32px 40px;text-align:center;">
    <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:600;letter-spacing:0.5px;">OMZONE</h1>
    <p style="color:#c5d5b8;margin:8px 0 0;font-size:14px;">Confirmación de Orden</p>
  </td></tr>
  <tr><td style="padding:40px;">
    <p style="color:#2c2c2c;font-size:16px;line-height:1.6;margin:0 0 24px;">
      Hola {{customerName}},
    </p>
    <p style="color:#2c2c2c;font-size:16px;line-height:1.6;margin:0 0 24px;">
      Gracias por tu compra. Tu orden ha sido confirmada y tus tickets están listos.
    </p>
    <table width="100%" cellpadding="12" cellspacing="0" style="background:#f7f5f2;border-radius:8px;margin:0 0 24px;">
      <tr><td style="color:#6b6b6b;font-size:13px;border-bottom:1px solid #e8e4df;">Número de Orden</td>
          <td style="color:#2c2c2c;font-size:14px;font-weight:600;border-bottom:1px solid #e8e4df;text-align:right;">{{orderNumber}}</td></tr>
      <tr><td style="color:#6b6b6b;font-size:13px;border-bottom:1px solid #e8e4df;">Experiencia</td>
          <td style="color:#2c2c2c;font-size:14px;border-bottom:1px solid #e8e4df;text-align:right;">{{experienceName}}</td></tr>
      <tr><td style="color:#6b6b6b;font-size:13px;border-bottom:1px solid #e8e4df;">Fecha</td>
          <td style="color:#2c2c2c;font-size:14px;border-bottom:1px solid #e8e4df;text-align:right;">{{date}}</td></tr>
      <tr><td style="color:#6b6b6b;font-size:13px;border-bottom:1px solid #e8e4df;">Código(s) de Ticket</td>
          <td style="color:#2c2c2c;font-size:14px;font-weight:600;border-bottom:1px solid #e8e4df;text-align:right;">{{ticketCodes}}</td></tr>
      <tr><td style="color:#6b6b6b;font-size:13px;">Total Pagado</td>
          <td style="color:#2c2c2c;font-size:16px;font-weight:700;text-align:right;">{{totalAmount}}</td></tr>
    </table>
    <p style="color:#6b6b6b;font-size:14px;line-height:1.6;margin:0 0 24px;">
      Presenta tu(s) código(s) de ticket en el lugar. También puedes ver tus tickets en tu
      <a href="https://omzone.com/portal/tickets" style="color:#4a6741;">portal de cliente</a>.
    </p>
    <p style="color:#2c2c2c;font-size:16px;line-height:1.6;margin:0;">
      Te esperamos,<br>El equipo OMZONE
    </p>
  </td></tr>
  <tr><td style="background:#f7f5f2;padding:24px 40px;text-align:center;">
    <p style="color:#9b9b9b;font-size:12px;margin:0;">&copy; 2026 OMZONE. Todos los derechos reservados.</p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`;

async function seed() {
  try {
    await db.createDocument(
      DB,
      "notification_templates",
      "tpl-order-confirmation",
      {
        key: "order-confirmation",
        type: "email",
        subject: subjectEN,
        subjectEs: subjectES,
        body: bodyEN,
        bodyEs: bodyES,
        isActive: true,
      },
    );
    console.log("Created notification template: order-confirmation");
  } catch (e) {
    if (e.code === 409) {
      console.log("Template order-confirmation already exists — skipping");
    } else {
      console.error("Error:", e.message);
    }
  }
}

seed();
