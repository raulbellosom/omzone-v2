# Check-in Daily Summary Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a real-data "daily summary" panel (today's stats, upcoming sessions, alerts, and a real day-wide activity feed) to the check-in module's side panel, in both normal admin mode and Kiosk mode (landscape/`lg`+), per [docs/superpowers/specs/2026-07-06-checkin-daily-summary-design.md](../specs/2026-07-06-checkin-daily-summary-design.md).

**Architecture:** One new Appwrite Function (`checkin-summary`) aggregates everything server-side in a single authenticated call (stats, today's upcoming sessions, alerts from `orders`/`admin_activity_logs` which operators can't read directly, and a real recent-activity feed with user names resolved via the server-only Users API). `validate-ticket` gains a small addition: it logs a `checkin.duplicate_scan_attempt` row to the existing `admin_activity_logs` audit table whenever a scan reveals an already-used ticket. The frontend gets one new hook (`useCheckInSummary`, polls every 75s + refetches after a successful check-in) and four small presentational components that replace `SessionHistoryList.jsx` in both `CheckInPage.jsx` and `KioskOverlay.jsx`.

**Tech Stack:** React 19, Vite, Tailwind, `node-appwrite` (new function + `validate-ticket` change), Appwrite CLI for function deployment, Appwrite MCP (`appwrite-api-dev`) for schema/function registration checks.

## Global Constraints

