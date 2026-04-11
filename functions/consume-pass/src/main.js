/**
 * @function consume-pass
 * @description Consumes one credit from a user's pass to book a specific slot,
 *   generating a ticket and booking record. Validates ownership, expiry, credits,
 *   experience eligibility, and slot availability. Fully idempotent: if already
 *   consumed for the same userPass + slot, returns the existing ticket.
 * @trigger HTTP POST
 *
 * @input {Object} payload
 * @input {string} payload.userPassId - The user_passes document $id (required)
 * @input {string} payload.slotId     - The slot document $id (required)
 *
 * @validates
 * - Autenticación: requiere JWT válido (x-appwrite-user-id)
 * - Autorización: caller es dueño del pase (userId match) o label admin/root
 * - Input: userPassId y slotId son strings presentes
 * - Negocio: pase activo, no expirado, créditos disponibles, experiencia válida,
 *   slot publicado, futuro, con capacidad
 *
 * @entities
 * - Lee: user_passes, passes, slots, experiences
 * - Escribe: user_passes (actualiza usedCredits/status)
 * - Crea: tickets, bookings, pass_consumptions
 *
 * @envVars
 * - APPWRITE_FUNCTION_API_ENDPOINT (built-in)
 * - APPWRITE_FUNCTION_PROJECT_ID (built-in)
 * - req.headers['x-appwrite-key'] (runtime only)
 * - APPWRITE_DATABASE_ID
 * - APPWRITE_COLLECTION_USER_PASSES
 * - APPWRITE_COLLECTION_PASSES
 * - APPWRITE_COLLECTION_PASS_CONSUMPTIONS
 * - APPWRITE_COLLECTION_TICKETS
 * - APPWRITE_COLLECTION_BOOKINGS
 * - APPWRITE_COLLECTION_SLOTS
 * - APPWRITE_COLLECTION_EXPERIENCES
 *
 * @errors
 * - 400: Input inválido, pase no activo, expirado, sin créditos, experiencia no válida, slot pasado
 * - 401: No autenticado
 * - 403: No autorizado (no es dueño ni admin)
 * - 404: User pass / slot no encontrado
 * - 409: Slot lleno, ya consumido (idempotente)
 * - 500: Error interno
 *
 * @idempotent Yes — checks existing consumption for userPass + slot
 * @snapshots ticketSnapshot with snapshotVersion: 1
 * @returns {Object} { ok: true, data: { ticket, booking, remainingCredits, userPassStatus } }
 */

import {
  Client,
  Databases,
  Query,
  ID,
  Users,
  Permission,
  Role,
} from "node-appwrite";
import { randomUUID } from "node:crypto";

// ─── Constants ───────────────────────────────────────────────────────────────

const TICKET_CODE_PREFIX = "OMZ-TKT";
const SNAPSHOT_VERSION = 1;

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

function generateTicketCode() {
  const hex = randomUUID().replace(/-/g, "").slice(0, 12).toUpperCase();
  return `${TICKET_CODE_PREFIX}${hex}`;
}

function safeParse(str) {
  if (!str) return null;
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}

function isExpired(expiresAt) {
  if (!expiresAt) return false;
  return new Date(expiresAt) < new Date();
}

function isInPast(datetime) {
  return new Date(datetime) < new Date();
}

function buildDocPermissions(userId) {
  return [
    Permission.read(Role.user(userId)),
    Permission.read(Role.label("admin")),
    Permission.read(Role.label("root")),
    Permission.update(Role.label("admin")),
    Permission.update(Role.label("root")),
  ];
}

