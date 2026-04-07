/**
 * @function send-reminder
 * @description Sends reminder emails to customers with valid tickets for slots
 *   starting within a configurable window (default 24-48 hours). Runs daily via
 *   CRON schedule. Tracks sent reminders in admin_activity_logs to prevent
 *   duplicates on re-execution. Email failures are logged but never stop
 *   processing of remaining tickets.
 * @trigger Schedule — CRON `0 8 * * *` (daily at 08:00 UTC)
 *
 * @input None (scheduled execution, no payload)
 *
 * @output {Object} { ok: true, data: { processed, sent, skipped, failed } }
 *
 * @errors
 * - 500 ERR_REMINDER_INTERNAL — unexpected error
 *
 * @idempotent Yes — duplicate-safe via admin_activity_logs tracking
 *
 * @entities
 * - Reads: slots, tickets, experiences, locations, user_profiles, notification_templates, admin_activity_logs
 * - Creates: admin_activity_logs (reminder tracking records)
 *
 * @envVars
 * - APPWRITE_FUNCTION_API_ENDPOINT (built-in)
 * - APPWRITE_FUNCTION_PROJECT_ID   (built-in)
 * - x-appwrite-key header          (runtime)
 * - APPWRITE_DATABASE_ID
 * - APPWRITE_COLLECTION_SLOTS
 * - APPWRITE_COLLECTION_TICKETS
 * - APPWRITE_COLLECTION_EXPERIENCES
 * - APPWRITE_COLLECTION_LOCATIONS
 * - APPWRITE_COLLECTION_USER_PROFILES
 * - APPWRITE_COLLECTION_NOTIFICATION_TEMPLATES
 * - APPWRITE_COLLECTION_ADMIN_ACTIVITY_LOGS
 * - EMAIL_PROVIDER  (resend | smtp)
 * - EMAIL_FROM
 * - RESEND_API_KEY  (if provider=resend)
 * - SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS (if provider=smtp)
 * - REMINDER_WINDOW_START_HOURS (default: 24)
 * - REMINDER_WINDOW_END_HOURS   (default: 48)
 */

import { Client, Databases, Query, ID } from "node-appwrite";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function initClient(req) {
  return new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
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

/**
 * Format a datetime in the timezone of the slot for display in the email.
 */
function formatDatetimeInTz(iso, timezone) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
      timeZone: timezone || "UTC",
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return new Date(iso).toISOString();
  }
}

function formatTime(iso, timezone) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleTimeString("en-US", {
      timeZone: timezone || "UTC",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

// ─── Email senders (same interface as send-confirmation) ──────────────────────

async function sendViaResend({ to, from, subject, html, log }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY is not configured");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to: [to], subject, html }),
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`Resend API ${response.status}: ${errBody}`);
  }

  const data = await response.json();
  log(`Email sent via Resend: id=${data.id}`);
  return data;
}

async function sendViaSmtp({ to, from, subject, html, log }) {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass)
    throw new Error("SMTP credentials not configured");

  throw new Error(
    "SMTP provider requires 'nodemailer' dependency. " +
      "Add it to package.json or switch EMAIL_PROVIDER to 'resend'.",
  );
}

async function sendEmail({ to, from, subject, html, log }) {
  const provider = (process.env.EMAIL_PROVIDER || "resend").toLowerCase();
  if (provider === "resend")
    return sendViaResend({ to, from, subject, html, log });
  if (provider === "smtp") return sendViaSmtp({ to, from, subject, html, log });
  throw new Error(`Unknown EMAIL_PROVIDER: ${provider}`);
}

// ─── Main handler ─────────────────────────────────────────────────────────────

