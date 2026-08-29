# Check-in Audit Trail, Timing Visibility & Facility Arrival Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Every check-in outcome (not just duplicate scans) gets an audit entry with rich client/session/staff context; kiosk staff see who's operating and whether a scan is early/on-time/late; and a ticket's first scan marks "arrived at facility," welcoming the client by email and in-app notification.

**Architecture:** Extend the existing `validate-ticket` function (one more audit action per outcome branch, one new one-shot arrival side effect) and the existing `admin_activity_logs`/`notification_templates`/`send-notification` infrastructure — no new logging or email system. Add one new Appwrite table (`client_notifications`) and one new frontend polling hook, following the exact pattern already used by `useCheckInSummary`.

**Tech Stack:** Appwrite 1.9 (self-hosted, TablesDB API — `appwrite.json`'s `tables` array, deployed via `appwrite push tables` / `tables-db` CLI commands), Appwrite Functions (Node, `node-appwrite`), React 18 + Vite, TanStack patterns not used for polling in this codebase (plain `useState`/`useEffect`/`setInterval`, matching `useCheckInSummary.js`), Tailwind, Radix UI (`DropdownMenu`).

**Spec:** [docs/superpowers/specs/2026-08-29-checkin-audit-arrival-design.md](../specs/2026-08-29-checkin-audit-arrival-design.md)

**Working directory for all steps below:** `d:\RacoonDevs\omzone-v2\.worktrees\checkin-audit-arrival` (already created on branch `feat/checkin-audit-arrival`).

---

## Appwrite CLI setup (do this once, before Task 1)

The CLI (`appwrite` v16, global install) needs to be pointed at the `omzone-dev` project. There is no interactive login available in this environment, but the repo's own `.env` already has a working server API key for this exact project — reuse it instead of running `appwrite login`.

- [ ] **Verify CLI access to the dev project**

```bash
cd "d:\RacoonDevs\omzone-v2"
KEY=$(grep '^APPWRITE_API_KEY=' .env | cut -d= -f2-)
appwrite client --endpoint https://aprod.racoondevs.com/v1 --project-id omzone-dev --key "$KEY"
unset KEY
appwrite tables-db get --database-id omzone_db
```

Expected: `Success: Setting client`, then a JSON dump of the `omzone_db` database (confirms the key has access). Never print `$KEY` itself in any command output — the substitution above keeps it out of stdout.

**Never run `git log`, `cat`, or any command against `~/.appwrite/prefs.json`** — it holds live API keys/session cookies for multiple projects. All CLI auth in this plan goes through the `client` command above, scoped to `omzone-dev` only.

---

## Task 1: Schema — `tickets.arrivedAt`

**Files:**
- Modify: `appwrite.json` (tickets table, ~line 4403-4537)

- [ ] **Step 1: Add the `arrivedAt` column**

In the `tickets` table's `columns` array, right after the existing `usedAt` column block, insert:

```json
                {
                    "key": "arrivedAt",
                    "type": "datetime",
                    "required": false,
                    "array": false,
                    "default": null,
                    "format": ""
                },
```

- [ ] **Step 2: Add the `idx_arrivedAt` index**

In the `tickets` table's `indexes` array, right after the existing `idx_userArchivedAt` index object, add a comma and:

```json
                ,
                {
                    "key": "idx_arrivedAt",
                    "type": "key",
                    "status": "available",
                    "columns": [
                        "arrivedAt"
                    ],
                    "orders": []
                }
```

(Adjust commas so the JSON stays valid — `idx_arrivedAt` should be the new last element in the array.)

- [ ] **Step 3: Validate JSON syntax**

```bash
node -e "require('./appwrite.json'); console.log('valid JSON')"
```

Expected: `valid JSON`

- [ ] **Step 4: Push the schema change**

```bash
appwrite push tables --id tickets -f
```

Expected: CLI reports the `arrivedAt` column and `idx_arrivedAt` index created on the live `tickets` table (may take a few seconds for the index to become `available` — that's normal, Appwrite builds indexes asynchronously).

- [ ] **Step 5: Verify**

```bash
appwrite tables-db list-columns --database-id omzone_db --table-id tickets | grep -A5 arrivedAt
```

Expected: shows the new `arrivedAt` datetime column.

- [ ] **Step 6: Commit**

```bash
git add appwrite.json
git commit -m "feat(schema): add tickets.arrivedAt for facility-arrival tracking"
```

---

## Task 2: Schema — `client_notifications` table

**Files:**
- Modify: `appwrite.json` (insert new table right after the `tickets` table block, before `ticket_redemptions`)

- [ ] **Step 1: Add the table definition**

Insert this whole object into the top-level `tables` array, immediately after the `tickets` table's closing `},`:

```json
        {
            "$id": "client_notifications",
            "$permissions": [
                "read(\"label:root\")",
                "read(\"label:admin\")",
                "create(\"label:root\")",
                "create(\"label:admin\")"
            ],
            "databaseId": "omzone_db",
            "name": "client_notifications",
            "enabled": true,
            "rowSecurity": true,
            "columns": [
                {
                    "key": "userId",
                    "type": "string",
                    "required": true,
                    "array": false,
                    "size": 255,
                    "default": null,
                    "encrypt": false
                },
                {
                    "key": "type",
                    "type": "string",
                    "required": true,
                    "array": false,
                    "size": 50,
                    "default": null,
                    "encrypt": false
                },
                {
                    "key": "title",
                    "type": "string",
                    "required": true,
                    "array": false,
                    "size": 255,
                    "default": null,
                    "encrypt": false
                },
                {
                    "key": "body",
                    "type": "text",
                    "required": true,
                    "array": false,
                    "default": null,
                    "encrypt": false
                },
                {
                    "key": "ticketId",
                    "type": "string",
                    "required": false,
                    "array": false,
                    "size": 255,
                    "default": null,
                    "encrypt": false
                },
                {
                    "key": "isRead",
                    "type": "boolean",
                    "required": true,
                    "array": false,
                    "default": false
                },
                {
                    "key": "readAt",
                    "type": "datetime",
                    "required": false,
                    "array": false,
                    "default": null,
                    "format": ""
                }
            ],
            "indexes": [
                {
                    "key": "idx_userId",
                    "type": "key",
                    "status": "available",
                    "columns": [
                        "userId"
                    ],
                    "orders": []
                },
                {
                    "key": "idx_userId_isRead",
                    "type": "key",
                    "status": "available",
                    "columns": [
                        "userId",
                        "isRead"
                    ],
                    "orders": []
                }
            ]
        },
```

`rowSecurity: true` + minimal collection-level permissions matches the `tickets`/`bookings` pattern exactly — the actual client-read/update access comes from the per-document `Permission.read(Role.user(userId))` set when `validate-ticket` creates each notification (Task 9).

- [ ] **Step 2: Validate JSON syntax**

```bash
node -e "require('./appwrite.json'); console.log('valid JSON')"
```

Expected: `valid JSON`

- [ ] **Step 3: Push the new table**

```bash
appwrite push tables --id client_notifications -f
```

Expected: CLI reports the `client_notifications` table created with 7 columns and 2 indexes.

- [ ] **Step 4: Verify**

```bash
appwrite tables-db get-table --database-id omzone_db --table-id client_notifications
```

Expected: returns the table metadata, `enabled: true`.

- [ ] **Step 5: Commit**

```bash
git add appwrite.json
git commit -m "feat(schema): add client_notifications table for in-app arrival notices"
```

---

## Task 3: Data — `arrival-welcome` notification template

**Files:** none (data row only, created directly against the live project — `notification_templates` rows are data, not schema, so they don't live in `appwrite.json`)

- [ ] **Step 1: Create the template row**

```bash
appwrite tables-db create-row \
  --database-id omzone_db \
  --table-id notification_templates \
  --row-id unique() \
  --data '{"key":"arrival-welcome","type":"email","subject":"Welcome to OMZONE, {{participantName}}!","subjectEs":"¡Bienvenido a OMZONE, {{participantName}}!","body":"<p>We have recorded your arrival at our facility. Your {{experienceName}} session starts in {{minutesUntilSession}} minutes in {{roomName}}. See you soon!</p>","bodyEs":"<p>Ya registramos tu llegada a nuestras instalaciones. Tu sesión de {{experienceName}} comenzará en {{minutesUntilSession}} minutos en {{roomName}}. ¡Te esperamos!</p>","isActive":true}'
```

Expected: CLI returns the created row with a generated `$id`. If it fails with a duplicate-key error on `idx_key`, a row with `key: "arrival-welcome"` already exists — skip this step (nothing further to do, Task 9's code will find it).

- [ ] **Step 2: Verify**

```bash
appwrite tables-db list-rows --database-id omzone_db --table-id notification_templates --queries 'equal("key",["arrival-welcome"])'
```

Expected: returns exactly one row with `isActive: true`.

(No commit — this is live project data, not a file in the repo.)

---

## Task 4: `scheduleWindow.js` — `minutesFromStart`

**Files:**
- Modify: `functions/validate-ticket/src/scheduleWindow.js`
- Test: `functions/validate-ticket/src/scheduleWindow.test.mjs`

- [ ] **Step 1: Write the failing test**

Append to `functions/validate-ticket/src/scheduleWindow.test.mjs` (after the existing `oneMinuteAfterClose` assertions, before the "Defaults sanity" section):

```js
// ── minutesFromStart ─────────────────────────────────────────────────────────
// Same slotStart = 2026-08-27T09:00:00.000Z as above.

const fifteenEarly = computeScheduleState(
  slotStart, 60, 30, new Date("2026-08-27T08:45:00.000Z"),
);
assert.equal(fifteenEarly.minutesFromStart, 15);

const tenLate = computeScheduleState(
  slotStart, 60, 30, new Date("2026-08-27T09:10:00.000Z"),
);
assert.equal(tenLate.minutesFromStart, -10);

const exactlyOnTime = computeScheduleState(
  slotStart, 60, 30, new Date("2026-08-27T09:00:00.000Z"),
);
assert.equal(exactlyOnTime.minutesFromStart, 0);
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
node functions/validate-ticket/src/scheduleWindow.test.mjs
```

Expected: `AssertionError` — `fifteenEarly.minutesFromStart` is `undefined`, not `15`.

- [ ] **Step 3: Implement `minutesFromStart`**

In `functions/validate-ticket/src/scheduleWindow.js`, replace the whole `computeScheduleState` function:

```js
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
  const minutesFromStart = Math.round((start.getTime() - now.getTime()) / 60000);

  if (now < windowStart) {
    return {
      withinWindow: false,
      reason: "too_early",
      validFrom: windowStart.toISOString(),
      validUntil: windowEnd.toISOString(),
      now: now.toISOString(),
      minutesFromStart,
    };
  }
  if (now > windowEnd) {
    return {
      withinWindow: false,
      reason: "too_late",
      validFrom: windowStart.toISOString(),
      validUntil: windowEnd.toISOString(),
      now: now.toISOString(),
      minutesFromStart,
    };
  }
  return {
    withinWindow: true,
    validFrom: windowStart.toISOString(),
    validUntil: windowEnd.toISOString(),
    now: now.toISOString(),
    minutesFromStart,
  };
}
```

- [ ] **Step 4: Run the test to verify it passes**

```bash
node functions/validate-ticket/src/scheduleWindow.test.mjs
```

Expected: `scheduleWindow tests passed`

- [ ] **Step 5: Commit**

```bash
git add functions/validate-ticket/src/scheduleWindow.js functions/validate-ticket/src/scheduleWindow.test.mjs
git commit -m "feat(validate-ticket): compute minutesFromStart in schedule window state"
```

---

## Task 5: `validate-ticket` — audit/notification helpers

**Files:**
- Modify: `functions/validate-ticket/src/main.js`

- [ ] **Step 1: Widen the imports**

Replace:

```js
import { Client, Databases, Query, ID, Users } from "node-appwrite";
```

with:

```js
import { Client, Databases, Query, ID, Users, Functions, Permission, Role } from "node-appwrite";
```

- [ ] **Step 2: Add `arrivedAt` to the display extractor**

In `extractSnapshotDisplay`, add one field so the frontend can see arrival state. Replace:

```js
    status: ticket.status,
    usedAt: ticket.usedAt || null,
  };
}
```

with:

```js
    status: ticket.status,
    usedAt: ticket.usedAt || null,
    arrivedAt: ticket.arrivedAt || null,
  };
}
```

- [ ] **Step 3: Give `logActivity` a `severity` parameter**

Replace:

```js
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

with:

```js
async function logActivity(db, dbId, action, entityType, entityId, actorId, labels, severity, details = {}) {
  try {
    if (labels.includes("root")) return; // ghost-user rule
    const detailsStr = JSON.stringify(details).slice(0, 4000);
    await db.createDocument(dbId, "admin_activity_logs", ID.unique(), {
      userId: actorId,
      action,
      entityType,
      entityId,
      details: detailsStr,
      severity,
      result: "ok",
      source: "function",
      actorRoleSnapshot: _roleSnapshot(labels),
    });
  } catch {
    /* non-critical — never let logging break the check-in flow */
  }
}
```

- [ ] **Step 4: Add `buildAuditDetails`, `fetchParticipantCount`, `resolveClientLanguage`, `triggerArrivalNotifications`**

Immediately after the `logActivity` function (still inside the `// ─── Helpers ───` section), add:

```js
/**
 * Assembles the shared audit-details payload for every check-in-related
 * admin_activity_logs entry: client identity, session context, group-size
 * signal, and staff identity — so every outcome (not just the failure
 * cases) carries enough context to investigate without a follow-up query.
 */
function buildAuditDetails({ ticket, schedule, caller, participantCount, extra = {} }) {
  const snapshot = safeParseSnapshot(ticket);
  return {
    ticketCode: ticket.ticketCode,
    ticketId: ticket.$id,
    participantName: ticket.participantName || null,
    participantEmail: ticket.participantEmail || null,
    clientUserId: ticket.userId || null,
    experienceName: snapshot?.experienceName || null,
    roomName: snapshot?.roomName || null,
    locationName: snapshot?.locationName || null,
    slotStartDatetime: snapshot?.slotStartDatetime || null,
    timezone: snapshot?.timezone || null,
    orderNumber: snapshot?.orderNumber || null,
    isGroupBooking: typeof participantCount === "number" ? participantCount > 1 : null,
    participantCount: typeof participantCount === "number" ? participantCount : null,
    staffUserId: caller?.$id || null,
    staffName: caller?.name || null,
    staffEmail: caller?.email || null,
    schedule: schedule
      ? {
          withinWindow: schedule.withinWindow,
          reason: schedule.reason || null,
          minutesFromStart: schedule.minutesFromStart,
        }
      : null,
    ...extra,
  };
}

/**
 * Looks up the booking tied to this ticket's order+slot to read
 * participantCount (the only group-size signal in the schema today).
 * Read-only, best-effort — a missing/failed lookup must never break check-in.
 */
async function fetchParticipantCount(db, dbId, colBookings, ticket) {
  if (!ticket.orderId || !ticket.slotId) return null;
  try {
    const res = await db.listDocuments(dbId, colBookings, [
      Query.equal("orderId", ticket.orderId),
      Query.equal("slotId", ticket.slotId),
      Query.limit(1),
    ]);
    if (res.total === 0) return null;
    return typeof res.documents[0].participantCount === "number"
      ? res.documents[0].participantCount
      : null;
  } catch {
    return null;
  }
}

/**
 * Resolves which language to use for the arrival welcome (in-app + email),
 * mirroring send-notification's profile-language lookup but scoped to the
 * one field needed here since we already have the client's userId.
 */
async function resolveClientLanguage(db, dbId, colProfiles, userId) {
  if (!userId) return "en";
  try {
    const profile = await db.getDocument(dbId, colProfiles, userId);
    const lang = String(profile.language || profile.locale || "").toLowerCase();
    return lang.startsWith("es") ? "es" : "en";
  } catch {
    return "en";
  }
}

/**
 * Fires the two arrival side effects (welcome email + in-app notification)
 * for a ticket's first scan. Both are independently best-effort: a failure
 * in one must never block the other or the check-in response.
 */
async function triggerArrivalNotifications({
  client,
  db,
  log,
  error,
  dbId,
  colClientNotifications,
  colUserProfiles,
  ticket,
  minutesUntilSession,
}) {
  const snapshot = safeParseSnapshot(ticket);
  const language = await resolveClientLanguage(db, dbId, colUserProfiles, ticket.userId);
  const isSpanish = language === "es";
  const minutesLabel =
    typeof minutesUntilSession === "number" ? String(Math.max(0, minutesUntilSession)) : "—";

  if (ticket.participantEmail) {
    try {
      const functions = new Functions(client);
      const FUNC_SEND_NOTIFICATION =
        process.env.APPWRITE_FUNCTION_SEND_NOTIFICATION || "send-notification";
      const execution = await functions.createExecution(
        FUNC_SEND_NOTIFICATION,
        JSON.stringify({
          templateKey: "arrival-welcome",
          recipientEmail: ticket.participantEmail,
          recipientName: ticket.participantName || "",
          language,
          userId: ticket.userId || null,
          vars: {
            participantName: ticket.participantName || "",
            experienceName: snapshot?.experienceName || "",
            roomName: snapshot?.roomName || "",
            minutesUntilSession: minutesLabel,
          },
        }),
        false,
        "/",
        "POST",
      );
      log(
        `Triggered arrival-welcome notification for ticket ${ticket.$id} (execution: ${execution.$id})`,
      );
    } catch (err) {
      error(
        `arrival-welcome email trigger failed (non-blocking) for ticket ${ticket.$id}: ${err.message}`,
      );
    }
  } else {
    log(`Skipping arrival-welcome email for ticket ${ticket.$id}: no participantEmail`);
  }

  try {
    const title = isSpanish ? "¡Bienvenido a OMZONE!" : "Welcome to OMZONE!";
    const body = snapshot?.experienceName
      ? isSpanish
        ? `Registramos tu llegada. Tu sesión de ${snapshot.experienceName} comenzará en ${minutesLabel} minutos.`
        : `We've recorded your arrival. Your ${snapshot.experienceName} session starts in ${minutesLabel} minutes.`
      : isSpanish
        ? "Registramos tu llegada a nuestras instalaciones."
        : "We've recorded your arrival at our facility.";

    await db.createDocument(
      dbId,
      colClientNotifications,
      ID.unique(),
      {
        userId: ticket.userId,
        type: "arrival_welcome",
        title,
        body,
        ticketId: ticket.$id,
        isRead: false,
      },
      [
        Permission.read(Role.user(ticket.userId)),
        Permission.update(Role.user(ticket.userId)),
        Permission.read(Role.label("admin")),
        Permission.read(Role.label("root")),
      ],
    );
  } catch (err) {
    error(
      `client_notifications create failed (non-blocking) for ticket ${ticket.$id}: ${err.message}`,
    );
  }
}
```

- [ ] **Step 5: Add the two new collection env-var constants**

Replace:

```js
  const DB = process.env.APPWRITE_DATABASE_ID || "omzone_db";
  const COL_TICKETS = process.env.APPWRITE_COLLECTION_TICKETS || "tickets";
  const COL_REDEMPTIONS =
    process.env.APPWRITE_COLLECTION_TICKET_REDEMPTIONS || "ticket_redemptions";
  const COL_BOOKINGS = process.env.APPWRITE_COLLECTION_BOOKINGS || "bookings";
  const COL_SETTINGS = process.env.APPWRITE_COLLECTION_SETTINGS || "settings";
```

with:

```js
  const DB = process.env.APPWRITE_DATABASE_ID || "omzone_db";
  const COL_TICKETS = process.env.APPWRITE_COLLECTION_TICKETS || "tickets";
  const COL_REDEMPTIONS =
    process.env.APPWRITE_COLLECTION_TICKET_REDEMPTIONS || "ticket_redemptions";
  const COL_BOOKINGS = process.env.APPWRITE_COLLECTION_BOOKINGS || "bookings";
  const COL_SETTINGS = process.env.APPWRITE_COLLECTION_SETTINGS || "settings";
  const COL_CLIENT_NOTIFICATIONS =
    process.env.APPWRITE_COLLECTION_CLIENT_NOTIFICATIONS || "client_notifications";
  const COL_USER_PROFILES =
    process.env.APPWRITE_COLLECTION_USER_PROFILES || "user_profiles";
```

- [ ] **Step 6: Check the file still parses**

```bash
node --check functions/validate-ticket/src/main.js
```

Expected: no output (syntax OK). It will still fail at runtime right now because existing `logActivity(...)` call sites haven't been updated to the new signature yet — that's fixed in the next tasks.

- [ ] **Step 7: Commit**

```bash
git add functions/validate-ticket/src/main.js
git commit -m "feat(validate-ticket): add audit-details, participant-count, and arrival-notification helpers"
```

---

## Task 6: `validate-ticket` — audit the not-found / cancelled / expired / duplicate outcomes

**Files:**
- Modify: `functions/validate-ticket/src/main.js`

- [ ] **Step 1: Audit "not found" and compute `participantCount` for every subsequent branch**

Replace:

```js
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
```

with:

```js
    if (ticketResult.total === 0) {
      log(`Ticket not found: ${sanitizedCode} (by ${userId})`);
      await logActivity(
        db, DB, "checkin.rejected_not_found", "ticket", sanitizedCode, userId, labels, "warn",
        {
          ticketCode: sanitizedCode,
          staffUserId: caller.$id,
          staffName: caller.name || null,
          staffEmail: caller.email || null,
        },
      );
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
    const participantCount = await fetchParticipantCount(db, DB, COL_BOOKINGS, ticket);
```

- [ ] **Step 2: Audit "already used", "cancelled", "expired"**

Replace the whole status-check block:

```js
    // ── Check ticket status ──────────────────────────────────────────────────
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
```

with:

```js
    // ── Check ticket status ──────────────────────────────────────────────────
    if (ticket.status === "used") {
      log(`Ticket already used: ${sanitizedCode} (usedAt: ${ticket.usedAt})`);
      await logActivity(
        db, DB, "checkin.duplicate_scan_attempt", "ticket", ticket.$id, userId, labels, "warn",
        buildAuditDetails({
          ticket,
          schedule: null,
          caller,
          participantCount,
          extra: { originalUsedAt: ticket.usedAt },
        }),
      );
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
      await logActivity(
        db, DB, "checkin.rejected_cancelled", "ticket", ticket.$id, userId, labels, "warn",
        buildAuditDetails({ ticket, schedule: null, caller, participantCount }),
      );
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
      await logActivity(
        db, DB, "checkin.rejected_expired", "ticket", ticket.$id, userId, labels, "warn",
        buildAuditDetails({ ticket, schedule: null, caller, participantCount }),
      );
      return res.json(
        {
          ok: false,
          error: { code: "ERR_VALIDATE_EXPIRED", message: "Ticket expired" },
          data: extractSnapshotDisplay(ticket),
        },
        410,
      );
    }
```

- [ ] **Step 3: Check the file still parses**

```bash
node --check functions/validate-ticket/src/main.js
```

Expected: no output.

- [ ] **Step 4: Commit**

```bash
git add functions/validate-ticket/src/main.js
git commit -m "feat(validate-ticket): audit not-found, cancelled, expired, and duplicate scans with rich context"
```

---

## Task 7: `validate-ticket` — arrival side effect + `valid_scan`/`rejected_schedule` audits

**Files:**
- Modify: `functions/validate-ticket/src/main.js`

- [ ] **Step 1: Replace the check-action block**

Replace:

```js
    // ── Schedule window check (informational — does not block "check") ───────
    const schedule = getScheduleState(
      ticket,
      checkInWindow.beforeMinutes,
      checkInWindow.afterMinutes,
    );

    // ── "check" action stops here — read-only ─────────────────────────────────
    if (action === "check") {
      return res.json({
        ok: true,
        data: { ticket: extractSnapshotDisplay(ticket), schedule, confirmed: false },
      });
    }
```

with:

```js
    // ── Schedule window check (informational — does not block "check") ───────
    const schedule = getScheduleState(
      ticket,
      checkInWindow.beforeMinutes,
      checkInWindow.afterMinutes,
    );

    // ── "check" action stops here — read-only, except for the one-shot ───────
    // facility-arrival side effect below, guarded by ticket.arrivedAt so it
    // only ever runs once per ticket no matter how many times it's re-scanned.
    if (action === "check") {
      let arrivalJustRecorded = false;

      if (!ticket.arrivedAt) {
        const arrivedAt = new Date().toISOString();
        try {
          await db.updateDocument(DB, COL_TICKETS, ticket.$id, { arrivedAt });
          ticket.arrivedAt = arrivedAt;
          arrivalJustRecorded = true;
        } catch (err) {
          log(`WARN: Failed to record arrival for ticket ${ticket.$id}: ${err.message}`);
        }

        if (arrivalJustRecorded) {
          const minutesUntilSession = schedule ? schedule.minutesFromStart : null;

          await logActivity(
            db, DB, "checkin.arrived", "ticket", ticket.$id, userId, labels, "info",
            buildAuditDetails({
              ticket, schedule, caller, participantCount, extra: { minutesUntilSession },
            }),
          );

          await triggerArrivalNotifications({
            client,
            db,
            log,
            error,
            dbId: DB,
            colClientNotifications: COL_CLIENT_NOTIFICATIONS,
            colUserProfiles: COL_USER_PROFILES,
            ticket,
            minutesUntilSession,
          });
        }
      }

      if (schedule && !schedule.withinWindow) {
        await logActivity(
          db, DB, "checkin.rejected_schedule", "ticket", ticket.$id, userId, labels, "warn",
          buildAuditDetails({ ticket, schedule, caller, participantCount }),
        );
      } else if (!arrivalJustRecorded) {
        await logActivity(
          db, DB, "checkin.valid_scan", "ticket", ticket.$id, userId, labels, "info",
          buildAuditDetails({ ticket, schedule, caller, participantCount }),
        );
      }

      return res.json({
        ok: true,
        data: {
          ticket: extractSnapshotDisplay(ticket),
          schedule,
          confirmed: false,
          arrivalJustRecorded,
        },
      });
    }
```

- [ ] **Step 2: Check the file still parses**

```bash
node --check functions/validate-ticket/src/main.js
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add functions/validate-ticket/src/main.js
git commit -m "feat(validate-ticket): record facility arrival on first scan, audit valid/out-of-window scans"
```

---

## Task 8: `validate-ticket` — audit `checkin.confirmed`

**Files:**
- Modify: `functions/validate-ticket/src/main.js`

- [ ] **Step 1: Add the audit call before the success response**

Replace:

```js
    // ── Return success with display data ─────────────────────────────────────
    const displayData = extractSnapshotDisplay({
      ...ticket,
      status: "used",
      usedAt: now,
    });
```

with:

```js
    await logActivity(
      db, DB, "checkin.confirmed", "ticket", ticket.$id, userId, labels, "info",
      buildAuditDetails({
        ticket: { ...ticket, status: "used", usedAt: now },
        schedule,
        caller,
        participantCount,
        extra: { redemptionMethod, previousStatus: "valid" },
      }),
    );

    // ── Return success with display data ─────────────────────────────────────
    const displayData = extractSnapshotDisplay({
      ...ticket,
      status: "used",
      usedAt: now,
    });
```

- [ ] **Step 2: Update the function docstring**

At the top of the file, replace the `@entities` block:

```js
 * @entities
 * - Reads: tickets (by ticketCode), bookings (by orderId + slotId), settings
 *   (checkin_window_before_minutes, checkin_window_after_minutes)
 * - Writes (action=confirm only): tickets (status → used, usedAt), bookings (status → checked-in, checkedInAt)
 * - Creates (action=confirm only): ticket_redemptions
```

with:

```js
 * @entities
 * - Reads: tickets (by ticketCode), bookings (by orderId + slotId), settings
 *   (checkin_window_before_minutes, checkin_window_after_minutes), user_profiles
 *   (for arrival-notification language)
 * - Writes (action=check, first scan only): tickets.arrivedAt (one-shot)
 * - Writes (action=confirm only): tickets (status → used, usedAt), bookings (status → checked-in, checkedInAt)
 * - Creates (action=confirm only): ticket_redemptions
 * - Creates (action=check, first scan only): client_notifications
 * - Writes: admin_activity_logs (one entry per outcome: checkin.rejected_not_found,
 *   checkin.duplicate_scan_attempt, checkin.rejected_cancelled, checkin.rejected_expired,
 *   checkin.rejected_schedule, checkin.arrived, checkin.valid_scan, checkin.confirmed)
```

And replace the `@idempotent` line:

```js
 * @idempotent "check" is always idempotent (read-only). "confirm" on an already-used
 *   ticket returns 409 without duplicating redemptions.
```

with:

```js
 * @idempotent "check" is read-only except for a guarded one-shot arrival side effect
 *   (tickets.arrivedAt, welcome email/notification) that only fires once per ticket
 *   regardless of re-scans. "confirm" on an already-used ticket returns 409 without
 *   duplicating redemptions.
```

- [ ] **Step 3: Check the file still parses**

```bash
node --check functions/validate-ticket/src/main.js
```

Expected: no output.

- [ ] **Step 4: Commit**

```bash
git add functions/validate-ticket/src/main.js
git commit -m "feat(validate-ticket): audit checkin.confirmed and update function docstring"
```

---

## Task 9: Deploy `validate-ticket`

**Files:** none (deployment only)

- [ ] **Step 1: Push the function**

```bash
appwrite push function --function-id=validate-ticket -f
```

Expected: build completes, CLI reports the new deployment as active. If `-f` isn't recognized by this CLI version, retry with `--force` (global flag) or check `appwrite push functions --help` for the current flag name.

- [ ] **Step 2: Smoke-test via a manual scan**

In the admin UI (`/admin/checkin`), scan or manually enter a ticket code for a ticket that has never been scanned before, in `valid` status. Confirm:
- The result modal shows "Pase válido" without error.
- No 500 error in the browser network tab for the `validate-ticket` execution.

- [ ] **Step 3: No commit needed** (deployment step only)

---

## Task 10: Frontend config — `env.js` collection var + i18n keys

**Files:**
- Modify: `src/config/env.js`
- Modify: `src/i18n/es/admin.json`, `src/i18n/en/admin.json`
- Modify: `src/i18n/es/landing.json`, `src/i18n/en/landing.json`

- [ ] **Step 1: Add the `client_notifications` collection var**

In `src/config/env.js`, after the `collectionHeroSlides` entry, add:

```js
  collectionClientNotifications:
    import.meta.env.VITE_APPWRITE_COLLECTION_CLIENT_NOTIFICATIONS ||
    "client_notifications",
```

- [ ] **Step 2: Add check-in i18n keys (Spanish)**

In `src/i18n/es/admin.json`, inside the `"checkin"` object, replace:

```json
      "recentActivityTitle": "Actividad reciente"
    },
```

with:

```json
      "recentActivityTitle": "Actividad reciente",
      "timingOnTime": "A tiempo",
      "timingEarly": "Temprano",
      "timingLate": "Tarde",
      "sessionStarts": "Sesión inicia",
      "operatedBy": "Operando: {name}",
      "arrivalWelcomeSent": "✓ Bienvenida enviada"
    },
```

- [ ] **Step 3: Add check-in i18n keys (English)**

In `src/i18n/en/admin.json`, inside the `"checkin"` object, replace:

```json
      "recentActivityTitle": "Recent activity"
    },
