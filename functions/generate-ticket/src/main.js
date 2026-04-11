/**
 * @function generate-ticket
 * @description Generates ticket documents and booking records for a paid order.
 *   Each order item of type "edition" produces N tickets (one per unit of quantity).
 *   Includes an immutable ticketSnapshot for historical reconstruction.
 *   Idempotent: re-invocation returns existing tickets without duplicates.
 * @trigger HTTP POST — invoked internally by stripe-webhook or manually by admin
 *
 * @input {Object} payload
 * @input {string} payload.orderId - The order document $id (required)
 *
 * @validates
 * - Input: orderId is present and is a string
 * - Auth: caller is admin/root, or server-side invocation (API key)
 * - Business: order exists, order.status === "paid", idempotency check
 *
 * @entities
 * - Reads: orders, order_items, slots
 * - Creates: tickets, bookings
 *
 * @envVars
 * - APPWRITE_FUNCTION_API_ENDPOINT (built-in, auto-injected)
 * - APPWRITE_FUNCTION_PROJECT_ID (built-in, auto-injected)
 * - x-appwrite-key header (dynamic API key, runtime only)
 * - APPWRITE_DATABASE_ID (project-level global)
 * - APPWRITE_COLLECTION_ORDERS (project-level global)
 * - APPWRITE_COLLECTION_ORDER_ITEMS (project-level global)
 * - APPWRITE_COLLECTION_TICKETS (project-level global)
 * - APPWRITE_COLLECTION_BOOKINGS (project-level global)
 * - APPWRITE_COLLECTION_SLOTS (project-level global)
 *
 * @errors
 * - 400: Missing orderId, order not paid
 * - 401: Not authenticated (no user and no API key)
 * - 403: Insufficient permissions
 * - 404: Order not found
 * - 500: Internal error
 *
 * @idempotent Yes — checks existing tickets for the order before creating
 * @snapshots ticketSnapshot with snapshotVersion: 1
 * @returns {Object} { ok: true, data: { tickets: [...], bookings: [...], generated: boolean } }
 */

