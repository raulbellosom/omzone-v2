# Ticket Detail Info Fix + Activity History Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the admin Ticket Detail page showing "—" for experience name and session date (wrong field names / unparsed snapshot JSON), and add a bilingual "Ticket Activity" section showing who confirmed the ticket and the full scan history, per [docs/superpowers/specs/2026-08-29-ticket-detail-activity-design.md](../specs/2026-08-29-ticket-detail-activity-design.md).

**Architecture:** Four pre-existing display bugs (wrong field names, unparsed JSON string) get fixed using the codebase's established conventions (`localizedField`, `slot.startDatetime`, a new shared `parseTicketSnapshot` helper). The backend `validate-ticket` function is extended to log every scan outcome (not just duplicates) to the existing `admin_activity_logs` collection. A new `useTicketActivity` hook and `TicketActivityCard` component surface that log plus the already-written-but-never-displayed `ticket_redemptions` collection on the ticket detail page, admin-gated the same way the existing "Actions" card is.

**Tech Stack:** React 19 + Vite (admin panel), `node-appwrite` (function), Appwrite CLI for function deployment and live verification (`omzone-dev` project, already authenticated).

## Global Constraints

- No test framework exists in this repo (no jest/vitest) — confirmed convention from prior plans (see [2026-08-27-checkin-tolerance-window.md](2026-08-27-checkin-tolerance-window.md)). Functions and React components are verified manually (deploy + exercise through the running app), never with mocks/frameworks.
- Target project is `omzone-dev` (default everywhere already). `ticket_redemptions` and `admin_activity_logs` already exist live with the exact shape needed — no `appwrite.json` / schema changes required anywhere in this plan.
- `npm run dev` / `npm run build` regenerate `public/docs/*.json` as a `predev`/`prebuild` side effect (unrelated docs-search index). After running either, check `git status` and revert any diff under `public/docs/` before committing.
- Follow existing i18n convention: every user-facing string goes through `useLanguage()`'s `t()`, with matching keys added to both `src/i18n/en/admin.json` and `src/i18n/es/admin.json`.
- Follow existing bilingual-field convention for entity data (not UI strings): `localizedField(item, field, language)` from `src/hooks/useLanguage.js` — EN value in `item[field]`, ES value in `item[field + "Es"]`.
- Every commit message ends with a `Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>` trailer, per this session's commit convention.

---

## File Structure

**Backend:**
- Modify: `functions/validate-ticket/src/main.js` — log every scan/confirm outcome to `admin_activity_logs`, not just duplicates.

**Frontend:**
- Create: `src/lib/tickets.js` — `parseTicketSnapshot(ticket)`, the single place that safely parses the `ticketSnapshot` JSON string.
- Create: `src/hooks/useTicketActivity.js` — fetches the ticket's redemption record + activity log rows + resolves actor display names.
- Create: `src/components/admin/tickets/TicketActivityCard.jsx` — renders "Confirmed by" + "Scan history".
- Modify: `src/config/env.js` — add the missing `collectionTicketRedemptions` constant.
- Modify: `src/pages/admin/TicketDetailPage.jsx` — fix experience-name/slot-date field bugs, add snapshot fallback, mount `TicketActivityCard`.
- Modify: `src/pages/admin/TicketListPage.jsx` — fix the experience filter dropdown's label bug.
- Modify: `src/components/admin/tickets/TicketTable.jsx` — fix the unparsed-snapshot bug.
- Modify: `src/components/admin/tickets/TicketCard.jsx` — fix the unparsed-snapshot bug.
- Modify: `src/i18n/en/admin.json`, `src/i18n/es/admin.json` — new `ticketDetail.*` keys.

---

### Task 1: Backend — log every check-in scan outcome

**Files:**
- Modify: `functions/validate-ticket/src/main.js`

- [ ] **Step 1: Confirm nothing else depends on the current logging behavior**

```bash
grep -rn "checkin.duplicate_scan_attempt\|admin_activity_logs" --include="*.js" --include="*.jsx" .
```

Expected: only `functions/validate-ticket/src/main.js` (the `logActivity` call being extended) and `src/pages/admin/AuditLogPage.jsx` (generic log viewer, reads by collection, not by action string — unaffected). If anything else filters specifically on `checkin.duplicate_scan_attempt`, stop and re-scope.

- [ ] **Step 2: Log a successful "check" scan (valid ticket)**

In `functions/validate-ticket/src/main.js`, find:

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

Replace with:

```js
    // ── Schedule window check (informational — does not block "check") ───────
    const schedule = getScheduleState(
      ticket,
      checkInWindow.beforeMinutes,
      checkInWindow.afterMinutes,
    );

    // ── "check" action stops here — read-only ─────────────────────────────────
    if (action === "check") {
      await logActivity(db, DB, "checkin.scan_valid", "ticket", ticket.$id, userId, labels, {
        ticketCode: sanitizedCode,
        withinWindow: schedule ? schedule.withinWindow : null,
      });
      return res.json({
        ok: true,
        data: { ticket: extractSnapshotDisplay(ticket), schedule, confirmed: false },
      });
    }
```

