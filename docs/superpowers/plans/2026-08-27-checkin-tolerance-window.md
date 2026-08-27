# Check-in Tolerance Window Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the hardcoded 30-minute check-in tolerance in `validate-ticket` with an admin-configurable window (`[slotStart - beforeMinutes, slotStart + afterMinutes]`, defaults 60/30), editable from a new "Check-in" tab in the admin Settings page, per [docs/superpowers/specs/2026-08-27-checkin-tolerance-window-design.md](../specs/2026-08-27-checkin-tolerance-window-design.md).

**Architecture:** The pure window-math is extracted into a new, independently-testable module (`functions/validate-ticket/src/scheduleWindow.js`) so it gets real `node:assert` unit tests — this repo's established pattern for pure logic (see `src/lib/checkoutRules.test.mjs`, `src/hooks/docsSearchCore.test.mjs`). `validate-ticket`'s handler reads the two tolerance values from the existing `settings` collection (already deployed to `omzone-dev`, currently unused) at request time, falling back to defaults if unset. The frontend gets a small hook (`useCheckInSettings`) and a new admin panel component, following the exact pattern of the existing `useNotificationTemplates` hook + `SystemInfoPanel` component in the same Settings page.

**Tech Stack:** `node-appwrite` (function), React 19 + Vite (admin panel), Appwrite CLI for function deployment and live verification (`omzone-dev` project, already authenticated).

## Global Constraints

- No test framework exists in this repo (no jest/vitest) — confirmed convention from prior plans. Pure logic modules get a plain `node:assert/strict` script run directly with `node <file>.test.mjs` (per `src/lib/checkoutRules.test.mjs`); functions and React components are verified manually (deploy + exercise through the running app), never with mocks/frameworks.
- Target project is `omzone-dev` (default everywhere already). No `appwrite.json` changes needed — the `settings` collection already exists live with the exact shape needed (`key`/`value`/`category` with `category` enum including `"general"`), and `APPWRITE_COLLECTION_SETTINGS` is already a project-level global variable (`settings`), confirmed via `appwrite databases get-collection` and `appwrite project list-variables`. No function scope changes needed either — `validate-ticket` already has `documents.read`.
- `npm run dev` / `npm run build` regenerate `public/docs/*.json` as a `predev`/`prebuild` side effect (unrelated docs-search index). After running either, check `git status` and revert any diff under `public/docs/` before committing — established convention from prior plans.
- Follow existing i18n convention: every user-facing string goes through `useLanguage()`'s `t()`, with matching keys added to both `src/i18n/en/admin.json` and `src/i18n/es/admin.json`.

---

## File Structure

**Backend:**
- Create: `functions/validate-ticket/src/scheduleWindow.js` — pure window-math (no Appwrite SDK dependency).
- Create: `functions/validate-ticket/src/scheduleWindow.test.mjs` — `node:assert` tests for the above.
- Modify: `functions/validate-ticket/src/main.js` — read settings, delegate to `scheduleWindow.js`, drop the old hardcoded constants.
- Modify: `scripts/seed-settings.mjs` — add the two new default rows so they exist immediately in any freshly-seeded environment.

**Frontend:**
- Create: `src/hooks/useCheckInSettings.js`.
- Create: `src/components/admin/settings/CheckInWindowPanel.jsx`.
- Modify: `src/pages/admin/SettingsPage.jsx` — add the "Check-in" tab.
- Modify: `src/i18n/en/admin.json`, `src/i18n/es/admin.json`.

---

### Task 1: Backend — extract schedule-window pure logic (TDD)

**Files:**
- Create: `functions/validate-ticket/src/scheduleWindow.js`
- Create: `functions/validate-ticket/src/scheduleWindow.test.mjs`

**Interfaces:**
- Produces (used by Task 2): `parseWindowMinutes(rawValue, fallback)`, `computeScheduleState(slotStartDatetime, beforeMinutes, afterMinutes, now?)`, `DEFAULT_CHECKIN_WINDOW_BEFORE_MINUTES`, `DEFAULT_CHECKIN_WINDOW_AFTER_MINUTES`.

- [ ] **Step 1: Write the failing test file**

Create `functions/validate-ticket/src/scheduleWindow.test.mjs`:

