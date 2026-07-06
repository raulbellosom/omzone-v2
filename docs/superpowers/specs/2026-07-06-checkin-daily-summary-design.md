# Check-in daily summary: stats, upcoming sessions, alerts, real activity feed

**Date:** 2026-07-06
**Status:** Approved

## Context

The check-in module's side panel currently shows only a manual code input and a client-side "session history" list (`SessionHistoryList.jsx`) — check-ins the current operator scanned since opening the page, lost on refresh, invisible to other operators. The user shared a reference design bundle (`Check-in Access` — a Claude Design handoff, not committed to this repo) that shows a much richer side panel: a "Resumen del día" stats grid (check-ins today, pending passes, upcoming sessions, alerts), an "Alertas" list (unpaid orders, duplicate scan attempts), a "Próximas sesiones" list, and a real "Actividad reciente" feed. The reference design's actual full-screen Kiosk mode is deliberately minimal (camera + input only) — the rich panel lives only in the normal admin view in the reference — but this project's approved scope extends it into Kiosk too, at `lg` and up.

Data availability research (against `appwrite.json` and existing hooks):
- `slots` (`read("any")`) and `tickets`/`ticket_redemptions` (`read` includes `label:operator`) are already readable directly by any authenticated admin/operator via the client SDK — [useDashboardMetrics.js](../../../src/hooks/useDashboardMetrics.js) already does exactly this for the main admin dashboard.
- `orders` and `admin_activity_logs` restrict `read` to `label:admin`/`label:root` only — **operators cannot read these directly**, which is why the alerts data must come from a privileged Function rather than a client-side query.
- No existing data models "duplicate scan attempt" as an event. `admin_activity_logs` (`userId, action, entityType, entityId, details, severity, result`) is the established generic audit table other functions already write to via the shared pattern documented in [functions/_shared/logger.js](../../../functions/_shared/logger.js) — reused here rather than adding a new table.
- `ticket_redemptions` stores only `redeemedBy` (a raw user ID), no display name. Resolving it to "Raúl M." requires Appwrite's Users API, which is server-only (not callable from the client SDK) — the summary function resolves it live via `Users.get()`, so no schema change is needed for this.

**Decision:** despite the direct-read option being simpler, the user explicitly chose to centralize all of this (stats + upcoming sessions + alerts + recent activity) behind a single new Function rather than splitting it between direct client reads and a smaller alerts-only function — one round trip, one place to own the "today" boundary and join logic, consistent with how `validate-ticket` already centralizes ticket logic.

**Timezone:** all "today" boundaries are computed in `America/Mexico_City`.

## Decision

### 1. New Appwrite Function: `checkin-summary`

