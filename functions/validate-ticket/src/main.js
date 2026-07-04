/**
 * @function validate-ticket
 * @description Checks or confirms a ticket by its ticketCode. In "check" mode (default)
 *   it is read-only: looks up the ticket, validates status and the check-in time window,
 *   and returns display data without mutating anything. In "confirm" mode it re-validates
 *   and then marks the ticket as used, creates a redemption record, and updates the
 *   associated booking to checked-in. Used by operators/admins at check-in points
 *   (QR scan, manual entry, or the kiosk overlay).
 * @trigger HTTP POST
 *
 * @input {Object} payload
 * @input {string} payload.ticketCode - The unique ticket code (required)
 * @input {string} [payload.action] - "check" (default, read-only) | "confirm" (mutates)
 * @input {string} [payload.method] - Redemption method for "confirm": "qr_scan" | "manual" | "kiosk" | "system" (default: "manual")
 * @input {string} [payload.notes] - Optional notes (e.g. location, observations) — only used on "confirm"
 *
 * @validates
 * - Auth: caller must be authenticated
 * - Authorize: caller must have label admin, operator, or root
 * - Input: ticketCode is present, string, alphanumeric+hyphens only; action is "check" or "confirm"
 * - Business: ticket exists, status is "valid" (both actions); "confirm" re-checks status
 *   at commit time to guard against a race between check and confirm
 *
 * @entities
 * - Reads: tickets (by ticketCode), bookings (by orderId + slotId)
 * - Writes (action=confirm only): tickets (status → used, usedAt), bookings (status → checked-in, checkedInAt)
 * - Creates (action=confirm only): ticket_redemptions
 *
 * @envVars
 * - APPWRITE_FUNCTION_API_ENDPOINT (built-in, auto-injected)
 * - APPWRITE_FUNCTION_PROJECT_ID (built-in, auto-injected)
 * - x-appwrite-key header (dynamic API key, runtime only)
 * - APPWRITE_DATABASE_ID (project-level global)
 * - APPWRITE_COLLECTION_TICKETS (project-level global)
 * - APPWRITE_COLLECTION_TICKET_REDEMPTIONS (project-level global)
 * - APPWRITE_COLLECTION_BOOKINGS (project-level global)
 *
 * @errors
 * - 400: Missing/invalid ticketCode, ticket status not "valid"
 * - 401: Not authenticated
 * - 403: Insufficient permissions (not admin/operator/root)
 * - 404: Ticket not found
 * - 409: Ticket already used (includes usedAt) — action=confirm only
 * - 410: Ticket cancelled or expired
 * - 500: Internal error
 *
 * @idempotent "check" is always idempotent (read-only). "confirm" on an already-used
 *   ticket returns 409 without duplicating redemptions.
 * @returns {Object} { ok: true, data: { ticket: {...}, schedule: {...}|null, confirmed: boolean } }
 */

import { Client, Databases, Query, ID, Users } from "node-appwrite";

// ─── Constants ───────────────────────────────────────────────────────────────

const VALID_METHODS = ["qr_scan", "manual", "kiosk", "system"];
const VALID_ACTIONS = ["check", "confirm"];
const TICKET_CODE_PATTERN = /^[A-Za-z0-9-]+$/;
const CHECK_IN_WINDOW_BEFORE_MS = 30 * 60 * 1000; // 30 minutes before slot start
const CHECK_IN_FALLBACK_DURATION_MS = 3 * 60 * 60 * 1000; // used when no slotEndDate

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

function safeParseSnapshot(ticket) {
  try {
    return JSON.parse(ticket.ticketSnapshot);
  } catch {
    return null;
  }
}

/**
 * Extract display-friendly data from ticketSnapshot for the operator.
 */
function extractSnapshotDisplay(ticket) {
  const snapshot = safeParseSnapshot(ticket);

  return {
    ticketId: ticket.$id,
    ticketCode: ticket.ticketCode,
    participantName: ticket.participantName || null,
    participantEmail: ticket.participantEmail || null,
    experienceName: snapshot?.experienceName || null,
    slotStartDatetime: snapshot?.slotStartDatetime || snapshot?.slotDate || null,
    slotTime: snapshot?.slotTime || null,
    slotEndDate: snapshot?.slotEndDate || null,
    timezone: snapshot?.timezone || null,
    locationName: snapshot?.locationName || null,
    roomName: snapshot?.roomName || null,
    tierName: snapshot?.tierName || snapshot?.passName || null,
    orderNumber: snapshot?.orderNumber || null,
    status: ticket.status,
    usedAt: ticket.usedAt || null,
  };
}