```

with:

```json
      "recentActivityTitle": "Recent activity",
      "timingOnTime": "On time",
      "timingEarly": "Early",
      "timingLate": "Late",
      "sessionStarts": "Session starts",
      "operatedBy": "Operated by: {name}",
      "arrivalWelcomeSent": "✓ Welcome sent"
    },
```

- [ ] **Step 4: Add notifications i18n namespace (Spanish)**

In `src/i18n/es/landing.json`, right after the closing `},` of the `"nav"` object, add:

```json
  "notifications": {
    "bellLabel": "Notificaciones",
    "title": "Notificaciones",
    "empty": "No tienes notificaciones nuevas"
  },
```

- [ ] **Step 5: Add notifications i18n namespace (English)**

In `src/i18n/en/landing.json`, in the same location, add:

```json
  "notifications": {
    "bellLabel": "Notifications",
    "title": "Notifications",
    "empty": "You have no new notifications"
  },
```

- [ ] **Step 6: Validate all four JSON files parse**

```bash
node -e "['es','en'].forEach(l => { require('./src/i18n/'+l+'/admin.json'); require('./src/i18n/'+l+'/landing.json'); }); console.log('valid JSON')"
```

Expected: `valid JSON`

- [ ] **Step 7: Commit**

```bash
git add src/config/env.js src/i18n/es/admin.json src/i18n/en/admin.json src/i18n/es/landing.json src/i18n/en/landing.json
git commit -m "feat(i18n): add check-in timing/staff-badge and notifications strings"
```

---

## Task 11: `CheckInResultModal` — timing chip + arrival note

**Files:**
- Modify: `src/hooks/useTicketCheckIn.js`
- Modify: `src/components/admin/checkin/CheckInResultModal.jsx`

- [ ] **Step 1: Pass `arrivalJustRecorded` through the hook**

In `src/hooks/useTicketCheckIn.js`, in `checkTicket`, replace:

```js
      const schedule = body.data.schedule;
      const outcome = schedule && !schedule.withinWindow ? "schedule" : "valid";
      const result = {
        outcome,
        ticketCode: sanitized,
        ticket: body.data.ticket,
        schedule,
      };
