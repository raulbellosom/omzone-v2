# Check-in Audit Trail, Timing Visibility & Facility Arrival

**Date:** 2026-08-29
**Status:** Approved

## Context

Reviewing the Audit Log (`AuditLogPage.jsx`) and the kiosk check-in flow surfaced several gaps:

- [functions/validate-ticket/src/main.js](../../../functions/validate-ticket/src/main.js) only writes an audit entry for one outcome — `checkin.duplicate_scan_attempt` (already-used ticket). A successful check-in (`action: "confirm"`), a plain valid scan that's never confirmed, and every rejection (not found / cancelled / expired / outside the check-in window) leave no trace in `admin_activity_logs` at all. The only record of a successful check-in today is a `ticket_redemptions` row, which isn't wired into the Audit Log UI.
- No audit entry captures who the client is beyond a ticket code — no client user id, no session/experience context, no group-size signal, no staff identity — even though most of this is already available in-memory at scan time.
- [KioskOverlay.jsx](../../../src/components/admin/checkin/KioskOverlay.jsx) and the normal-mode header in [CheckInPage.jsx](../../../src/pages/admin/CheckInPage.jsx) never show which staff account is operating the scanner — it's captured server-side as `redeemedBy` but never rendered.
- [CheckInResultModal.jsx](../../../src/components/admin/checkin/CheckInResultModal.jsx) only shows session-start timing (`validFrom`/`validUntil`/`now`) when a scan is *rejected* for being outside the window. A normal in-window valid scan shows no session time or early/late context at all.
- There is no concept of "arrived at the facility" independent of session check-in. Reception scans a pass the moment a client walks in, often well before the session's `confirm`/"Registrar entrada" step happens — today that moment is invisible and the client gets no acknowledgment that they've arrived.

## Decision

Extend the existing `validate-ticket` function and `admin_activity_logs` collection rather than introducing new logging infrastructure — this stays consistent with how every other admin audit action already works. Add a first-scan "arrival" side effect that's additive to the existing read-only `check` action, reusing the existing transactional-email infrastructure (`send-notification` + `notification_templates`) for the welcome email, and introduce a small new in-app notification collection since no such mechanism exists yet.

## Part 1 — Audit trail for every check-in outcome

### `functions/validate-ticket/src/main.js`

`logActivity()` gains a `severity` parameter (currently hardcoded to `"warn"`) and a shared `buildAuditDetails(ticket, schedule, extra)` helper that assembles a consistent payload for every check-in-related audit entry:

```
ticketCode, ticketId, participantName, participantEmail, clientUserId,
experienceName, roomName, locationName, slotStartDatetime, timezone,
orderNumber, isGroupBooking, participantCount,
staffUserId, staffName, staffEmail,
schedule: { withinWindow, reason, minutesFromStart } | null,
...extra
```

`participantCount`/`isGroupBooking` comes from the `bookings` lookup by `orderId`+`slotId` (same indexed query already used in the `confirm` branch at line ~425) — this lookup is now also performed in the `check` action, which doesn't do it today. `staffName`/`staffEmail` come from the `caller` object already fetched via `users.get(userId)` for authorization — no extra query.

One `logActivity` call is added per outcome branch:

| Outcome | Action | Severity | Where |
|---|---|---|---|
| Ticket not found | `checkin.rejected_not_found` | warn | new, ~line 300 |
| Already used | `checkin.duplicate_scan_attempt` | warn | existing call, switched to shared details builder |
| Cancelled | `checkin.rejected_cancelled` | warn | new, ~line 338 |
| Expired | `checkin.rejected_expired` | warn | new, ~line 353 |
| Valid, outside check-in window | `checkin.rejected_schedule` | warn | new, after schedule computation, before the `check`-stops-here return |
| Valid, first scan of this ticket (any time) | `checkin.arrived` | info | new — see Part 3 |
| Valid, in window, re-scan (already arrived earlier) | `checkin.valid_scan` | info | new, in the `check`-stops-here return |
| `confirm` succeeds | `checkin.confirmed` | info | new — `confirm` branch currently has no audit call at all |