```js
import assert from "node:assert/strict";
import {
  DEFAULT_CHECKIN_WINDOW_BEFORE_MINUTES,
  DEFAULT_CHECKIN_WINDOW_AFTER_MINUTES,
  parseWindowMinutes,
  computeScheduleState,
} from "./scheduleWindow.js";

// ── parseWindowMinutes ──────────────────────────────────────────────────────

assert.equal(parseWindowMinutes("60", 30), 60);
assert.equal(parseWindowMinutes("0", 30), 0);
assert.equal(parseWindowMinutes("1440", 30), 1440);
assert.equal(parseWindowMinutes("1441", 30), 30); // above max -> fallback
assert.equal(parseWindowMinutes("-1", 30), 30); // negative -> fallback
assert.equal(parseWindowMinutes("abc", 30), 30); // not numeric -> fallback
assert.equal(parseWindowMinutes(undefined, 30), 30); // missing -> fallback
assert.equal(parseWindowMinutes(null, 30), 30); // null -> fallback

// ── computeScheduleState — invalid input ────────────────────────────────────

assert.equal(computeScheduleState(null, 60, 30), null);
assert.equal(computeScheduleState(undefined, 60, 30), null);
assert.equal(computeScheduleState("not-a-date", 60, 30), null);

// ── computeScheduleState — window boundaries ────────────────────────────────
// Slot starts 2026-08-27T09:00:00.000Z, window = [-60min, +30min] = [08:00, 09:30]

const slotStart = "2026-08-27T09:00:00.000Z";

const atWindowOpen = computeScheduleState(
  slotStart, 60, 30, new Date("2026-08-27T08:00:00.000Z"),
);
assert.equal(atWindowOpen.withinWindow, true);
assert.equal(atWindowOpen.validFrom, "2026-08-27T08:00:00.000Z");
assert.equal(atWindowOpen.validUntil, "2026-08-27T09:30:00.000Z");

const oneMinuteBeforeOpen = computeScheduleState(
  slotStart, 60, 30, new Date("2026-08-27T07:59:00.000Z"),
);
assert.equal(oneMinuteBeforeOpen.withinWindow, false);
assert.equal(oneMinuteBeforeOpen.reason, "too_early");

const atSlotStart = computeScheduleState(
  slotStart, 60, 30, new Date("2026-08-27T09:00:00.000Z"),
);
assert.equal(atSlotStart.withinWindow, true);

const atWindowClose = computeScheduleState(
  slotStart, 60, 30, new Date("2026-08-27T09:30:00.000Z"),
);
assert.equal(atWindowClose.withinWindow, true);

const oneMinuteAfterClose = computeScheduleState(
  slotStart, 60, 30, new Date("2026-08-27T09:31:00.000Z"),
);
assert.equal(oneMinuteAfterClose.withinWindow, false);
assert.equal(oneMinuteAfterClose.reason, "too_late");

// ── Defaults sanity ──────────────────────────────────────────────────────────

assert.equal(DEFAULT_CHECKIN_WINDOW_BEFORE_MINUTES, 60);
assert.equal(DEFAULT_CHECKIN_WINDOW_AFTER_MINUTES, 30);

console.log("scheduleWindow tests passed");
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node functions/validate-ticket/src/scheduleWindow.test.mjs`
Expected: `Error [ERR_MODULE_NOT_FOUND]` — `./scheduleWindow.js` doesn't exist yet.

- [ ] **Step 3: Write the implementation**

Create `functions/validate-ticket/src/scheduleWindow.js`:

```js
/**
 * Pure check-in window math for validate-ticket, kept dependency-free from
 * the Appwrite SDK so it can be unit-tested directly with `node:assert`.
 */

export const DEFAULT_CHECKIN_WINDOW_BEFORE_MINUTES = 60;
export const DEFAULT_CHECKIN_WINDOW_AFTER_MINUTES = 30;

const MIN_WINDOW_MINUTES = 0;
const MAX_WINDOW_MINUTES = 1440;

/**
 * Parses a stored setting value into a valid minutes count, falling back to
 * `fallback` for anything missing, non-numeric, or out of the sane [0, 1440]
 * range — a bad/missing setting must never break check-in.
 */
export function parseWindowMinutes(rawValue, fallback) {
  const parsed = Number.parseInt(rawValue, 10);
  if (
    !Number.isFinite(parsed) ||
    parsed < MIN_WINDOW_MINUTES ||
    parsed > MAX_WINDOW_MINUTES
  ) {
    return fallback;
  }
  return parsed;
}

/**
 * Computes whether `now` falls inside the check-in window for a slot:
 * [slotStartDatetime - beforeMinutes, slotStartDatetime + afterMinutes].
 * Returns null when slotStartDatetime is missing or unparseable.
 */
export function computeScheduleState(
  slotStartDatetime,
  beforeMinutes,
  afterMinutes,
  now = new Date(),
) {
  if (!slotStartDatetime) return null;

  const start = new Date(slotStartDatetime);
  if (Number.isNaN(start.getTime())) return null;

  const windowStart = new Date(start.getTime() - beforeMinutes * 60 * 1000);
  const windowEnd = new Date(start.getTime() + afterMinutes * 60 * 1000);

  if (now < windowStart) {
    return {
      withinWindow: false,
      reason: "too_early",
      validFrom: windowStart.toISOString(),
      validUntil: windowEnd.toISOString(),
      now: now.toISOString(),
    };
  }
  if (now > windowEnd) {
    return {
      withinWindow: false,
      reason: "too_late",
      validFrom: windowStart.toISOString(),
      validUntil: windowEnd.toISOString(),
      now: now.toISOString(),
    };
  }
  return {
    withinWindow: true,
    validFrom: windowStart.toISOString(),
    validUntil: windowEnd.toISOString(),
    now: now.toISOString(),
  };
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `node functions/validate-ticket/src/scheduleWindow.test.mjs`
Expected: prints `scheduleWindow tests passed` and exits 0.

- [ ] **Step 5: Commit**

```bash
git add functions/validate-ticket/src/scheduleWindow.js functions/validate-ticket/src/scheduleWindow.test.mjs
git commit -m "feat(check-in): extract configurable schedule-window math with tests"
```

---

### Task 2: Backend — wire `validate-ticket` to the configurable window

**Files:**
- Modify: `functions/validate-ticket/src/main.js`

- [ ] **Step 1: Confirm no other caller depends on the old `slotEndDate`-based cutoff**

```bash
grep -rn "getScheduleState\|schedule\.\(validFrom\|validUntil\|withinWindow\|reason\)" --include="*.js" --include="*.jsx" .
```

Expected: only `functions/validate-ticket/src/main.js` (the function being edited), plus `src/components/admin/checkin/CheckInResultModal.jsx` and `src/hooks/useTicketCheckIn.js` consuming `schedule.validFrom` / `schedule.validUntil` / `schedule.withinWindow` on the frontend (already accounted for in this plan — they keep working unchanged since the returned shape doesn't change, only how the values are computed). If anything else shows up, stop and re-scope before continuing.

- [ ] **Step 2: Update the module doc comment**

In `functions/validate-ticket/src/main.js`, find:

```js
 * @entities
 * - Reads: tickets (by ticketCode), bookings (by orderId + slotId)
```

Replace with:

```js
 * @entities
 * - Reads: tickets (by ticketCode), bookings (by orderId + slotId), settings
 *   (checkin_window_before_minutes, checkin_window_after_minutes)
```

Find:

```js
 * @envVars
 * - APPWRITE_FUNCTION_API_ENDPOINT (built-in, auto-injected)
 * - APPWRITE_FUNCTION_PROJECT_ID (built-in, auto-injected)
 * - x-appwrite-key header (dynamic API key, runtime only)
 * - APPWRITE_DATABASE_ID (project-level global)
 * - APPWRITE_COLLECTION_TICKETS (project-level global)
 * - APPWRITE_COLLECTION_TICKET_REDEMPTIONS (project-level global)
 * - APPWRITE_COLLECTION_BOOKINGS (project-level global)
```

Replace with:

```js
 * @envVars
 * - APPWRITE_FUNCTION_API_ENDPOINT (built-in, auto-injected)
 * - APPWRITE_FUNCTION_PROJECT_ID (built-in, auto-injected)
 * - x-appwrite-key header (dynamic API key, runtime only)
 * - APPWRITE_DATABASE_ID (project-level global)
 * - APPWRITE_COLLECTION_TICKETS (project-level global)
 * - APPWRITE_COLLECTION_TICKET_REDEMPTIONS (project-level global)
 * - APPWRITE_COLLECTION_BOOKINGS (project-level global)
 * - APPWRITE_COLLECTION_SETTINGS (project-level global)
```

- [ ] **Step 3: Import the new module and drop the old constants**

Find:

```js
import { Client, Databases, Query, ID, Users } from "node-appwrite";

// ─── Constants ───────────────────────────────────────────────────────────────

