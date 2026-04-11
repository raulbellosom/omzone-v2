/**
 * @function validate-ticket
 * @description Validates a ticket by its ticketCode, marks it as used, creates a
 *   redemption record, and updates the associated booking to checked-in.
 *   Used by operators/admins at check-in points (QR scan or manual entry).
 * @trigger HTTP POST
 *
 * @input {Object} payload
 * @input {string} payload.ticketCode - The unique ticket code (required)
 * @input {string} [payload.method] - Redemption method: "qr_scan" | "manual" | "system" (default: "manual")
 * @input {string} [payload.notes] - Optional notes (e.g. location, observations)
 *
 * @validates
 * - Auth: caller must be authenticated
 * - Authorize: caller must have label admin, operator, or root
 * - Input: ticketCode is present, string, alphanumeric+hyphens only
 * - Business: ticket exists, status is "valid"
 *
 * @entities
 * - Reads: tickets (by ticketCode), bookings (by orderId + slotId)
 * - Writes: tickets (status → used, usedAt), bookings (status → checked-in, checkedInAt)
 * - Creates: ticket_redemptions
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
 * - 400: Missing or invalid ticketCode
 * - 401: Not authenticated
 * - 403: Insufficient permissions (not admin/operator/root)
 * - 404: Ticket not found
 * - 409: Ticket already used (includes usedAt)
 * - 410: Ticket cancelled or expired
 * - 500: Internal error
 *
 * @idempotent Yes — re-validating a used ticket returns 409 without duplicating redemptions
 * @returns {Object} { ok: true, data: { ticket: {...}, redeemed: true } }
 */

import { Client, Databases, Query, ID, Users } from "node-appwrite";

// ─── Constants ───────────────────────────────────────────────────────────────

const VALID_METHODS = ["qr_scan", "manual", "system"];
const TICKET_CODE_PATTERN = /^[A-Za-z0-9-]+$/;

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

/**
 * Extract display-friendly data from ticketSnapshot for the operator.
 */
function extractSnapshotDisplay(ticket) {
  let snapshot = null;
  try {
    snapshot = JSON.parse(ticket.ticketSnapshot);
  } catch {
    // Snapshot parsing failed — return minimal data
  }

  return {
    ticketCode: ticket.ticketCode,
    participantName: ticket.participantName || null,
    participantEmail: ticket.participantEmail || null,
    experienceName: snapshot?.experienceName || null,
    editionName: snapshot?.editionName || null,
    slotDate: snapshot?.slotDate || null,
    slotEndDate: snapshot?.slotEndDate || null,
    timezone: snapshot?.timezone || null,
    tierName: snapshot?.tierName || null,
    addons: snapshot?.addons || [],
    orderNumber: snapshot?.orderNumber || null,
    status: ticket.status,
    usedAt: ticket.usedAt || null,
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
    const body = JSON.parse(req.body || "{}");
    const { ticketCode, method, notes } = body;

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

    // ── Mark ticket as used ──────────────────────────────────────────────────
    const now = new Date().toISOString();

    await db.updateDocument(DB, COL_TICKETS, ticket.$id, {
      status: "used",
      usedAt: now,
    });

    log(`Ticket validated: ${sanitizedCode} → used (by ${userId})`);

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
        // Booking update is best-effort — don't fail the ticket validation
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
        redeemed: true,
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