`checkin.arrived` and `checkin.rejected_schedule` are not mutually exclusive: arrival (Part 3) is guarded only by `!ticket.arrivedAt`, independent of the schedule window, per the explicit decision that an early arrival should still be welcomed. So the **first** scan of a ticket that happens to also be outside the window logs **both** `checkin.arrived` (this client just arrived) and `checkin.rejected_schedule` (this particular confirm attempt can't proceed yet) in the same request. `checkin.valid_scan` only fires when the ticket was already marked arrived by an earlier scan — it never co-occurs with `checkin.arrived`. Concretely, the order of checks in the `check` action is: (1) run the Part 3 arrival side effect if `!ticket.arrivedAt`, regardless of window; (2) if `!schedule.withinWindow`, log `checkin.rejected_schedule`; (3) else if arrival did *not* just fire (i.e. this was a re-scan), log `checkin.valid_scan`.

No changes to the Admin Audit Log UI (`AuditLogPage.jsx`) — `entityType: "ticket"` is already wired into `ENTITY_CONFIG`/`EntityLabel`, so all eight actions show up automatically with clickable ticket-code resolution and the existing Details drawer renders the richer JSON payload.

### `functions/validate-ticket/src/scheduleWindow.js`

`computeScheduleState` gains one additional field on its return value, computed unconditionally alongside the existing window math: `minutesFromStart` (positive = minutes before session start, negative = minutes after). Both the audit payload and the UI timing chip (Part 2) read this single server-computed number instead of deriving it independently client-side.

## Part 2 — Timing visibility in the kiosk UI

### Session-start chip — `CheckInResultModal.jsx`

The `group === "valid"` block (today only `group === "schedule"` shows any timing info) gets a "Sesión inicia: {time}" line plus a colored chip, derived from `data.schedule.minutesFromStart`:

- `> 5` → amber "Temprano" chip
- `< -5` → orange "Tarde" chip
- otherwise → green "A tiempo" chip

`schedule` is already returned by `checkTicket()` for every valid outcome ([useTicketCheckIn.js:63](../../../src/hooks/useTicketCheckIn.js#L63)) — display-only change, no new fetch.

### Staff badge — kiosk + normal mode + alerts

A small `StaffBadge` component (name from `useAuth().user.name`), rendered in three places:

- `KioskOverlay.jsx` header, between the clock and the exit button.
- `CheckInPage.jsx` normal-mode header, next to the "Modo Kiosco" button.
- A one-line "Operando: {name}" strip at the top of `AlertsCard.jsx`, above the alert list (only rendered when the card itself renders, i.e. when there are alerts — matches its existing collapse-when-empty behavior).

## Part 3 — Facility arrival

### Concept

"Arrival" is distinct from session check-in: it fires automatically on the **first** `check`-action scan of a given ticket (reception scanning the pass the moment someone walks in), regardless of whether the session has started yet. "Registrar entrada" (`confirm`) remains unchanged — a separate, later, explicit action for session check-in. Scoped **per ticket** (not per client-per-day): each ticket gets its own `arrivedAt`, so a client with two sessions the same day gets two arrival welcomes, each with that session's own timing.

### Schema changes

- `tickets.arrivedAt` (datetime, nullable) — one-shot marker, same pattern as the existing `usedAt`/`archivedAt` fields.
- **New collection `client_notifications`** (client-owned data pattern per `.github/instructions/appwrite-schema.instructions.md` §6.2):
  - `userId` (string, indexed), `type` (string, e.g. `arrival_welcome`), `title` (string), `body` (string), `ticketId` (string, optional), `isRead` (boolean, default `false`), `readAt` (datetime, nullable).
  - Permissions: `read` + `update` for `Role.user(userId)` (so the client can mark-as-read directly from the frontend) plus admin/root `read`; `create` server-side only (via API key from `validate-ticket`).
  - Index on `userId`, and on `userId+isRead` for the unread-count query.
  - Mirrors the `isRead`/`readAt` pattern already used by `contact_messages` ([appwrite.json:6204-6218](../../../appwrite.json)).
- **New row in `notification_templates`**: `key: "arrival-welcome"`, `type: "email"`, ES + EN subject/body using `{{participantName}}`, `{{experienceName}}`, `{{minutesUntilSession}}`, `{{roomName}}` placeholders. Draft copy:
  - ES subject: `¡Bienvenido a OMZONE, {{participantName}}!`
  - ES body: `Ya registramos tu llegada a nuestras instalaciones. Tu sesión de {{experienceName}} comenzará en {{minutesUntilSession}} minutos en {{roomName}}. ¡Te esperamos!`
  - EN subject: `Welcome to OMZONE, {{participantName}}!`
  - EN body: `We've recorded your arrival at our facility. Your {{experienceName}} session starts in {{minutesUntilSession}} minutes in {{roomName}}. See you soon!`
  - Editable later from the existing templates admin UI without a redeploy, same as every other transactional email.

All three changes go through the Appwrite MCP tools / CLI against the self-hosted `aprod.racoondevs.com` endpoint, following the 10-step schema workflow in `.github/agents/appwrite-backend.agent.md` §7.

### Backend — `validate-ticket`, `check` action only

Immediately after the schedule-window calculation, before the existing "check stops here" return: if `ticket.status === "valid" && !ticket.arrivedAt`:

1. `db.updateDocument(tickets, ticket.$id, { arrivedAt: now })`
2. `logActivity(..., "checkin.arrived", ..., "info", buildAuditDetails(..., { minutesUntilSession }))`
3. Fire-and-forget `new Functions(client).createExecution(FUNC_SEND_NOTIFICATION, JSON.stringify({ templateKey: "arrival-welcome", recipientEmail: ticket.participantEmail, userId: ticket.userId, vars: {...} }), false, "/", "POST")` — exact pattern already used by `generate-ticket` → `send-confirmation`/`send-notification` ([generate-ticket/src/main.js:472-535](../../../functions/generate-ticket/src/main.js#L472-L535)), wrapped in try/catch, logged-but-non-blocking on failure.
4. Fire-and-forget `db.createDocument(client_notifications, ID.unique(), { userId: ticket.userId, type: "arrival_welcome", title, body, ticketId: ticket.$id }, [Permission.read(Role.user(ticket.userId)), Permission.update(Role.user(ticket.userId)), Permission.read(Role.label("admin")), Permission.read(Role.label("root"))])` — also try/catch, non-blocking.

If `ticket.arrivedAt` is already set, none of the above runs — a re-scan just returns the existing display data as it does today.

This makes the `check` action mutate for the first time (previously pure read-only) — the function's docstring `@entities`/`@idempotent` sections get updated to describe this one-shot, guarded side effect. The `check` response gains `arrivalJustRecorded: boolean` so the UI can distinguish "just welcomed" from "already arrived earlier" without comparing timestamps client-side.

### Frontend

- `CheckInResultModal.jsx`: when `arrivalJustRecorded` is true, a small confirmation note ("✓ Bienvenida enviada") near the timing chip, so reception staff can see the client was notified.
- **New `NotificationBell.jsx`**, added to `Navbar.jsx` in the desktop auth area (next to `LanguageSwitcher`, before `UserMenuDropdown` — [Navbar.jsx:102-126](../../../src/components/layout/Navbar.jsx#L102-L126)) and in the mobile `SheetContent` client section ([Navbar.jsx:213-245](../../../src/components/layout/Navbar.jsx#L213-L245)). Reuses the existing Radix `DropdownMenu` primitives already imported for `UserMenuDropdown.jsx`.
- **New `useClientNotifications()` hook** (`src/hooks/`): React Query with `refetchInterval` polling (60s). No Appwrite Realtime subscription exists anywhere in this codebase yet (`grep -rn "\.subscribe(" src functions` → zero matches), and introducing the app's first Realtime channel for a single bell icon isn't justified — polling matches the existing convention used by `useCheckInSummary`.
- Bell shows an unread-count badge (from `Query.equal("isRead", false)` count); click opens a dropdown list of recent notifications; clicking a notification marks it read directly via `databases.updateDocument` (allowed by the document's own `Role.user(userId)` update permission — no function round-trip needed).

## i18n

New keys under `admin.checkin.*` (timing chip labels, staff badge, arrival-welcome confirmation note) and a new `notifications.*` namespace (bell empty state, mark-as-read, relative timestamps), added to both [en/admin.json](../../../src/i18n/en/admin.json) / a client-facing i18n file and [es/admin.json](../../../src/i18n/es/admin.json).

## Testing / verification

- Manual: scan a fresh valid ticket in the admin UI, confirm `checkin.valid_scan` **and** `checkin.arrived` both appear in Audit Log with the expected detail payload (client identity, session info, group flag, staff identity).
- Manual: re-scan the same ticket — confirm no duplicate `checkin.arrived`/email/notification fires, and `arrivalJustRecorded` is `false` on the second scan.
- Manual: confirm entry ("Registrar entrada") — confirm `checkin.confirmed` appears and is distinct from `checkin.arrived`.
- Manual: scan a not-found / cancelled / expired / already-used / out-of-window ticket — confirm each produces its distinct audit action.
- Manual: verify the welcome email arrives (or check function execution logs if email delivery isn't testable in the current environment) with correctly rendered placeholders.
- Manual: log in as the client whose ticket was scanned, confirm the bell shows an unread badge, the notification appears, and clicking it marks it read and clears the badge.
- Manual: verify the staff badge shows the correct logged-in name in kiosk mode, normal mode, and the alerts card.
- Manual: verify the timing chip shows correct early/on-time/late states by scanning tickets with slot times in the near future, near-now, and in the past (within window).
- Confirm no other caller of `validate-ticket`'s `check` action assumes it's side-effect-free (grep before changing — the frontend `useTicketCheckIn.checkTicket()` is the only caller found in scope).

## Out of scope

- Browser push notifications (service worker, VAPID, subscription capture) — no such infrastructure exists today; explicitly deferred in favor of in-app notification + email per user decision.
- New alert types in `checkin-summary`'s `alerts` array (e.g. surfacing rejected/expired scans as kiosk alerts) — only audit trail entries are added for those outcomes, not new alert cards.
- Auditing `consume-pass` (pass → ticket creation) — out of scope, this task is check-in-time only.
- Per-client-per-day arrival dedup — explicitly rejected in favor of per-ticket.
- Server-side enforcement changes to the check-in window itself — unrelated to this work (handled by the separate tolerance-window feature).