```

with:

```js
      const schedule = body.data.schedule;
      const outcome = schedule && !schedule.withinWindow ? "schedule" : "valid";
      const result = {
        outcome,
        ticketCode: sanitized,
        ticket: body.data.ticket,
        schedule,
        arrivalJustRecorded: body.data.arrivalJustRecorded ?? false,
      };
```

- [ ] **Step 2: Add a `timingChip` helper to the modal**

In `src/components/admin/checkin/CheckInResultModal.jsx`, after the `invalidReasonKey` function, add:

```js
function timingChip(minutesFromStart, t) {
  if (typeof minutesFromStart !== "number") return null;
  if (minutesFromStart > 5) {
    return { label: t("admin.checkin.timingEarly"), className: "bg-amber-100 text-amber-800" };
  }
  if (minutesFromStart < -5) {
    return { label: t("admin.checkin.timingLate"), className: "bg-orange-100 text-orange-800" };
  }
  return { label: t("admin.checkin.timingOnTime"), className: "bg-emerald-100 text-emerald-800" };
}
```

- [ ] **Step 3: Render the chip and arrival note for the `valid` outcome**

Replace:

```jsx
                      {group === "used" && data.usedAt && (
                        <div className="flex justify-between text-sm">
                          <span className="text-charcoal-muted">{t("admin.checkin.previouslyCheckedIn").replace("{date}", "")}</span>
                          <span className="text-charcoal">{formatDateTime(data.usedAt)}</span>
                        </div>
                      )}
