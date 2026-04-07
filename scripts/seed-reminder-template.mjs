import { Client, Databases } from "node-appwrite";

const client = new Client()
  .setEndpoint("https://aprod.racoondevs.com/v1")
  .setProject("omzone-dev")
  .setKey(process.env.APPWRITE_API_KEY || "");

const db = new Databases(client);
const DB = "omzone_db";

const subjectEN = "Reminder: {{experienceName}} — {{date}}";
const subjectES = "Recordatorio: {{experienceName}} — {{date}}";

const bodyEN = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f7f5f2;font-family:Georgia,'Times New Roman',serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f5f2;padding:32px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;">
  <tr><td style="background:#4a6741;padding:32px 40px;text-align:center;">
    <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:600;letter-spacing:0.5px;">OMZONE</h1>
    <p style="color:#c5d5b8;margin:8px 0 0;font-size:14px;">Event Reminder</p>
  </td></tr>
  <tr><td style="padding:40px;">
    <p style="color:#2c2c2c;font-size:16px;line-height:1.6;margin:0 0 24px;">
      Hi {{customerName}},
    </p>
    <p style="color:#2c2c2c;font-size:16px;line-height:1.6;margin:0 0 24px;">
      This is a friendly reminder that your upcoming experience is just around the corner.
    </p>
    <table width="100%" cellpadding="12" cellspacing="0" style="background:#f7f5f2;border-radius:8px;margin:0 0 24px;">
      <tr><td style="color:#6b6b6b;font-size:13px;border-bottom:1px solid #e8e4df;">Experience</td>
          <td style="color:#2c2c2c;font-size:14px;font-weight:600;border-bottom:1px solid #e8e4df;text-align:right;">{{experienceName}}</td></tr>
      <tr><td style="color:#6b6b6b;font-size:13px;border-bottom:1px solid #e8e4df;">Date &amp; Time</td>
          <td style="color:#2c2c2c;font-size:14px;border-bottom:1px solid #e8e4df;text-align:right;">{{date}}</td></tr>
      <tr><td style="color:#6b6b6b;font-size:13px;border-bottom:1px solid #e8e4df;">Location</td>
          <td style="color:#2c2c2c;font-size:14px;border-bottom:1px solid #e8e4df;text-align:right;">{{location}}</td></tr>
      <tr><td style="color:#6b6b6b;font-size:13px;">Your Ticket Code</td>
          <td style="color:#2c2c2c;font-size:14px;font-weight:600;text-align:right;">{{ticketCode}}</td></tr>
    </table>
    <p style="color:#6b6b6b;font-size:14px;line-height:1.6;margin:0 0 24px;">
      Please present your ticket code at the venue. You can also view your tickets in your
      <a href="https://omzone.com/portal/tickets" style="color:#4a6741;">customer portal</a>.
    </p>
    <p style="color:#2c2c2c;font-size:16px;line-height:1.6;margin:0;">
      We look forward to seeing you,<br>The OMZONE Team
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
    <p style="color:#c5d5b8;margin:8px 0 0;font-size:14px;">Recordatorio de Evento</p>
  </td></tr>
  <tr><td style="padding:40px;">
    <p style="color:#2c2c2c;font-size:16px;line-height:1.6;margin:0 0 24px;">
      Hola {{customerName}},
    </p>
    <p style="color:#2c2c2c;font-size:16px;line-height:1.6;margin:0 0 24px;">
      Te recordamos que tu experiencia est&aacute; pr&oacute;xima.
    </p>
    <table width="100%" cellpadding="12" cellspacing="0" style="background:#f7f5f2;border-radius:8px;margin:0 0 24px;">
      <tr><td style="color:#6b6b6b;font-size:13px;border-bottom:1px solid #e8e4df;">Experiencia</td>
          <td style="color:#2c2c2c;font-size:14px;font-weight:600;border-bottom:1px solid #e8e4df;text-align:right;">{{experienceName}}</td></tr>
      <tr><td style="color:#6b6b6b;font-size:13px;border-bottom:1px solid #e8e4df;">Fecha y Hora</td>
          <td style="color:#2c2c2c;font-size:14px;border-bottom:1px solid #e8e4df;text-align:right;">{{date}}</td></tr>
      <tr><td style="color:#6b6b6b;font-size:13px;border-bottom:1px solid #e8e4df;">Ubicaci&oacute;n</td>
          <td style="color:#2c2c2c;font-size:14px;border-bottom:1px solid #e8e4df;text-align:right;">{{location}}</td></tr>
      <tr><td style="color:#6b6b6b;font-size:13px;">Tu C&oacute;digo de Ticket</td>
          <td style="color:#2c2c2c;font-size:14px;font-weight:600;text-align:right;">{{ticketCode}}</td></tr>
    </table>
    <p style="color:#6b6b6b;font-size:14px;line-height:1.6;margin:0 0 24px;">
      Presenta tu c&oacute;digo de ticket en el lugar. Tambi&eacute;n puedes ver tus tickets en tu
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
      "tpl-event-reminder",
      {
        key: "event-reminder",
        type: "email",
        subject: subjectEN,
        subjectEs: subjectES,
        body: bodyEN,
        bodyEs: bodyES,
        isActive: true,
      },
    );
    console.log("Created notification template: event-reminder");
  } catch (e) {
    if (e.code === 409) {
      console.log("Template event-reminder already exists — skipping");
    } else {
      console.error("Error:", e.message);
    }
  }
}

seed();