const VALID_METHODS = ["qr_scan", "manual", "kiosk", "system"];
const VALID_ACTIONS = ["check", "confirm"];
const TICKET_CODE_PATTERN = /^[A-Za-z0-9-]+$/;
const CHECK_IN_WINDOW_BEFORE_MS = 30 * 60 * 1000; // 30 minutes before slot start
const CHECK_IN_FALLBACK_DURATION_MS = 3 * 60 * 60 * 1000; // used when no slotEndDate
```

Replace with:

```js
import { Client, Databases, Query, ID, Users } from "node-appwrite";
import {
  DEFAULT_CHECKIN_WINDOW_BEFORE_MINUTES,
  DEFAULT_CHECKIN_WINDOW_AFTER_MINUTES,
  parseWindowMinutes,
  computeScheduleState,
} from "./scheduleWindow.js";

// ─── Constants ───────────────────────────────────────────────────────────────

const VALID_METHODS = ["qr_scan", "manual", "kiosk", "system"];
const VALID_ACTIONS = ["check", "confirm"];
const TICKET_CODE_PATTERN = /^[A-Za-z0-9-]+$/;
const SETTING_KEY_BEFORE = "checkin_window_before_minutes";
const SETTING_KEY_AFTER = "checkin_window_after_minutes";
```

- [ ] **Step 4: Replace `getScheduleState` with a thin wrapper + add the settings fetch helper**

Find:

```js
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
```

Replace with:

```js
/**
 * Computes whether "now" falls inside the ticket's check-in window. The
 * window bounds and the pure calculation live in scheduleWindow.js so they
 * can be unit-tested without spinning up the whole function runtime.
 */
function getScheduleState(ticket, beforeMinutes, afterMinutes) {
  const snapshot = safeParseSnapshot(ticket);
  return computeScheduleState(
    snapshot?.slotStartDatetime,
    beforeMinutes,
    afterMinutes,
  );
}

/**
 * Reads the admin-configurable check-in tolerance window from the settings
 * collection. Falls back to defaults if the documents don't exist yet or the
 * stored values are invalid — a bad/missing setting must never break check-in.
 */
async function fetchCheckInWindowMinutes(db, dbId, colSettings) {
  try {
    const result = await db.listDocuments(dbId, colSettings, [
      Query.equal("key", [SETTING_KEY_BEFORE, SETTING_KEY_AFTER]),
      Query.limit(2),
    ]);
    const byKey = Object.fromEntries(
      result.documents.map((doc) => [doc.key, doc.value]),
    );
    return {
      beforeMinutes: parseWindowMinutes(
        byKey[SETTING_KEY_BEFORE],
        DEFAULT_CHECKIN_WINDOW_BEFORE_MINUTES,
      ),
      afterMinutes: parseWindowMinutes(
        byKey[SETTING_KEY_AFTER],
        DEFAULT_CHECKIN_WINDOW_AFTER_MINUTES,
      ),
    };
  } catch {
    return {
      beforeMinutes: DEFAULT_CHECKIN_WINDOW_BEFORE_MINUTES,
      afterMinutes: DEFAULT_CHECKIN_WINDOW_AFTER_MINUTES,
    };
  }
}
```

- [ ] **Step 5: Add the `COL_SETTINGS` constant**

Find:

```js
  const COL_BOOKINGS = process.env.APPWRITE_COLLECTION_BOOKINGS || "bookings";
```

Replace with:

```js
  const COL_BOOKINGS = process.env.APPWRITE_COLLECTION_BOOKINGS || "bookings";
  const COL_SETTINGS = process.env.APPWRITE_COLLECTION_SETTINGS || "settings";
```

- [ ] **Step 6: Fetch the window settings in parallel with the ticket lookup**

Find:

```js
    // ── Lookup ticket by ticketCode ──────────────────────────────────────────
    const ticketResult = await db.listDocuments(DB, COL_TICKETS, [
      Query.equal("ticketCode", sanitizedCode),
      Query.limit(1),
    ]);
```

Replace with:

```js
    // ── Lookup ticket by ticketCode + check-in window settings (parallel) ────
    const [ticketResult, checkInWindow] = await Promise.all([
      db.listDocuments(DB, COL_TICKETS, [
        Query.equal("ticketCode", sanitizedCode),
        Query.limit(1),
      ]),
      fetchCheckInWindowMinutes(db, DB, COL_SETTINGS),
    ]);
