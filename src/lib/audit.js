/**
 * src/lib/audit.js — OMZONE Frontend Audit Client
 *
 * Provides two public APIs:
 *   auditAction(payload)   — track admin mutations (fire-and-forget)
 *   captureError(err, ctx) — capture JS errors for root-visible system_event_logs
 *
 * DESIGN:
 * - Events are batched in memory and flushed every 5 s or when the queue
 *   reaches 10 items, whichever comes first.
 * - On pagehide / beforeunload, remaining events are sent via sendBeacon.
 * - Errors within this module are silenced to avoid infinite loops.
 * - Root users: the log-event Function already enforces the ghost-user rule
 *   server-side; we do NOT need to block root users client-side.
 * - Deduplication: identical (action+entityId+severity) within a 2-second
 *   window is dropped to avoid duplicate events from rapid re-renders.
 */

import env from "@/config/env";
import { functions } from "@/lib/appwrite";
import { ExecutionMethod } from "appwrite";

// ── Config ─────────────────────────────────────────────────────────────────

const FLUSH_INTERVAL_MS = 5_000;
const BATCH_MAX = 10;
const DEDUP_WINDOW_MS = 2_000;
const FUNCTION_ID = env.functionLogEvent;

// ── Internal state ─────────────────────────────────────────────────────────

/** @type {Array<{type: string, [key: string]: any}>} */
let _queue = [];
let _timer = null;
let _isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;
/** @type {Map<string, number>} dedupKey → timestamp */
const _dedupCache = new Map();

// ── Helpers ────────────────────────────────────────────────────────────────

function _dedupKey(payload) {
  return `${payload.action}|${payload.entityId ?? ""}|${payload.severity ?? "info"}`;
}

function _isDuplicate(payload) {
  if (payload.type === "error") return false; // never dedup errors
  const key = _dedupKey(payload);
  const last = _dedupCache.get(key);
  const now = Date.now();
  if (last && now - last < DEDUP_WINDOW_MS) return true;
  _dedupCache.set(key, now);
  return false;
}

/** Add common metadata to every payload. */
function _enrich(payload) {
  return {
    ...payload,
    userAgent:
      typeof navigator !== "undefined" ? navigator.userAgent : undefined,
    route: typeof window !== "undefined" ? window.location.pathname : undefined,
    source: "admin",
  };
}

/** Send a single event to the log-event function. Returns a Promise. */
async function _send(payload) {
  try {
    await functions.createExecution(
      FUNCTION_ID,
      JSON.stringify(payload),
      false, // async = false → wait for response (fast function)
      "/",
      ExecutionMethod.POST,
      { "content-type": "application/json" },
    );
  } catch {
    // Silenced — audit must never crash the app
  }
}

/** Send all queued events. Falls back to sendBeacon if unavailable. */
function _flush(useBeacon = false) {
  if (_queue.length === 0) return;
  const batch = _queue.splice(0);

  if (useBeacon && typeof navigator !== "undefined" && navigator.sendBeacon) {
    // sendBeacon: fire-and-forget, survives page unload
    for (const item of batch) {
      try {
        const body = new Blob([JSON.stringify(item)], {
          type: "application/json",
        });
        // sendBeacon to the Appwrite functions execution endpoint indirectly —
        // we don't have direct URL access here so fall back to async XHR.
        // If sendBeacon isn't viable, silently discard (audit is non-critical).
        navigator.sendBeacon(
          `${env.appwriteEndpoint}/functions/${FUNCTION_ID}/executions`,
          body,
        );
      } catch {
        // Silenced
      }
    }
    return;
  }

  for (const item of batch) {
    _send(item);
  }
}

function _scheduleFlush() {
  if (_timer) return;
  _timer = setTimeout(() => {
    _timer = null;
    if (_isOnline) _flush();
  }, FLUSH_INTERVAL_MS);
}

function _enqueue(payload) {
  if (!_isOnline) {
    // Hold in queue until back online
    _queue.push(payload);
    return;
  }
  _queue.push(payload);
  if (_queue.length >= BATCH_MAX) {
    clearTimeout(_timer);
    _timer = null;
    _flush();
  } else {
    _scheduleFlush();
  }
}

// ── Lifecycle listeners (browser only) ────────────────────────────────────

if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    _isOnline = true;
    _flush();
  });
  window.addEventListener("offline", () => {
    _isOnline = false;
  });
  window.addEventListener("pagehide", () => _flush(true), { capture: true });
  window.addEventListener("beforeunload", () => _flush(true), {
    capture: true,
  });
}

// ── Public API ─────────────────────────────────────────────────────────────

/**
 * Track an admin action (mutations, navigations, UI events).
 *
 * @param {object} payload
 * @param {string} payload.action      - Dot-notation action key, e.g. "experience.update"
 * @param {string} payload.entityType  - Collection name, e.g. "experiences"
 * @param {string} payload.entityId    - Document ID
 * @param {object} [payload.details]   - Arbitrary JSON context (≤4 KB serialized)
 * @param {'info'|'warn'|'error'|'critical'} [payload.severity] - Default "info"
 */
export function auditAction({
  action,
  entityType,
  entityId,
  details,
  severity = "info",
}) {
  try {
    const payload = _enrich({
      type: "action",
      action,
      entityType,
      entityId,
      details,
      severity,
    });
    if (_isDuplicate(payload)) return;
    _enqueue(payload);
  } catch {
    // Silenced
  }
}

/**
 * Capture a JavaScript error and route it to system_event_logs (root-only).
 *
 * @param {Error|unknown} err
 * @param {object} [context] - Arbitrary JSON context
 */
export function captureError(err, context = {}) {
  try {
    const payload = _enrich({
      type: "error",
      errorName: err instanceof Error ? err.name : "UnknownError",
      errorMessage: err instanceof Error ? err.message : String(err),
      errorStack: err instanceof Error ? err.stack : undefined,
      context,
      severity: "error",
      source: context?.source ?? "admin",
    });
    _enqueue(payload);
  } catch {
    // Silenced
  }
}