- [ ] **Step 3: Log a "check" scan on a cancelled ticket**

Find:

```js
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
```

Replace with:

```js
    if (ticket.status === "cancelled") {
      log(`Ticket cancelled: ${sanitizedCode}`);
      await logActivity(db, DB, "checkin.scan_cancelled", "ticket", ticket.$id, userId, labels, {
        ticketCode: sanitizedCode,
      });
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
```

- [ ] **Step 4: Log a "check" scan on an expired ticket**

Find:

```js
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

Replace with:

```js
    if (ticket.status === "expired") {
      log(`Ticket expired: ${sanitizedCode}`);
      await logActivity(db, DB, "checkin.scan_expired", "ticket", ticket.$id, userId, labels, {
        ticketCode: sanitizedCode,
      });
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

Note: `ticket.status === "used"` (the duplicate-scan case) already calls `logActivity(..., "checkin.duplicate_scan_attempt", ...)` a few lines above these two blocks — leave that one exactly as-is.

- [ ] **Step 5: Log a successful "confirm"**

Find:

```js
    await db.createDocument(DB, COL_REDEMPTIONS, ID.unique(), redemptionData);

    log(
      `Redemption recorded: ticket=${ticket.$id}, by=${userId}, method=${redemptionMethod}`,
    );
```

Replace with:

```js
    const redemption = await db.createDocument(
      DB,
      COL_REDEMPTIONS,
      ID.unique(),
      redemptionData,
    );

    log(
      `Redemption recorded: ticket=${ticket.$id}, by=${userId}, method=${redemptionMethod}`,
    );

    await logActivity(db, DB, "checkin.confirmed", "ticket", ticket.$id, userId, labels, {
      ticketCode: sanitizedCode,
      method: redemptionMethod,
      redemptionId: redemption.$id,
    });
```

- [ ] **Step 6: Update the module doc comment**

Find:

```js
 * @entities
 * - Reads: tickets (by ticketCode), bookings (by orderId + slotId), settings
 *   (checkin_window_before_minutes, checkin_window_after_minutes)
 * - Writes (action=confirm only): tickets (status → used, usedAt), bookings (status → checked-in, checkedInAt)
 * - Creates (action=confirm only): ticket_redemptions
```

Replace with:

```js
 * @entities
 * - Reads: tickets (by ticketCode), bookings (by orderId + slotId), settings
 *   (checkin_window_before_minutes, checkin_window_after_minutes)
 * - Writes (action=confirm only): tickets (status → used, usedAt), bookings (status → checked-in, checkedInAt)
 * - Creates (action=confirm only): ticket_redemptions
 * - Creates (best-effort, non-blocking): admin_activity_logs — one row per scan
 *   outcome (checkin.scan_valid / scan_cancelled / scan_expired /
 *   duplicate_scan_attempt / confirmed), entityType "ticket", so the admin
 *   Ticket Detail page can show a full scan history + who confirmed it.
```

- [ ] **Step 7: Deploy to `omzone-dev`**

```bash
appwrite push function --function-id=validate-ticket --yes
```

Expected: build completes, CLI reports the new deployment as active.

- [ ] **Step 8: Verify via a real scan**

Using `npm run dev`, log in as admin/operator, go to `/admin/check-in`, and scan (or manually enter) a valid ticket without confirming it. Then check the CLI:

```bash
appwrite databases list-documents --database-id omzone_db --collection-id admin_activity_logs --queries 'orderDesc("$createdAt")' --queries 'limit(1)'
```

Expected: the newest document has `action: "checkin.scan_valid"`, `entityType: "ticket"`, `entityId` matching the ticket's `$id`, and `userId` matching the logged-in admin/operator.

- [ ] **Step 9: Commit**

```bash
git add functions/validate-ticket/src/main.js
git commit -m "$(cat <<'EOF'
feat(check-in): log every scan outcome, not just duplicates

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: Frontend — shared snapshot parser + missing env constant

**Files:**
- Create: `src/lib/tickets.js`
- Modify: `src/config/env.js`

**Interfaces:**
- Produces (used by Tasks 3 and 4): `parseTicketSnapshot(ticket)` → parsed object or `null`.
- Produces (used by Task 5): `env.collectionTicketRedemptions`.

- [ ] **Step 1: Create the snapshot parser**

Create `src/lib/tickets.js`:

```js
/**
 * Safely parses a ticket's `ticketSnapshot` field, which Appwrite stores as a
 * JSON string (not a native object) — accessing properties on it directly
 * without parsing always yields `undefined`.
 *
 * @param {object} ticket - A tickets collection document.
 * @returns {object|null} Parsed snapshot, or null if missing/unparseable.
 */
export function parseTicketSnapshot(ticket) {
  if (!ticket?.ticketSnapshot) return null;
  if (typeof ticket.ticketSnapshot !== "string") return ticket.ticketSnapshot;
  try {
    return JSON.parse(ticket.ticketSnapshot);
  } catch {
    return null;
  }
}
```

- [ ] **Step 2: Add the missing collection constant**

In `src/config/env.js`, find:

```js
  collectionTickets:
    import.meta.env.VITE_APPWRITE_COLLECTION_TICKETS || "tickets",
```

Replace with:

```js
  collectionTickets:
    import.meta.env.VITE_APPWRITE_COLLECTION_TICKETS || "tickets",
  collectionTicketRedemptions:
    import.meta.env.VITE_APPWRITE_COLLECTION_TICKET_REDEMPTIONS ||
    "ticket_redemptions",
```

- [ ] **Step 3: Verify**

```bash
npm run build
```

Expected: build succeeds with no syntax errors. Then run `git status` and revert any regenerated diff under `public/docs/` (unrelated `prebuild` side effect).

- [ ] **Step 4: Commit**

```bash
git add src/lib/tickets.js src/config/env.js
git commit -m "$(cat <<'EOF'
feat(tickets): add shared snapshot parser and ticket_redemptions env constant

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: Frontend — fix TicketDetailPage field bugs + snapshot fallback

**Files:**
- Modify: `src/pages/admin/TicketDetailPage.jsx`

- [ ] **Step 1: Import the new helpers**

In `src/pages/admin/TicketDetailPage.jsx`, find:

```jsx
import { useTicketDetail, invalidateTicket } from "@/hooks/useAdminTickets";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
```

Replace with:

```jsx
import { useTicketDetail, invalidateTicket } from "@/hooks/useAdminTickets";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage, localizedField } from "@/hooks/useLanguage";
import { parseTicketSnapshot } from "@/lib/tickets";
```

- [ ] **Step 2: Read `language` from the language hook and use the shared parser**

Find:

```jsx
  const { user } = useAuth();
  const { t } = useLanguage();
  const { ticket, experience, slot, order, loading, error } =
    useTicketDetail(ticketId);
```

Replace with:

```jsx
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const { ticket, experience, slot, order, loading, error } =
    useTicketDetail(ticketId);
```

Find:

```jsx
  const snapshot = ticket.ticketSnapshot
    ? typeof ticket.ticketSnapshot === "string"
      ? JSON.parse(ticket.ticketSnapshot)
      : ticket.ticketSnapshot
    : null;
```

Replace with:

```jsx
  const snapshot = parseTicketSnapshot(ticket);
```

- [ ] **Step 3: Fix the experience name/type and add the snapshot fallback**

Find:

```jsx
          {/* Related experience */}
          {experience && (
            <Card className="p-5">
              <h2 className="text-base font-semibold text-charcoal mb-3">
                {t("admin.ticketDetail.experience")}
              </h2>
              <DetailRow label={t("admin.ticketDetail.name")}>
                {experience.titleEn || experience.titleEs || "—"}
              </DetailRow>
              <DetailRow label={t("admin.ticketDetail.type")}>
                {experience.type || "—"}
              </DetailRow>
            </Card>
          )}
```

Replace with:

```jsx
          {/* Related experience */}
          {(experience || snapshot?.experienceName) && (
            <Card className="p-5">
              <h2 className="text-base font-semibold text-charcoal mb-3">
                {t("admin.ticketDetail.experience")}
              </h2>
              <DetailRow label={t("admin.ticketDetail.name")}>
                {experience
                  ? localizedField(experience, "name", language) || "—"
                  : snapshot?.experienceName || "—"}
              </DetailRow>
              <DetailRow label={t("admin.ticketDetail.type")}>
                {experience?.type || "—"}
              </DetailRow>
            </Card>
          )}
```

- [ ] **Step 4: Fix the slot date and add the snapshot fallback**

Find:

```jsx
          {/* Related slot */}
          {slot && (
            <Card className="p-5">
              <h2 className="text-base font-semibold text-charcoal mb-3">
                {t("admin.ticketDetail.slot")}
              </h2>
              <DetailRow label={t("admin.ticketDetail.date")}>
                {formatDate(slot.startDate)}
              </DetailRow>
              <DetailRow label={t("admin.ticketDetail.status")}>
                {slot.status || "—"}
              </DetailRow>
              <DetailRow label={t("admin.ticketDetail.capacity")}>
                {slot.capacity ?? "—"}
              </DetailRow>
            </Card>
          )}
```

Replace with:

```jsx
          {/* Related slot */}
          {(slot || snapshot?.slotStartDatetime) && (
            <Card className="p-5">
              <h2 className="text-base font-semibold text-charcoal mb-3">
                {t("admin.ticketDetail.slot")}
              </h2>
              <DetailRow label={t("admin.ticketDetail.date")}>
                {formatDate(
                  slot ? slot.startDatetime : snapshot?.slotStartDatetime,
                )}
              </DetailRow>
              <DetailRow label={t("admin.ticketDetail.status")}>
                {slot?.status || "—"}
              </DetailRow>
              <DetailRow label={t("admin.ticketDetail.capacity")}>
                {slot?.capacity ?? "—"}
              </DetailRow>
            </Card>
          )}
```

- [ ] **Step 5: Verify in the browser**

Run `npm run dev`, log in as admin, open the ticket from the bug report (or any `used`/`valid` ticket with a real experience+slot). Confirm "Experiencia › Nombre" and "Sesión › Fecha" now show real values instead of "—". Switch the language toggle between ES/EN and confirm the experience name follows `nameEs`/`name` correctly.

- [ ] **Step 6: Commit**

```bash
git add src/pages/admin/TicketDetailPage.jsx
git commit -m "$(cat <<'EOF'
fix(ticket-detail): correct experience/slot field names, add snapshot fallback

experience.titleEn/titleEs never existed (real fields are name/nameEs);
slot.startDate never existed (real field is startDatetime). Both silently
rendered as "—". Also fall back to ticketSnapshot when the live experience
or slot document is missing.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: Frontend — fix the same bug class in list/card/filter views

**Files:**
- Modify: `src/pages/admin/TicketListPage.jsx`
- Modify: `src/components/admin/tickets/TicketTable.jsx`
- Modify: `src/components/admin/tickets/TicketCard.jsx`

- [ ] **Step 1: Fix the experience filter dropdown**

In `src/pages/admin/TicketListPage.jsx`, find:

```jsx
import { useAdminTickets } from "@/hooks/useAdminTickets";
import { useExperiences } from "@/hooks/useExperiences";
import { useLanguage } from "@/hooks/useLanguage";
```

Replace with:

```jsx
import { useAdminTickets } from "@/hooks/useAdminTickets";
import { useExperiences } from "@/hooks/useExperiences";
import { useLanguage, localizedField } from "@/hooks/useLanguage";
```

Find:

```jsx
  const { t } = useLanguage();
```

Replace with:

```jsx
  const { t, language } = useLanguage();
```

Find:

```jsx
  const EXPERIENCE_OPTIONS = [
    { value: "", label: t("admin.tickets.allExperiences") },
    ...experiences.map((exp) => ({
      value: exp.$id,
      label: exp.titleEn || exp.titleEs || exp.$id,
    })),
  ];
```

Replace with:

```jsx
  const EXPERIENCE_OPTIONS = [
    { value: "", label: t("admin.tickets.allExperiences") },
    ...experiences.map((exp) => ({
      value: exp.$id,
      label: localizedField(exp, "name", language) || exp.$id,
    })),
  ];
```

- [ ] **Step 2: Fix `TicketTable.jsx`**

In `src/components/admin/tickets/TicketTable.jsx`, find:

```jsx
import { Link, useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import TicketStatusBadge from "./TicketStatusBadge";
```

Replace with:

```jsx
import { Link, useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import TicketStatusBadge from "./TicketStatusBadge";
import { parseTicketSnapshot } from "@/lib/tickets";
```

Find:

```jsx
                <td className="px-4 py-3 hidden md:table-cell">
                  <p className="text-charcoal truncate max-w-50">
                    {ticket.ticketSnapshot?.experienceName || ticket.experienceId || "—"}
                  </p>
                </td>
```

Replace with:

```jsx
                <td className="px-4 py-3 hidden md:table-cell">
                  <p className="text-charcoal truncate max-w-50">
                    {parseTicketSnapshot(ticket)?.experienceName ||
                      ticket.experienceId ||
                      "—"}
                  </p>
                </td>
```

- [ ] **Step 3: Fix `TicketCard.jsx`**

In `src/components/admin/tickets/TicketCard.jsx`, find:

```jsx
import Card from "../../common/Card";
import TicketStatusBadge from "./TicketStatusBadge";
import { Link } from "react-router-dom";
```

Replace with:

```jsx
import Card from "../../common/Card";
import TicketStatusBadge from "./TicketStatusBadge";
import { Link } from "react-router-dom";
import { parseTicketSnapshot } from "@/lib/tickets";
```

Find:

```jsx
        <p className="text-xs text-charcoal-subtle truncate max-w-[60%]">
          {ticket.ticketSnapshot?.experienceName || ticket.experienceId || "—"}
        </p>
```

Replace with:

```jsx
        <p className="text-xs text-charcoal-subtle truncate max-w-[60%]">
          {parseTicketSnapshot(ticket)?.experienceName ||
            ticket.experienceId ||
            "—"}
        </p>
```

- [ ] **Step 4: Verify in the browser**

Run `npm run dev`, go to `/admin/tickets`. Confirm the desktop table's "Experience" column and the mobile card view now show the experience name instead of a raw id or "—". Confirm the experience filter dropdown lists real experience names.

- [ ] **Step 5: Commit**

```bash
git add src/pages/admin/TicketListPage.jsx src/components/admin/tickets/TicketTable.jsx src/components/admin/tickets/TicketCard.jsx
git commit -m "$(cat <<'EOF'
fix(tickets): parse ticketSnapshot JSON before reading it in list/card/filter views

ticketSnapshot is stored as a JSON string; property access on it without
parsing always returned undefined, silently falling back to raw ids or "—".

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: Frontend — `useTicketActivity` hook

**Files:**
- Create: `src/hooks/useTicketActivity.js`

**Interfaces:**
- Produces (used by Task 6): `useTicketActivity(ticketId)` → `{ redemption: object|null, activity: object[], actors: Record<string, object>, loading: boolean, error: string|null }`.
- `redemption` is the `ticket_redemptions` document for this ticket, or `null`.
- `activity` is up to 20 `admin_activity_logs` documents for this ticket, newest first.
- `actors` maps Appwrite user id → `user_profiles` document, for every distinct actor referenced by `redemption`/`activity`.

- [ ] **Step 1: Create the hook**

Create `src/hooks/useTicketActivity.js`:

```js
import { useState, useEffect } from "react";
import { databases, Query } from "@/lib/appwrite";
import env from "@/config/env";
import { useLanguage } from "@/hooks/useLanguage";
import { getErrorMessage } from "@/lib/errors";

const DB = env.appwriteDatabaseId;
const COL_REDEMPTIONS = env.collectionTicketRedemptions;
const COL_ACTIVITY = env.collectionAdminActivityLogs;
const COL_PROFILES = env.collectionUserProfiles;

const ACTIVITY_LIMIT = 20;

/**
 * Loads a ticket's redemption record (who confirmed it, when, how) and its
 * full scan/action history from admin_activity_logs, plus the display names
 * of everyone involved. Read access to both collections is admin/root only —
 * callers must not mount this for non-admin viewers.
 */
export function useTicketActivity(ticketId) {
  const { t } = useLanguage();
  const [redemption, setRedemption] = useState(null);
  const [activity, setActivity] = useState([]);
  const [actors, setActors] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!ticketId) return;
    let cancelled = false;

    setLoading(true);
    setError(null);

    async function load() {
      try {
        const [redemptionRes, activityRes] = await Promise.all([
          databases.listDocuments(DB, COL_REDEMPTIONS, [
            Query.equal("ticketId", ticketId),
            Query.limit(1),
          ]),
          databases.listDocuments(DB, COL_ACTIVITY, [
            Query.equal("entityType", ["ticket", "tickets"]),
            Query.equal("entityId", ticketId),
            Query.orderDesc("$createdAt"),
            Query.limit(ACTIVITY_LIMIT),
          ]),
        ]);

        if (cancelled) return;

        const redemptionDoc = redemptionRes.documents[0] || null;
        const activityDocs = activityRes.documents;

        const userIds = [
          ...new Set(
            [redemptionDoc?.redeemedBy, ...activityDocs.map((d) => d.userId)].filter(
              Boolean,
            ),
          ),
        ];

        let profileMap = {};
        if (userIds.length > 0) {
          const profilesRes = await databases.listDocuments(DB, COL_PROFILES, [
            Query.equal("$id", userIds),
            Query.limit(userIds.length),
          ]);
          profileMap = Object.fromEntries(
            profilesRes.documents.map((p) => [p.$id, p]),
          );
        }

        if (cancelled) return;
        setRedemption(redemptionDoc);
        setActivity(activityDocs);
        setActors(profileMap);
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err, t));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [ticketId, t]);

  return { redemption, activity, actors, loading, error };
}
```

- [ ] **Step 2: Verify**

```bash
npm run build
```

Expected: build succeeds. Revert any `public/docs/` diff per the Global Constraints.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useTicketActivity.js
git commit -m "$(cat <<'EOF'
feat(tickets): add useTicketActivity hook for redemption + scan history

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 6: Frontend — `TicketActivityCard` + wire into `TicketDetailPage` + i18n

**Files:**
- Create: `src/components/admin/tickets/TicketActivityCard.jsx`
- Modify: `src/pages/admin/TicketDetailPage.jsx`
- Modify: `src/i18n/en/admin.json`
- Modify: `src/i18n/es/admin.json`

- [ ] **Step 1: Add i18n keys (English)**

In `src/i18n/en/admin.json`, find:

```json
    "ticketDetail": {
      "ticketInfo": "Ticket information",
      "code": "Code",
      "status": "Status",
      "participant": "Participant",
      "usedAt": "Used at",
      "qrCode": "QR Code",
      "experience": "Experience",
      "name": "Name",
      "type": "Type",
      "slot": "Slot",
      "date": "Date",
      "capacity": "Capacity",
      "order": "Order",
      "orderNumber": "Order #",
      "orderStatus": "Order status",
      "snapshot": "Snapshot",
      "actions": "Actions",
      "invalidate": "Invalidate ticket",
      "invalidateConfirm": "Are you sure you want to invalidate this ticket? This action cannot be undone.",
      "notFound": "Ticket not found",
      "created": "Created"
    },
```

Replace with:

```json
    "ticketDetail": {
      "ticketInfo": "Ticket information",
      "code": "Code",
      "status": "Status",
      "participant": "Participant",
      "usedAt": "Used at",
      "qrCode": "QR Code",
      "experience": "Experience",
      "name": "Name",
      "type": "Type",
      "slot": "Slot",
      "date": "Date",
      "capacity": "Capacity",
      "order": "Order",
      "orderNumber": "Order #",
      "orderStatus": "Order status",
      "snapshot": "Snapshot",
      "actions": "Actions",
      "invalidate": "Invalidate ticket",
      "invalidateConfirm": "Are you sure you want to invalidate this ticket? This action cannot be undone.",
      "notFound": "Ticket not found",
      "created": "Created",
      "activity": "Ticket activity",
      "confirmedBy": "Confirmed by",
      "noRedemption": "Not confirmed yet.",
      "redeemedAt": "Confirmed at",
      "method": "Method",
      "notes": "Notes",
      "scanHistory": "Scan history",
      "noActivity": "No activity recorded yet.",
      "methodQrScan": "QR scan",
      "methodManual": "Manual",
      "methodKiosk": "Kiosk",
      "methodSystem": "System",
      "actionScanValid": "Scanned — valid",
      "actionScanCancelled": "Scan attempt — ticket cancelled",
      "actionScanExpired": "Scan attempt — ticket expired",
      "actionScanDuplicate": "Scan attempt — already used",
      "actionConfirmed": "Entry confirmed",
      "actionInvalidate": "Ticket invalidated"
    },
```

- [ ] **Step 2: Add i18n keys (Spanish)**

In `src/i18n/es/admin.json`, find:

```json
    "ticketDetail": {
      "ticketInfo": "Información del ticket",
      "code": "Código",
      "status": "Estado",
      "participant": "Participante",
      "usedAt": "Usado el",
      "qrCode": "Código QR",
      "experience": "Experiencia",
      "name": "Nombre",
      "type": "Tipo",
      "slot": "Sesión",
      "date": "Fecha",
      "capacity": "Capacidad",
      "order": "Orden",
      "orderNumber": "Orden #",
      "orderStatus": "Estado de orden",
      "snapshot": "Snapshot",
      "actions": "Acciones",
      "invalidate": "Invalidar ticket",
      "invalidateConfirm": "¿Estás seguro de invalidar este ticket? Esta acción no se puede deshacer.",
      "notFound": "Ticket no encontrado",
      "created": "Creado"
    },
```

Replace with:

```json
    "ticketDetail": {
      "ticketInfo": "Información del ticket",
      "code": "Código",
      "status": "Estado",
      "participant": "Participante",
      "usedAt": "Usado el",
      "qrCode": "Código QR",
      "experience": "Experiencia",
      "name": "Nombre",
      "type": "Tipo",
      "slot": "Sesión",
      "date": "Fecha",
      "capacity": "Capacidad",
      "order": "Orden",
      "orderNumber": "Orden #",
      "orderStatus": "Estado de orden",
      "snapshot": "Snapshot",
      "actions": "Acciones",
      "invalidate": "Invalidar ticket",
      "invalidateConfirm": "¿Estás seguro de invalidar este ticket? Esta acción no se puede deshacer.",
      "notFound": "Ticket no encontrado",
      "created": "Creado",
      "activity": "Actividad del ticket",
      "confirmedBy": "Confirmado por",
      "noRedemption": "Aún no confirmado.",
      "redeemedAt": "Confirmado el",
      "method": "Método",
      "notes": "Notas",
      "scanHistory": "Historial de escaneos",
      "noActivity": "Aún no hay actividad registrada.",
      "methodQrScan": "Escaneo QR",
      "methodManual": "Manual",
      "methodKiosk": "Kiosco",
      "methodSystem": "Sistema",
      "actionScanValid": "Escaneado — válido",
      "actionScanCancelled": "Intento de escaneo — ticket cancelado",
      "actionScanExpired": "Intento de escaneo — ticket expirado",
      "actionScanDuplicate": "Intento de escaneo — ya usado",
      "actionConfirmed": "Entrada confirmada",
      "actionInvalidate": "Ticket invalidado"
    },
```

- [ ] **Step 3: Create the activity card component**

Create `src/components/admin/tickets/TicketActivityCard.jsx`:

```jsx
import { Card } from "@/components/common/Card";
import { useLanguage } from "@/hooks/useLanguage";
import { useTicketActivity } from "@/hooks/useTicketActivity";
import { displayRoleName } from "@/constants/roles";
import { UserCheck, History } from "lucide-react";

const ACTION_LABEL_KEYS = {
  "checkin.scan_valid": "actionScanValid",
  "checkin.scan_cancelled": "actionScanCancelled",
  "checkin.scan_expired": "actionScanExpired",
  "checkin.duplicate_scan_attempt": "actionScanDuplicate",
  "checkin.confirmed": "actionConfirmed",
  "ticket.invalidate": "actionInvalidate",
};

const METHOD_LABEL_KEYS = {
  qr_scan: "methodQrScan",
  manual: "methodManual",
  kiosk: "methodKiosk",
  system: "methodSystem",
};

function formatDateTime(iso, language) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(language === "es" ? "es-MX" : "en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function actorDisplayName(profile, fallbackId) {
  if (!profile) return fallbackId;
  const full = [profile.firstName, profile.lastName].filter(Boolean).join(" ");
  return full || profile.email || fallbackId;
}

export default function TicketActivityCard({ ticketId }) {
  const { t, language } = useLanguage();
  const { redemption, activity, actors, loading } = useTicketActivity(ticketId);

  if (loading) {
    return (
      <Card className="p-5 space-y-3 animate-pulse">
        <div className="h-4 w-32 rounded bg-warm-gray" />
        <div className="h-4 w-full rounded bg-warm-gray" />
        <div className="h-4 w-full rounded bg-warm-gray" />
      </Card>
    );
  }

  // Best-effort role lookup: the matching checkin.confirmed activity entry
  // (if present) carries an actorRoleSnapshot; the redemption record itself
  // does not store a role.
  const confirmEntry = redemption
    ? activity.find(
        (e) => e.action === "checkin.confirmed" && e.userId === redemption.redeemedBy,
      )
    : null;

  return (
    <Card className="p-5 space-y-5">
      <div>
        <h2 className="text-base font-semibold text-charcoal mb-3 flex items-center gap-2">
          <UserCheck className="h-4 w-4 text-charcoal-muted" />
          {t("admin.ticketDetail.confirmedBy")}
        </h2>
        {redemption ? (
          <div className="space-y-1 text-sm">
            <p className="font-medium text-charcoal">
              {actorDisplayName(actors[redemption.redeemedBy], redemption.redeemedBy)}
              {confirmEntry?.actorRoleSnapshot && (
                <span className="ml-2 text-xs font-normal text-charcoal-muted">
                  {displayRoleName(confirmEntry.actorRoleSnapshot)}
                </span>
              )}
            </p>
            <p className="text-charcoal-muted">
              {formatDateTime(redemption.redeemedAt, language)}
            </p>
            <p className="text-charcoal-muted">
              {t("admin.ticketDetail.method")}:{" "}
              {t(`admin.ticketDetail.${METHOD_LABEL_KEYS[redemption.method] || "methodManual"}`)}
            </p>
            {redemption.notes && (
              <p className="text-xs text-charcoal-subtle mt-1">{redemption.notes}</p>
            )}
          </div>
        ) : (
          <p className="text-sm text-charcoal-subtle">
            {t("admin.ticketDetail.noRedemption")}
          </p>
        )}
      </div>

      <div>
        <h2 className="text-base font-semibold text-charcoal mb-3 flex items-center gap-2">
          <History className="h-4 w-4 text-charcoal-muted" />
          {t("admin.ticketDetail.scanHistory")}
        </h2>
        {activity.length === 0 ? (
          <p className="text-sm text-charcoal-subtle">
            {t("admin.ticketDetail.noActivity")}
          </p>
        ) : (
          <ul className="space-y-3">
            {activity.map((entry) => {
              const labelKey = ACTION_LABEL_KEYS[entry.action];
              return (
                <li
                  key={entry.$id}
                  className="text-sm border-b border-sand-dark/30 last:border-0 pb-2 last:pb-0"
                >
                  <p className="text-charcoal">
                    {labelKey ? t(`admin.ticketDetail.${labelKey}`) : entry.action}
                  </p>
                  <p className="text-xs text-charcoal-muted">
                    {formatDateTime(entry.$createdAt, language)}
                    {" · "}
                    {actorDisplayName(actors[entry.userId], entry.userId)}
                    {entry.actorRoleSnapshot &&
                      ` (${displayRoleName(entry.actorRoleSnapshot)})`}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Card>
  );
}
```

- [ ] **Step 4: Mount the card in `TicketDetailPage.jsx`, admin-gated**

In `src/pages/admin/TicketDetailPage.jsx`, find:

```jsx
import TicketStatusBadge from "@/components/admin/tickets/TicketStatusBadge";
import SnapshotViewer from "@/components/admin/orders/SnapshotViewer";
```

Replace with:

```jsx
import TicketStatusBadge from "@/components/admin/tickets/TicketStatusBadge";
import TicketActivityCard from "@/components/admin/tickets/TicketActivityCard";
import SnapshotViewer from "@/components/admin/orders/SnapshotViewer";
```

Find:

```jsx
          {/* Admin actions */}
          {isAdmin && ticket.status === "valid" && (
            <Card className="p-5">
              <h2 className="text-base font-semibold text-charcoal mb-3">
                {t("admin.ticketDetail.actions")}
              </h2>
              <Button
                variant="danger"
                size="sm"
                onClick={handleInvalidate}
                disabled={invalidating}
                className="w-full"
              >
                <Ban className="h-4 w-4 mr-1.5" />
                {invalidating
                  ? t("admin.common.loading")
                  : t("admin.ticketDetail.invalidate")}
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
```

Replace with:

```jsx
          {/* Admin actions */}
          {isAdmin && ticket.status === "valid" && (
            <Card className="p-5">
              <h2 className="text-base font-semibold text-charcoal mb-3">
                {t("admin.ticketDetail.actions")}
              </h2>
              <Button
                variant="danger"
                size="sm"
                onClick={handleInvalidate}
                disabled={invalidating}
                className="w-full"
              >
                <Ban className="h-4 w-4 mr-1.5" />
                {invalidating
                  ? t("admin.common.loading")
                  : t("admin.ticketDetail.invalidate")}
              </Button>
            </Card>
          )}

          {/* Ticket activity (who confirmed it, scan history) */}
          {isAdmin && <TicketActivityCard ticketId={ticket.$id} />}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Verify in the browser**

Run `npm run dev`, log in as admin. Open a ticket that was confirmed via Task 1's test scan+confirm flow — confirm the "Confirmado por"/"Confirmed by" section shows the agent's name, timestamp, and method, and the "Historial de escaneos"/"Scan history" list shows the scan attempts in order with correct actor names. Switch language and confirm all labels translate. Then log in as an operator (non-admin) and confirm the Activity card does not render and no console error/403 appears.

Then run `npm run build` and revert any `public/docs/` diff.

- [ ] **Step 6: Commit**

```bash
git add src/components/admin/tickets/TicketActivityCard.jsx src/pages/admin/TicketDetailPage.jsx src/i18n/en/admin.json src/i18n/es/admin.json
git commit -m "$(cat <<'EOF'
feat(ticket-detail): show who confirmed the ticket and its full scan history

Admin-only section surfacing the previously-unread ticket_redemptions record
and the admin_activity_logs scan trail (valid/cancelled/expired/duplicate
scans plus the confirming agent), bilingual via the existing i18n system.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 7: Full manual end-to-end verification

**Files:** none (verification only).

- [ ] **Step 1: Verify the original bug report is fixed**

Open the exact ticket from the bug report (or any ticket with a real linked experience + slot). Confirm "Experiencia › Nombre" and "Sesión › Fecha" show real data, not "—".

- [ ] **Step 2: Verify the snapshot fallback**

Find or create a ticket whose `experienceId`/`slotId` don't resolve to a live document (e.g. an old ticket, or temporarily note one with a deleted experience). Confirm the Experience/Slot cards still render using the snapshot values instead of disappearing or showing "—" everywhere.

- [ ] **Step 3: Verify a complete check-in cycle end-to-end**

Using two different admin/operator accounts if available (otherwise the same account twice is acceptable): scan a valid ticket (Actor A) without confirming, then scan the same ticket again as a duplicate attempt (Actor B, or the same actor), then confirm entry (Actor A or B). Reload the ticket detail page and confirm:
- "Confirmed by" shows the correct confirming actor, method, and timestamp.
- "Scan history" lists all three events in reverse-chronological order with correct actor names and translated labels.

- [ ] **Step 4: Verify list/card views**

On `/admin/tickets`, confirm the table's "Experience" column, the mobile card view, and the experience filter dropdown all show real experience names now.

- [ ] **Step 5: Verify bilingual rendering**

Toggle the language switcher on the ticket detail page and the ticket list page. Confirm every fixed/new string (experience name via `nameEs`, activity section labels, action labels, method labels) renders correctly in both ES and EN with no raw i18n keys showing through.

- [ ] **Step 6: Verify non-admin access**

Log in as an operator. Confirm the ticket detail page loads normally (experience/slot/order info intact) but the "Ticket activity" card does not render, and the browser console shows no 403/permission errors (the card must not mount its queries for non-admins).

- [ ] **Step 7: Report results to the user**

Summarize which scenarios passed, explicitly calling out the fix for the original screenshot's bug (experience name + session date now populated) and the new activity history, before considering this plan complete.
