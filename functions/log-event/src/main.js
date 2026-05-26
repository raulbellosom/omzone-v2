/**
 * log-event — OMZONE Audit Bridge Function
 *
 * Receives audit events from the frontend (admin panel) and writes them
 * to admin_activity_logs or system_event_logs.
 *
 * Entrypoint: src/main.js
 * Runtime:    node-22
 * Execute:    users
 * Scopes:     users.read, documents.write, databases.read, collections.read
 *
 * CRITICAL: Root users NEVER generate audit traces (ghost-user rule).
 * Rate-limit: >50 events per user per minute → reject with 429.
 */

import { Client, Databases, Users, ID } from "node-appwrite";

// ── Constants ──────────────────────────────────────────────────────────────

const DB = process.env.APPWRITE_DATABASE_ID || "omzone_db";
const COL_ACTIVITY = "admin_activity_logs";
const COL_SYSTEM =
  process.env.APPWRITE_COLLECTION_SYSTEM_EVENT_LOGS || "system_event_logs";

const MAX_DETAILS_LEN = 4000;
const MAX_STACK_LEN = 8000;
const MAX_CONTEXT_LEN = 4000;
const MAX_MSG_LEN = 2000;
const RATE_LIMIT = 50; // events per RATE_WINDOW_MS
const RATE_WINDOW_MS = 60_000;

// In-memory rate-limit store (reset on cold start, good-enough for throttling)
const _rateCounts = new Map(); // userId → { count, windowStart }

// ── Helpers ────────────────────────────────────────────────────────────────

function initClient(req) {
  let endpoint = process.env.APPWRITE_FUNCTION_API_ENDPOINT;
  if (endpoint?.startsWith("http://")) {
    endpoint = endpoint.replace("http://", "https://");
  }
  return new Client()
    .setEndpoint(endpoint)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setSelfSigned(true)
    .setKey(req.headers["x-appwrite-key"]);
}

function truncate(str, max) {
  if (typeof str !== "string") return str;
  return str.length > max ? str.slice(0, max) : str;
}

function roleSnapshot(labels) {
  if (labels.includes("admin")) return "admin";
  if (labels.includes("operator")) return "operator";
  return "client";
}