export default async ({ req, res, log, error }) => {
  const client = initClient(req);
  const db = new Databases(client);

  const DB = process.env.APPWRITE_DATABASE_ID || "omzone_db";
  const COL_SLOTS = process.env.APPWRITE_COLLECTION_SLOTS || "slots";
  const COL_TICKETS = process.env.APPWRITE_COLLECTION_TICKETS || "tickets";
  const COL_EXPERIENCES =
    process.env.APPWRITE_COLLECTION_EXPERIENCES || "experiences";
  const COL_LOCATIONS =
    process.env.APPWRITE_COLLECTION_LOCATIONS || "locations";
  const COL_PROFILES =
    process.env.APPWRITE_COLLECTION_USER_PROFILES || "user_profiles";
  const COL_TEMPLATES =
    process.env.APPWRITE_COLLECTION_NOTIFICATION_TEMPLATES ||
    "notification_templates";
  const COL_LOGS =
    process.env.APPWRITE_COLLECTION_ADMIN_ACTIVITY_LOGS ||
    "admin_activity_logs";

  const stats = { processed: 0, sent: 0, skipped: 0, failed: 0 };

  try {
    // ── 1. Calculate reminder window ──────────────────────────────────────
    const startHours = parseInt(
      process.env.REMINDER_WINDOW_START_HOURS || "24",
      10,
    );
    const endHours = parseInt(
      process.env.REMINDER_WINDOW_END_HOURS || "48",
      10,
    );

    const now = new Date();
    const windowStart = new Date(now.getTime() + startHours * 60 * 60 * 1000);
    const windowEnd = new Date(now.getTime() + endHours * 60 * 60 * 1000);

    log(
      `Reminder window: ${windowStart.toISOString()} → ${windowEnd.toISOString()}`,
    );

    // ── 2. Query slots starting within the window ─────────────────────────
    // slots.status === "published" means the slot is live/available
    const slotsRes = await db.listDocuments(DB, COL_SLOTS, [
      Query.greaterThanEqual("startDatetime", windowStart.toISOString()),
      Query.lessThanEqual("startDatetime", windowEnd.toISOString()),
      Query.equal("status", "published"),
      Query.limit(100),
    ]);

    const slots = slotsRes.documents;
    log(`Found ${slots.length} slot(s) in reminder window`);

    if (slots.length === 0) {
      return res.json({ ok: true, data: stats });
    }

    // ── 3. Fetch email template ───────────────────────────────────────────
    const templatesRes = await db.listDocuments(DB, COL_TEMPLATES, [
      Query.equal("key", "event-reminder"),
      Query.equal("type", "email"),
      Query.equal("isActive", true),
      Query.limit(1),
    ]);

    if (templatesRes.documents.length === 0) {
      log("WARN: No active event-reminder email template found — aborting");
      return res.json({ ok: true, data: { ...stats, reason: "no_template" } });
    }

    const tpl = templatesRes.documents[0];
    const emailFrom = process.env.EMAIL_FROM || "OMZONE <noreply@omzone.com>";

    // ── 4. Pre-cache experiences and locations ────────────────────────────
    const experienceCache = {};
    const locationCache = {};

    // ── 5. Process each slot ──────────────────────────────────────────────
    for (const slot of slots) {
      // Fetch tickets with status "valid" for this slot
      const ticketsRes = await db.listDocuments(DB, COL_TICKETS, [
        Query.equal("slotId", slot.$id),
        Query.equal("status", "valid"),
        Query.limit(200),
      ]);

      if (ticketsRes.documents.length === 0) continue;

      // Fetch experience (cached)
      if (!experienceCache[slot.experienceId]) {
        try {
          experienceCache[slot.experienceId] = await db.getDocument(
            DB,
            COL_EXPERIENCES,
            slot.experienceId,
          );
        } catch {
          experienceCache[slot.experienceId] = null;
        }
      }
      const experience = experienceCache[slot.experienceId];

      // Fetch location if present (cached)
      let location = null;
      if (slot.locationId) {
        if (!locationCache[slot.locationId]) {
          try {
            locationCache[slot.locationId] = await db.getDocument(
              DB,
              COL_LOCATIONS,
              slot.locationId,
            );
          } catch {
            locationCache[slot.locationId] = null;
          }
        }
        location = locationCache[slot.locationId];
      }

      // Process each ticket for this slot
      for (const ticket of ticketsRes.documents) {
        stats.processed++;

        // ── 5a. Check if reminder already sent ────────────────────────────
        const dedupKey = `reminder-sent-${ticket.$id}-${slot.$id}`;
        try {
          const existingLogs = await db.listDocuments(DB, COL_LOGS, [
            Query.equal("action", dedupKey),
            Query.limit(1),
          ]);
          if (existingLogs.documents.length > 0) {
            stats.skipped++;
            continue;
          }
        } catch {
          // If query fails, proceed to send (safe side)
        }

        // ── 5b. Find customer email ───────────────────────────────────────
        // From ticket's participantEmail, or from order's customerEmail via snapshot
        let email = ticket.participantEmail;
        if (!email || !EMAIL_RE.test(email)) {
          // Try ticket snapshot for customerEmail
          try {
            const snap = JSON.parse(ticket.ticketSnapshot || "{}");
            email = snap.customerEmail;
          } catch {
            // ignore
          }
        }

        if (!email || !EMAIL_RE.test(email)) {
          log(`WARN: No valid email for ticket ${ticket.$id} — skipping`);
          stats.skipped++;
          continue;
        }

        // ── 5c. Determine language ────────────────────────────────────────
        let language = "en";
        if (ticket.userId) {
          try {
            // user_profiles uses document ID = userId (row security)
            const profile = await db.getDocument(
              DB,
              COL_PROFILES,
              ticket.userId,
            );
            language = profile.language || "en";
          } catch {
            // No profile — default EN
          }
        }
        const useSpanish = language.startsWith("es");

        // ── 5d. Select localized template ─────────────────────────────────
        const subject =
          useSpanish && tpl.subjectEs ? tpl.subjectEs : tpl.subject;
        const bodyTpl = useSpanish && tpl.bodyEs ? tpl.bodyEs : tpl.body;

        if (!subject || !bodyTpl) {
          stats.skipped++;
          continue;
        }

        // ── 5e. Build template variables ──────────────────────────────────
        // Try to get customer name from profile or snapshot
        let customerName = "";
        if (ticket.userId) {
          try {
            const profile = await db.getDocument(
              DB,
              COL_PROFILES,
              ticket.userId,
            );
            customerName =
              profile.displayName ||
              [profile.firstName, profile.lastName].filter(Boolean).join(" ");
          } catch {
            // ignore
          }
        }
        if (!customerName) {
          try {
            const snap = JSON.parse(ticket.ticketSnapshot || "{}");
            customerName = snap.customerName || "";
          } catch {
            // ignore
          }
        }

        const vars = {
          customerName: customerName || "Guest",
          experienceName: experience?.title || experience?.name || "—",
          date: formatDatetimeInTz(slot.startDatetime, slot.timezone),
          time: formatTime(slot.startDatetime, slot.timezone),
          location: location?.name
            ? `${location.name}${location.address ? `, ${location.address}` : ""}`
            : "",
          ticketCode: ticket.ticketCode,
        };

        const renderedSubject = renderTemplate(subject, vars);
        const renderedBody = renderTemplate(bodyTpl, vars);

        // ── 5f. Send email ────────────────────────────────────────────────
        try {
          await sendEmail({
            to: email,
            from: emailFrom,
            subject: renderedSubject,
            html: renderedBody,
            log,
          });

          // ── 5g. Record in activity logs (dedup tracking) ────────────────
          try {
            await db.createDocument(DB, COL_LOGS, ID.unique(), {
              userId: ticket.userId || "system",
              action: dedupKey,
              entityType: "ticket",
              entityId: ticket.$id,
              details: JSON.stringify({
                slotId: slot.$id,
                email,
                sentAt: new Date().toISOString(),
              }),
            });
          } catch (logErr) {
            error(
              `Failed to log reminder for ticket ${ticket.$id}: ${logErr.message}`,
            );
          }

          stats.sent++;
          log(
            `Reminder sent: ticket=${ticket.$id} slot=${slot.$id} → ${email}`,
          );
        } catch (sendErr) {
          stats.failed++;
          error(
            `Reminder email failed for ticket ${ticket.$id}: ${sendErr.message}`,
          );
          // Continue with next ticket — never stop the batch
        }
      }
    }

    log(
      `Reminder run complete: ${stats.processed} processed, ${stats.sent} sent, ${stats.skipped} skipped, ${stats.failed} failed`,
    );

    return res.json({ ok: true, data: stats });
  } catch (err) {
    error(`send-reminder failed: ${err.message}`);
    return res.json(
      {
        ok: false,
        error: { code: "ERR_REMINDER_INTERNAL", message: "Internal error" },
      },
      500,
    );
  }
};
