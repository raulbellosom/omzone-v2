# Check-in Access

**Date:** 2026-07-04
**Status:** Approved

## Context

OMZONE needs a proper check-in / pass validator for reception staff, based on a Claude Design mockup (`Check-in Access.dc.html`, imported from `C:\Users\raulb\Downloads\check-in-access-module\`). The mockup has 7 views (About, Check-in, Search, Detail, Activity, Kiosk, Settings) plus a result modal and a settings drawer.

The codebase already has most of the backend pieces:
- [functions/validate-ticket/src/main.js](../../../functions/validate-ticket/src/main.js) — validates a `ticketCode`, marks it `used`, creates a `ticket_redemptions` record, updates the linked `booking`. Currently **one-step**: validating immediately consumes the ticket.
- [functions/consume-pass/src/main.js](../../../functions/consume-pass/src/main.js) — consumes a pass credit and creates the `ticket` beforehand (at booking time, not at check-in time). No changes needed here — by the time a client arrives at reception, their `ticket` document already exists regardless of whether they paid directly or used a pass.
- [src/pages/admin/CheckInPage.jsx](../../../src/pages/admin/CheckInPage.jsx) + [src/components/admin/checkin/CheckInResult.jsx](../../../src/components/admin/checkin/CheckInResult.jsx) — manual code entry only, inline result (not a modal), one-step validation.
- `tickets` collection status enum: `valid | used | cancelled | expired` (no schedule-mismatch concept).
- `ticket_redemptions.method` enum: `qr_scan | manual | system` (no `kiosk`).

Two existing admin pages already cover functionality the mockup's Search/Detail views would duplicate:
- [src/pages/admin/TicketListPage.jsx](../../../src/pages/admin/TicketListPage.jsx) — search/filter tickets by status, experience, text.
- [src/pages/admin/TicketDetailPage.jsx](../../../src/pages/admin/TicketDetailPage.jsx) — full ticket detail, QR code, invalidate action.

The mockup's "About" (marketing splash), Search, Detail, Activity table, and Settings drawer are **not** part of this build — see Out of Scope.

## Decision

Rebuild [CheckInPage.jsx](../../../src/pages/admin/CheckInPage.jsx) as a single component with two presentations:

1. **Normal mode** (inside the admin shell/sidebar): scanner card (camera QR + manual/HID text input) + a lightweight session history list (already exists today — kept, not the mockup's persisted "Actividad" table).
2. **Kiosk mode**: a full-screen overlay (fixed, `z-index` above the admin chrome) toggled by a "Modo Kiosco" button, matching the mockup's kiosk view — just the scanner, the input, a clock, and an exit button. No sidebar, no dashboard widgets.

Both modes share the same result modal and the same validation hook.

The mockup's dashboard sidebar (Resumen del día / Próximas sesiones / Alertas / Actividad reciente) is **dropped** — it duplicates [AdminDashboardPage.jsx](../../../src/pages/admin/AdminDashboardPage.jsx) (`useUpcomingSlots`) and [AgendaGlobalPage.jsx](../../../src/pages/admin/AgendaGlobalPage.jsx). Nothing existing needs to be removed to accommodate this — we simply don't build the duplicate widgets.

### Two-step validation flow

`validate-ticket` gains an `action` field to separate "check" from "confirm", so a scan doesn't consume the ticket until staff explicitly confirms:

- `{ ticketCode, action: "check" }` (the default when `action` is omitted, so a caller can never consume a ticket by accident) — **read-only**. Looks up the ticket, runs all validation (status + new schedule-window check below), returns display data. Does **not** mutate anything.
- `{ ticketCode, action: "confirm", method }` — current behavior: re-validates (defense in depth — status may have changed between check and confirm), then marks `used`, creates the `ticket_redemptions` record, updates the `booking`. `method` is `"qr_scan" | "manual" | "kiosk"` (see schema change below).

Both branches share the same lookup + status-check code (extracted into a helper) to avoid duplicating logic.

### Schedule-window check ("fuera de horario")

New validation, computed entirely from `ticket.ticketSnapshot` (already contains `slotStartDatetime` / `slotEndDate` — no extra DB fetch needed):

- Valid window: from **30 minutes before** `slotStartDatetime` to `slotEndDate` (if present) or `slotStartDatetime + 3 hours` (if no end date recorded).
- Outside that window (too early or too late) → new result state `schedule`, returned only from `action: "check"` (a ticket outside its window is never auto-confirmable — staff must use judgment, matching the mockup's "Permitir con autorización" / "Reagendar" actions, which just show a toast for now — see Out of Scope).
- This is a soft business signal, not a new `tickets.status` value — `status` stays `valid`; `schedule` is a check-time computation layered on top of a `valid` ticket.

### Invalid reasons

Simplified from the mockup's 4 reasons to the 3 that map to real ticket state (a `ticket` document only exists after payment is confirmed, so "Orden no pagada" / "Experiencia no disponible" can't happen for a real ticket lookup — those were mockup placeholder data):

- Código no encontrado (404 — ticketCode doesn't exist)
- Pase cancelado (`status === "cancelled"`)
- Pase expirado (`status === "expired"`)

### Result modal states

Matches the mockup's visual treatment: `loading`, `valid` (→ shows "Registrar entrada" to confirm), `used` (already redeemed, shows original redemption time/staff), `invalid` (shows the specific reason), `schedule` (shows valid window vs. current time). After confirming, an `entered` success state shows briefly before returning to scan-ready.

## Data model changes

- `ticket_redemptions.method` enum: add `"kiosk"` alongside existing `qr_scan | manual | system`, so redemptions made from the kiosk overlay are distinguishable from staff manual entry in the admin view. Applied directly on `omzone-dev` via the Appwrite MCP, then reflected in [appwrite.json](../../../appwrite.json).
- No new collections, no new fields on `tickets` or `bookings`.

## Frontend changes

- **New dependency**: a camera QR-scanning library (`html5-qrcode`) — nothing in [package.json](../../../package.json) currently reads a camera. Used only in the scanner card / kiosk view.
- **Bluetooth/USB "gun" scanners** need no new code beyond what a keyboard-wedge device already gets for free (types into the focused input + sends Enter) — the fix needed is making sure the manual-entry input is refocused after every result/modal close, including inside the kiosk overlay, so the physical scanner always has a target.
- [useValidateTicket.js](../../../src/hooks/useValidateTicket.js) is extended to support `check` and `confirm` calls (two functions or a `mode` param) instead of a single `validate()`.
- [CheckInResult.jsx](../../../src/components/admin/checkin/CheckInResult.jsx) is replaced by a modal component with the 4+1 states described above, styled per the mockup's color language (sage green valid, amber used, terracotta invalid, blue schedule).
- "Ver detalles" in the modal links to `/admin/tickets/:ticketId` (existing [TicketDetailPage](../../../src/pages/admin/TicketDetailPage.jsx)); "Buscar cliente" links to `/admin/clients` (existing [ClientListPage](../../../src/pages/admin/ClientListPage.jsx)). No new search/detail pages are built.

## i18n

New keys added under `admin.checkin.*` in both [en/admin.json](../../../src/i18n/en/admin.json) and [es/admin.json](../../../src/i18n/es/admin.json) for: kiosk mode labels, the 4 result states, invalid reasons, and the confirm-entry step. Existing keys (`title`, `subtitle`, `ticketCode`, `placeholder`, `validate`, `validating`, `clear`, `recentCheckins`, etc.) are kept where they still apply; `subtitle` copy updates since check-in now covers scanning, not just typing a code.

## Testing / verification

- Manual verification in the browser (dev server) per the four demo scenarios the mockup itself defines (valid / used / invalid / schedule), using real seeded tickets in `omzone-dev` rather than hardcoded demo codes.
- Confirm the physical scanner behavior can't be tested without hardware — verified logically (focused input + Enter-key submit), flagged to the user for a real-device smoke test after deploy.
- Confirm `validate-ticket` changes don't break other callers — search the codebase for existing callers before changing the request contract (currently only `useValidateTicket.js` per earlier exploration; re-verify at implementation time).

## Out of scope

- Mockup's "About" marketing page — not needed for an internal admin tool.
- Mockup's "Search" and "Detail" views — [TicketListPage](../../../src/pages/admin/TicketListPage.jsx) / [TicketDetailPage](../../../src/pages/admin/TicketDetailPage.jsx) already cover this.
- Mockup's "Actividad" persisted table — session history (already in the current page) is kept instead; no new collection or list view for redemption history.
- Mockup's dashboard sidebar (Resumen del día / Próximas sesiones / Alertas) — duplicates Dashboard/Agenda.
- Settings drawer (sound, autofocus, brightness, confirm-before-registering toggles) and branch selector — no multi-branch concept exists in the data model today; deferred.
- "Solicitar autorización" / "Reagendar" / "Permitir con autorización" actions on the `used`/`schedule` states — UI affordance only (toast), no real authorization workflow or reschedule flow is built.
- Real Bluetooth Web API integration — the "scanner" is a HID keyboard-wedge device, not something the browser needs to pair with in software.