- Target project: **`omzone-dev`** (already the default per `src/config/env.js`) — no env changes needed to test locally.
- No test framework exists for functions or components in this repo (established convention, confirmed in prior plans). Verification is manual: deploy the function, call it directly (or exercise it through the running app), and exercise the frontend via the Vite dev server.
- All "today" boundaries are computed in `America/Mexico_City` (fixed year-round UTC-6, no DST since 2022).
- Follow existing conventions: Tailwind utility classes matching colors already used in this feature (`sage`, `charcoal`, `charcoal-muted`, `sand-dark`, plain `red`/`amber` for alert dots), `useLanguage()` for all strings, the `functions/_shared/logger.js` audit pattern (copy into `validate-ticket`, per its own documented convention — don't import cross-function).
- No changes to `ticket_redemptions`' schema — user display names are resolved live via the Users API inside the new function, not cached.

---

## File Structure

**Backend:**
- Create: `functions/checkin-summary/package.json`
- Create: `functions/checkin-summary/src/main.js`
- Modify: `appwrite.json` — register the new function (mirroring `validate-ticket`'s entry) and add its five new collection-id env-var defaults are inline in code, no schema/column changes.
- Modify: `functions/validate-ticket/src/main.js` — add the shared `logActivity` helper (copied from `functions/_shared/logger.js`) and one call site.

**Frontend:**
- Modify: `src/config/env.js` — add `functionCheckinSummary`.
- Create: `src/hooks/useCheckInSummary.js`.
- Create: `src/components/admin/checkin/DailySummaryCard.jsx`.
- Create: `src/components/admin/checkin/UpcomingSessionsCard.jsx`.
- Create: `src/components/admin/checkin/AlertsCard.jsx`.
- Create: `src/components/admin/checkin/RecentActivityList.jsx`.
- Delete: `src/components/admin/checkin/SessionHistoryList.jsx`.
- Modify: `src/pages/admin/CheckInPage.jsx`.
- Modify: `src/components/admin/checkin/KioskOverlay.jsx`.
- Modify: `src/i18n/es/admin.json`, `src/i18n/en/admin.json`.

---

### Task 1: Backend — `checkin-summary` Appwrite Function

**Files:**
- Create: `functions/checkin-summary/package.json`
- Create: `functions/checkin-summary/src/main.js`

**Interfaces:**
- Produces: HTTP contract consumed by Task 4's hook — `POST` with body `"{}"`. Success (200): `{ ok: true, data: { stats: { checkinsToday, pendingToday, upcomingCount, alertsCount }, upcomingSessions: [{ slotId, time, experienceName, roomName, bookedCount }], alerts: [{ type: "unpaid_order"|"duplicate_scan", title, detail, orderId?, ticketId }], recentActivity: [{ ticketCode, participantName, experienceName, redeemedByName, redeemedAt, method }] } }`. Failure: `{ ok: false, error: { code, message } }` (401/403/500).

- [ ] **Step 1: Create the function's `package.json`**

Create `functions/checkin-summary/package.json`:

```json
{
  "name": "checkin-summary",
  "version": "1.0.0",
  "type": "module",
  "dependencies": {
    "node-appwrite": "^16.0.0"
  }
}
```

- [ ] **Step 2: Create the function source**

Create `functions/checkin-summary/src/main.js`:

```js
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
    const unpaidAlerts = [];
    for (const order of unpaidOrdersRes.documents) {
      if (unpaidAlerts.length >= 10) break;
      const ticketsRes = await db.listDocuments(DB, COL_TICKETS, [
        Query.equal("orderId", order.$id),
        Query.limit(1),
      ]);
      const ticket = ticketsRes.documents[0];
      if (!ticket) continue;
      const snapshot = safeParseJson(ticket.ticketSnapshot);
      const slotStart = snapshot?.slotStartDatetime;
      if (!slotStart || slotStart < startOfDay || slotStart >= endOfDay) continue;
      unpaidAlerts.push({
        type: "unpaid_order",
        title: "Orden no pagada",
        detail: `${ticket.participantName || "—"} · ${snapshot?.experienceName || "—"}`,
        orderId: order.$id,
        ticketId: ticket.$id,
      });
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
        title: "Pase duplicado detectado",
        detail: `${details.participantName || details.ticketCode || "—"} · ${formatTimeMX(row.$createdAt)}`,
        ticketId: row.entityId,
      };
    });

    const alerts = [...unpaidAlerts, ...duplicateAlerts];

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

    const recentActivity = await Promise.all(
      recentRes.documents.map(async (redemption) => {
        let ticketCode = "—";
        let participantName = "—";
        let experienceName = "—";
        try {
          const ticket = await db.getDocument(DB, COL_TICKETS, redemption.ticketId);
          const snapshot = safeParseJson(ticket.ticketSnapshot);
          ticketCode = ticket.ticketCode || "—";
          participantName = ticket.participantName || "—";
          experienceName = snapshot?.experienceName || "—";
        } catch {
          // Ticket may have been hard-deleted; keep placeholders.
        }
        return {
          ticketCode,
          participantName,
          experienceName,
          redeemedByName: userNameMap[redemption.redeemedBy] || redemption.redeemedBy,
          redeemedAt: redemption.redeemedAt,
          method: redemption.method,
        };
      }),
    );

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
```

- [ ] **Step 3: Install dependencies**

```bash
cd functions/checkin-summary
npm install
cd ../..
```
Expected: `functions/checkin-summary/package-lock.json` and `node_modules/` created, no errors.

- [ ] **Step 4: Commit**

```bash
git add functions/checkin-summary/package.json functions/checkin-summary/src/main.js functions/checkin-summary/package-lock.json
git commit -m "feat(check-in): add checkin-summary function (stats, sessions, alerts, activity)"
```
(`node_modules/` is already gitignored per the repo's existing `.gitignore` — verify with `git status` that it isn't staged.)

---

### Task 2: Register and deploy `checkin-summary`

**Files:**
- Modify: `appwrite.json` (functions array)

**Interfaces:** No code interface — this makes the function deployable to `omzone-dev`.

- [ ] **Step 1: Register the function in `appwrite.json`**

Find `validate-ticket`'s function entry in `appwrite.json` (in the top-level `functions` array) and add a new entry for `checkin-summary` right after it, following the exact same shape:

```json
        {
            "$id": "checkin-summary",
            "name": "checkin-summary",
            "runtime": "node-22",
            "execute": [
                "users"
            ],
            "scopes": [
                "users.read",
                "documents.read",
                "collections.read",
                "databases.read"
            ],
            "events": [],
            "timeout": 15,
            "enabled": true,
            "logging": true,
            "deploymentRetention": 0,
            "entrypoint": "src/main.js",
            "commands": "npm install",
            "path": "functions/checkin-summary"
        },
```

(Note the scopes list omits `documents.write` — this function is read-only, per the spec.)

- [ ] **Step 2: Deploy to `omzone-dev`**

```bash
appwrite push function --function-id=checkin-summary --yes
```
Expected: build completes, CLI reports the new deployment as active.

- [ ] **Step 3: Verify auth/authorization manually**

As an authenticated admin/operator user, call the function (via the Appwrite console's "Execute now", or `curl` with a valid session per how other functions in this repo are invoked — see `docs/superpowers/plans/2026-07-04-checkin-access.md`'s Task 2 Step 3 for the exact pattern used elsewhere in this repo):

Payload: `{}`

Expected: `200`, `data.stats` present with all four numeric fields (likely `0` on a fresh test project — that's fine, confirms the shape works), `data.upcomingSessions`/`data.alerts`/`data.recentActivity` are arrays (possibly empty).

- [ ] **Step 4: Commit**

```bash
git add appwrite.json
git commit -m "feat(check-in): register checkin-summary function in appwrite.json"
```

---

### Task 3: Backend — log duplicate scan attempts in `validate-ticket`

**Files:**
- Modify: `functions/validate-ticket/src/main.js`

**Interfaces:**
- Produces: one new `admin_activity_logs` row per duplicate-scan detection — `{ action: "checkin.duplicate_scan_attempt", entityType: "ticket", entityId: <ticket.$id>, userId: <caller>, details: JSON string of { ticketCode, participantName, originalUsedAt }, severity: "warn" }`. Consumed by Task 1's function (already built to query this exact `action` value).
- No change to `validate-ticket`'s existing response shape or status codes.

- [ ] **Step 1: Add the shared audit-log helper**

In `functions/validate-ticket/src/main.js`, after the existing `// ─── Helpers ───` section's `getScheduleState` function (and before `// ─── Main Handler ───`), add (copied from `functions/_shared/logger.js`'s documented pattern, using `ID` which is already imported in this file):

```js
function _roleSnapshot(labels) {
  if (labels.includes("admin")) return "admin";
  if (labels.includes("operator")) return "operator";
  return "client";
}

async function logActivity(db, dbId, action, entityType, entityId, actorId, labels, details = {}) {
  try {
    if (labels.includes("root")) return; // ghost-user rule
    const detailsStr = JSON.stringify(details).slice(0, 4000);
    await db.createDocument(dbId, "admin_activity_logs", ID.unique(), {
      userId: actorId,
      action,
      entityType,
      entityId,
      details: detailsStr,
      severity: "warn",
      result: "ok",
      source: "function",
      actorRoleSnapshot: _roleSnapshot(labels),
    });
  } catch {
    /* non-critical — never let logging break the check-in flow */
  }
}
```

Note: `logActivity` is defined at module scope (alongside the other helpers like `getScheduleState`), but the database ID constant `DB` is declared *inside* the request handler (`const DB = process.env.APPWRITE_DATABASE_ID || "omzone_db";`) — a module-scope function can't close over a handler-local variable. That's why `logActivity` takes `dbId` as an explicit second parameter instead of reading a `DB` closed over from the handler; the call site (Step 2) passes the handler's local `DB` constant in explicitly.

- [ ] **Step 2: Call it at the shared `status === "used"` branch**

Find this block inside the main handler (currently around where the ticket status is checked, *before* the `if (action === "check")` early-return):

```js
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
```

Replace with (adds one `await logActivity(...)` call right before the `return`):

```js
    if (ticket.status === "used") {
      log(`Ticket already used: ${sanitizedCode} (usedAt: ${ticket.usedAt})`);
      await logActivity(db, DB, "checkin.duplicate_scan_attempt", "ticket", ticket.$id, userId, labels, {
        ticketCode: sanitizedCode,
        participantName: ticket.participantName || null,
        originalUsedAt: ticket.usedAt,
      });
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
```

Confirm `labels` is the exact variable name already in scope at this point (it's assigned earlier in the handler as `const labels = caller.labels || [];`, right after the `Authorize` section) — reuse it, don't redeclare.

- [ ] **Step 3: Deploy to `omzone-dev`**

```bash
appwrite push function --function-id=validate-ticket --yes
```
Expected: build completes, CLI reports the new deployment as active.

- [ ] **Step 4: Verify the log write**

Using a real ticket that's already `status: "used"` in `omzone-dev` (or flip a spare ticket to `used` via the MCP for this test), call `validate-ticket` with `{"ticketCode": "<used-ticket-code>", "action": "check"}` as an authenticated admin/operator (not root — the ghost-user rule intentionally skips logging for root). Expected: `409` response as before (unchanged), and a new document appears in `admin_activity_logs` with `action: "checkin.duplicate_scan_attempt"` and `entityId` matching the ticket's `$id` (verify via the MCP's list-documents tool on `admin_activity_logs`, `database_id: "omzone_db"`).

- [ ] **Step 5: Commit**

```bash
git add functions/validate-ticket/src/main.js
git commit -m "feat(check-in): log duplicate scan attempts to admin_activity_logs"
```

---

### Task 4: Frontend — `useCheckInSummary` hook

**Files:**
- Modify: `src/config/env.js`
- Create: `src/hooks/useCheckInSummary.js`

**Interfaces:**
- Produces (used by Task 6): `useCheckInSummary()` → `{ data: { stats, upcomingSessions, alerts, recentActivity } | null, loading: boolean, refetch: () => void }`.

- [ ] **Step 1: Add the function env var**

In `src/config/env.js`, in the `// ─── Functions ───` section, right after the existing `functionValidateTicket` entry:

```js
  functionValidateTicket:
    import.meta.env.VITE_APPWRITE_FUNCTION_VALIDATE_TICKET || "validate-ticket",
```

add:

```js
  functionCheckinSummary:
    import.meta.env.VITE_APPWRITE_FUNCTION_CHECKIN_SUMMARY || "checkin-summary",
```

- [ ] **Step 2: Create the hook**

Create `src/hooks/useCheckInSummary.js`:

```js
import { useState, useEffect, useCallback, useRef } from "react";
import { functions } from "@/lib/appwrite";
import env from "@/config/env";

const POLL_INTERVAL_MS = 75 * 1000;

async function callCheckinSummary() {
  const execution = await functions.createExecution(
    env.functionCheckinSummary,
    "{}",
    false,
    "/",
    "POST",
    { "Content-Type": "application/json" },
  );
  const body = JSON.parse(execution.responseBody);
  return { status: execution.responseStatusCode, body };
}

/**
 * Fetches the check-in page's daily summary (stats, upcoming sessions,
 * alerts, recent activity). Refreshes on a fixed interval; callers should
 * also invoke `refetch()` right after a successful check-in confirmation
 * so the operator sees it reflected without waiting for the next tick.
 */
export function useCheckInSummary() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const dataRef = useRef(null);

  const fetchSummary = useCallback(async () => {
    try {
      const { status, body } = await callCheckinSummary();
      if (status < 400 && body.ok) {
        dataRef.current = body.data;
        setData(body.data);
      }
      // On failure, silently keep the last-known-good data — this is a
      // background-refreshed convenience panel, not the primary scan flow.
    } catch {
      // Network error — keep last-known-good data.
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
    const id = setInterval(fetchSummary, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [fetchSummary]);

  return { data, loading, refetch: fetchSummary };
}
```

- [ ] **Step 3: Verify**

Run `npm run build` to confirm no syntax errors (revert any regenerated `public/docs/*.json` files afterward, per this repo's `predev`/`prebuild` side effect).

- [ ] **Step 4: Commit**

```bash
git add src/config/env.js src/hooks/useCheckInSummary.js
git commit -m "feat(check-in): add useCheckInSummary hook"
```

---

### Task 5: Frontend — summary panel components

**Files:**
- Create: `src/components/admin/checkin/DailySummaryCard.jsx`
- Create: `src/components/admin/checkin/UpcomingSessionsCard.jsx`
- Create: `src/components/admin/checkin/AlertsCard.jsx`
- Create: `src/components/admin/checkin/RecentActivityList.jsx`
- Modify: `src/i18n/es/admin.json`, `src/i18n/en/admin.json`

**Interfaces:**
- Produces (used by Task 6): `<DailySummaryCard stats={data?.stats} loading={boolean} />`, `<UpcomingSessionsCard sessions={data?.upcomingSessions} loading={boolean} />`, `<AlertsCard alerts={data?.alerts} loading={boolean} />`, `<RecentActivityList activity={data?.recentActivity} loading={boolean} />`. Each renders `null` once loaded with an empty list (no empty-card clutter), but still renders (with placeholder `—` values) while `loading` — except `DailySummaryCard`, which always renders (it's the primary stats grid, always relevant).

- [ ] **Step 1: Add i18n keys**

In `src/i18n/es/admin.json`, inside the existing `"checkin": { ... }` block, remove the now-unused `"sessionHistory"` key (line ~624) and add:

```json
      "summaryTitle": "Resumen del día",
      "summaryCheckins": "Check-ins realizados",
      "summaryPending": "Pases pendientes",
      "summaryUpcoming": "Próximas sesiones",
      "summaryAlerts": "Alertas",
      "upcomingTitle": "Próximas sesiones",
      "people": "persona(s)",
      "alertsTitle": "Alertas",
      "alertTypeUnpaidOrder": "Orden no pagada",
      "alertTypeDuplicateScan": "Pase duplicado detectado",
      "recentActivityTitle": "Actividad reciente"
```

In `src/i18n/en/admin.json`, inside `"checkin": { ... }`, remove the unused `"sessionHistory"` key and add:

```json
      "summaryTitle": "Today's summary",
      "summaryCheckins": "Check-ins completed",
      "summaryPending": "Pending passes",
      "summaryUpcoming": "Upcoming sessions",
      "summaryAlerts": "Alerts",
      "upcomingTitle": "Upcoming sessions",
      "people": "people",
      "alertsTitle": "Alerts",
      "alertTypeUnpaidOrder": "Unpaid order",
      "alertTypeDuplicateScan": "Duplicate pass detected",
      "recentActivityTitle": "Recent activity"
```

- [ ] **Step 2: Create `DailySummaryCard.jsx`**

Create `src/components/admin/checkin/DailySummaryCard.jsx`:

```jsx
import { useLanguage } from "@/hooks/useLanguage";

export default function DailySummaryCard({ stats, loading }) {
  const { t } = useLanguage();

  const tiles = [
    { key: "checkinsToday", label: t("admin.checkin.summaryCheckins"), value: stats?.checkinsToday, accent: false },
    { key: "pendingToday", label: t("admin.checkin.summaryPending"), value: stats?.pendingToday, accent: false },
    { key: "upcomingCount", label: t("admin.checkin.summaryUpcoming"), value: stats?.upcomingCount, accent: false },
    { key: "alertsCount", label: t("admin.checkin.summaryAlerts"), value: stats?.alertsCount, accent: true },
  ];

  return (
    <div className="bg-white rounded-2xl border border-sand-dark/30 shadow-sm p-5">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-charcoal-muted mb-3">
        {t("admin.checkin.summaryTitle")}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {tiles.map((tile) => (
          <div
            key={tile.key}
            className="bg-sand-dark/5 border border-sand-dark/20 rounded-xl px-4 py-3"
          >
            <div
              className={`font-display text-2xl font-semibold leading-none ${
                tile.accent ? "text-red-600" : "text-charcoal"
              }`}
            >
              {loading ? "—" : (tile.value ?? 0)}
            </div>
            <div className="text-xs text-charcoal-muted mt-1.5">{tile.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create `UpcomingSessionsCard.jsx`**

Create `src/components/admin/checkin/UpcomingSessionsCard.jsx`:

```jsx
import { useLanguage } from "@/hooks/useLanguage";

export default function UpcomingSessionsCard({ sessions, loading }) {
  const { t } = useLanguage();
  const list = sessions || [];

  if (!loading && list.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-sand-dark/30 shadow-sm p-5">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-charcoal-muted mb-3">
        {t("admin.checkin.upcomingTitle")}
      </div>
      <div className="space-y-1">
        {list.map((session) => (
          <div
            key={session.slotId}
            className="flex items-center gap-3 py-2.5 border-t border-sand-dark/15 first:border-t-0"
          >
            <div className="font-display text-sm font-semibold text-sage w-12 shrink-0">
              {session.time}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-charcoal truncate">
                {session.experienceName}
              </div>
              <div className="text-xs text-charcoal-muted truncate">
                {session.roomName} · {session.bookedCount} {t("admin.checkin.people")}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create `AlertsCard.jsx`**

Create `src/components/admin/checkin/AlertsCard.jsx`:

```jsx
import { useLanguage } from "@/hooks/useLanguage";

const DOT_COLOR = {
  unpaid_order: "bg-red-500",
  duplicate_scan: "bg-amber-500",
};

const TITLE_KEY = {
  unpaid_order: "admin.checkin.alertTypeUnpaidOrder",
  duplicate_scan: "admin.checkin.alertTypeDuplicateScan",
};

export default function AlertsCard({ alerts, loading }) {
  const { t } = useLanguage();
  const list = alerts || [];

  if (!loading && list.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-sand-dark/30 shadow-sm p-5">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-charcoal-muted mb-3">
        {t("admin.checkin.alertsTitle")}
      </div>
      <div className="space-y-1">
        {list.map((alert, idx) => (
          <div
            key={`${alert.type}-${alert.ticketId}-${idx}`}
            className="flex items-start gap-3 py-2.5 border-t border-sand-dark/15 first:border-t-0"
          >
            <span
              className={`h-2 w-2 rounded-full mt-1.5 shrink-0 ${DOT_COLOR[alert.type] || "bg-charcoal-muted"}`}
            />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-charcoal">
                {t(TITLE_KEY[alert.type] || "admin.checkin.alertsTitle")}
              </div>
              <div className="text-xs text-charcoal-muted truncate">{alert.detail}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Create `RecentActivityList.jsx`**

Create `src/components/admin/checkin/RecentActivityList.jsx`:

```jsx
import { useLanguage } from "@/hooks/useLanguage";

function formatTime(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function RecentActivityList({ activity, loading }) {
  const { t } = useLanguage();
  const list = activity || [];

  if (!loading && list.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-sand-dark/30 shadow-sm p-5">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-charcoal-muted mb-3">
        {t("admin.checkin.recentActivityTitle")}
      </div>
      <div className="space-y-1">
        {list.map((entry, idx) => (
          <div
            key={`${entry.ticketCode}-${idx}`}
            className="flex items-center gap-3 py-2.5 border-t border-sand-dark/15 first:border-t-0"
          >
            <div className="text-xs font-semibold text-charcoal-muted w-14 shrink-0">
              {formatTime(entry.redeemedAt)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-charcoal truncate">
                {entry.participantName}
              </div>
              <div className="text-xs text-charcoal-muted truncate">
                {entry.experienceName} · {entry.redeemedByName}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Verify**

Run `npm run build` to confirm no syntax errors (revert regenerated docs-index files afterward).

- [ ] **Step 7: Commit**

```bash
git add src/components/admin/checkin/DailySummaryCard.jsx src/components/admin/checkin/UpcomingSessionsCard.jsx src/components/admin/checkin/AlertsCard.jsx src/components/admin/checkin/RecentActivityList.jsx src/i18n/es/admin.json src/i18n/en/admin.json
git commit -m "feat(check-in): add daily summary, upcoming sessions, alerts, and activity components"
```

---

### Task 6: Frontend — rewire `CheckInPage.jsx`

**Files:**
- Delete: `src/components/admin/checkin/SessionHistoryList.jsx`
- Modify: `src/pages/admin/CheckInPage.jsx`

**Interfaces:**
- Consumes: `useCheckInSummary` (Task 4), the four new cards (Task 5).
- Produces: `KioskOverlay` is now called with a `summaryPanel` prop (a single pre-rendered node bundling all four cards) instead of the old raw `history` array — Task 7 updates `KioskOverlay.jsx` to match.

- [ ] **Step 1: Delete the old component**

```bash
git rm src/components/admin/checkin/SessionHistoryList.jsx
```

- [ ] **Step 2: Replace `CheckInPage.jsx`**

Replace the entire contents of `src/pages/admin/CheckInPage.jsx` with:

```jsx
import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTicketCheckIn } from "@/hooks/useTicketCheckIn";
import { useCheckInSummary } from "@/hooks/useCheckInSummary";
import { useLanguage } from "@/hooks/useLanguage";
import { ROUTES } from "@/constants/routes";
import ScannerCard from "@/components/admin/checkin/ScannerCard";
import ManualCodeInput from "@/components/admin/checkin/ManualCodeInput";
import DailySummaryCard from "@/components/admin/checkin/DailySummaryCard";
import UpcomingSessionsCard from "@/components/admin/checkin/UpcomingSessionsCard";
import AlertsCard from "@/components/admin/checkin/AlertsCard";
import RecentActivityList from "@/components/admin/checkin/RecentActivityList";
import CheckInResultModal from "@/components/admin/checkin/CheckInResultModal";
import KioskOverlay from "@/components/admin/checkin/KioskOverlay";
import Button from "@/components/common/Button";
import { ScanLine, Maximize2 } from "lucide-react";

export default function CheckInPage() {
  const { state, checkTicket, confirmEntry, reset } = useTicketCheckIn();
  const { data: summary, loading: summaryLoading, refetch: refetchSummary } =
    useCheckInSummary();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [kioskMode, setKioskMode] = useState(false);
  const [focusToken, setFocusToken] = useState(0);

  const bumpFocus = useCallback(() => setFocusToken((n) => n + 1), []);

  const handleSubmitCode = useCallback(
    (code) => {
      checkTicket(code);
    },
    [checkTicket],
  );

  const handleConfirm = useCallback(
    async (ticketCode) => {
      const method = kioskMode ? "kiosk" : "manual";
      const result = await confirmEntry(ticketCode, method);
      if (result) {
        refetchSummary();
      }
    },
    [confirmEntry, kioskMode, refetchSummary],
  );

  const handleScanAnother = useCallback(() => {
    reset();
    bumpFocus();
  }, [reset, bumpFocus]);

  const handleViewDetails = useCallback(
    (ticketId) => {
      navigate(ROUTES.ADMIN_TICKET_DETAIL.replace(":ticketId", ticketId));
    },
    [navigate],
  );

  const handleSearchClient = useCallback(() => {
    navigate(ROUTES.ADMIN_CLIENTS);
  }, [navigate]);

  const disabled = state.phase === "loading" || state.phase === "confirming";

  const scanner = <ScannerCard onSubmitCode={handleSubmitCode} />;

  const manualInput = (
    <ManualCodeInput
      onSubmitCode={handleSubmitCode}
      disabled={disabled}
      focusToken={focusToken}
    />
  );

  const summaryPanel = (
    <>
      <DailySummaryCard stats={summary?.stats} loading={summaryLoading} />
      <UpcomingSessionsCard sessions={summary?.upcomingSessions} loading={summaryLoading} />
      <AlertsCard alerts={summary?.alerts} loading={summaryLoading} />
      <RecentActivityList activity={summary?.recentActivity} loading={summaryLoading} />
    </>
  );

  const modal = (
    <CheckInResultModal
      state={state}
      onConfirm={handleConfirm}
      onScanAnother={handleScanAnother}
      onViewDetails={handleViewDetails}
      onSearchClient={handleSearchClient}
    />
  );

  if (kioskMode) {
    return (
      <KioskOverlay
        onExit={() => setKioskMode(false)}
        scanner={scanner}
        manualInput={manualInput}
        summaryPanel={summaryPanel}
      >
        {modal}
      </KioskOverlay>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-sage/10 flex items-center justify-center">
            <ScanLine className="h-5 w-5 text-sage" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-display font-bold text-charcoal">
              {t("admin.checkin.title")}
            </h1>
            <p className="text-sm text-charcoal-muted">{t("admin.checkin.subtitle")}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => setKioskMode(true)}>
          <Maximize2 className="h-4 w-4 mr-1.5" />
          {t("admin.checkin.kioskEnter")}
        </Button>
      </div>

      {/* Camera on top under lg, side-by-side with manual input + summary at lg+ */}
      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-6 items-start">
        {scanner}
        <div className="flex flex-col gap-6">
          {manualInput}
          {summaryPanel}
        </div>
      </div>

      {modal}
    </div>
  );
}
```

Key changes from the previous version: `history`/`MAX_HISTORY`/`setHistory` are gone entirely (replaced by `useCheckInSummary()`'s `data`/`loading`); `handleConfirm` calls `refetchSummary()` instead of updating local state; `handleScanAnother` no longer needs to save `state.data` into a history array (there is no local history anymore — the real data comes from the backend); `KioskOverlay` receives a new `summaryPanel` prop (a `<>...</>` fragment bundling all four cards) instead of the old `history` array prop.

- [ ] **Step 3: Verify no other file references the deleted component or removed state**

```bash
grep -rn "SessionHistoryList\|MAX_HISTORY" src/
```
Expected: no output.

- [ ] **Step 4: Commit**

```bash
git add src/pages/admin/CheckInPage.jsx
git commit -m "feat(check-in): wire real daily summary panel into CheckInPage, remove local history"
```
(The `SessionHistoryList.jsx` deletion from Step 1 is included in the same commit via `git rm`.)

---

### Task 7: Frontend — rewire `KioskOverlay.jsx`

**Files:**
- Modify: `src/components/admin/checkin/KioskOverlay.jsx`

**Interfaces:**
- Produces: `<KioskOverlay onExit scanner manualInput summaryPanel>{children}</KioskOverlay>` — `summaryPanel` (a pre-rendered node) replaces the old `history` array prop, rendered only at `lg` and up (matches the approved design: Kiosk stays camera+input-only below `lg`).

- [ ] **Step 1: Replace the file**

Replace the entire contents of `src/components/admin/checkin/KioskOverlay.jsx` with:

```jsx
import { useEffect, useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";

function useClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

export default function KioskOverlay({
  onExit,
  scanner,
  manualInput,
  summaryPanel,
  children,
}) {
  const { t, language } = useLanguage();
  const now = useClock();

  const clock = now.toLocaleTimeString(language === "es" ? "es-MX" : "en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const dateLabel = now.toLocaleDateString(language === "es" ? "es-MX" : "en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-[#F4F1EA]">
      <div className="flex items-center justify-between px-8 py-5 border-b border-sand-dark/40 bg-white/70 backdrop-blur">
        <span className="font-display text-2xl font-semibold tracking-wide text-charcoal">
          OMZONE
        </span>
        <div className="text-center">
          <div className="font-display text-3xl font-semibold text-charcoal leading-none">
            {clock}
          </div>
          <div className="text-xs text-charcoal-muted mt-1 capitalize">{dateLabel}</div>
        </div>
        <button
          onClick={onExit}
          className="h-14 px-6 rounded-xl border border-sand-dark bg-white text-sm font-semibold text-charcoal hover:bg-warm-gray transition-colors cursor-pointer"
        >
          {t("admin.checkin.kioskExit")}
        </button>
      </div>
      <div className="flex-1 overflow-auto p-6 flex items-start justify-center">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-6 items-start">
          {scanner}
          <div className="flex flex-col gap-6">
            {manualInput}
            <div className="hidden lg:flex lg:flex-col lg:gap-6">{summaryPanel}</div>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}
```

Changes from the previous version: dropped the `SessionHistoryList` import; `history` prop renamed/replaced by `summaryPanel`; the `hidden lg:block` wrapper became `hidden lg:flex lg:flex-col lg:gap-6` since it now wraps four stacked cards (the fragment from `CheckInPage.jsx`) that need spacing between them, not a single list component.

- [ ] **Step 2: Verify**

Run `npm run build` to confirm no syntax errors (revert regenerated docs-index files afterward). Confirm via `grep -rn "history" src/components/admin/checkin/KioskOverlay.jsx` that no leftover reference to the old prop remains.

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/checkin/KioskOverlay.jsx
git commit -m "feat(check-in): show daily summary panel in KioskOverlay at lg"
```

---

### Task 8: Full manual end-to-end verification

**Files:** none (verification only).

- [ ] **Step 1: Verify the four cards render with real data**

Start `npm run dev`, log in as admin or operator, open `/admin/check-in`. Confirm all four cards appear in the side panel (stats grid always visible; the other three appear once there's real data, or stay hidden if genuinely empty — that's expected, not a bug). Confirm the numbers are plausible against `omzone-dev`'s actual data (cross-check `stats.checkinsToday` against a manual count of today's `ticket_redemptions` via the MCP, for instance).

- [ ] **Step 2: Verify refresh behavior**

Confirm a real check-in via the manual input or a demo ticket. Confirm the panel updates (checkinsToday increments, the new entry appears in "Actividad reciente") without a page reload, shortly after confirming — not waiting the full 75s.

- [ ] **Step 3: Verify the duplicate-scan alert end-to-end**

Re-scan (or manually re-submit) a ticket that's already `used`. Confirm the existing "Pase ya utilizado" result still shows correctly (no behavior change there), then reload the check-in page and confirm a new "Pase duplicado detectado" alert appears in the Alertas card within one refresh cycle.

- [ ] **Step 4: Verify Kiosk mode**

Enter Kiosk mode at a landscape/`lg` width — confirm the same four cards appear in the side panel. Shrink to portrait/narrow width while still in Kiosk — confirm the cards disappear (camera + manual input only), per the approved design.

- [ ] **Step 5: Verify operator-level access (not just admin)**

Log in as a user with only the `operator` label (not `admin`). Confirm the check-in page still shows the full panel with real data (this is the whole reason `checkin-summary` exists as a privileged function — confirm it actually works for operators, not just admins, since a plain client-side query would have failed silently for `orders`/`admin_activity_logs`-derived alerts).

- [ ] **Step 6: Report results to the user**

Summarize which scenarios passed/failed, noting explicitly if operator-level access (Step 5) or the duplicate-scan flow (Step 3) couldn't be fully exercised due to test-account limitations, before considering this plan complete.