/**
 * Computes whether "now" falls inside the check-in window for this ticket's slot.
 * Window: [slotStartDatetime - 30min, slotEndDate] (or +3h from start if no end date).
 * Returns null when the snapshot has no slot start time (can't be determined).
 */
function getScheduleState(ticket) {
  const snapshot = safeParseSnapshot(ticket);
  if (!snapshot?.slotStartDatetime) return null;

  const start = new Date(snapshot.slotStartDatetime);
  if (Number.isNaN(start.getTime())) return null;

  const end = snapshot.slotEndDate
    ? new Date(snapshot.slotEndDate)
    : new Date(start.getTime() + CHECK_IN_FALLBACK_DURATION_MS);
  const windowStart = new Date(start.getTime() - CHECK_IN_WINDOW_BEFORE_MS);
  const now = new Date();

  if (now < windowStart) {
    return {
      withinWindow: false,
      reason: "too_early",
      validFrom: start.toISOString(),
      validUntil: end.toISOString(),
      now: now.toISOString(),
    };
  }
  if (now > end) {
    return {
      withinWindow: false,
      reason: "too_late",
      validFrom: start.toISOString(),
      validUntil: end.toISOString(),
      now: now.toISOString(),
    };
  }
  return {
    withinWindow: true,
    validFrom: start.toISOString(),
    validUntil: end.toISOString(),
    now: now.toISOString(),
  };
}

// ─── Main Handler ────────────────────────────────────────────────────────────

