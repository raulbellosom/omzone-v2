# Check-in Tolerance Window

**Date:** 2026-08-27
**Status:** Approved

## Context

Reception staff reported that the check-in window feels too strict: someone arriving at 8:50 for a 9:00 class was blocked. Investigation found:

- [functions/validate-ticket/src/main.js](../../../functions/validate-ticket/src/main.js) already computes a schedule window (`getScheduleState`), currently hardcoded to `[slotStartDatetime - 30min, slotEndDate or slotStartDatetime + 3h]` via `CHECK_IN_WINDOW_BEFORE_MS` / `CHECK_IN_FALLBACK_DURATION_MS`.
- [CheckInResultModal.jsx](../../../src/components/admin/checkin/CheckInResultModal.jsx) hides the "Registrar entrada" button entirely when `schedule.withinWindow` is `false` (the `schedule` outcome group only renders a "scan another" button) — this is the actual point of friction, not a bug in the 30-minute math itself.
- There is no "facility access" concept independent of a booked class in the data model today (all tickets/passes resolve to a specific `slot`), and no door-hardware integration exists yet. A future electronic-lock/keypad idea was raised but requires separate hardware research and is explicitly out of scope here.

The ask, scoped down through discussion: make the tolerance window configurable by admins (not hardcoded), raise the default before-start grace period, and add a genuine after-start cutoff instead of relying on the class's end time.

## Decision

Replace the fixed 30-minute/slot-end window with a symmetric, admin-configurable window: **`[slotStartDatetime - beforeMinutes, slotStartDatetime + afterMinutes]`**, where `beforeMinutes` (default 60) and `afterMinutes` (default 30) are read from the existing `settings` collection at request time, with safe fallbacks if unset or invalid.

This drops the dependency on `slotEndDate` / the 3-hour fallback for gating purposes. `slotEndDate` keeps flowing through `ticketSnapshot` and `extractSnapshotDisplay` for display purposes only (e.g. showing "ends at X" elsewhere) — nothing consumes it for the window calculation anymore.

No changes to the two-step check/confirm flow, the result modal states, or the fact that `action=confirm` does not itself re-check the schedule window server-side (that was already true before this change and is not part of this request).

## Data model changes

Two new documents in the existing `settings` collection (schema already supports this — no migration needed):

| key | value | category |
|---|---|---|
| `checkin_window_before_minutes` | `"60"` | `general` |
| `checkin_window_after_minutes` | `"30"` | `general` |

Documents are created lazily (upsert on first save from the admin UI) — if they don't exist yet, both the function and the admin UI fall back to the defaults above. No schema/enum changes required.

## Backend changes — `functions/validate-ticket`

- Add `COL_SETTINGS = process.env.APPWRITE_COLLECTION_SETTINGS || "settings"` (same pattern as the other collection env vars). No new function scopes needed — `documents.read` is already granted.
- Fetch both setting documents in parallel with the ticket lookup (`Promise.all`), to avoid adding serial latency.
- Parse each value as an integer in `[0, 1440]`; anything missing, non-numeric, or out of range falls back to the default (60 / 30) — a bad setting value must never break check-in.
- `getScheduleState(ticket, beforeMinutes, afterMinutes)` becomes a pure function of these two numbers plus `slotStartDatetime`; drop `CHECK_IN_WINDOW_BEFORE_MS` and `CHECK_IN_FALLBACK_DURATION_MS` constants and the `slotEndDate` branch.
- `too_early` / `too_late` reasons and the returned `{ withinWindow, reason, validFrom, validUntil, now }` shape are unchanged — only how `validFrom`/`validUntil` are computed changes.

## Frontend changes

- New hook `src/hooks/useCheckInSettings.js`, following the existing [useNotificationTemplates.js](../../../src/hooks/useNotificationTemplates.js) pattern: reads the two `settings` documents by `key`, exposes `{ beforeMinutes, afterMinutes, loading, error, save(values) }`. `save` updates the documents if they exist, creates them (upsert) if this is the first time they're configured.
- New "Check-in" tab in [SettingsPage.jsx](../../../src/pages/admin/SettingsPage.jsx), alongside the existing "Templates" / "System" tabs: two number inputs ("Minutos antes de la clase" / "Minutos después de la clase"), client-side validated to `[0, 1440]` integers, a Save button, and an `auditAction` call on save (matching the existing template-update audit call).
- No changes to `useTicketCheckIn.js`, `CheckInResultModal.jsx`, `KioskOverlay.jsx`, `ScannerCard.jsx` — they keep consuming `schedule.validFrom/validUntil/withinWindow` exactly as returned today; only the values behind them change.

## i18n

New keys under `admin.settings.*` (tab label, field labels, save confirmation) and reuse of existing `admin.checkin.*` keys where applicable, added to both [en/admin.json](../../../src/i18n/en/admin.json) and [es/admin.json](../../../src/i18n/es/admin.json).

## Testing / verification

- Unit-level manual check: temporarily set `beforeMinutes`/`afterMinutes` to small values and verify `getScheduleState` boundaries (just inside / just outside) with a scripted or REPL-style check against the extracted function logic, since there's no existing test harness for this function.
- Manual verification in the browser: seed a ticket with a near-future slot, confirm check-in is now allowed up to the configured `beforeMinutes` earlier than before, and blocked correctly outside the new window.
- Verify the admin Settings tab round-trips correctly: change values, reload, confirm persisted values are shown (not stale defaults).
- Confirm no other caller of `validate-ticket` depends on the old `slotEndDate`-based cutoff (grep before changing).

## Out of scope

- Electronic lock / keypad / door-hardware integration — flagged as a future investigation item, not built here.
- A "facility access" concept decoupled from a booked class/slot — no such product (membership, day pass) exists today; nothing to model.
- Server-side enforcement of the schedule window at `action=confirm` time (currently informational-only, pre-existing behavior, not part of this request).
- Per-experience or per-location tolerance overrides — a single global setting is sufficient for now.