**File:** `functions/checkin-summary/src/main.js` (new function, new deployment, mirrors `validate-ticket`'s auth/init boilerplate).

**Request:** HTTP POST, empty body `{}` (no parameters — always "today", single location, no filters for v1).

**Auth:** same as `validate-ticket` — requires `x-appwrite-user-id` header (401 if missing), caller must have label `admin`, `operator`, or `root` (403 otherwise).

**Response (200):**
```json
{
  "ok": true,
  "data": {
    "stats": { "checkinsToday": 24, "pendingToday": 8, "upcomingCount": 5, "alertsCount": 2 },
    "upcomingSessions": [
      { "slotId": "...", "time": "10:30", "experienceName": "Recuperación de Rendimiento", "roomName": "Recovery Room 2", "bookedCount": 1 }
    ],
    "alerts": [
      { "type": "unpaid_order", "title": "Orden no pagada", "detail": "Tomás Vega · Evaluación en Apnea", "orderId": "...", "ticketId": "..." },
      { "type": "duplicate_scan", "title": "Pase duplicado detectado", "detail": "Daniel Herrera · 09:15 AM", "ticketId": "..." }
    ],
    "recentActivity": [
      { "ticketCode": "OMZ-8F42K", "participantName": "Daniel Herrera", "experienceName": "Rehabilitación Deportiva", "redeemedByName": "Raúl M.", "redeemedAt": "2026-07-06T15:52:00.000Z", "method": "kiosk" }
    ]
  }
}
```
Failure shape matches `validate-ticket`'s convention: `{ ok: false, error: { code, message } }` (401/403/500).

**Server-side computation (all queries scoped to `America/Mexico_City` "today" — start/end of day converted to UTC ISO strings before querying):**

1. `stats.checkinsToday` — `Databases.listDocuments(ticket_redemptions, [Query.greaterThanEqual("redeemedAt", startOfDay), Query.lessThan("redeemedAt", endOfDay), Query.limit(1)])`, read `.total`.
2. `stats.pendingToday` — query `slots` for `startDatetime` within today (any status, since a pending pass may belong to a slot regardless of publish state — use the same `status:"published"` filter as `useUpcomingSlots` for consistency), collect slot IDs; query `tickets` with `Query.equal("status", "valid")` + `Query.equal("slotId", slotIds)` (Appwrite treats an array value as an OR match), `Query.limit(1)`, read `.total`. If there are no matching slots today, short-circuit to 0 without querying tickets.
3. `upcomingSessions` — query `slots` with `Query.greaterThanEqual("startDatetime", now)`, `Query.lessThan("startDatetime", endOfDay)`, `Query.equal("status", "published")`, `Query.orderAsc("startDatetime")`, `Query.limit(5)`; enrich each with `experienceName` (batch `Databases.getDocument(experiences, id)` per unique `experienceId`, same pattern as `useUpcomingSlots`) and `roomName` (batch `getDocument(rooms, id)` per unique `roomId`, if the slot has one). `bookedCount`/`capacity` are already fields on `slots` — no join needed. `stats.upcomingCount` = this list's length (not a separate query — v1 only shows/counts the same top-5 window, per the reference design's "Próximas sesiones" card showing 3 items and its own stat tile with a matching count).
4. `alerts` (both sub-queries capped and combined into one array, most recent first):
   - **Unpaid orders today:** query `orders` with `Query.equal("paymentStatus", "pending")`, `Query.orderDesc("$createdAt")`, `Query.limit(20)` (recent-unpaid window, not all-time — keeps the join cheap); for each, query `tickets` with `Query.equal("orderId", order.$id)`, `Query.limit(1)`; for tickets found, parse `ticketSnapshot` for `participantName`/`slotStartDatetime`/`experienceName` and keep only those whose slot is today. Cap the final list at 10.
   - **Duplicate scan attempts today:** query `admin_activity_logs` with `Query.equal("action", "checkin.duplicate_scan_attempt")`, `Query.greaterThanEqual("$createdAt", startOfDay)`, `Query.lessThan("$createdAt", endOfDay)`, `Query.orderDesc("$createdAt")`, `Query.limit(10)`; parse each row's `details` JSON (written by `validate-ticket`, see below) for `ticketCode`/`participantName`.
   - `stats.alertsCount` = combined length of both (capped total, e.g. `Math.min(combined.length, 20)` is unnecessary since each sub-list is already capped at 10+10=20 max).
5. `recentActivity` — query `ticket_redemptions` with `Query.orderDesc("redeemedAt")`, `Query.greaterThanEqual("redeemedAt", startOfDay)`, `Query.limit(10)`; for each, fetch the linked `tickets` document (by `ticketId`) for `participantName`/`experienceName` (from its `ticketSnapshot`, same parsing helper `validate-ticket` already has as `extractSnapshotDisplay`); resolve `redeemedByName` via a batched `Users.get(userId)` call per unique `redeemedBy` (cache in a local map to avoid duplicate lookups within one request), falling back to the raw ID string if the lookup fails (e.g., deleted user).

**Env vars:** same set `validate-ticket` already uses (`APPWRITE_DATABASE_ID`, `APPWRITE_COLLECTION_TICKETS`, `APPWRITE_COLLECTION_TICKET_REDEMPTIONS`), plus four new ones following the exact same `process.env.X || "default-table-id"` pattern: `APPWRITE_COLLECTION_ORDERS` (default `"orders"`), `APPWRITE_COLLECTION_SLOTS` (default `"slots"`), `APPWRITE_COLLECTION_EXPERIENCES` (default `"experiences"`), `APPWRITE_COLLECTION_ROOMS` (default `"rooms"`), `APPWRITE_COLLECTION_ADMIN_ACTIVITY_LOGS` (default `"admin_activity_logs"`) — matching the table `$id`s confirmed in `appwrite.json`.

### 2. `validate-ticket` — log duplicate scan attempts

