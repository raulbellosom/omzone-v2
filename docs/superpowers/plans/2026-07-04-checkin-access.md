# Check-in Access Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the admin Check-in page into a two-step, camera + physical-scanner capable pass validator with a result modal and a full-screen kiosk mode, per [docs/superpowers/specs/2026-07-04-checkin-access-design.md](../specs/2026-07-04-checkin-access-design.md).

**Architecture:** `validate-ticket` (Appwrite function) gains an `action` field (`check` = read-only preview, `confirm` = mutate). The frontend gets a new hook (`useTicketCheckIn`) driving that two-step flow, feeding a scanner component (camera QR via `html5-qrcode` + manual/HID text input) and a result modal with 5 visual states (loading / valid / used / invalid / schedule / entered). `CheckInPage` composes these and can render a full-screen kiosk overlay on top of the same state.

**Tech Stack:** React 19, Vite, Tailwind (utility classes, no new design tokens), `node-appwrite` (function), `html5-qrcode` (new frontend dependency), Appwrite MCP (`appwrite-api-dev`) for the dev-project schema change, Appwrite CLI for function deployment.

## Global Constraints

- Target project for all changes and testing: **`omzone-dev`** (endpoint `https://aprod.racoondevs.com/v1`) — this is already the default in [src/config/env.js](../../../src/config/env.js:8-9), so no env changes are needed to test locally.
- No unit-test framework exists for Appwrite functions or React components in this repo (verified — no test runner besides one ad-hoc script for docs search). Backend tasks are verified by deploying to `omzone-dev` and calling the function directly (curl or `appwrite` CLI execution). Frontend tasks are verified by running the Vite dev server and exercising the feature in a browser. Do not introduce a new test framework as part of this plan.
- Schedule window: valid from **30 minutes before** `slotStartDatetime` to `slotEndDate` (or `slotStartDatetime + 3 hours` if no end date is recorded).
- Invalid reasons are limited to: not found, cancelled, expired (see spec — "orden no pagada" / "experiencia no disponible" don't map to real ticket state).
- `ticket_redemptions.method` enum becomes `qr_scan | manual | kiosk | system`.
- Follow existing code conventions: Tailwind utility classes matching colors already used in this feature (`sage`, `charcoal`, `sand-dark`, plus plain Tailwind `emerald`/`red`/`amber`/`blue` for state colors, consistent with [CheckInResult.jsx](../../../src/components/admin/checkin/CheckInResult.jsx) before this rewrite), `@/lib/utils` `cn()` helper, `lucide-react` icons, the `Dialog` primitives in [src/components/common/dialog.jsx](../../../src/components/common/dialog.jsx).

---

## File Structure

**Backend:**
- Modify: `functions/validate-ticket/src/main.js` — action split (`check`/`confirm`) + schedule-window computation.

**Schema:**
- Modify (via Appwrite MCP on `omzone-dev`, then mirrored in git): `ticket_redemptions.method` enum column.
- Modify: `appwrite.json` — reflect the enum change so the checked-in config matches the live project.

**Frontend:**
- Create: `src/hooks/useTicketCheckIn.js` — two-step check-in state machine (`checkTicket`, `confirmEntry`, `reset`).
- Delete: `src/hooks/useValidateTicket.js` — superseded by the above (single caller, being rewritten in the same plan).
- Create: `src/components/admin/checkin/ScannerCard.jsx` — camera QR view + manual/HID input, shared by normal and kiosk mode.
- Create: `src/components/admin/checkin/CheckInResultModal.jsx` — the 5-state result modal, replaces `CheckInResult.jsx`.
- Delete: `src/components/admin/checkin/CheckInResult.jsx` — superseded by the modal.
- Create: `src/components/admin/checkin/KioskOverlay.jsx` — full-screen wrapper used only in kiosk mode.
- Modify: `src/pages/admin/CheckInPage.jsx` — orchestrates scanner + modal + kiosk toggle + session history.
- Modify: `src/i18n/es/admin.json`, `src/i18n/en/admin.json` — new `admin.checkin.*` keys.
- Modify: `package.json` — add `html5-qrcode` dependency.

---

### Task 1: Schema — add `kiosk` to `ticket_redemptions.method`

**Files:**
- Modify: `appwrite.json` (the `ticket_redemptions` table's `method` column, around line 4230-4237)

**Interfaces:**
- Produces: `ticket_redemptions.method` accepts `"kiosk"` as a valid value, for later tasks' `confirmEntry(ticketCode, "kiosk")` calls.

- [ ] **Step 1: Update the enum on `omzone-dev` via the Appwrite MCP**

Call the `appwrite-api-dev` MCP tool `tables_db_update_enum_column` with:
```json
{
  "database_id": "omzone_db",
  "table_id": "ticket_redemptions",
  "key": "method",
  "elements": ["qr_scan", "manual", "kiosk", "system"],
  "required": true,
  "default": null
}
```
Set `confirm_write: true` on the `appwrite_call_tool` call (this is a mutating tool).

- [ ] **Step 2: Verify the change**

Use the MCP's read tool for columns (search `appwrite_search_tools` with query `"list columns of a table"`, `service_hints: "tables_db"`) to fetch `ticket_redemptions` columns and confirm `method.elements` now includes `"kiosk"`.

- [ ] **Step 3: Mirror the change in `appwrite.json`**

In `appwrite.json`, find the `ticket_redemptions` table's `method` column:
```json
{
  "key": "method",
  "type": "string",
  "required": true,
  "array": false,
  "default": null,
  "format": "enum",
  "elements": ["qr_scan", "manual", "system"]
}
```
Change `"elements"` to:
```json
"elements": ["qr_scan", "manual", "kiosk", "system"]
```

- [ ] **Step 4: Commit**

```bash
git add appwrite.json
git commit -m "feat(check-in): add kiosk redemption method"
```

---

### Task 2: Backend — two-step `validate-ticket` with schedule check

**Files:**
- Modify: `functions/validate-ticket/src/main.js` (full rewrite of the file — same shape, new action dispatch)

**Interfaces:**
- Consumes: nothing from other tasks.
- Produces: HTTP contract consumed by Task 3's hook:
  - Request: `{ ticketCode: string, action?: "check" | "confirm", method?: "qr_scan"|"manual"|"kiosk"|"system", notes?: string }`. `action` defaults to `"check"`.
  - `action: "check"` success (200): `{ ok: true, data: { ticket: {...display fields...}, schedule: ScheduleState | null, confirmed: false } }`
  - `action: "confirm"` success (200): `{ ok: true, data: { ticket: {...}, schedule, confirmed: true, redemptionMethod, redeemedBy, redeemedAt } }`
  - Failure shape (400/404/409/410): `{ ok: false, error: { code, message, usedAt? }, data?: {...display fields...} }`
  - `ScheduleState` shape: `{ withinWindow: boolean, reason?: "too_early"|"too_late", validFrom: string, validUntil: string, now: string } | null` (`null` when the ticket snapshot has no slot start time).
  - Display ticket fields: `{ ticketId, ticketCode, participantName, participantEmail, experienceName, slotStartDatetime, slotTime, slotEndDate, timezone, locationName, roomName, tierName, orderNumber, status, usedAt }`.

- [ ] **Step 1: Replace the function source**

Replace the entire contents of `functions/validate-ticket/src/main.js` with:

```js
/**
 * @function validate-ticket
 * @description Checks or confirms a ticket by its ticketCode. In "check" mode (default)
 *   it is read-only: looks up the ticket, validates status and the check-in time window,
 *   and returns display data without mutating anything. In "confirm" mode it re-validates
 *   and then marks the ticket as used, creates a redemption record, and updates the
 *   associated booking to checked-in. Used by operators/admins at check-in points
 *   (QR scan, manual entry, or the kiosk overlay).
 * @trigger HTTP POST
 *
 * @input {Object} payload
 * @input {string} payload.ticketCode - The unique ticket code (required)
 * @input {string} [payload.action] - "check" (default, read-only) | "confirm" (mutates)
 * @input {string} [payload.method] - Redemption method for "confirm": "qr_scan" | "manual" | "kiosk" | "system" (default: "manual")
 * @input {string} [payload.notes] - Optional notes (e.g. location, observations) — only used on "confirm"
 *
 * @validates
 * - Auth: caller must be authenticated
 * - Authorize: caller must have label admin, operator, or root
 * - Input: ticketCode is present, string, alphanumeric+hyphens only; action is "check" or "confirm"
 * - Business: ticket exists, status is "valid" (both actions); "confirm" re-checks status
 *   at commit time to guard against a race between check and confirm
 *
 * @entities
 * - Reads: tickets (by ticketCode), bookings (by orderId + slotId)
 * - Writes (action=confirm only): tickets (status → used, usedAt), bookings (status → checked-in, checkedInAt)
 * - Creates (action=confirm only): ticket_redemptions
 *
 * @envVars
 * - APPWRITE_FUNCTION_API_ENDPOINT (built-in, auto-injected)
 * - APPWRITE_FUNCTION_PROJECT_ID (built-in, auto-injected)
 * - x-appwrite-key header (dynamic API key, runtime only)
 * - APPWRITE_DATABASE_ID (project-level global)
 * - APPWRITE_COLLECTION_TICKETS (project-level global)
 * - APPWRITE_COLLECTION_TICKET_REDEMPTIONS (project-level global)
 * - APPWRITE_COLLECTION_BOOKINGS (project-level global)
 *
 * @errors
 * - 400: Missing/invalid ticketCode, ticket status not "valid"
 * - 401: Not authenticated
 * - 403: Insufficient permissions (not admin/operator/root)
 * - 404: Ticket not found
 * - 409: Ticket already used (includes usedAt) — action=confirm only
 * - 410: Ticket cancelled or expired
 * - 500: Internal error
 *
 * @idempotent "check" is always idempotent (read-only). "confirm" on an already-used
 *   ticket returns 409 without duplicating redemptions.
 * @returns {Object} { ok: true, data: { ticket: {...}, schedule: {...}|null, confirmed: boolean } }
 */

import { Client, Databases, Query, ID, Users } from "node-appwrite";

// ─── Constants ───────────────────────────────────────────────────────────────

const VALID_METHODS = ["qr_scan", "manual", "kiosk", "system"];
const VALID_ACTIONS = ["check", "confirm"];
const TICKET_CODE_PATTERN = /^[A-Za-z0-9-]+$/;
const CHECK_IN_WINDOW_BEFORE_MS = 30 * 60 * 1000; // 30 minutes before slot start
const CHECK_IN_FALLBACK_DURATION_MS = 3 * 60 * 60 * 1000; // used when no slotEndDate

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

function safeParseSnapshot(ticket) {
  try {
    return JSON.parse(ticket.ticketSnapshot);
  } catch {
    return null;
  }
}

/**
 * Extract display-friendly data from ticketSnapshot for the operator.
 */
function extractSnapshotDisplay(ticket) {
  const snapshot = safeParseSnapshot(ticket);

  return {
    ticketId: ticket.$id,
    ticketCode: ticket.ticketCode,
    participantName: ticket.participantName || null,
    participantEmail: ticket.participantEmail || null,
    experienceName: snapshot?.experienceName || null,
    slotStartDatetime: snapshot?.slotStartDatetime || snapshot?.slotDate || null,
    slotTime: snapshot?.slotTime || null,
    slotEndDate: snapshot?.slotEndDate || null,
    timezone: snapshot?.timezone || null,
    locationName: snapshot?.locationName || null,
    roomName: snapshot?.roomName || null,
    tierName: snapshot?.tierName || snapshot?.passName || null,
    orderNumber: snapshot?.orderNumber || null,
    status: ticket.status,
    usedAt: ticket.usedAt || null,
  };
}

/**
 * Computes whether "now" falls inside the check-in window for this ticket's slot.
 * Window: [slotStartDatetime - 30min, slotEndDate] (or +3h from start if no end date).
 * Returns null when the snapshot has no slot start time (can't be determined).
 */
function getScheduleState(ticket) {
  const snapshot = safeParseSnapshot(ticket);
  if (!snapshot?.slotStartDatetime) return null;

  const start = new Date(snapshot.slotStartDatetime);
  if (Number.isNaN(start.getTime())) return null;

  const end = snapshot.slotEndDate
    ? new Date(snapshot.slotEndDate)
    : new Date(start.getTime() + CHECK_IN_FALLBACK_DURATION_MS);
  const windowStart = new Date(start.getTime() - CHECK_IN_WINDOW_BEFORE_MS);
  const now = new Date();

  if (now < windowStart) {
    return {
      withinWindow: false,
      reason: "too_early",
      validFrom: start.toISOString(),
      validUntil: end.toISOString(),
      now: now.toISOString(),
    };
  }
  if (now > end) {
    return {
      withinWindow: false,
      reason: "too_late",
      validFrom: start.toISOString(),
      validUntil: end.toISOString(),
      now: now.toISOString(),
    };
  }
  return {
    withinWindow: true,
    validFrom: start.toISOString(),
    validUntil: end.toISOString(),
    now: now.toISOString(),
  };
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
  const COL_TICKETS = process.env.APPWRITE_COLLECTION_TICKETS || "tickets";
  const COL_REDEMPTIONS =
    process.env.APPWRITE_COLLECTION_TICKET_REDEMPTIONS || "ticket_redemptions";
  const COL_BOOKINGS = process.env.APPWRITE_COLLECTION_BOOKINGS || "bookings";

  try {
    // ── Parse input ──────────────────────────────────────────────────────────
    const body = JSON.parse(req.body || "{}");
    const { ticketCode, method, notes } = body;
    const action = VALID_ACTIONS.includes(body.action) ? body.action : "check";

    // ── Validate input ───────────────────────────────────────────────────────
    if (!ticketCode || typeof ticketCode !== "string") {
      return res.json(
        {
          ok: false,
          error: {
            code: "ERR_VALIDATE_MISSING_CODE",
            message: "ticketCode is required",
          },
        },
        400,
      );
    }

    const sanitizedCode = ticketCode.trim();
    if (!TICKET_CODE_PATTERN.test(sanitizedCode)) {
      return res.json(
        {
          ok: false,
          error: {
            code: "ERR_VALIDATE_INVALID_CODE",
            message: "ticketCode contains invalid characters",
          },
        },
        400,
      );
    }

    const redemptionMethod = VALID_METHODS.includes(method) ? method : "manual";

    // ── Auth ─────────────────────────────────────────────────────────────────
    const userId = req.headers["x-appwrite-user-id"];
    if (!userId) {
      return res.json(
        {
          ok: false,
          error: {
            code: "ERR_UNAUTHENTICATED",
            message: "Authentication required",
          },
        },
        401,
      );
    }

    // ── Authorize ────────────────────────────────────────────────────────────
    const users = new Users(client);
    const caller = await users.get(userId);
    const labels = caller.labels || [];

    if (
      !labels.includes("admin") &&
      !labels.includes("operator") &&
      !labels.includes("root")
    ) {
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

    // ── Lookup ticket by ticketCode ──────────────────────────────────────────
    const ticketResult = await db.listDocuments(DB, COL_TICKETS, [
      Query.equal("ticketCode", sanitizedCode),
      Query.limit(1),
    ]);

    if (ticketResult.total === 0) {
      log(`Ticket not found: ${sanitizedCode} (by ${userId})`);
      return res.json(
        {
          ok: false,
          error: {
            code: "ERR_VALIDATE_NOT_FOUND",
            message: "Ticket not found",
          },
        },
        404,
      );
    }

    const ticket = ticketResult.documents[0];

    // ── Check ticket status ──────────────────────────────────────────────────
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

    if (ticket.status === "cancelled") {
      log(`Ticket cancelled: ${sanitizedCode}`);
      return res.json(
        {
          ok: false,
          error: {
            code: "ERR_VALIDATE_CANCELLED",
            message: "Ticket cancelled",
          },
          data: extractSnapshotDisplay(ticket),
        },
        410,
      );
    }

    if (ticket.status === "expired") {
      log(`Ticket expired: ${sanitizedCode}`);
      return res.json(
        {
          ok: false,
          error: { code: "ERR_VALIDATE_EXPIRED", message: "Ticket expired" },
          data: extractSnapshotDisplay(ticket),
        },
        410,
      );
    }

    if (ticket.status !== "valid") {
      log(`Ticket in unexpected status: ${sanitizedCode} (${ticket.status})`);
      return res.json(
        {
          ok: false,
          error: {
            code: "ERR_VALIDATE_INVALID_STATUS",
            message: `Ticket status: ${ticket.status}`,
          },
        },
        400,
      );
    }

    // ── Schedule window check (informational — does not block "check") ───────
    const schedule = getScheduleState(ticket);

    // ── "check" action stops here — read-only ─────────────────────────────────
    if (action === "check") {
      return res.json({
        ok: true,
        data: { ticket: extractSnapshotDisplay(ticket), schedule, confirmed: false },
      });
    }

    // ── "confirm" action — mark ticket as used ────────────────────────────────
    const now = new Date().toISOString();

    await db.updateDocument(DB, COL_TICKETS, ticket.$id, {
      status: "used",
      usedAt: now,
    });

    log(`Ticket confirmed: ${sanitizedCode} → used (by ${userId})`);

    // ── Create redemption record ─────────────────────────────────────────────
    const redemptionData = {
      ticketId: ticket.$id,
      redeemedBy: userId,
      redeemedAt: now,
      method: redemptionMethod,
    };

    if (notes && typeof notes === "string") {
      redemptionData.notes = notes.slice(0, 500);
    }

    await db.createDocument(DB, COL_REDEMPTIONS, ID.unique(), redemptionData);

    log(
      `Redemption recorded: ticket=${ticket.$id}, by=${userId}, method=${redemptionMethod}`,
    );

    // ── Update associated booking if exists ──────────────────────────────────
    if (ticket.orderId && ticket.slotId) {
      try {
        const bookingResult = await db.listDocuments(DB, COL_BOOKINGS, [
          Query.equal("orderId", ticket.orderId),
          Query.equal("slotId", ticket.slotId),
          Query.limit(1),
        ]);

        if (bookingResult.total > 0) {
          const booking = bookingResult.documents[0];

          if (booking.status === "confirmed") {
            await db.updateDocument(DB, COL_BOOKINGS, booking.$id, {
              status: "checked-in",
              checkedInAt: now,
            });
            log(`Booking ${booking.$id} updated to checked-in`);
          } else {
            log(
              `Booking ${booking.$id} already in status: ${booking.status}, skipping`,
            );
          }
        }
      } catch (err) {
        // Booking update is best-effort — don't fail the confirmation
        log(
          `WARN: Failed to update booking for ticket ${ticket.$id}: ${err.message}`,
        );
      }
    }

    // ── Return success with display data ─────────────────────────────────────
    const displayData = extractSnapshotDisplay({
      ...ticket,
      status: "used",
      usedAt: now,
    });

    return res.json({
      ok: true,
      data: {
        ticket: displayData,
        schedule,
        confirmed: true,
        redemptionMethod,
        redeemedBy: userId,
        redeemedAt: now,
      },
    });
  } catch (err) {
    error(`validate-ticket failed: ${err.message}`);
    return res.json(
      {
        ok: false,
        error: { code: "ERR_VALIDATE_INTERNAL", message: "Internal error" },
      },
      500,
    );
  }
};
```

- [ ] **Step 2: Deploy the updated function to `omzone-dev`**

```bash
appwrite push function --function-id=validate-ticket --yes
```
Expected: build completes and the CLI reports the new deployment as active. (The `appwrite` CLI is already authenticated against this project per `scripts/VARS_WORKFLOW.md`.)

- [ ] **Step 3: Verify "check" is read-only and schedule state is computed**

Find a real `valid` ticket's `ticketCode` in `omzone-dev` (via the MCP: search `appwrite_search_tools` for `"list documents in a table"`, `service_hints: "tables_db"`, then call it with `database_id: "omzone_db"`, `table_id: "tickets"`, a query filtering `status=valid`, `limit: 1`). Then, as an authenticated admin/operator user, call the function (via the Appwrite console's "Execute now" on the function, or `curl` with a valid session JWT in `x-appwrite-user-id`/session header per how the other functions in this repo are invoked):

Payload: `{"ticketCode": "<real code>", "action": "check"}`

Expected: `200`, `data.confirmed: false`, `data.ticket.status` still `"valid"` in the `tickets` table afterward (re-fetch the document via MCP to confirm `status` did **not** change to `used`).

- [ ] **Step 4: Verify "confirm" mutates and "kiosk" method is accepted**

Same ticket, payload `{"ticketCode": "<real code>", "action": "confirm", "method": "kiosk"}`.

Expected: `200`, `data.confirmed: true`. Re-fetch the ticket via MCP — `status` is now `"used"`. Fetch the newest `ticket_redemptions` document for this `ticketId` via MCP — `method` is `"kiosk"`.

- [ ] **Step 5: Verify "confirm" on an already-used ticket returns 409**

Repeat the same `action: "confirm"` call.

Expected: `409`, `error.code: "ERR_VALIDATE_ALREADY_USED"`.

- [ ] **Step 6: Commit**

```bash
git add functions/validate-ticket/src/main.js
git commit -m "feat(check-in): split validate-ticket into check/confirm actions with schedule window check"
```

---

### Task 3: Frontend — `useTicketCheckIn` hook

**Files:**
- Create: `src/hooks/useTicketCheckIn.js`
- Delete: `src/hooks/useValidateTicket.js`

**Interfaces:**
- Consumes: `functions` from `@/lib/appwrite`, `env.functionValidateTicket` from `@/config/env` (both already exist, used identically to the old `useValidateTicket.js`).
- Produces (used by Task 4 and Task 7):
  - `state: { phase: "idle"|"loading"|"result"|"confirming"|"entered", data: object|null, error: string|null }`
  - `data` when `phase` is `"result"`: `{ outcome: "valid"|"used"|"invalid_not_found"|"invalid_cancelled"|"invalid_expired"|"schedule", ticketCode: string, ticket: object|null, schedule?: object|null, message?: string, usedAt?: string|null }`
  - `data` when `phase` is `"entered"`: `{ outcome: "entered", ticketCode: string, ticket: object }`
  - `checkTicket(ticketCode: string): Promise<result|null>`
  - `confirmEntry(ticketCode: string, method?: string): Promise<result|null>`
  - `reset(): void`

- [ ] **Step 1: Create the hook**

Create `src/hooks/useTicketCheckIn.js`:

```js
import { useState, useCallback } from "react";
import { functions } from "@/lib/appwrite";
import env from "@/config/env";

async function callValidateTicket(payload) {
  const execution = await functions.createExecution(
    env.functionValidateTicket,
    JSON.stringify(payload),
    false, // async
    "/",
    "POST",
    { "Content-Type": "application/json" },
  );
  const body = JSON.parse(execution.responseBody);
  return { status: execution.responseStatusCode, body };
}

function outcomeFromErrorCode(code) {
  if (code === "ERR_VALIDATE_ALREADY_USED") return "used";
  if (code === "ERR_VALIDATE_CANCELLED") return "invalid_cancelled";
  if (code === "ERR_VALIDATE_EXPIRED") return "invalid_expired";
  return "invalid_not_found";
}

/**
 * Drives the two-step check-in flow against the validate-ticket function:
 * checkTicket() previews a ticket without consuming it, confirmEntry() marks
 * it used. Returns { state, checkTicket, confirmEntry, reset }.
 */
export function useTicketCheckIn() {
  const [state, setState] = useState({ phase: "idle", data: null, error: null });

  const checkTicket = useCallback(async (ticketCode) => {
    const sanitized = (ticketCode || "").trim();
    if (!sanitized) {
      setState({ phase: "idle", data: null, error: "Ingresa o escanea un código de pase" });
      return null;
    }

    setState({ phase: "loading", data: { ticketCode: sanitized }, error: null });

    try {
      const { status, body } = await callValidateTicket({
        ticketCode: sanitized,
        action: "check",
      });

      if (status >= 400) {
        const result = {
          outcome: outcomeFromErrorCode(body.error?.code),
          ticketCode: sanitized,
          ticket: body.data || null,
          message: body.error?.message || "Validation failed",
          usedAt: body.error?.usedAt || null,
        };
        setState({ phase: "result", data: result, error: null });
        return result;
      }

      const schedule = body.data.schedule;
      const outcome = schedule && !schedule.withinWindow ? "schedule" : "valid";
      const result = {
        outcome,
        ticketCode: sanitized,
        ticket: body.data.ticket,
        schedule,
      };
      setState({ phase: "result", data: result, error: null });
      return result;
    } catch (err) {
      setState({ phase: "idle", data: null, error: err.message || "Failed to check ticket" });
      return null;
    }
  }, []);

  const confirmEntry = useCallback(async (ticketCode, method = "manual") => {
    setState((s) => ({ ...s, phase: "confirming" }));

    try {
      const { status, body } = await callValidateTicket({
        ticketCode,
        action: "confirm",
        method,
      });

      if (status >= 400) {
        // Someone else confirmed it between check and confirm.
        const result = {
          outcome: outcomeFromErrorCode(body.error?.code),
          ticketCode,
          ticket: body.data || null,
          message: body.error?.message || "Ticket already used",
          usedAt: body.error?.usedAt || null,
        };
        setState({ phase: "result", data: result, error: null });
        return result;
      }

      const result = { outcome: "entered", ticketCode, ticket: body.data.ticket };
      setState({ phase: "entered", data: result, error: null });
      return result;
    } catch (err) {
      setState((s) => ({ ...s, phase: "result", error: err.message || "Failed to confirm entry" }));
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ phase: "idle", data: null, error: null });
  }, []);

  return { state, checkTicket, confirmEntry, reset };
}
```

- [ ] **Step 2: Delete the old hook**

```bash
git rm src/hooks/useValidateTicket.js
```

- [ ] **Step 3: Verify no other files import the deleted hook**

```bash
grep -rn "useValidateTicket" src/
```
Expected: no output (the only prior usage was in `CheckInPage.jsx`, which Task 7 rewrites to use `useTicketCheckIn` instead). If this returns matches outside `CheckInPage.jsx`, stop and update the plan before proceeding — do not silently leave a broken import.

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useTicketCheckIn.js
git commit -m "feat(check-in): add two-step useTicketCheckIn hook"
```
(The deletion from Step 2 is included in the same commit via `git rm`.)

---

### Task 4: Frontend — `CheckInResultModal` component

**Files:**
- Create: `src/components/admin/checkin/CheckInResultModal.jsx`
- Delete: `src/components/admin/checkin/CheckInResult.jsx`
- Modify: `src/i18n/es/admin.json`, `src/i18n/en/admin.json`

**Interfaces:**
- Consumes: `state` shape produced by Task 3's `useTicketCheckIn` (`{ phase, data, error }`).
- Produces (used by Task 7): `<CheckInResultModal state={state} onConfirm={(ticketCode) => void} onScanAnother={() => void} onViewDetails={(ticketId) => void} onSearchClient={() => void} />`. Open state is derived internally from `state.phase !== "idle"`.

- [ ] **Step 1: Add new i18n keys**

In `src/i18n/es/admin.json`, inside the existing `"checkin": { ... }` block (around line 614), add these keys (keep all existing keys):

```json
      "resultValidTitle": "Pase válido",
      "resultUsedTitle": "Pase ya utilizado",
      "resultInvalidTitle": "Pase inválido",
      "resultScheduleTitle": "Fuera de horario",
      "resultEnteredTitle": "Entrada registrada",
      "reasonNotFound": "Código no encontrado",
      "reasonCancelled": "Pase cancelado",
      "reasonExpired": "Pase expirado",
      "confirmEntry": "Registrar entrada",
      "confirming": "Registrando…",
      "scanAnother": "Escanear otro",
      "viewDetails": "Ver detalles",
      "searchClient": "Buscar cliente",
      "room": "Salón",
      "time": "Hora",
      "validFrom": "Válido desde",
      "validUntil": "Válido hasta",
      "currentTime": "Hora actual",
      "enteredSubtitle": "Ingresó a {room} · {time}"
```

In `src/i18n/en/admin.json`, inside the existing `"checkin": { ... }` block (around line 614), add the matching keys:

```json
      "resultValidTitle": "Valid pass",
      "resultUsedTitle": "Pass already used",
      "resultInvalidTitle": "Invalid pass",
      "resultScheduleTitle": "Outside schedule window",
      "resultEnteredTitle": "Entry registered",
      "reasonNotFound": "Code not found",
      "reasonCancelled": "Pass cancelled",
      "reasonExpired": "Pass expired",
      "confirmEntry": "Confirm entry",
      "confirming": "Confirming…",
      "scanAnother": "Scan another",
      "viewDetails": "View details",
      "searchClient": "Search client",
      "room": "Room",
      "time": "Time",
      "validFrom": "Valid from",
      "validUntil": "Valid until",
      "currentTime": "Current time",
      "enteredSubtitle": "Checked into {room} · {time}"
```

- [ ] **Step 2: Create the modal component**

Create `src/components/admin/checkin/CheckInResultModal.jsx`:

```jsx
import {
  Dialog,
  DialogPortal,
  DialogOverlay,
} from "@/components/common/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { CheckCircle, XCircle, AlertTriangle, Clock, Loader2 } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";

const STATE_STYLES = {
  valid: { accent: "text-emerald-700", bg: "bg-emerald-50", ring: "border-emerald-200" },
  used: { accent: "text-amber-700", bg: "bg-amber-50", ring: "border-amber-200" },
  invalid: { accent: "text-red-700", bg: "bg-red-50", ring: "border-red-200" },
  schedule: { accent: "text-blue-700", bg: "bg-blue-50", ring: "border-blue-200" },
  entered: { accent: "text-emerald-700", bg: "bg-emerald-50", ring: "border-emerald-200" },
};

function formatDateTime(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("es-MX", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function outcomeGroup(outcome) {
  if (outcome === "valid") return "valid";
  if (outcome === "used") return "used";
  if (outcome === "schedule") return "schedule";
  if (outcome === "entered") return "entered";
  return "invalid"; // invalid_not_found | invalid_cancelled | invalid_expired
}

function invalidReasonKey(outcome) {
  if (outcome === "invalid_cancelled") return "reasonCancelled";
  if (outcome === "invalid_expired") return "reasonExpired";
  return "reasonNotFound";
}

export default function CheckInResultModal({
  state,
  onConfirm,
  onScanAnother,
  onViewDetails,
  onSearchClient,
}) {
  const { t } = useLanguage();
  const open = state.phase !== "idle";
  const { phase, data } = state;

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) onScanAnother(); }}>
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          onEscapeKeyDown={(e) => { if (phase === "loading" || phase === "confirming") e.preventDefault(); }}
          onPointerDownOutside={(e) => { if (phase === "loading" || phase === "confirming") e.preventDefault(); }}
          className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-[min(560px,95vw)] max-h-[92vh] overflow-auto rounded-3xl bg-white shadow-2xl"
        >
          <DialogPrimitive.Title className="sr-only">
            {t("admin.checkin.title")}
          </DialogPrimitive.Title>

          {(phase === "loading" || phase === "confirming") && (
            <div className="p-14 text-center">
              <Loader2 className="h-12 w-12 mx-auto mb-6 text-sage animate-spin" />
              <p className="font-display text-xl text-charcoal">
                {phase === "confirming" ? t("admin.checkin.confirming") : t("admin.checkin.validating")}
              </p>
              <p className="text-xs tracking-wider text-charcoal-muted mt-2 font-mono">
                {data?.ticketCode}
              </p>
            </div>
          )}

          {phase === "entered" && (
            <>
              <div className="bg-emerald-50 p-9 text-center">
                <div className="h-16 w-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <CheckCircle className="h-8 w-8" />
                </div>
                <p className="font-display text-2xl font-semibold text-emerald-800">
                  {t("admin.checkin.resultEnteredTitle")}
                </p>
              </div>
              <div className="p-7 space-y-4">
                <div className="text-center">
                  <p className="font-display text-xl text-charcoal">
                    {data.ticket.participantName || data.ticketCode}
                  </p>
                  <p className="text-sm text-charcoal-muted mt-1">
                    {t("admin.checkin.enteredSubtitle")
                      .replace("{room}", data.ticket.roomName || "—")
                      .replace("{time}", formatDateTime(new Date().toISOString()))}
                  </p>
                </div>
                <button
                  onClick={onScanAnother}
                  className="w-full h-12 rounded-xl bg-sage text-white font-semibold hover:bg-sage-dark transition-colors cursor-pointer"
                >
                  {t("admin.checkin.scanAnother")}
                </button>
              </div>
            </>
          )}

          {phase === "result" && data && (() => {
            const group = outcomeGroup(data.outcome);
            const styles = STATE_STYLES[group];
            return (
              <>
                <div className={cn("p-9 text-center", styles.bg)}>
                  <div className={cn("h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg text-white",
                    group === "valid" && "bg-emerald-600",
                    group === "used" && "bg-amber-600",
                    group === "invalid" && "bg-red-600",
                    group === "schedule" && "bg-blue-600",
                  )}>
                    {group === "valid" && <CheckCircle className="h-8 w-8" />}
                    {group === "used" && <AlertTriangle className="h-7 w-7" />}
                    {group === "invalid" && <XCircle className="h-7 w-7" />}
                    {group === "schedule" && <Clock className="h-7 w-7" />}
                  </div>
                  <p className={cn("font-display text-2xl font-semibold", styles.accent)}>
                    {t(`admin.checkin.result${group.charAt(0).toUpperCase()}${group.slice(1)}Title`)}
                  </p>
                  {data.message && group !== "valid" && (
                    <p className="text-sm text-charcoal-muted mt-2">{data.message}</p>
                  )}
                </div>

                <div className="p-7 space-y-4">
                  {data.ticket && (group === "valid" || group === "used" || group === "schedule") && (
                    <div className="space-y-2 border-t border-sand-dark/30 pt-4">
                      {data.ticket.participantName && (
                        <div className="flex justify-between text-sm">
                          <span className="text-charcoal-muted">{t("admin.checkin.participant")}</span>
                          <span className="font-medium text-charcoal">{data.ticket.participantName}</span>
                        </div>
                      )}
                      {data.ticket.experienceName && (
                        <div className="flex justify-between text-sm">
                          <span className="text-charcoal-muted">{t("admin.checkin.experience")}</span>
                          <span className="font-medium text-charcoal text-right">{data.ticket.experienceName}</span>
                        </div>
                      )}
                      {data.ticket.roomName && (
                        <div className="flex justify-between text-sm">
                          <span className="text-charcoal-muted">{t("admin.checkin.room")}</span>
                          <span className="text-charcoal">{data.ticket.roomName}</span>
                        </div>
                      )}
                      {group === "used" && data.usedAt && (
                        <div className="flex justify-between text-sm">
                          <span className="text-charcoal-muted">{t("admin.checkin.previouslyCheckedIn").replace("{date}", "")}</span>
                          <span className="text-charcoal">{formatDateTime(data.usedAt)}</span>
                        </div>
                      )}
                      {group === "schedule" && data.schedule && (
                        <>
                          <div className="flex justify-between text-sm">
                            <span className="text-charcoal-muted">{t("admin.checkin.validFrom")}</span>
                            <span className="text-charcoal">{formatDateTime(data.schedule.validFrom)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-charcoal-muted">{t("admin.checkin.validUntil")}</span>
                            <span className="text-charcoal">{formatDateTime(data.schedule.validUntil)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-charcoal-muted">{t("admin.checkin.currentTime")}</span>
                            <span className="text-charcoal">{formatDateTime(data.schedule.now)}</span>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {group === "invalid" && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
                      {t(`admin.checkin.${invalidReasonKey(data.outcome)}`)}
                    </div>
                  )}

                  <div className="flex flex-col gap-2.5 pt-2">
                    {group === "valid" && (
                      <button
                        onClick={() => onConfirm(data.ticketCode)}
                        className="w-full h-12 rounded-xl bg-sage text-white font-semibold hover:bg-sage-dark transition-colors cursor-pointer"
                      >
                        {t("admin.checkin.confirmEntry")}
                      </button>
                    )}
                    <div className="flex gap-2.5">
                      {group === "valid" && data.ticket?.ticketId && (
                        <button
                          onClick={() => onViewDetails(data.ticket.ticketId)}
                          className="flex-1 h-11 rounded-xl border border-sand-dark text-charcoal font-medium hover:bg-warm-gray transition-colors cursor-pointer"
                        >
                          {t("admin.checkin.viewDetails")}
                        </button>
                      )}
                      {group === "invalid" && (
                        <button
                          onClick={onSearchClient}
                          className="flex-1 h-11 rounded-xl border border-sand-dark text-charcoal font-medium hover:bg-warm-gray transition-colors cursor-pointer"
                        >
                          {t("admin.checkin.searchClient")}
                        </button>
                      )}
                      <button
                        onClick={onScanAnother}
                        className="flex-1 h-11 rounded-xl border border-sand-dark text-charcoal font-medium hover:bg-warm-gray transition-colors cursor-pointer"
                      >
                        {t("admin.checkin.scanAnother")}
                      </button>
                    </div>
                  </div>
                </div>
              </>
            );
          })()}
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
```

- [ ] **Step 3: Delete the old result component**

```bash
git rm src/components/admin/checkin/CheckInResult.jsx
```

- [ ] **Step 4: Commit**

```bash
git add src/components/admin/checkin/CheckInResultModal.jsx src/i18n/es/admin.json src/i18n/en/admin.json
git commit -m "feat(check-in): add 5-state result modal, remove inline result component"
```

---

### Task 5: Frontend — `ScannerCard` component (camera + manual/HID input)

**Files:**
- Create: `src/components/admin/checkin/ScannerCard.jsx`
- Modify: `package.json` (add `html5-qrcode`)
- Modify: `src/i18n/es/admin.json`, `src/i18n/en/admin.json`

**Interfaces:**
- Consumes: nothing from other tasks.
- Produces (used by Task 7): `<ScannerCard onSubmitCode={(code: string) => void} disabled={boolean} focusToken={number} />`. `focusToken` — increment it from the parent any time the input should be refocused (e.g. after the result modal closes); the component re-focuses its manual input whenever this value changes.

- [ ] **Step 1: Install the camera QR scanning dependency**

```bash
npm install html5-qrcode
```
Expected: `package.json` gains `"html5-qrcode": "^2.x.x"` under `dependencies`.

- [ ] **Step 2: Add new i18n keys**

In `src/i18n/es/admin.json`, inside `"checkin": { ... }`, add:

```json
      "scanTitle": "Escanea el pase del cliente",
      "scanSubtitle": "Coloca el código QR frente a la cámara o usa el scanner físico.",
      "cameraStarting": "Iniciando cámara…",
      "cameraError": "No se pudo acceder a la cámara. Usa el código manual.",
      "cameraActive": "Cámara activa",
      "manualSectionLabel": "Ingresar código manualmente"
```

In `src/i18n/en/admin.json`, inside `"checkin": { ... }`, add:

```json
      "scanTitle": "Scan the customer's pass",
      "scanSubtitle": "Place the QR code in front of the camera or use the physical scanner.",
      "cameraStarting": "Starting camera…",
      "cameraError": "Couldn't access the camera. Use the manual code instead.",
      "cameraActive": "Camera active",
      "manualSectionLabel": "Enter code manually"
```

- [ ] **Step 3: Create the component**

Create `src/components/admin/checkin/ScannerCard.jsx`:

```jsx
import { useEffect, useRef, useState, useId } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { ScanLine } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import Button from "@/components/common/Button";
import { cn } from "@/lib/utils";

const TICKET_CODE_PATTERN = /^[A-Za-z0-9-]+$/;

export default function ScannerCard({ onSubmitCode, disabled = false, focusToken = 0 }) {
  const { t } = useLanguage();
  const elementId = useId().replace(/:/g, "");
  const [code, setCode] = useState("");
  const [cameraState, setCameraState] = useState("starting"); // starting | active | error
  const inputRef = useRef(null);
  const scannerRef = useRef(null);
  const lastScannedRef = useRef({ code: "", at: 0 });

  // Refocus the manual/HID input whenever the parent asks (e.g. modal closed).
  useEffect(() => {
    const id = setTimeout(() => inputRef.current?.focus(), 60);
    return () => clearTimeout(id);
  }, [focusToken]);

  // Camera lifecycle: start on mount, stop on unmount.
  useEffect(() => {
    let cancelled = false;
    const scanner = new Html5Qrcode(elementId);
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        (decodedText) => {
          const sanitized = decodedText.trim().toUpperCase();
          const now = Date.now();
          // Debounce: ignore the same code re-fired within 3s (camera scans continuously).
          if (
            lastScannedRef.current.code === sanitized &&
            now - lastScannedRef.current.at < 3000
          ) {
            return;
          }
          lastScannedRef.current = { code: sanitized, at: now };
          if (TICKET_CODE_PATTERN.test(sanitized)) {
            onSubmitCode(sanitized);
          }
        },
        () => {
          /* per-frame decode failures are expected while no code is in view — ignore */
        },
      )
      .then(() => {
        if (!cancelled) setCameraState("active");
      })
      .catch(() => {
        if (!cancelled) setCameraState("error");
      });

    return () => {
      cancelled = true;
      scanner
        .stop()
        .then(() => scanner.clear())
        .catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elementId]);

  const submitManual = () => {
    const sanitized = code.trim().toUpperCase();
    if (!sanitized) return;
    onSubmitCode(sanitized);
    setCode("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submitManual();
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-sand-dark/30 shadow-sm p-6 space-y-5">
      <div>
        <h2 className="font-display text-xl font-semibold text-charcoal">
          {t("admin.checkin.scanTitle")}
        </h2>
        <p className="text-sm text-charcoal-muted mt-1">{t("admin.checkin.scanSubtitle")}</p>
      </div>

      <div className="relative h-64 rounded-2xl overflow-hidden bg-charcoal">
        <div id={elementId} className="w-full h-full [&_video]:w-full [&_video]:h-full [&_video]:object-cover" />
        {cameraState !== "active" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-sand-light bg-charcoal/80 pointer-events-none">
            <ScanLine className="h-8 w-8" />
            <span className="text-xs">
              {cameraState === "error" ? t("admin.checkin.cameraError") : t("admin.checkin.cameraStarting")}
            </span>
          </div>
        )}
        {cameraState === "active" && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full bg-charcoal/70 px-3 py-1.5 text-xs text-sand-light">
            <span className="h-1.5 w-1.5 rounded-full bg-sage animate-pulse" />
            {t("admin.checkin.cameraActive")}
          </div>
        )}
      </div>

      <div>
        <label
          htmlFor="ticket-code-input"
          className="block text-[11px] font-semibold uppercase tracking-wider text-charcoal-muted mb-2"
        >
          {t("admin.checkin.manualSectionLabel")}
        </label>
        <div className="flex gap-3">
          <input
            ref={inputRef}
            id="ticket-code-input"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t("admin.checkin.placeholder")}
            autoFocus
            autoComplete="off"
            disabled={disabled}
            className={cn(
              "flex-1 h-12 rounded-xl border border-sand-dark bg-white px-4 text-charcoal font-mono text-sm uppercase tracking-wide placeholder:text-charcoal-muted/40 placeholder:normal-case focus:outline-none focus:border-sage focus:ring-2 focus:ring-sage/20",
              disabled && "opacity-50",
            )}
          />
          <Button type="button" size="lg" disabled={disabled || !code.trim()} onClick={submitManual}>
            {t("admin.checkin.validate")}
          </Button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json src/components/admin/checkin/ScannerCard.jsx src/i18n/es/admin.json src/i18n/en/admin.json
git commit -m "feat(check-in): add camera + manual/HID scanner card"
```

---

### Task 6: Frontend — `KioskOverlay` component

**Files:**
- Create: `src/components/admin/checkin/KioskOverlay.jsx`
- Modify: `src/i18n/es/admin.json`, `src/i18n/en/admin.json`

**Interfaces:**
- Consumes: nothing from other tasks directly — it's a layout wrapper that takes `children` (Task 7 passes a `<ScannerCard>` into it).
- Produces (used by Task 7): `<KioskOverlay onExit={() => void}>{children}</KioskOverlay>` — fixed full-screen, `z-40` (must render below the result modal's `z-50` from Task 4, above the normal admin layout).

- [ ] **Step 1: Add new i18n keys**

In `src/i18n/es/admin.json`, inside `"checkin": { ... }`, add:

```json
      "kioskEnter": "Modo Kiosco",
      "kioskExit": "Salir"
```

In `src/i18n/en/admin.json`, inside `"checkin": { ... }`, add:

```json
      "kioskEnter": "Kiosk Mode",
      "kioskExit": "Exit"
```

- [ ] **Step 2: Create the component**

Create `src/components/admin/checkin/KioskOverlay.jsx`:

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

export default function KioskOverlay({ onExit, children }) {
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
          className="h-10 px-4 rounded-xl border border-sand-dark bg-white text-sm font-semibold text-charcoal hover:bg-warm-gray transition-colors cursor-pointer"
        >
          {t("admin.checkin.kioskExit")}
        </button>
      </div>
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-xl">{children}</div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/checkin/KioskOverlay.jsx src/i18n/es/admin.json src/i18n/en/admin.json
git commit -m "feat(check-in): add full-screen kiosk overlay"
```

---

### Task 7: Frontend — rewrite `CheckInPage`

**Files:**
- Modify: `src/pages/admin/CheckInPage.jsx` (full rewrite)
- Modify: `src/i18n/es/admin.json`, `src/i18n/en/admin.json`

**Interfaces:**
- Consumes: `useTicketCheckIn` (Task 3), `ScannerCard` (Task 5), `CheckInResultModal` (Task 4), `KioskOverlay` (Task 6). All already produce the exact props this task uses.
- Produces: the page rendered at `ADMIN_CHECK_IN` (`/admin/check-in`, already routed in `src/App.jsx:352` — no route change needed).

- [ ] **Step 1: Add remaining i18n keys**

In `src/i18n/es/admin.json`, inside `"checkin": { ... }`: replace the `"subtitle"` line, delete the `"recentCheckins"` line (the new page uses `sessionHistory` instead — no other file references `recentCheckins`), and add `"sessionHistory"`:

```json
      "subtitle": "Escanea o ingresa el código del pase del cliente",
      "sessionHistory": "Check-ins de esta sesión"
```

In `src/i18n/en/admin.json`, the same three changes (replace `subtitle`, delete `recentCheckins`, add `sessionHistory`):

```json
      "subtitle": "Scan or enter the customer's pass code",
      "sessionHistory": "This session's check-ins"
```

- [ ] **Step 2: Rewrite the page**

Replace the entire contents of `src/pages/admin/CheckInPage.jsx` with:

```jsx
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTicketCheckIn } from "@/hooks/useTicketCheckIn";
import { useLanguage } from "@/hooks/useLanguage";
import { ROUTES } from "@/constants/routes";
import ScannerCard from "@/components/admin/checkin/ScannerCard";
import CheckInResultModal from "@/components/admin/checkin/CheckInResultModal";
import KioskOverlay from "@/components/admin/checkin/KioskOverlay";
import Button from "@/components/common/Button";
import { ScanLine, Maximize2 } from "lucide-react";

const MAX_HISTORY = 10;

export default function CheckInPage() {
  const { state, checkTicket, confirmEntry, reset } = useTicketCheckIn();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
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
        setHistory((prev) => [result, ...prev].slice(0, MAX_HISTORY));
      }
    },
    [confirmEntry, kioskMode],
  );

  const handleScanAnother = useCallback(() => {
    // Record failed/terminal outcomes in session history too, before resetting.
    if (state.phase === "result" && state.data) {
      setHistory((prev) => [state.data, ...prev].slice(0, MAX_HISTORY));
    }
    reset();
    bumpFocus();
  }, [state, reset, bumpFocus]);

  const handleViewDetails = useCallback(
    (ticketId) => {
      navigate(ROUTES.ADMIN_TICKET_DETAIL.replace(":ticketId", ticketId));
    },
    [navigate],
  );

  const handleSearchClient = useCallback(() => {
    navigate(ROUTES.ADMIN_CLIENTS);
  }, [navigate]);

  const scanner = (
    <ScannerCard
      onSubmitCode={handleSubmitCode}
      disabled={state.phase === "loading" || state.phase === "confirming"}
      focusToken={focusToken}
    />
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
      <KioskOverlay onExit={() => setKioskMode(false)}>
        {scanner}
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

      {scanner}
      {modal}

      {/* Session history */}
      {history.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-charcoal-muted uppercase tracking-wider">
            {t("admin.checkin.sessionHistory")}
          </h2>
          <div className="space-y-2">
            {history.map((entry, idx) => (
              <div
                key={`${entry.ticketCode}-${idx}`}
                className={`rounded-xl border px-4 py-3 text-sm flex items-center justify-between ${
                  entry.outcome === "valid" || entry.outcome === "entered"
                    ? "bg-emerald-50/50 border-emerald-200/60 text-emerald-800"
                    : "bg-red-50/50 border-red-200/60 text-red-800"
                }`}
              >
                <span className="font-mono text-xs">{entry.ticketCode}</span>
                <span className="text-xs">{entry.outcome}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/admin/CheckInPage.jsx src/i18n/es/admin.json src/i18n/en/admin.json
git commit -m "feat(check-in): wire scanner, result modal and kiosk mode into CheckInPage"
```

---

### Task 8: Manual end-to-end verification

**Files:** none (verification only).

- [ ] **Step 1: Start the dev server and open the Check-in page**

Use the preview tool to start the `dev` script and navigate to `/admin/check-in` logged in as an admin/operator user.

- [ ] **Step 2: Verify camera permission flow**

Grant camera access when prompted. Expected: the scanner box switches from "Iniciando cámara…" to the "Cámara activa" pill within a few seconds. If no camera is available in the test environment, confirm the box shows the "cameraError" copy and the manual input still works (this is the expected fallback, not a bug).

- [ ] **Step 3: Verify the manual-entry path for each outcome**

Using real ticket codes/status from `omzone-dev` (or ones you set up via the MCP for this test — e.g. temporarily flip a spare ticket to `cancelled`/`expired`, and use a slot far in the past/future for the schedule case):
- A `valid` ticket in-window → modal shows "Pase válido" with participant/experience/room rows and a "Registrar entrada" button.
- Click "Registrar entrada" → modal shows "Entrada registrada", then click "Escanear otro" → modal closes and the manual input is focused again (check by typing immediately without clicking the input).
- The same ticket scanned again → modal shows "Pase ya utilizado" with the redemption time.
- A `cancelled` ticket → "Pase inválido" with "Pase cancelado" reason.
- An `expired` ticket → "Pase inválido" with "Pase expirado" reason.
- A nonexistent code → "Pase inválido" with "Código no encontrado" reason.
- A valid ticket whose slot is outside the check-in window → "Fuera de horario" with the valid-from/until/now rows.

- [ ] **Step 4: Verify Kiosk mode**

Click "Modo Kiosco". Expected: the admin sidebar/topbar disappear, a full-screen scanner + clock UI takes over, "Salir" returns to the normal page. Confirm a ticket confirmed while in kiosk mode is recorded with `method: "kiosk"` (re-check the `ticket_redemptions` document via the MCP).

- [ ] **Step 5: Verify "Ver detalles" and "Buscar cliente" links**

From a "valid" result, click "Ver detalles" → lands on `/admin/tickets/:ticketId` (existing `TicketDetailPage`). From an "invalid" result, click "Buscar cliente" → lands on `/admin/clients` (existing `ClientListPage`).

- [ ] **Step 6: Note the physical scanner limitation**

Physical Bluetooth/USB "gun" scanners can't be exercised in this environment. Confirm logically that the manual input is always focused (Step 3's re-focus check covers this) and flag to the user that a real-device smoke test with an actual HID scanner is recommended after this ships.

- [ ] **Step 7: Report results to the user**

Summarize which scenarios passed/failed, with screenshots if the preview tool captured any, before considering this plan complete.