```

with:

```jsx
                      {group === "used" && data.usedAt && (
                        <div className="flex justify-between text-sm">
                          <span className="text-charcoal-muted">{t("admin.checkin.previouslyCheckedIn").replace("{date}", "")}</span>
                          <span className="text-charcoal">{formatDateTime(data.usedAt)}</span>
                        </div>
                      )}
                      {group === "valid" && data.schedule && (
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-charcoal-muted">{t("admin.checkin.sessionStarts")}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-charcoal">{formatDateTime(data.ticket.slotStartDatetime)}</span>
                            {(() => {
                              const chip = timingChip(data.schedule.minutesFromStart, t);
                              return chip ? (
                                <span className={cn("px-2 py-0.5 rounded-full text-xs font-semibold", chip.className)}>
                                  {chip.label}
                                </span>
                              ) : null;
                            })()}
                          </div>
                        </div>
                      )}
                      {group === "valid" && data.arrivalJustRecorded && (
                        <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs font-medium text-emerald-700 text-center">
                          {t("admin.checkin.arrivalWelcomeSent")}
                        </div>
                      )}
```

- [ ] **Step 4: Lint the changed files**

```bash
npx eslint src/hooks/useTicketCheckIn.js src/components/admin/checkin/CheckInResultModal.jsx
```

Expected: no errors.

- [ ] **Step 5: Manual verification**

Run `npm run dev`, log in as admin, scan a fresh valid ticket in `/admin/checkin`. Confirm the "Pase válido" modal shows the session start time with an "A tiempo"/"Temprano"/"Tarde" chip, and the green "✓ Bienvenida enviada" note. Re-scan the same ticket — confirm the note no longer appears (arrival already recorded) but the timing chip still does.

- [ ] **Step 6: Commit**

```bash
git add src/hooks/useTicketCheckIn.js src/components/admin/checkin/CheckInResultModal.jsx
git commit -m "feat(checkin): show session timing chip and arrival-welcome confirmation in scan result"
```

---

## Task 12: Staff badge — kiosk, normal mode, alerts card

**Files:**
- Create: `src/components/admin/checkin/StaffBadge.jsx`
- Modify: `src/components/admin/checkin/KioskOverlay.jsx`
- Modify: `src/pages/admin/CheckInPage.jsx`
- Modify: `src/components/admin/checkin/AlertsCard.jsx`

- [ ] **Step 1: Create `StaffBadge`**

```jsx
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { UserCircle2 } from "lucide-react";