```

- [ ] **Step 7: Pass the resolved minutes into `getScheduleState`**

Find:

```js
    // ── Schedule window check (informational — does not block "check") ───────
    const schedule = getScheduleState(ticket);
```

Replace with:

```js
    // ── Schedule window check (informational — does not block "check") ───────
    const schedule = getScheduleState(
      ticket,
      checkInWindow.beforeMinutes,
      checkInWindow.afterMinutes,
    );
```

- [ ] **Step 8: Deploy to `omzone-dev`**

```bash
appwrite push function --function-id=validate-ticket --yes
```

Expected: build completes, CLI reports the new deployment as active.

- [ ] **Step 9: Verify with a real ticket via the running app**

Using `npm run dev`, log in as admin/operator, go to `/admin/check-in`, and check-in a ticket whose slot starts more than 30 (but less than 60) minutes from now — this must now succeed (it would have failed before this change). Confirm the result modal's "Válido desde" / "Válido hasta" values match slotStart ± the configured defaults (60/30 min), not slotStart / slotEnd as before.

- [ ] **Step 10: Commit**

```bash
git add functions/validate-ticket/src/main.js
git commit -m "feat(check-in): make check-in tolerance window admin-configurable"
```

---

### Task 3: Backend — seed the default settings values

**Files:**
- Modify: `scripts/seed-settings.mjs`

- [ ] **Step 1: Add the two new settings rows**

In `scripts/seed-settings.mjs`, find the end of the `// ── General ──` block:

```js
  await createDoc("settings", "setting-contact-phone", {
    key: "contact_phone",
    value: "+52 322 000 0000",
    category: "general",
    description: "Public contact phone number",
  });
```

Replace with (adds two new rows right after it, same block):

```js
  await createDoc("settings", "setting-contact-phone", {
    key: "contact_phone",
    value: "+52 322 000 0000",
    category: "general",
    description: "Public contact phone number",
  });

  await createDoc("settings", "setting-checkin-window-before", {
    key: "checkin_window_before_minutes",
    value: "60",
    category: "general",
    description: "Minutes before a class starts that check-in is still allowed",
  });

  await createDoc("settings", "setting-checkin-window-after", {
    key: "checkin_window_after_minutes",
    value: "30",
    category: "general",
    description: "Minutes after a class starts that check-in is still allowed",
  });
```

- [ ] **Step 2: Run the seed script against `omzone-dev`**

```bash
set -a && source .env && set +a && node scripts/seed-settings.mjs
```

Expected: the two new lines print `✓ settings/setting-checkin-window-before` and `✓ settings/setting-checkin-window-after`; every other existing line prints `⏭ ... (exists)` (idempotent — confirms nothing else was touched).

- [ ] **Step 3: Verify via the CLI**

```bash
appwrite databases list-documents --database-id omzone_db --collection-id settings --queries 'equal("key",["checkin_window_before_minutes","checkin_window_after_minutes"])'
```

Expected: two documents, `value: "60"` and `value: "30"` respectively.

- [ ] **Step 4: Commit**

```bash
git add scripts/seed-settings.mjs
git commit -m "chore(settings): seed default check-in tolerance window values"
```

---

### Task 4: Frontend — `useCheckInSettings` hook

**Files:**
- Create: `src/hooks/useCheckInSettings.js`

**Interfaces:**
- Produces (used by Task 5): `useCheckInSettings()` → `{ beforeMinutes: number, afterMinutes: number, loading: boolean, error: string|null, save: (values: { beforeMinutes: number, afterMinutes: number }) => Promise<void> }`.

- [ ] **Step 1: Create the hook**

Create `src/hooks/useCheckInSettings.js`:

```js
import { useState, useEffect, useCallback } from "react";
import { databases, Query, ID } from "@/lib/appwrite";
import env from "@/config/env";
import { useLanguage } from "@/hooks/useLanguage";
import { getErrorMessage } from "@/lib/errors";

const DB = env.appwriteDatabaseId;
const COL = env.collectionSettings;

const KEY_BEFORE = "checkin_window_before_minutes";
const KEY_AFTER = "checkin_window_after_minutes";

export const DEFAULT_BEFORE_MINUTES = 60;
export const DEFAULT_AFTER_MINUTES = 30;

/**
 * Reads/writes the admin-configurable check-in tolerance window
 * (checkin_window_before_minutes / checkin_window_after_minutes) from the
 * shared `settings` collection. Creates the documents on first save if they
 * don't exist yet (they're seeded by scripts/seed-settings.mjs, but the hook
 * doesn't assume that ran).
 */
export function useCheckInSettings() {
  const { t } = useLanguage();
  const [beforeMinutes, setBeforeMinutes] = useState(DEFAULT_BEFORE_MINUTES);
  const [afterMinutes, setAfterMinutes] = useState(DEFAULT_AFTER_MINUTES);
  const [docs, setDocs] = useState({ before: null, after: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await databases.listDocuments(DB, COL, [
        Query.equal("key", [KEY_BEFORE, KEY_AFTER]),
        Query.limit(2),
      ]);
      const before = res.documents.find((d) => d.key === KEY_BEFORE) || null;
      const after = res.documents.find((d) => d.key === KEY_AFTER) || null;
      setDocs({ before, after });
      setBeforeMinutes(
        before ? Number.parseInt(before.value, 10) : DEFAULT_BEFORE_MINUTES,
      );
      setAfterMinutes(
        after ? Number.parseInt(after.value, 10) : DEFAULT_AFTER_MINUTES,
      );
    } catch (err) {
      setError(getErrorMessage(err, t));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const save = useCallback(
    async (values) => {
      const nextBefore = String(values.beforeMinutes);
      const nextAfter = String(values.afterMinutes);

      if (docs.before) {
        await databases.updateDocument(DB, COL, docs.before.$id, {
          value: nextBefore,
        });
      } else {
        await databases.createDocument(DB, COL, ID.unique(), {
          key: KEY_BEFORE,
          value: nextBefore,
          category: "general",
          description:
            "Minutes before a class starts that check-in is still allowed",
        });
      }

      if (docs.after) {
        await databases.updateDocument(DB, COL, docs.after.$id, {
          value: nextAfter,
        });
      } else {
        await databases.createDocument(DB, COL, ID.unique(), {
          key: KEY_AFTER,
          value: nextAfter,
          category: "general",
          description:
            "Minutes after a class starts that check-in is still allowed",
        });
      }

      await fetch();
    },
    [docs, fetch],
  );

  return { beforeMinutes, afterMinutes, loading, error, save };
}
```

- [ ] **Step 2: Verify**

Run `npm run build` to confirm no syntax errors. Then run `git status` and revert any regenerated `public/docs/*.json` diff (unrelated `prebuild` side effect — see Global Constraints).

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useCheckInSettings.js
git commit -m "feat(check-in): add useCheckInSettings hook"
```

---

### Task 5: Frontend — Check-in tab in Settings page

**Files:**
- Create: `src/components/admin/settings/CheckInWindowPanel.jsx`
- Modify: `src/pages/admin/SettingsPage.jsx`
- Modify: `src/i18n/en/admin.json`
- Modify: `src/i18n/es/admin.json`

- [ ] **Step 1: Add i18n keys (English)**

In `src/i18n/en/admin.json`, inside the `"settings"` object, find:

```json
      "storageBuckets": "Storage Buckets"
    },
```

Replace with:

```json
      "storageBuckets": "Storage Buckets",
      "checkinTab": "Check-in",
      "checkinWindowTitle": "Check-in tolerance window",
      "checkinWindowSubtitle": "Configure how many minutes before and after a class starts that check-in is still allowed.",
      "checkinBeforeMinutesLabel": "Minutes before class start",
      "checkinAfterMinutesLabel": "Minutes after class start",
      "checkinSaveButton": "Save",
      "checkinSaving": "Saving…",
      "checkinSaveSuccess": "Check-in window updated.",
      "checkinSaveError": "Couldn't save the check-in window. Please try again."
    },
```

- [ ] **Step 2: Add i18n keys (Spanish)**

In `src/i18n/es/admin.json`, inside the `"settings"` object, find:

```json
      "storageBuckets": "Buckets de Almacenamiento"
    },
```

Replace with:

```json
      "storageBuckets": "Buckets de Almacenamiento",
      "checkinTab": "Check-in",
      "checkinWindowTitle": "Ventana de tolerancia de check-in",
      "checkinWindowSubtitle": "Configura cuántos minutos antes y después del inicio de una clase se permite hacer check-in.",
      "checkinBeforeMinutesLabel": "Minutos antes del inicio de la clase",
      "checkinAfterMinutesLabel": "Minutos después del inicio de la clase",
      "checkinSaveButton": "Guardar",
      "checkinSaving": "Guardando…",
      "checkinSaveSuccess": "Ventana de check-in actualizada.",
      "checkinSaveError": "No se pudo guardar la ventana de check-in. Intenta de nuevo."
    },
