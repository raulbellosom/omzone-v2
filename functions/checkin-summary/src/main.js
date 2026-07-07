/**
 * @function checkin-summary
 * @description Aggregates today's check-in operations data for the admin/
 *   operator check-in page: stats (check-ins done, pending passes, upcoming
 *   sessions, alerts), the next few scheduled sessions today, alerts (unpaid
 *   orders and duplicate-scan attempts), and the most recent real check-ins
 *   today across all operators. Read-only — never mutates anything.
 * @trigger HTTP POST
 *
 * @input {Object} payload - empty object, no parameters (always "today",
 *   single location)
 *
 * @validates
 * - Auth: caller must be authenticated
 * - Authorize: caller must have label admin, operator, or root
 *
 * @entities
 * - Reads: ticket_redemptions, tickets, slots, experiences, rooms, orders,
 *   admin_activity_logs, Appwrite Users (for display names)
 *
 * @envVars
 * - APPWRITE_FUNCTION_API_ENDPOINT (built-in, auto-injected)
 * - APPWRITE_FUNCTION_PROJECT_ID (built-in, auto-injected)
 * - x-appwrite-key header (dynamic API key, runtime only)
 * - APPWRITE_DATABASE_ID (project-level global)
 * - APPWRITE_COLLECTION_TICKETS
 * - APPWRITE_COLLECTION_TICKET_REDEMPTIONS
 * - APPWRITE_COLLECTION_ORDERS
 * - APPWRITE_COLLECTION_SLOTS
 * - APPWRITE_COLLECTION_EXPERIENCES
 * - APPWRITE_COLLECTION_ROOMS
 * - APPWRITE_COLLECTION_ADMIN_ACTIVITY_LOGS
 *
 * @errors
 * - 401: Not authenticated
 * - 403: Insufficient permissions (not admin/operator/root)
 * - 500: Internal error
 *
 * @idempotent Always (read-only)
 * @returns {Object} { ok: true, data: { stats, upcomingSessions, alerts, recentActivity } }
 */

import { Client, Databases, Query, Users } from "node-appwrite";

const TIMEZONE_OFFSET = "-06:00"; // America/Mexico_City, no DST since 2022

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

function safeParseJson(str) {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}

/** Today's [start, end) bounds in America/Mexico_City, as UTC ISO strings. */
function todayBoundsUTC() {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Mexico_City",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const y = parts.find((p) => p.type === "year").value;
  const m = parts.find((p) => p.type === "month").value;
  const d = parts.find((p) => p.type === "day").value;

  const start = new Date(`${y}-${m}-${d}T00:00:00${TIMEZONE_OFFSET}`);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return { start: start.toISOString(), end: end.toISOString(), nowISO: now.toISOString() };
}