The `status === "used"` check (409 `ERR_VALIDATE_ALREADY_USED` response) runs *before* the function branches on `action`, so it fires for both `"check"` (the camera/manual-input flow's default action, used on every scan) and `"confirm"` — the log write must happen at this shared point, not inside a `"confirm"`-only branch, since the normal camera-scan flow never reaches `"confirm"` for an already-used ticket (the UI only shows a confirm button for valid, unused tickets). Right before this shared branch returns its 409, write one row to `admin_activity_logs` using the copied `logActivity` helper from [functions/_shared/logger.js](../../../functions/_shared/logger.js):
```js
await logActivity(db, "checkin.duplicate_scan_attempt", "ticket", ticket.$id, userId, callerLabels, {
  ticketCode: sanitizedCode,
  participantName: ticket.participantName || null,
  originalUsedAt: ticket.usedAt,
}, { severity: "warn" });
```
This is fire-and-forget from the caller's perspective (the existing 409 response is unchanged) — a logging failure must never block or alter the check-in flow's response. The ghost-user rule in the shared logger (root never leaves an audit trace) applies unchanged.

### 3. Frontend — `useCheckInSummary` hook

New `src/hooks/useCheckInSummary.js`, shaped like the plan's other check-in hooks:
```js
export function useCheckInSummary() {
  // calls functions.createExecution(env.functionCheckinSummary, "{}", ...)
  // returns { data: { stats, upcomingSessions, alerts, recentActivity } | null, loading, refetch }
}
```
- Fetches once on mount.
- Refetches automatically every 75 seconds (chosen as a single fixed value between the 60–90s range discussed, not user-configurable) via `setInterval`, cleaned up on unmount.
- Exposes `refetch()` so `CheckInPage.jsx` can call it immediately after a successful `confirmEntry` (in addition to the timer), so the operator sees their own check-in reflected without waiting up to 75s.
- On error, keeps the last-known-good `data` rather than clearing it (a transient network hiccup shouldn't blank out the whole panel) and does not surface a visible error state for v1 (silent retry on the next interval tick) — this is a background-refreshed convenience panel, not the primary check-in flow, so failures here should never block or distract from scanning.

### 4. Frontend — new components (in `src/components/admin/checkin/`)

- **`DailySummaryCard.jsx`** — `{ stats, loading }` → the 4-tile stats grid (Check-ins realizados, Pases pendientes, Próximas sesiones, Alertas), following `MetricCard.jsx`'s existing visual convention (card container, label, big number) adapted to a 2×2 grid matching the reference design's layout.
- **`UpcomingSessionsCard.jsx`** — `{ sessions, loading }` → the time/label/meta list.
- **`AlertsCard.jsx`** — `{ alerts, loading }` → the colored-dot list (red dot for `unpaid_order`, amber dot for `duplicate_scan`, matching the reference design's dot colors).
- **`RecentActivityList.jsx`** — replaces `SessionHistoryList.jsx` entirely (same visual slot in the layout, real data instead of local state): `{ activity, loading }`, row per entry (time, participant name, experience, colored outcome badge), no "session-local" framing since it's now day-wide.

`SessionHistoryList.jsx` is deleted. `CheckInPage.jsx`'s local `history` state, `MAX_HISTORY` constant, and the `setHistory` calls in `handleConfirm`/`handleScanAnother` are removed — the panel now reflects `useCheckInSummary()`'s `recentActivity` exclusively, refreshed via the hook's own timer + the `refetch()` call added to `handleConfirm` right after a successful `confirmEntry`.

### 5. Layout — normal mode and Kiosk mode

Both `CheckInPage.jsx`'s normal-mode side panel and `KioskOverlay.jsx`'s `lg`-and-up side panel gain the same four cards, in this order: `DailySummaryCard` → `UpcomingSessionsCard` → `AlertsCard` → `RecentActivityList` (matching the reference design's top-to-bottom order), stacked below `ManualCodeInput`. Below `lg` in Kiosk mode, none of these four render (Kiosk stays camera+input-only on portrait/narrow, per the existing approved responsive design) — only the normal (non-Kiosk) admin view shows them below `lg` too, stacked under the camera per the existing grid.

## Out of scope (v1)

- The reference design's separate "Búsqueda" and dedicated "Actividad" pages, and the enriched ticket "Detalle" page — explicitly deferred by the user to a future iteration; not built as part of this spec.
- Per-location filtering (single-location assumption, matches existing check-in code).
- Configurable poll interval or manual refresh button — fixed 75s + refetch-on-confirm is sufficient for v1.
- Any change to `ticket_redemptions`' schema (no `redeemedByName` column) — names are resolved live via the Users API inside the new function.

## Verification

No test framework exists for functions or components in this repo (established convention). Verification is manual, per `omzone-dev`: deploy `checkin-summary` and the updated `validate-ticket`, confirm via a real admin/operator session that the four cards populate with real data (create a test unpaid order and a duplicate-scan attempt against a real ticket to confirm both alert types appear), confirm the panel refreshes after confirming a check-in without waiting for the 75s timer, and confirm the panel appears in both normal mode and Kiosk mode (landscape/`lg`) but not Kiosk portrait.
