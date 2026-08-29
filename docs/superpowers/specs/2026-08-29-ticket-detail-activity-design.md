# Ticket Detail: Info Fix + Activity History

**Date:** 2026-08-29
**Status:** Approved

## Context

The admin Ticket Detail page ([TicketDetailPage.jsx](../../../src/pages/admin/TicketDetailPage.jsx)) is showing "—" for the experience name and session date, even though a `ticketSnapshot` with that exact data is visible on the same screen (see reported screenshot: `experienceName: "Performance Recovery Program"` in the snapshot, but the "Experiencia › Nombre" row shows "—"). Investigation found this is not missing data — it's wrong field names and an unparsed JSON string, all pre-existing bugs, not caused by any recent change:

- `TicketDetailPage.jsx` reads `experience.titleEn || experience.titleEs`. The real experience field is `name` / `nameEs` ([ExperienceCard.jsx](../../../src/components/admin/experiences/ExperienceCard.jsx) uses `experience.name`; the codebase's bilingual convention is `localizedField(item, field, language)` in [useLanguage.js](../../../src/hooks/useLanguage.js): EN in `field`, ES in `field + "Es"`). `titleEn`/`titleEs` do not exist on the experience document at all.
- `TicketDetailPage.jsx` reads `slot.startDate`. The real slot field is `startDatetime` (confirmed in [SlotListPage.jsx](../../../src/pages/admin/SlotListPage.jsx), [AuditLogPage.jsx](../../../src/pages/admin/AuditLogPage.jsx) entity resolvers).
- `TicketListPage.jsx`'s experience filter dropdown has the same `exp.titleEn || exp.titleEs` bug.
- `TicketTable.jsx` and `TicketCard.jsx` (admin ticket list views) read `ticket.ticketSnapshot?.experienceName` directly, but `ticketSnapshot` is stored as a **JSON string** (confirmed by `TicketDetailPage.jsx`'s own parsing: `typeof ticket.ticketSnapshot === "string" ? JSON.parse(...) : ...`). Property access on a string is always `undefined`, so this silently falls back to the raw `experienceId` or "—".

Separately, the user asked for a ticket activity history: which agent confirmed the ticket, scan attempts, and who else was involved. Investigation found the backend already captures most of the raw material but never surfaces it:

- `functions/validate-ticket/src/main.js` creates a `ticket_redemptions` document on every successful confirm (`redeemedBy`, `redeemedAt`, `method`, `notes`) — this collection exists and is populated, but nothing in the frontend reads it, and it isn't even in [env.js](../../../src/config/env.js)'s collection list.
- The same function calls `logActivity(...)` into `admin_activity_logs` only for the `checkin.duplicate_scan_attempt` case (someone scans a ticket that's already used). All other outcomes (valid scan, cancelled, expired, and the confirm itself) are not logged at all today.
- `admin_activity_logs` read permission is `label:root` + `label:admin` only (not `operator`) — matches the existing `isAdmin`-gated "Actions" card on this page, so the new section can reuse that same gate.

## Decision

1. Fix the four field-name/parsing bugs above using the codebase's existing conventions (`localizedField`, `slot.startDatetime`, parsed snapshot).
2. Add a snapshot fallback on the detail page: if the live `experience` or `slot` document is missing (deleted, or the ticket never stored `experienceId`/`slotId`), fall back to the corresponding `ticketSnapshot` fields so a card is never blank.
3. Extend `functions/validate-ticket` to log every scan outcome (not just duplicates) to `admin_activity_logs`, tied to the ticket via `entityType: "ticket"` / `entityId: ticket.$id`.
4. Add a new admin-only "Actividad del ticket" card to `TicketDetailPage.jsx` showing (a) who confirmed the ticket (from `ticket_redemptions`) and (b) the full scan history (from `admin_activity_logs`), each row resolving the actor's name via `user_profiles`.
5. All new UI text goes through the existing `t()` / `admin.json` (es/en) bilingual system, following the current `ticketDetail.*` key structure.

## Data model changes

None — both `ticket_redemptions` and `admin_activity_logs` already exist with the needed fields and indexes (`idx_ticketId` on redemptions; `idx_entityType_entityId` on activity logs). Only a missing frontend collection-id constant is added:

```js
// src/config/env.js
collectionTicketRedemptions:
  import.meta.env.VITE_APPWRITE_COLLECTION_TICKET_REDEMPTIONS || "ticket_redemptions",
```

## Backend changes — `functions/validate-ticket/src/main.js`

`logActivity(db, dbId, action, entityType, entityId, actorId, labels, details)` already exists and is reused (no signature change). Add calls for every branch that currently returns without logging:

| Branch | New action | entityType/entityId | Notes |
|---|---|---|---|
| `check`, ticket valid | `checkin.scan_valid` | `ticket` / `ticket.$id` | includes `{ withinWindow }` in details |
| `check`, ticket cancelled | `checkin.scan_cancelled` | `ticket` / `ticket.$id` | |
| `check`, ticket expired | `checkin.scan_expired` | `ticket` / `ticket.$id` | |
| `check`, already used | `checkin.duplicate_scan_attempt` | `ticket` / `ticket.$id` | unchanged (already logged today) |
| `confirm`, success | `checkin.confirmed` | `ticket` / `ticket.$id` | includes `{ method, redemptionId }` |

`logActivity` is already fire-and-forget/best-effort (wrapped in try/catch, never throws) and already excludes root actors (ghost-user rule), so no additional error handling is needed. This roughly doubles the write volume on the check-in path (one activity-log write per scan instead of only on duplicates) — acceptable given check-in volume is bounded to daily foot traffic at a single wellness facility.

## Frontend changes

### `src/lib/tickets.js` (new)

```js
export function parseTicketSnapshot(ticket) {
  if (!ticket?.ticketSnapshot) return null;
  if (typeof ticket.ticketSnapshot !== "string") return ticket.ticketSnapshot;
  try { return JSON.parse(ticket.ticketSnapshot); } catch { return null; }
}
```

Used by `TicketDetailPage.jsx` (replacing its inline parsing), `TicketTable.jsx`, and `TicketCard.jsx`.

### `TicketDetailPage.jsx`

- Experience card: `localizedField(experience, "name", language)` instead of `titleEn || titleEs`; falls back to `snapshot.experienceName` when `experience` is null.
- Slot card: `slot.startDatetime` instead of `slot.startDate`; falls back to `snapshot.slotStartDatetime` when `slot` is null.
- New `TicketActivityCard` (admin-only, same `isAdmin` condition as the existing Actions card), placed in the right sidebar below the Actions card:
  - **Confirmed by**: queries `ticket_redemptions` where `ticketId == ticket.$id` (limit 1); shows actor name (resolved via `user_profiles`), role badge, `redeemedAt`, `method` badge, `notes`. Hidden if no redemption exists yet (ticket still valid).
  - **Scan history**: queries `admin_activity_logs` where `entityType IN ["ticket","tickets"]` AND `entityId == ticket.$id`, `orderDesc($createdAt)`, `limit(20)`; each row shows timestamp, translated action label, actor name + role badge. Empty state if none.
- New hook `src/hooks/useTicketActivity.js` encapsulating both queries (`{ redemption, activity, loading }`), plus a small internal user-name lookup (batched `Query.equal("$id", [...userIds])` against `user_profiles`, deduped) so each row isn't a separate round trip.

### `TicketListPage.jsx`

Experience filter option labels: `localizedField(exp, "name", language)` instead of `exp.titleEn || exp.titleEs`.

### `TicketTable.jsx` / `TicketCard.jsx`

Replace `ticket.ticketSnapshot?.experienceName` with `parseTicketSnapshot(ticket)?.experienceName`.

## i18n

New keys under `admin.ticketDetail.*` in both [en/admin.json](../../../src/i18n/en/admin.json) and [es/admin.json](../../../src/i18n/es/admin.json): `activity`, `confirmedBy`, `redeemedAt`, `method`, `notes`, `scanHistory`, `noActivity`, `noRedemption`, method labels (`methodQrScan`/`methodManual`/`methodKiosk`/`methodSystem`), and action labels for each `checkin.*` action (`actionScanValid`, `actionScanCancelled`, `actionScanExpired`, `actionScanDuplicate`, `actionConfirmed`, `actionInvalidate`).

## Testing / verification

- Manual: open a ticket whose experience/slot documents exist — confirm name and date now render instead of "—".
- Manual: open a ticket with a missing/deleted `experienceId` or `slotId` — confirm snapshot fallback fills the card instead of hiding it or showing "—".
- Manual: run a full check-in cycle (scan valid → confirm) and a duplicate-scan attempt on the same ticket; reload the ticket detail page and confirm both the "Confirmed by" block and the scan history list reflect what happened, with correct actor names.
- Manual: verify list/card views (`TicketListPage`, mobile `TicketCard`) now show the experience name instead of the raw id or "—".
- Manual: toggle the language switcher and confirm all new/fixed text renders correctly in both es and en.
- Confirm a non-admin (operator) viewing the ticket detail page does not see the new Activity card (matches existing `isAdmin`-gated Actions card) and does not get a 403 in the console from the hook (hook should not fire its queries when `!isAdmin`).

## Out of scope

- Changing `admin_activity_logs` read permissions to include `operator` — the new card reuses the existing `isAdmin` gate; operators keep seeing what they see today (nothing new, nothing removed).
- Retroactively backfilling activity-log entries for scans that happened before this change ships — history starts from deploy time.
- A dedicated standalone "audit trail" page for tickets outside of the detail page (the existing root-only `AuditLogPage.jsx` already covers cross-entity search; this is a ticket-scoped convenience view only).
- Renaming the existing `checkin.duplicate_scan_attempt` action string (kept as-is for continuity with any existing log entries).