import {
  Client,
  Databases,
  Functions,
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

// Item types that produce tickets
const TICKETABLE_ITEM_TYPES = ["edition"];

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
 * Generate a unique ticket code: OMZ-TKT + 12 hex chars from crypto.
 */
function generateTicketCode() {
  const hex = randomUUID().replace(/-/g, "").slice(0, 12).toUpperCase();
  return `${TICKET_CODE_PREFIX}${hex}`;
}

/**
 * Build document-level permissions so the ticket owner and admins can access the document.
 */
function buildDocPermissions(userId) {
  return [
    Permission.read(Role.user(userId)),
    Permission.read(Role.label("admin")),
    Permission.read(Role.label("operator")),
    Permission.read(Role.label("root")),
    Permission.update(Role.label("admin")),
    Permission.update(Role.label("root")),
  ];
}

/**
 * Safely parse JSON string, returning null on failure.
 */
function safeParse(str) {
  if (!str) return null;
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}

/**
 * Build the immutable ticket snapshot from order and item data.
 */
function buildTicketSnapshot(order, item, itemSnapshotData, slotData) {
  return JSON.stringify({
    snapshotVersion: SNAPSHOT_VERSION,
    orderNumber: order.orderNumber,
    experienceName:
      itemSnapshotData?.experienceName || itemSnapshotData?.name || item.name,
    editionName: itemSnapshotData?.editionName || null,
    tierName:
      itemSnapshotData?.tierName || itemSnapshotData?.pricingTierName || null,
    slotDate: slotData?.startDatetime || null,
    slotEndDate: slotData?.endDatetime || null,
    timezone: slotData?.timezone || null,
    unitPrice: item.unitPrice,
    currency: item.currency || order.currency,
    participantName: order.customerName || null,
    participantEmail: order.customerEmail || null,
    addons: itemSnapshotData?.addons || [],
    itemType: item.itemType,
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

  const DB = process.env.APPWRITE_DATABASE_ID || "omzone_db";
  const COL_ORDERS = process.env.APPWRITE_COLLECTION_ORDERS || "orders";
  const COL_ORDER_ITEMS =
    process.env.APPWRITE_COLLECTION_ORDER_ITEMS || "order_items";
  const COL_TICKETS = process.env.APPWRITE_COLLECTION_TICKETS || "tickets";
  const COL_BOOKINGS = process.env.APPWRITE_COLLECTION_BOOKINGS || "bookings";
  const COL_SLOTS = process.env.APPWRITE_COLLECTION_SLOTS || "slots";

  try {
    // ── Parse input ──────────────────────────────────────────────────────────
    const body = JSON.parse(req.body || "{}");
    const { orderId } = body;

    if (!orderId || typeof orderId !== "string") {
      return res.json(
        {
          ok: false,
          error: {
            code: "ERR_TICKET_MISSING_ORDER",
            message: "orderId is required",
          },
        },
        400,
      );
    }

    // ── Auth / Authorize ─────────────────────────────────────────────────────
    const userId = req.headers["x-appwrite-user-id"];

    if (userId) {
      // Human caller → verify admin/root labels
      const users = new Users(client);
      const caller = await users.get(userId);
      const labels = caller.labels || [];

      if (!labels.includes("admin") && !labels.includes("root")) {
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
    }
    // If no userId, this is a server-side invocation (API key) — allowed

    // ── Fetch order ──────────────────────────────────────────────────────────
    let order;
    try {
      order = await db.getDocument(DB, COL_ORDERS, orderId);
    } catch {
      return res.json(
        {
          ok: false,
          error: {
            code: "ERR_TICKET_ORDER_NOT_FOUND",
            message: "Order not found",
          },
        },
        404,
      );
    }

    // ── Validate order status ────────────────────────────────────────────────
    if (order.status !== "paid") {
      return res.json(
        {
          ok: false,
          error: {
            code: "ERR_TICKET_ORDER_NOT_PAID",
            message: "Order not yet paid",
          },
        },
        400,
      );
    }

    // ── Idempotency check ────────────────────────────────────────────────────
    const existingTickets = await db.listDocuments(DB, COL_TICKETS, [
      Query.equal("orderId", orderId),
      Query.limit(100),
    ]);

    if (existingTickets.total > 0) {
      log(
        `Order ${orderId} already has ${existingTickets.total} tickets — returning existing`,
      );
      return res.json({
        ok: true,
        data: {
          tickets: existingTickets.documents.map((t) => ({
            $id: t.$id,
            ticketCode: t.ticketCode,
            experienceId: t.experienceId,
            slotId: t.slotId,
            status: t.status,
          })),
          bookings: [],
          generated: false,
        },
      });
    }

    // ── Fetch order items ────────────────────────────────────────────────────
    const orderItems = await db.listDocuments(DB, COL_ORDER_ITEMS, [
      Query.equal("orderId", orderId),
      Query.limit(100),
    ]);

    if (orderItems.total === 0) {
      log(`Order ${orderId} has no order items`);
      return res.json({
        ok: true,
        data: { tickets: [], bookings: [], generated: true },
      });
    }

    // ── Generate tickets + bookings ──────────────────────────────────────────
    const createdTickets = [];
    const createdBookings = [];
    const slotCache = new Map();

    for (const item of orderItems.documents) {
      // Only generate tickets for ticketable item types
      if (!TICKETABLE_ITEM_TYPES.includes(item.itemType)) {
        log(`Skipping item ${item.$id} (type: ${item.itemType})`);
        continue;
      }

      const quantity = item.quantity || 1;
      const itemSnapshotData = safeParse(item.itemSnapshot);

      // Fetch slot data if present (cached)
      let slotData = null;
      if (item.slotId) {
        if (slotCache.has(item.slotId)) {
          slotData = slotCache.get(item.slotId);
        } else {
          try {
            slotData = await db.getDocument(DB, COL_SLOTS, item.slotId);
            slotCache.set(item.slotId, slotData);
          } catch (err) {
            log(
              `WARN: Slot ${item.slotId} not found for item ${item.$id}: ${err.message}`,
            );
          }
        }
      }

      // Derive experienceId from item snapshot or slot
      const experienceId =
        itemSnapshotData?.experienceId ||
        itemSnapshotData?.editionId ||
        item.referenceId ||
        slotData?.experienceId ||
        "";

      // Generate N tickets (one per unit of quantity)
      for (let i = 0; i < quantity; i++) {
        const ticketCode = generateTicketCode();
        const ticketSnapshot = buildTicketSnapshot(
          order,
          item,
          itemSnapshotData,
          slotData,
        );

        const ticket = await db.createDocument(
          DB,
          COL_TICKETS,
          ID.unique(),
          {
            orderId,
            orderItemId: item.$id,
            userId: order.userId,
            experienceId,
            slotId: item.slotId || null,
            ticketCode,
            participantName: order.customerName || null,
            participantEmail: order.customerEmail || null,
            status: "valid",
            ticketSnapshot,
          },
          buildDocPermissions(order.userId),
        );

        createdTickets.push({
          $id: ticket.$id,
          ticketCode: ticket.ticketCode,
          experienceId: ticket.experienceId,
          slotId: ticket.slotId,
          status: ticket.status,
        });
      }

      // Create booking if slot is present (one booking per order item, not per ticket)
      if (item.slotId) {
        try {
          const booking = await db.createDocument(
            DB,
            COL_BOOKINGS,
            ID.unique(),
            {
              orderId,
              orderItemId: item.$id,
              slotId: item.slotId,
              userId: order.userId,
              participantCount: quantity,
              status: "confirmed",
            },
            buildDocPermissions(order.userId),
          );

          createdBookings.push({
            $id: booking.$id,
            slotId: booking.slotId,
            participantCount: booking.participantCount,
            status: booking.status,
          });

          log(
            `Booking created for slot ${item.slotId} (${quantity} participants)`,
          );
        } catch (err) {
          // Log but don't fail the whole operation if booking creation fails
          error(
            `Failed to create booking for slot ${item.slotId}: ${err.message}`,
          );
        }
      }

      // Note: bookedCount increment is handled by reconcileSlots() in stripe-webhook.
      // We do NOT re-increment here to avoid double-counting.
    }

    log(
      `Order ${orderId}: generated ${createdTickets.length} ticket(s), ${createdBookings.length} booking(s)`,
    );

    // ── Fire-and-forget: trigger confirmation email ──────────────────────────
    try {
      const functions = new Functions(client);
      const FUNC_SEND_CONFIRMATION =
        process.env.APPWRITE_FUNCTION_SEND_CONFIRMATION || "send-confirmation";
      await functions.createExecution(
        FUNC_SEND_CONFIRMATION,
        JSON.stringify({ orderId }),
        true, // async — non-blocking
      );
      log(`Triggered send-confirmation for order ${orderId}`);
    } catch (emailErr) {
      // Never let email failure block ticket delivery
      error(
        `send-confirmation trigger failed (non-blocking): ${emailErr.message}`,
      );
    }

    return res.json({
      ok: true,
      data: {
        tickets: createdTickets,
        bookings: createdBookings,
        generated: true,
      },
    });
  } catch (err) {
    error(`generate-ticket failed: ${err.message}`);
    return res.json(
      {
        ok: false,
        error: { code: "ERR_TICKET_INTERNAL", message: "Internal error" },
      },
      500,
    );
  }
};