function buildTicketSnapshot(experience, slot, pass, userPass) {
  return JSON.stringify({
    snapshotVersion: SNAPSHOT_VERSION,
    experienceName: experience.name || null,
    experienceType: experience.type || null,
    slotDate: slot.startDatetime || null,
    slotEndDate: slot.endDatetime || null,
    timezone: slot.timezone || null,
    passName: pass.name || null,
    passId: pass.$id,
    totalCredits: userPass.totalCredits,
    creditsUsedBefore: userPass.usedCredits,
    creditsUsedAfter: userPass.usedCredits + 1,
    currency: pass.currency || "MXN",
    consumedViaPass: true,
    generatedAt: new Date().toISOString(),
  });
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
  const users = new Users(client);

  const DB = process.env.APPWRITE_DATABASE_ID || "omzone_db";
  const COL_USER_PASSES =
    process.env.APPWRITE_COLLECTION_USER_PASSES || "user_passes";
  const COL_PASSES = process.env.APPWRITE_COLLECTION_PASSES || "passes";
  const COL_CONSUMPTIONS =
    process.env.APPWRITE_COLLECTION_PASS_CONSUMPTIONS || "pass_consumptions";
  const COL_TICKETS = process.env.APPWRITE_COLLECTION_TICKETS || "tickets";
  const COL_BOOKINGS = process.env.APPWRITE_COLLECTION_BOOKINGS || "bookings";
  const COL_SLOTS = process.env.APPWRITE_COLLECTION_SLOTS || "slots";
  const COL_EXPERIENCES =
    process.env.APPWRITE_COLLECTION_EXPERIENCES || "experiences";

  try {
    // ── Parse input ──────────────────────────────────────────────────────────
    const body = JSON.parse(req.body || "{}");
    const { userPassId, slotId } = body;

    if (!userPassId || typeof userPassId !== "string") {
      return res.json(
        {
          ok: false,
          error: {
            code: "ERR_PASS_MISSING_USER_PASS",
            message: "userPassId is required",
          },
        },
        400,
      );
    }
    if (!slotId || typeof slotId !== "string") {
      return res.json(
        {
          ok: false,
          error: {
            code: "ERR_PASS_MISSING_SLOT",
            message: "slotId is required",
          },
        },
        400,
      );
    }

    // ── Auth ─────────────────────────────────────────────────────────────────
    const callerId = req.headers["x-appwrite-user-id"];
    if (!callerId) {
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

    // ── Fetch user pass ──────────────────────────────────────────────────────
    let userPass;
    try {
      userPass = await db.getDocument(DB, COL_USER_PASSES, userPassId);
    } catch {
      return res.json(
        {
          ok: false,
          error: { code: "ERR_PASS_NOT_FOUND", message: "User pass not found" },
        },
        404,
      );
    }

    // ── Authorize: ownership or admin ────────────────────────────────────────
    const caller = await users.get(callerId);
    const callerLabels = caller.labels || [];
    const isAdmin =
      callerLabels.includes("admin") || callerLabels.includes("root");
    const isOwner = userPass.userId === callerId;

    if (!isOwner && !isAdmin) {
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

    // ── Validate user pass state ─────────────────────────────────────────────
    if (userPass.status !== "active") {
      return res.json(
        {
          ok: false,
          error: {
            code: "ERR_PASS_NOT_ACTIVE",
            message: `Pass status is "${userPass.status}", must be "active"`,
          },
        },
        400,
      );
    }

    if (isExpired(userPass.expiresAt)) {
      // Also update pass status to expired
      try {
        await db.updateDocument(DB, COL_USER_PASSES, userPassId, {
          status: "expired",
        });
      } catch (e) {
        log(`Warning: failed to update expired pass status: ${e.message}`);
      }
      return res.json(
        {
          ok: false,
          error: { code: "ERR_PASS_EXPIRED", message: "Pass expired" },
        },
        400,
      );
    }

    const remainingCredits = userPass.totalCredits - userPass.usedCredits;
    if (remainingCredits <= 0) {
      return res.json(
        {
          ok: false,
          error: {
            code: "ERR_PASS_NO_CREDITS",
            message: "No credits remaining",
          },
        },
        400,
      );
    }

    // ── Fetch pass type ──────────────────────────────────────────────────────
    let pass;
    try {
      pass = await db.getDocument(DB, COL_PASSES, userPass.passId);
    } catch {
      return res.json(
        {
          ok: false,
          error: {
            code: "ERR_PASS_TYPE_NOT_FOUND",
            message: "Pass type not found",
          },
        },
        404,
      );
    }

    // ── Fetch slot ───────────────────────────────────────────────────────────
    let slot;
    try {
      slot = await db.getDocument(DB, COL_SLOTS, slotId);
    } catch {
      return res.json(
        {
          ok: false,
          error: { code: "ERR_SLOT_NOT_FOUND", message: "Slot not found" },
        },
        404,
      );
    }

    // ── Validate experience eligibility ──────────────────────────────────────
    const validIds = safeParse(pass.validExperienceIds) || [];
    if (validIds.length > 0 && !validIds.includes(slot.experienceId)) {
      return res.json(
        {
          ok: false,
          error: {
            code: "ERR_PASS_EXPERIENCE_NOT_VALID",
            message: "Experience not valid for this pass",
          },
        },
        400,
      );
    }

    // ── Validate slot state ──────────────────────────────────────────────────
    if (slot.status !== "published") {
      return res.json(
        {
          ok: false,
          error: {
            code: "ERR_SLOT_NOT_AVAILABLE",
            message: `Slot status is "${slot.status}", must be "published"`,
          },
        },
        400,
      );
    }

    if (isInPast(slot.startDatetime)) {
      return res.json(
        {
          ok: false,
          error: {
            code: "ERR_SLOT_ALREADY_STARTED",
            message: "Slot already started",
          },
        },
        400,
      );
    }

    if (slot.bookedCount >= slot.capacity) {
      return res.json(
        {
          ok: false,
          error: { code: "ERR_SLOT_FULL", message: "Slot is full" },
        },
        409,
      );
    }

    // ── Fetch experience (for snapshot) ──────────────────────────────────────
    let experience;
    try {
      experience = await db.getDocument(DB, COL_EXPERIENCES, slot.experienceId);
    } catch {
      experience = { name: null, type: null };
    }

    // ── Idempotency: check existing consumption for this userPass + slot ─────
    const existingConsumptions = await db.listDocuments(DB, COL_CONSUMPTIONS, [
      Query.equal("userPassId", userPassId),
      Query.equal("slotId", slotId),
      Query.limit(1),
    ]);

    if (existingConsumptions.total > 0) {
      log(
        `Already consumed: userPass=${userPassId} slot=${slotId} — returning existing`,
      );

      // Find the existing ticket for this slot + user
      const existingTickets = await db.listDocuments(DB, COL_TICKETS, [
        Query.equal("userId", userPass.userId),
        Query.equal("slotId", slotId),
        Query.limit(1),
      ]);

      const currentRemaining = userPass.totalCredits - userPass.usedCredits;
      return res.json({
        ok: true,
        data: {
          ticket: existingTickets.documents[0] || null,
          booking: null,
          remainingCredits: currentRemaining,
          userPassStatus: userPass.status,
          alreadyConsumed: true,
        },
      });
    }

    // ─── Execute consumption ─────────────────────────────────────────────────

    // 1. Generate ticket
    const ticketCode = generateTicketCode();
    const ticketSnapshot = buildTicketSnapshot(
      experience,
      slot,
      pass,
      userPass,
    );

    const docPerms = buildDocPermissions(userPass.userId);

    const ticket = await db.createDocument(
      DB,
      COL_TICKETS,
      ID.unique(),
      {
        orderId: userPass.orderId,
        orderItemId: userPass.orderItemId,
        userId: userPass.userId,
        experienceId: slot.experienceId,
        slotId: slotId,
        ticketCode,
        participantName: caller.name || null,
        participantEmail: caller.email || null,
        status: "valid",
        ticketSnapshot,
      },
      docPerms,
    );

    log(`Ticket created: ${ticket.$id} code=${ticketCode}`);

    // 2. Create booking
    let booking = null;
    try {
      booking = await db.createDocument(
        DB,
        COL_BOOKINGS,
        ID.unique(),
        {
          orderId: userPass.orderId,
          orderItemId: userPass.orderItemId,
          slotId: slotId,
          userId: userPass.userId,
          participantCount: 1,
          status: "confirmed",
        },
        docPerms,
      );
      log(`Booking created: ${booking.$id}`);
    } catch (e) {
      log(`Warning: booking creation failed: ${e.message}`);
    }

    // 3. Increment slot bookedCount (mark full if capacity reached)
    try {
      const newBookedCount = slot.bookedCount + 1;
      const slotUpdate = { bookedCount: newBookedCount };
      if (slot.capacity > 0 && newBookedCount >= slot.capacity) {
        slotUpdate.status = "full";
        log(
          `Slot ${slotId} will be marked as full (${newBookedCount}/${slot.capacity})`,
        );
      }
      await db.updateDocument(DB, COL_SLOTS, slotId, slotUpdate);
    } catch (e) {
      log(`Warning: slot bookedCount update failed: ${e.message}`);
    }

    // 4. Increment usedCredits on user pass
    const newUsedCredits = userPass.usedCredits + 1;
    const newRemaining = userPass.totalCredits - newUsedCredits;
    const newStatus = newRemaining <= 0 ? "exhausted" : "active";

    await db.updateDocument(DB, COL_USER_PASSES, userPassId, {
      usedCredits: newUsedCredits,
      status: newStatus,
    });

    log(`User pass updated: usedCredits=${newUsedCredits} status=${newStatus}`);

    // 5. Create consumption record
    const consumption = await db.createDocument(
      DB,
      COL_CONSUMPTIONS,
      ID.unique(),
      {
        userPassId,
        slotId,
        experienceId: slot.experienceId,
        creditsUsed: 1,
        consumedAt: new Date().toISOString(),
        notes: `Ticket ${ticketCode}`,
      },
      docPerms,
    );

    log(
      `Consumption recorded: ${consumption.$id} for userPass=${userPassId} slot=${slotId}`,
    );

    // ── Return ───────────────────────────────────────────────────────────────
    return res.json({
      ok: true,
      data: {
        ticket: {
          $id: ticket.$id,
          ticketCode: ticket.ticketCode,
          experienceId: ticket.experienceId,
          slotId: ticket.slotId,
          status: ticket.status,
        },
        booking: booking
          ? {
              $id: booking.$id,
              slotId: booking.slotId,
              status: booking.status,
            }
          : null,
        remainingCredits: newRemaining,
        userPassStatus: newStatus,
        alreadyConsumed: false,
      },
    });
  } catch (err) {
    error(`consume-pass failed: ${err.message}`);
    return res.json(
      { ok: false, error: { code: "ERR_INTERNAL", message: "Internal error" } },
      500,
    );
  }
};