function formatTimeMX(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("es-MX", {
    timeZone: "America/Mexico_City",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async ({ req, res, error }) => {
  if (req.method !== "POST") {
    return res.json(
      { ok: false, error: { code: "ERR_METHOD_NOT_ALLOWED", message: "Only POST allowed" } },
      405,
    );
  }

  const client = initClient(req);
  const db = new Databases(client);
  const users = new Users(client);

  const DB = process.env.APPWRITE_DATABASE_ID || "omzone_db";
  const COL_TICKETS = process.env.APPWRITE_COLLECTION_TICKETS || "tickets";
  const COL_REDEMPTIONS =
    process.env.APPWRITE_COLLECTION_TICKET_REDEMPTIONS || "ticket_redemptions";
  const COL_ORDERS = process.env.APPWRITE_COLLECTION_ORDERS || "orders";
  const COL_SLOTS = process.env.APPWRITE_COLLECTION_SLOTS || "slots";
  const COL_EXPERIENCES = process.env.APPWRITE_COLLECTION_EXPERIENCES || "experiences";
  const COL_ROOMS = process.env.APPWRITE_COLLECTION_ROOMS || "rooms";
  const COL_ACTIVITY_LOGS =
    process.env.APPWRITE_COLLECTION_ADMIN_ACTIVITY_LOGS || "admin_activity_logs";

  try {
    // ── Auth ─────────────────────────────────────────────────────────────────
    const userId = req.headers["x-appwrite-user-id"];
    if (!userId) {
      return res.json(
        { ok: false, error: { code: "ERR_UNAUTHENTICATED", message: "Authentication required" } },
        401,
      );
    }

    // ── Authorize ────────────────────────────────────────────────────────────
    const caller = await users.get(userId);
    const labels = caller.labels || [];
    if (!labels.includes("admin") && !labels.includes("operator") && !labels.includes("root")) {
      return res.json(
        { ok: false, error: { code: "ERR_UNAUTHORIZED", message: "Insufficient permissions" } },
        403,
      );
    }

    const { start: startOfDay, end: endOfDay, nowISO } = todayBoundsUTC();

    // ── Check-ins today ──────────────────────────────────────────────────────
    const checkinsRes = await db.listDocuments(DB, COL_REDEMPTIONS, [
      Query.greaterThanEqual("redeemedAt", startOfDay),
      Query.lessThan("redeemedAt", endOfDay),
      Query.limit(1),
    ]);
    const checkinsToday = checkinsRes.total;

    // ── Today's published slots (reused for pending count + upcoming list) ──
    const todaySlotsRes = await db.listDocuments(DB, COL_SLOTS, [
      Query.greaterThanEqual("startDatetime", startOfDay),
      Query.lessThan("startDatetime", endOfDay),
      Query.equal("status", "published"),
      Query.orderAsc("startDatetime"),
      Query.limit(100),
    ]);
    const todaySlotIds = todaySlotsRes.documents.map((s) => s.$id);

    // ── Pending passes (valid tickets tied to today's slots) ─────────────────
    let pendingToday = 0;
    if (todaySlotIds.length > 0) {
      const pendingRes = await db.listDocuments(DB, COL_TICKETS, [
        Query.equal("status", "valid"),
        Query.equal("slotId", todaySlotIds),
        Query.limit(1),
      ]);
      pendingToday = pendingRes.total;
    }

    // ── Upcoming sessions (today, from now, top 5) ───────────────────────────
    const upcomingSlots = todaySlotsRes.documents
      .filter((s) => s.startDatetime >= nowISO)
      .slice(0, 5);
    const expIds = [...new Set(upcomingSlots.map((s) => s.experienceId).filter(Boolean))];
    const roomIds = [...new Set(upcomingSlots.map((s) => s.roomId).filter(Boolean))];
    const expMap = {};
    const roomMap = {};
    await Promise.all([
      ...expIds.map(async (id) => {
        try {
          const exp = await db.getDocument(DB, COL_EXPERIENCES, id);
          expMap[id] = exp.publicName || exp.name || "—";
        } catch {
          expMap[id] = "—";
        }
      }),
      ...roomIds.map(async (id) => {
        try {
          const room = await db.getDocument(DB, COL_ROOMS, id);
          roomMap[id] = room.name || "—";
        } catch {
          roomMap[id] = "—";
        }
      }),
    ]);
    const upcomingSessions = upcomingSlots.map((s) => ({
      slotId: s.$id,
      time: formatTimeMX(s.startDatetime),
      experienceName: expMap[s.experienceId] || "—",
      roomName: s.roomId ? roomMap[s.roomId] || "—" : "—",
      bookedCount: s.bookedCount || 0,
    }));

    // ── Alerts: unpaid orders whose tickets are scheduled today ──────────────
    const unpaidOrdersRes = await db.listDocuments(DB, COL_ORDERS, [
      Query.equal("paymentStatus", "pending"),
      Query.orderDesc("$createdAt"),
      Query.limit(20),
    ]);
    const orderIds = unpaidOrdersRes.documents.map((o) => o.$id);
    const unpaidAlerts = [];
    if (orderIds.length > 0) {
      try {
        const ticketsRes = await db.listDocuments(DB, COL_TICKETS, [
          Query.equal("orderId", orderIds),
          Query.limit(orderIds.length),
        ]);
        const ticketsByOrderId = {};
        for (const ticket of ticketsRes.documents) {
          if (!ticketsByOrderId[ticket.orderId]) ticketsByOrderId[ticket.orderId] = ticket;
        }
        for (const order of unpaidOrdersRes.documents) {
          if (unpaidAlerts.length >= 10) break;
          const ticket = ticketsByOrderId[order.$id];
          if (!ticket) continue;
          const snapshot = safeParseJson(ticket.ticketSnapshot);
          const slotStart = snapshot?.slotStartDatetime;
          if (!slotStart || slotStart < startOfDay || slotStart >= endOfDay) continue;
          unpaidAlerts.push({
            type: "unpaid_order",
            detail: `${ticket.participantName || "—"} · ${snapshot?.experienceName || "—"}`,
            orderId: order.$id,
            ticketId: ticket.$id,
            createdAt: order.$createdAt,
          });
        }
      } catch {
        // Degrade gracefully — this is a background-refreshed panel, not the scan path.
      }
    }

    // ── Alerts: duplicate scan attempts today ────────────────────────────────
    const dupLogsRes = await db.listDocuments(DB, COL_ACTIVITY_LOGS, [
      Query.equal("action", "checkin.duplicate_scan_attempt"),
      Query.greaterThanEqual("$createdAt", startOfDay),
      Query.lessThan("$createdAt", endOfDay),
      Query.orderDesc("$createdAt"),
      Query.limit(10),
    ]);
    const duplicateAlerts = dupLogsRes.documents.map((row) => {
      const details = safeParseJson(row.details) || {};
      return {
        type: "duplicate_scan",
        detail: `${details.participantName || details.ticketCode || "—"} · ${formatTimeMX(row.$createdAt)}`,
        ticketId: row.entityId,
        createdAt: row.$createdAt,
      };
    });

    const alerts = [...unpaidAlerts, ...duplicateAlerts].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    );

    // ── Recent activity (today, all operators) ───────────────────────────────
    const recentRes = await db.listDocuments(DB, COL_REDEMPTIONS, [
      Query.greaterThanEqual("redeemedAt", startOfDay),
      Query.lessThan("redeemedAt", endOfDay),
      Query.orderDesc("redeemedAt"),
      Query.limit(10),
    ]);

    const uniqueUserIds = [
      ...new Set(recentRes.documents.map((r) => r.redeemedBy).filter(Boolean)),
    ];
    const userNameMap = {};
    await Promise.all(
      uniqueUserIds.map(async (id) => {
        try {
          const u = await users.get(id);
          userNameMap[id] = u.name || u.email || id;
        } catch {
          userNameMap[id] = id;
        }
      }),
    );

    const redemptionTicketIds = [
      ...new Set(recentRes.documents.map((r) => r.ticketId).filter(Boolean)),
    ];
    const ticketsById = {};
    if (redemptionTicketIds.length > 0) {
      try {
        const ticketsRes = await db.listDocuments(DB, COL_TICKETS, [
          Query.equal("$id", redemptionTicketIds),
          Query.limit(redemptionTicketIds.length),
        ]);
        for (const ticket of ticketsRes.documents) {
          ticketsById[ticket.$id] = ticket;
        }
      } catch {
        // Tickets may have been hard-deleted; keep placeholders below.
      }
    }

    const recentActivity = recentRes.documents.map((redemption) => {
      let ticketCode = "—";
      let participantName = "—";
      let experienceName = "—";
      const ticket = ticketsById[redemption.ticketId];
      if (ticket) {
        const snapshot = safeParseJson(ticket.ticketSnapshot);
        ticketCode = ticket.ticketCode || "—";
        participantName = ticket.participantName || "—";
        experienceName = snapshot?.experienceName || "—";
      }
      return {
        ticketCode,
        participantName,
        experienceName,
        redeemedByName: userNameMap[redemption.redeemedBy] || redemption.redeemedBy,
        redeemedAt: redemption.redeemedAt,
        method: redemption.method,
      };
    });

    return res.json({
      ok: true,
      data: {
        stats: {
          checkinsToday,
          pendingToday,
          upcomingCount: upcomingSessions.length,
          alertsCount: alerts.length,
        },
        upcomingSessions,
        alerts,
        recentActivity,
      },
    });
  } catch (err) {
    error(`checkin-summary failed: ${err.message}`);
    return res.json(
      { ok: false, error: { code: "ERR_CHECKIN_SUMMARY_INTERNAL", message: "Internal error" } },
      500,
    );
  }
};