export default function StaffBadge({ className = "" }) {
  const { user } = useAuth();
  const { t } = useLanguage();

  if (!user) return null;

  return (
    <div
      className={`flex items-center gap-2 rounded-full border border-sand-dark bg-white px-3 py-1.5 text-xs font-medium text-charcoal ${className}`}
    >
      <UserCircle2 className="h-4 w-4 text-sage" />
      <span className="truncate max-w-40">
        {t("admin.checkin.operatedBy").replace("{name}", user.name || user.email)}
      </span>
    </div>
  );
}
```

- [ ] **Step 2: Add it to `KioskOverlay`'s header**

In `src/components/admin/checkin/KioskOverlay.jsx`, add the import:

```jsx
import StaffBadge from "@/components/admin/checkin/StaffBadge";
```

Replace:

```jsx
        <button
          onClick={onExit}
          className="h-14 px-6 rounded-xl border border-sand-dark bg-white text-sm font-semibold text-charcoal hover:bg-warm-gray transition-colors cursor-pointer"
        >
          {t("admin.checkin.kioskExit")}
        </button>
      </div>
```

with:

```jsx
        <div className="flex items-center gap-3">
          <StaffBadge />
          <button
            onClick={onExit}
            className="h-14 px-6 rounded-xl border border-sand-dark bg-white text-sm font-semibold text-charcoal hover:bg-warm-gray transition-colors cursor-pointer"
          >
            {t("admin.checkin.kioskExit")}
          </button>
        </div>
      </div>