```

- [ ] **Step 3: Create the panel component**

Create `src/components/admin/settings/CheckInWindowPanel.jsx`:

```jsx
import { useState, useEffect } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { useCheckInSettings } from "@/hooks/useCheckInSettings";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/common/Card";
import { Clock, Loader2 } from "lucide-react";
import { auditAction } from "@/lib/audit";

const MIN_MINUTES = 0;
const MAX_MINUTES = 1440;

function clampMinutes(value) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return MIN_MINUTES;
  return Math.min(MAX_MINUTES, Math.max(MIN_MINUTES, parsed));
}

export default function CheckInWindowPanel() {
  const { t } = useLanguage();
  const { beforeMinutes, afterMinutes, loading, error, save } =
    useCheckInSettings();

  const [beforeInput, setBeforeInput] = useState(beforeMinutes);
  const [afterInput, setAfterInput] = useState(afterMinutes);
  const [saving, setSaving] = useState(false);
  const [saveState, setSaveState] = useState(null); // "success" | "error" | null

  useEffect(() => {
    setBeforeInput(beforeMinutes);
    setAfterInput(afterMinutes);
  }, [beforeMinutes, afterMinutes]);

  const handleSave = async () => {
    setSaving(true);
    setSaveState(null);
    try {
      const values = {
        beforeMinutes: clampMinutes(beforeInput),
        afterMinutes: clampMinutes(afterInput),
      };
      await save(values);
      auditAction({
        action: "settings.checkin_window_update",
        entityType: "settings",
        entityId: "checkin_window",
        details: values,
      });
      setSaveState("success");
    } catch {
      setSaveState("error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-10 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-charcoal-muted" />
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-charcoal-muted" />
          {t("admin.settings.checkinWindowTitle")}
        </CardTitle>
        <CardDescription>
          {t("admin.settings.checkinWindowSubtitle")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && <p className="text-sm text-red-700">{error}</p>}
        <div>
          <label className="block text-sm font-medium text-charcoal mb-1">
            {t("admin.settings.checkinBeforeMinutesLabel")}
          </label>
          <input
            type="number"
            min={MIN_MINUTES}
            max={MAX_MINUTES}
            value={beforeInput}
            onChange={(e) => setBeforeInput(e.target.value)}
            className="w-full max-w-xs rounded-lg border border-sand-dark px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-charcoal mb-1">
            {t("admin.settings.checkinAfterMinutesLabel")}
          </label>
          <input
            type="number"
            min={MIN_MINUTES}
            max={MAX_MINUTES}
            value={afterInput}
            onChange={(e) => setAfterInput(e.target.value)}
            className="w-full max-w-xs rounded-lg border border-sand-dark px-3 py-2 text-sm"
          />
        </div>
        {saveState === "success" && (
          <p className="text-sm text-emerald-700">
            {t("admin.settings.checkinSaveSuccess")}
          </p>
        )}
        {saveState === "error" && (
          <p className="text-sm text-red-700">
            {t("admin.settings.checkinSaveError")}
          </p>
        )}
      </CardContent>
      <CardFooter>
        <button
          onClick={handleSave}
          disabled={saving}
          className="h-11 px-6 rounded-xl bg-sage text-white font-semibold hover:bg-sage-dark transition-colors cursor-pointer disabled:opacity-50"
        >
          {saving
            ? t("admin.settings.checkinSaving")
            : t("admin.settings.checkinSaveButton")}
        </button>
      </CardFooter>
    </Card>
  );
}
```

- [ ] **Step 4: Wire the new tab into `SettingsPage.jsx`**

In `src/pages/admin/SettingsPage.jsx`, find:

```jsx
import { Mail, Settings, Bell, Loader2 } from "lucide-react";
import { auditAction } from "@/lib/audit";

const SECTION_TABS = ["templates", "system"];
```

Replace with:

```jsx
import { Mail, Settings, Bell, Loader2, Clock } from "lucide-react";
import { auditAction } from "@/lib/audit";
import CheckInWindowPanel from "@/components/admin/settings/CheckInWindowPanel";

const SECTION_TABS = ["templates", "checkin", "system"];

const TAB_META = {
  templates: { icon: Bell, labelKey: "admin.settings.notificationTemplates" },
  checkin: { icon: Clock, labelKey: "admin.settings.checkinTab" },
  system: { icon: Settings, labelKey: "admin.settings.systemInfo" },
};
```

Find:

```jsx
      <div className="flex gap-1 border-b border-sand-dark/30">
        {SECTION_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 ${
              activeTab === tab
                ? "border-sage text-sage"
                : "border-transparent text-charcoal-muted hover:text-charcoal"
            }`}
          >
            {tab === "templates" ? (
              <Bell className="h-4 w-4" />
            ) : (
              <Settings className="h-4 w-4" />
            )}
            {tab === "templates"
              ? t("admin.settings.notificationTemplates")
              : t("admin.settings.systemInfo")}
          </button>
        ))}
      </div>
```

Replace with:

```jsx
      <div className="flex gap-1 border-b border-sand-dark/30">
        {SECTION_TABS.map((tab) => {
          const { icon: Icon, labelKey } = TAB_META[tab];
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 ${
                activeTab === tab
                  ? "border-sage text-sage"
                  : "border-transparent text-charcoal-muted hover:text-charcoal"
              }`}
            >
              <Icon className="h-4 w-4" />
              {t(labelKey)}
            </button>
          );
        })}
      </div>