/** Returns true if the user has exceeded the rate limit. */
function isRateLimited(userId) {
  const now = Date.now();
  const entry = _rateCounts.get(userId);
  if (!entry || now - entry.windowStart > RATE_WINDOW_MS) {
    _rateCounts.set(userId, { count: 1, windowStart: now });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT;
}

// ── Main handler ───────────────────────────────────────────────────────────

export default async ({ req, res, log, error }) => {
  if (req.method !== "POST") {
    return res.json(
      {
        ok: false,
        error: { code: "ERR_METHOD", message: "Only POST allowed" },
      },
      405,
    );
  }

  // ── 1. Auth ────────────────────────────────────────────────────────────
  const actorUserId = req.headers["x-appwrite-user-id"];
  if (!actorUserId) {
    return res.json(
      {
        ok: false,
        error: { code: "ERR_AUTH", message: "Authentication required" },
      },
      401,
    );
  }

  // ── 2. Rate limit ──────────────────────────────────────────────────────
  if (isRateLimited(actorUserId)) {
    return res.json(
      {
        ok: false,
        error: { code: "ERR_RATE_LIMIT", message: "Too many requests" },
      },
      429,
    );
  }

  // ── 3. Parse body ──────────────────────────────────────────────────────
  let body;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  } catch {
    return res.json(
      { ok: false, error: { code: "ERR_BODY", message: "Invalid JSON body" } },
      400,
    );
  }

  const {
    type = "action", // "action" | "error"
    action,
    entityType,
    entityId,
    details,
    severity = "info",
    result = "ok",
    route,
    userAgent,
    requestId,
    // error-type fields
    errorName,
    errorMessage,
    errorStack,
    context,
    correlationId,
  } = body || {};

  // ── 4. Fetch actor labels (ghost-user check) ───────────────────────────
  const client = initClient(req);
  const db = new Databases(client);
  const users = new Users(client);

  let actorLabels = [];
  try {
    const user = await users.get(actorUserId);
    actorLabels = user.labels || [];
  } catch (err) {
    error(`Failed to fetch actor labels: ${err.message}`);
    return res.json(
      {
        ok: false,
        error: { code: "ERR_USER", message: "Cannot verify actor identity" },
      },
      403,
    );
  }

  // Ghost-user rule: root users never leave any audit trace
  if (actorLabels.includes("root")) {
    return res.json({ ok: true, skipped: true });
  }

  // Determine IP (only included for admin sources, never for portal)
  const source = body.source || "admin";
  const ipRaw =
    req.headers["x-forwarded-for"] || req.headers["x-real-ip"] || null;
  const ipAddress =
    source === "portal"
      ? null
      : ipRaw
        ? String(ipRaw).split(",")[0].trim()
        : null;

  // ── 5. Write event ─────────────────────────────────────────────────────
  try {
    if (type === "error") {
      // system_event_logs — detailed error trace
      const errMsg = errorMessage
        ? truncate(String(errorMessage), MAX_MSG_LEN)
        : null;
      const errStack = errorStack
        ? truncate(String(errorStack), MAX_STACK_LEN)
        : null;
      const ctxStr = context
        ? truncate(JSON.stringify(context), MAX_CONTEXT_LEN)
        : null;

      await db.createDocument(DB, COL_SYSTEM, ID.unique(), {
        level: "error",
        source,
        userId: actorUserId,
        route: route ? truncate(String(route), 500) : null,
        errorName: errorName ? truncate(String(errorName), 255) : null,
        errorMessage: errMsg,
        errorStack: errStack,
        context: ctxStr,
        ...(ipAddress ? { ipAddress } : {}),
        ...(userAgent ? { userAgent: truncate(String(userAgent), 500) } : {}),
        ...(requestId ? { requestId: truncate(String(requestId), 64) } : {}),
        ...(correlationId
          ? { correlationId: truncate(String(correlationId), 64) }
          : {}),
      });

      log(`Logged system error for ${actorUserId} from ${source}`);
    } else {
      // admin_activity_logs — action event
      if (!action || !entityType || !entityId) {
        return res.json(
          {
            ok: false,
            error: {
              code: "ERR_MISSING_FIELDS",
              message:
                "action, entityType, entityId are required for action type",
            },
          },
          400,
        );
      }

      const detailsStr = details
        ? truncate(JSON.stringify(details), MAX_DETAILS_LEN)
        : null;

      await db.createDocument(DB, COL_ACTIVITY, ID.unique(), {
        userId: actorUserId,
        action: truncate(String(action), 100),
        entityType: truncate(String(entityType), 100),
        entityId: truncate(String(entityId), 255),
        details: detailsStr,
        severity: ["info", "warn", "error", "critical"].includes(severity)
          ? severity
          : "info",
        result: ["ok", "error"].includes(result) ? result : "ok",
        source,
        actorRoleSnapshot: roleSnapshot(actorLabels),
        ...(ipAddress ? { ipAddress } : {}),
        ...(userAgent ? { userAgent: truncate(String(userAgent), 500) } : {}),
        ...(route ? { route: truncate(String(route), 500) } : {}),
        ...(requestId ? { requestId: truncate(String(requestId), 64) } : {}),
      });

      log(
        `Logged action=${action} entity=${entityType}/${entityId} for ${actorUserId}`,
      );
    }

    return res.json({ ok: true });
  } catch (err) {
    error(`log-event write failed: ${err.message}`);
    return res.json(
      {
        ok: false,
        error: { code: "ERR_WRITE", message: "Failed to persist event" },
      },
      500,
    );
  }
};