```

- [ ] **Step 3: Add it to `CheckInPage`'s normal-mode header**

In `src/pages/admin/CheckInPage.jsx`, add the import:

```jsx
import StaffBadge from "@/components/admin/checkin/StaffBadge";
```

Replace:

```jsx
        <Button variant="outline" size="sm" onClick={() => setKioskMode(true)}>
          <Maximize2 className="h-4 w-4 mr-1.5" />
          {t("admin.checkin.kioskEnter")}
        </Button>
      </div>
```

with:

```jsx
        <div className="flex items-center gap-3">
          <StaffBadge />
          <Button variant="outline" size="sm" onClick={() => setKioskMode(true)}>
            <Maximize2 className="h-4 w-4 mr-1.5" />
            {t("admin.checkin.kioskEnter")}
          </Button>
        </div>
      </div>
```

- [ ] **Step 4: Add an "operating" line to `AlertsCard`**

In `src/components/admin/checkin/AlertsCard.jsx`, add the import:

```jsx
import { useAuth } from "@/hooks/useAuth";
```

Replace:

```jsx
export default function AlertsCard({ alerts, loading }) {
  const { t } = useLanguage();
  const list = alerts || [];

  if (loading || list.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-sand-dark/30 shadow-sm p-5">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-charcoal-muted mb-3">
        {t("admin.checkin.alertsTitle")}
      </div>
```

with:

```jsx
export default function AlertsCard({ alerts, loading }) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const list = alerts || [];

  if (loading || list.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-sand-dark/30 shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-charcoal-muted">
          {t("admin.checkin.alertsTitle")}
        </div>
        {user && (
          <div className="text-[11px] text-charcoal-muted">
            {t("admin.checkin.operatedBy").replace("{name}", user.name || user.email)}
          </div>
        )}
      </div>
```

- [ ] **Step 5: Lint the changed files**

```bash
npx eslint src/components/admin/checkin/StaffBadge.jsx src/components/admin/checkin/KioskOverlay.jsx src/pages/admin/CheckInPage.jsx src/components/admin/checkin/AlertsCard.jsx
```

Expected: no errors.

- [ ] **Step 6: Manual verification**

Run `npm run dev`. In `/admin/checkin`, confirm the staff badge shows your logged-in name in normal mode. Click "Modo Kiosco" — confirm the badge also appears in the kiosk header. Trigger a duplicate-scan alert (scan an already-used ticket twice) and confirm the "Operando: {name}" line appears above the alerts list.

- [ ] **Step 7: Commit**

```bash
git add src/components/admin/checkin/StaffBadge.jsx src/components/admin/checkin/KioskOverlay.jsx src/pages/admin/CheckInPage.jsx src/components/admin/checkin/AlertsCard.jsx
git commit -m "feat(checkin): show operating staff badge in kiosk, normal mode, and alerts card"
```

---

## Task 13: In-app notification bell

**Files:**
- Create: `src/hooks/useClientNotifications.js`
- Create: `src/components/common/NotificationBell.jsx`
- Modify: `src/components/layout/Navbar.jsx`

- [ ] **Step 1: Create the polling hook**

```js
import { useState, useEffect, useCallback } from "react";
import { databases, Query } from "@/lib/appwrite";
import { useAuth } from "@/hooks/useAuth";
import env from "@/config/env";

const DB = env.appwriteDatabaseId;
const COL_NOTIFICATIONS = env.collectionClientNotifications;
const POLL_INTERVAL_MS = 60 * 1000;

/**
 * Polls the authenticated client's in-app notifications. No Realtime
 * subscription exists in this codebase yet, so this follows the same
 * setInterval pattern already used by useCheckInSummary.
 */
export function useClientNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    if (!user?.$id) {
      setNotifications([]);
      setLoading(false);
      return;
    }
    try {
      const res = await databases.listDocuments(DB, COL_NOTIFICATIONS, [
        Query.equal("userId", user.$id),
        Query.orderDesc("$createdAt"),
        Query.limit(20),
      ]);
      setNotifications(res.documents);
    } catch {
      // Background convenience feature — keep last-known-good data.
    } finally {
      setLoading(false);
    }
  }, [user?.$id]);

  useEffect(() => {
    fetchNotifications();
    const id = setInterval(fetchNotifications, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [fetchNotifications]);

  const markAsRead = useCallback(async (notificationId) => {
    setNotifications((prev) =>
      prev.map((n) => (n.$id === notificationId ? { ...n, isRead: true } : n)),
    );
    try {
      await databases.updateDocument(DB, COL_NOTIFICATIONS, notificationId, {
        isRead: true,
        readAt: new Date().toISOString(),
      });
    } catch {
      // Best-effort — a failed mark-as-read just means it reappears as unread.
    }
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return { notifications, unreadCount, loading, markAsRead, refetch: fetchNotifications };
}
```

- [ ] **Step 2: Create the bell component**

```jsx
import { Bell } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useClientNotifications } from "@/hooks/useClientNotifications";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/common/dropdown-menu";

export default function NotificationBell({ transparent = false }) {
  const { t } = useLanguage();
  const { notifications, unreadCount, markAsRead } = useClientNotifications();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={`relative p-2 rounded-full transition-colors cursor-pointer ${
            transparent ? "text-white hover:text-white/80" : "text-charcoal hover:text-sage"
          }`}
          aria-label={t("notifications.bellLabel")}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0.5 right-0.5 h-4 min-w-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-semibold flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>{t("notifications.title")}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <div className="px-3 py-6 text-center text-sm text-charcoal-muted">
            {t("notifications.empty")}
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {notifications.map((n) => (
              <button
                key={n.$id}
                onClick={() => markAsRead(n.$id)}
                className={`w-full text-left px-3 py-2.5 border-b border-sand-dark/15 last:border-b-0 transition-colors hover:bg-warm-gray/60 cursor-pointer ${
                  n.isRead ? "" : "bg-sage/5"
                }`}
              >
                <div className="text-sm font-semibold text-charcoal">{n.title}</div>
                <div className="text-xs text-charcoal-muted mt-0.5">{n.body}</div>
              </button>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

- [ ] **Step 3: Wire it into `Navbar` (desktop)**

In `src/components/layout/Navbar.jsx`, add the import:

```jsx
import NotificationBell from "@/components/common/NotificationBell";
```

Replace:

```jsx
        <div className="hidden lg:flex items-center gap-3">
          <LanguageSwitcher transparent={isTransparent} />
          {!user ? (
```

with:

```jsx
        <div className="hidden lg:flex items-center gap-3">
          <LanguageSwitcher transparent={isTransparent} />
          {user && isClient && <NotificationBell transparent={isTransparent} />}
          {!user ? (
```

- [ ] **Step 4: Wire it into `Navbar` (mobile)**

Replace:

```jsx
                  {isClient && (
                    <>
                      <Link
                        to={ROUTES.PORTAL}
```

with:

```jsx
                  {isClient && (
                    <>
                      <div className="flex items-center justify-between px-3 py-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-muted">
                          {t("notifications.title")}
                        </span>
                        <NotificationBell />
                      </div>
                      <Link
                        to={ROUTES.PORTAL}
```

- [ ] **Step 5: Lint the changed files**

```bash
npx eslint src/hooks/useClientNotifications.js src/components/common/NotificationBell.jsx src/components/layout/Navbar.jsx
```

Expected: no errors.

- [ ] **Step 6: Manual verification**

Run `npm run dev`. Log in as a client whose ticket you scanned earlier in Task 11 (a fresh, previously-unscanned ticket triggers the notification — you may need to scan a new one now that the schema/function are live). Confirm the bell in the navbar shows an unread badge, opening it shows the arrival-welcome notification, and clicking it clears the badge and marks it read (refresh the page and confirm it stays read).

- [ ] **Step 7: Commit**

```bash
git add src/hooks/useClientNotifications.js src/components/common/NotificationBell.jsx src/components/layout/Navbar.jsx
git commit -m "feat(portal): add in-app notification bell for facility arrival welcomes"
```

---

## Task 14: Full manual verification pass

**Files:** none (verification only, per the spec's Testing section)

- [ ] **Step 1: Every outcome produces its audit action**

In `/admin/checkin`, in order:
1. Scan a fresh valid ticket (in-window) → confirm `checkin.arrived` **and** the timing chip/arrival note appear; check `/admin/audit` shows `checkin.arrived` with client identity, session info, group flag, staff identity in the details drawer.
2. Re-scan the same ticket → confirm `checkin.valid_scan` appears (not another `checkin.arrived`), and the arrival note is gone but the timing chip remains.
3. Click "Registrar entrada" → confirm `checkin.confirmed` appears, distinct from `checkin.arrived`.
4. Scan an already-used ticket → confirm `checkin.duplicate_scan_attempt` (existing alert still shows in the Alerts card).
5. Scan a nonexistent code → confirm `checkin.rejected_not_found`.
6. Find or create a cancelled/expired ticket and scan it → confirm `checkin.rejected_cancelled` / `checkin.rejected_expired`.
7. Scan a valid ticket for a session far in the future (outside the check-in window) → confirm `checkin.rejected_schedule` **and** `checkin.arrived` both appear (first scan, early arrival — see spec Part 1's co-occurrence note).

- [ ] **Step 2: Welcome email**

Check the `send-notification` function's execution logs (Appwrite console or `appwrite functions list-executions --function-id send-notification`) for a recent `arrival-welcome` execution with `sent: true`. If email delivery isn't observable in this environment, confirm the execution ran without error as a substitute.

- [ ] **Step 3: Staff badge and timing chip across contexts**

Confirm the staff badge shows the correct logged-in name in kiosk mode, normal mode, and the alerts card. Scan tickets with slot times in the near future, near-now, and already-passed-but-in-window to see all three timing chip states (Temprano / A tiempo / Tarde).

- [ ] **Step 4: No regressions**

```bash
npm run build
```

Expected: build succeeds with no new errors.

- [ ] **Step 5: No commit needed** (verification only — if any issue is found, fix it in the relevant task's files and commit there).

---

## Task 15: Merge to `main`

**Files:** none

- [ ] **Step 1: Push the branch**

```bash
cd "d:\RacoonDevs\omzone-v2\.worktrees\checkin-audit-arrival"
git push -u origin feat/checkin-audit-arrival
```

- [ ] **Step 2: Merge to `main`**

The user has explicitly pre-authorized pushing this work to `main` once complete. From the main worktree:

```bash
cd "d:\RacoonDevs\omzone-v2"
git fetch origin
git merge --no-ff feat/checkin-audit-arrival -m "Merge feat/checkin-audit-arrival: check-in audit trail, timing visibility, facility arrival"
git push origin main
```

- [ ] **Step 3: Clean up the worktree**

```bash
git worktree remove .worktrees/checkin-audit-arrival
git branch -d feat/checkin-audit-arrival
```

---

## Plan self-review notes

- **Spec coverage:** Part 1 (all 8 audit actions) → Tasks 5-8. Part 2 (timing chip, staff badge) → Tasks 11-12. Part 3 (schema, backend arrival logic, email, in-app notification) → Tasks 1-3, 5, 7, 13. i18n → Task 10. Testing section → Task 14. Out-of-scope items from the spec are not touched by any task.
- **Type/signature consistency:** `logActivity` is called with the new `severity` argument in every call site across Tasks 6-8 (no stale 7-arg calls remain). `buildAuditDetails` is used consistently with `{ ticket, schedule, caller, participantCount, extra }`. `triggerArrivalNotifications` is only called once, from Task 7, with matching parameter names. `arrivalJustRecorded` flows from `main.js` response → `useTicketCheckIn.js` → `CheckInResultModal.jsx` with the same field name throughout.
- **No placeholders:** every step above contains complete, runnable code — no "add error handling" or "similar to Task N" shortcuts.