```

Find:

```jsx
      {/* System info section */}
      {activeTab === "system" && <SystemInfoPanel />}
```

Replace with:

```jsx
      {/* Check-in window section */}
      {activeTab === "checkin" && <CheckInWindowPanel />}

      {/* System info section */}
      {activeTab === "system" && <SystemInfoPanel />}
```

- [ ] **Step 5: Verify in the browser**

Run `npm run dev`, log in as admin, go to `/admin/settings`. Confirm a "Check-in" tab appears between "Notification Templates" and "System Info". Open it, confirm it shows 60 / 30 (or whatever is currently seeded), change the values, click Save, confirm the success message appears, reload the page, and confirm the changed values persist (not reset to 60/30).

Then run `npm run build` to confirm no syntax errors, and `git status` to revert any regenerated `public/docs/*.json` diff.

- [ ] **Step 6: Commit**

```bash
git add src/components/admin/settings/CheckInWindowPanel.jsx src/pages/admin/SettingsPage.jsx src/i18n/en/admin.json src/i18n/es/admin.json
git commit -m "feat(check-in): add Check-in tolerance window tab to admin Settings"
```

---

### Task 6: Full manual end-to-end verification

**Files:** none (verification only).

- [ ] **Step 1: Verify the new default window end-to-end**

With the default 60/30 minutes in place (Task 3's seed), check in a real ticket in `omzone-dev` whose slot starts 45 minutes from now. Confirm it now succeeds — this is the original complaint ("8:50 for a 9:00 class") and would have failed before this change (old hardcoded window was only 30 minutes).

- [ ] **Step 2: Verify the outer boundaries**

Using a ticket with a slot starting in more than 60 minutes, confirm check-in is correctly blocked (`schedule` outcome, "too early" — no "Registrar entrada" button). Using a ticket whose slot started more than 30 minutes ago, confirm check-in is correctly blocked ("too late").

- [ ] **Step 3: Verify a changed setting takes effect immediately**

From `/admin/settings` → Check-in tab, change "Minutes before class start" to `15` and save. Without redeploying anything, re-check the "starts in 45 minutes" ticket from Step 1 — it must now be blocked as too early (proves the function reads the live setting on every request, not a cached/stale value). Change it back to `60` afterward to leave `omzone-dev` in its default state.

- [ ] **Step 4: Verify invalid/missing settings don't break check-in**

Via the CLI, temporarily set one of the two documents to an invalid value:

```bash
appwrite databases list-documents --database-id omzone_db --collection-id settings --queries 'equal("key",["checkin_window_before_minutes"])'
```

Note the returned `$id`, then:

```bash
appwrite databases update-document --database-id omzone_db --collection-id settings --document-id <the-id-from-above> --data '{"value":"not-a-number"}'
```

Re-run Step 1's check-in — it must still work, falling back to the 60-minute default (not error out). Restore the value to `"60"` afterward with the same command.

- [ ] **Step 5: Report results to the user**

Summarize which scenarios passed, including the exact before/after behavior for the original "8:50 for a 9:00 class" complaint, before considering this plan complete.