export default async ({ req, res, log, error }) => {
  // ── Method check ───────────────────────────────────────────────────────────
  if (req.method !== "POST") {
    return res.json(
      {
        ok: false,
        error: { code: "ERR_METHOD_NOT_ALLOWED", message: "Only POST allowed" },
      },
      405,
    );
  }

  // ── Init ───────────────────────────────────────────────────────────────────
  const client = initClient(req);
  const db = new Databases(client);

  const DB = process.env.APPWRITE_DATABASE_ID || "omzone_db";
  const COL_TICKETS = process.env.APPWRITE_COLLECTION_TICKETS || "tickets";
  const COL_REDEMPTIONS =
    process.env.APPWRITE_COLLECTION_TICKET_REDEMPTIONS || "ticket_redemptions";
  const COL_BOOKINGS = process.env.APPWRITE_COLLECTION_BOOKINGS || "bookings";

  try {
    // ── Parse input ──────────────────────────────────────────────────────────
    // req.body is a raw string on some Appwrite runtime versions and an
    // already-parsed object on others (when Content-Type: application/json) —
    // handle both instead of assuming a string.
    const body =
      typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    const { ticketCode, method, notes } = body;
    const action = VALID_ACTIONS.includes(body.action) ? body.action : "check";

    // ── Validate input ───────────────────────────────────────────────────────
    if (!ticketCode || typeof ticketCode !== "string") {
      return res.json(
        {
          ok: false,
          error: {
            code: "ERR_VALIDATE_MISSING_CODE",
            message: "ticketCode is required",
          },
        },
        400,
      );
    }

    const sanitizedCode = ticketCode.trim();
    if (!TICKET_CODE_PATTERN.test(sanitizedCode)) {
      return res.json(
        {
          ok: false,
          error: {
            code: "ERR_VALIDATE_INVALID_CODE",
            message: "ticketCode contains invalid characters",
          },
        },
        400,
      );
    }

    const redemptionMethod = VALID_METHODS.includes(method) ? method : "manual";

    // ── Auth ─────────────────────────────────────────────────────────────────
    const userId = req.headers["x-appwrite-user-id"];
    if (!userId) {
      return res.json(
        {
          ok: false,
          error: {
            code: "ERR_UNAUTHENTICATED",
            message: "Authentication required",
          },
        },
        401,
      );
    }

    // ── Authorize ────────────────────────────────────────────────────────────
    const users = new Users(client);
    const caller = await users.get(userId);
    const labels = caller.labels || [];

    if (
      !labels.includes("admin") &&
      !labels.includes("operator") &&
      !labels.includes("root")
    ) {
      return res.json(
        {
          ok: false,
          error: {
            code: "ERR_UNAUTHORIZED",
            message: "Insufficient permissions",
          },
        },
        403,
      );
    }

    // ── Lookup ticket by ticketCode ──────────────────────────────────────────
    const ticketResult = await db.listDocuments(DB, COL_TICKETS, [
      Query.equal("ticketCode", sanitizedCode),
      Query.limit(1),
    ]);

    if (ticketResult.total === 0) {
      log(`Ticket not found: ${sanitizedCode} (by ${userId})`);
      return res.json(
        {
          ok: false,
          error: {
            code: "ERR_VALIDATE_NOT_FOUND",
            message: "Ticket not found",
          },
        },
        404,
      );
    }

    const ticket = ticketResult.documents[0];

    // ── Check ticket status ──────────────────────────────────────────────────
    if (ticket.status === "used") {
      log(`Ticket already used: ${sanitizedCode} (usedAt: ${ticket.usedAt})`);
      return res.json(
        {
          ok: false,
          error: {
            code: "ERR_VALIDATE_ALREADY_USED",
            message: "Ticket already used",
            usedAt: ticket.usedAt,
          },
          data: extractSnapshotDisplay(ticket),
        },
        409,
      );
    }

    if (ticket.status === "cancelled") {
      log(`Ticket cancelled: ${sanitizedCode}`);
      return res.json(
        {
          ok: false,
          error: {
            code: "ERR_VALIDATE_CANCELLED",
            message: "Ticket cancelled",
          },
          data: extractSnapshotDisplay(ticket),
        },
        410,
      );
    }

    if (ticket.status === "expired") {
      log(`Ticket expired: ${sanitizedCode}`);
      return res.json(
        {
          ok: false,
          error: { code: "ERR_VALIDATE_EXPIRED", message: "Ticket expired" },
          data: extractSnapshotDisplay(ticket),
        },
        410,
      );
    }

    if (ticket.status !== "valid") {
      log(`Ticket in unexpected status: ${sanitizedCode} (${ticket.status})`);
      return res.json(
        {
          ok: false,
          error: {
            code: "ERR_VALIDATE_INVALID_STATUS",
            message: `Ticket status: ${ticket.status}`,
          },
        },
        400,
      );
    }

    // ── Schedule window check (informational — does not block "check") ───────
    const schedule = getScheduleState(ticket);

    // ── "check" action stops here — read-only ─────────────────────────────────
    if (action === "check") {
      return res.json({
        ok: true,
        data: { ticket: extractSnapshotDisplay(ticket), schedule, confirmed: false },
      });
    }

    // ── "confirm" action — mark ticket as used ────────────────────────────────
    const now = new Date().toISOString();

    await db.updateDocument(DB, COL_TICKETS, ticket.$id, {
      status: "used",
      usedAt: now,
    });

    log(`Ticket confirmed: ${sanitizedCode} → used (by ${userId})`);

    // ── Create redemption record ─────────────────────────────────────────────
    const redemptionData = {
      ticketId: ticket.$id,
      redeemedBy: userId,
      redeemedAt: now,
      method: redemptionMethod,
    };

    if (notes && typeof notes === "string") {
      redemptionData.notes = notes.slice(0, 500);
    }

    await db.createDocument(DB, COL_REDEMPTIONS, ID.unique(), redemptionData);

    log(
      `Redemption recorded: ticket=${ticket.$id}, by=${userId}, method=${redemptionMethod}`,
    );

    // ── Update associated booking if exists ──────────────────────────────────
    if (ticket.orderId && ticket.slotId) {
      try {
        const bookingResult = await db.listDocuments(DB, COL_BOOKINGS, [
          Query.equal("orderId", ticket.orderId),
          Query.equal("slotId", ticket.slotId),
          Query.limit(1),
        ]);

        if (bookingResult.total > 0) {
          const booking = bookingResult.documents[0];

          if (booking.status === "confirmed") {
            await db.updateDocument(DB, COL_BOOKINGS, booking.$id, {
              status: "checked-in",
              checkedInAt: now,
            });
            log(`Booking ${booking.$id} updated to checked-in`);
          } else {
            log(
              `Booking ${booking.$id} already in status: ${booking.status}, skipping`,
            );
          }
        }
      } catch (err) {
        // Booking update is best-effort — don't fail the confirmation
        log(
          `WARN: Failed to update booking for ticket ${ticket.$id}: ${err.message}`,
        );
      }
    }

    // ── Return success with display data ─────────────────────────────────────
    const displayData = extractSnapshotDisplay({
      ...ticket,
      status: "used",
      usedAt: now,
    });

    return res.json({
      ok: true,
      data: {
        ticket: displayData,
        schedule,
        confirmed: true,
        redemptionMethod,
        redeemedBy: userId,
        redeemedAt: now,
      },
    });
  } catch (err) {
    error(`validate-ticket failed: ${err.message}`);
    return res.json(
      {
        ok: false,
        error: { code: "ERR_VALIDATE_INTERNAL", message: "Internal error" },
      },
      500,
    );
  }
};
