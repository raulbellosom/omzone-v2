# Admin User Management (root-only)

**Date:** 2026-07-05
**Status:** Approved

## Context

The route `ADMIN_USERS: "/admin/users"` ([routes.js](../../../src/constants/routes.js)) and the sidebar/menu link ("Gestión de usuarios") already exist, but no page was ever built behind them — [App.jsx](../../../src/App.jsx) has no `path="users"` route under `/admin`. [Breadcrumbs.jsx](../../../src/components/admin/layout/Breadcrumbs.jsx) already maps the `users` path segment to `admin.breadcrumbs.users` (defined in both `en/admin.json` and `es/admin.json`) — that piece needs no changes. There is, however, no `admin.sidebar.users` key yet; that must be added for the new sidebar nav item.

The project already has a full labels/roles model:
- [constants/roles.js](../../../src/constants/roles.js) — `ROLES.ROOT/ADMIN/OPERATOR/CLIENT`, `isGhostUser`/`excludeGhostUsers` (root is meant to be invisible), `canHardDelete`, etc.
- [routes/guards.jsx](../../../src/routes/guards.jsx) — `RequireLabel`, `ProtectedRoute`, and a dedicated `RequireRoot` guard already used elsewhere (internal docs).
- [AdminSidebar.jsx](../../../src/components/admin/layout/AdminSidebar.jsx) — nav items already support a `rootOnly` flag (used today for `admin.sidebar.audit`).
- [.github/agents/roles-permissions.agent.md](../../../.github/agents/roles-permissions.agent.md) — documents the permission matrix and explicitly states "Root NUNCA aparece en listados de usuarios" and, in the access matrix, that root must never appear in user listings under any viewer (not even root itself).
- [functions/assign-user-label/src/main.js](../../../functions/assign-user-label/src/main.js) — an existing Appwrite Function already handles: (a) auto-assigning `client` on signup, (b) `ensure-profile` self-service profile creation, and (c) `handleManualAssignment`, an HTTP endpoint that lets a caller with label `admin` **or** `root` assign `admin | operator | client` to a target user (never `root`). The 3 existing frontend call sites (`AuthContext.jsx` x2, `useUserProfile.js`) only use the `ensure-profile` flow — none use manual assignment today.
- [hooks/useAdminClients.js](../../../src/hooks/useAdminClients.js) + [ClientDetailPage.jsx](../../../src/pages/admin/ClientDetailPage.jsx) — an existing, separate "Clientes" admin section that lists `user_profiles` documents (not Appwrite Auth users, and that collection has no label/role attribute). This is unrelated to the new page and is not touched by this work.

What's missing: the actual page, a way to list real Appwrite Auth users (requires the server SDK / API key — not available client-side, so it must go through a Function), and the decision — confirmed by the user — that this whole feature is **root-only**, both in the UI and enforced server-side.

## Decision

Build a root-only "Gestión de usuarios" page at `/admin/users` that lists all Appwrite Auth users except those labeled `root`, and lets root assign or remove the `admin`, `operator`, and `client` labels on any listed user.

### 1. Backend — extend `functions/assign-user-label`

**New action `"list-users"`** (HTTP POST `{ action: "list-users", search?: string, cursor?: string }`):
- 401 `ERR_AUTH_REQUIRED` if no `x-appwrite-user-id` header.
- 403 `ERR_UNAUTHORIZED` unless caller's labels include `root` (root-only, no `admin` fallback — this differs from `handleManualAssignment`'s current behavior on purpose, see below).
- Calls `users.list(queries, search)` with `Query.limit(50)` (+ `Query.cursorAfter(cursor)` if provided) and `search` (capped at 256 chars) passed as the SDK's free-text search parameter.
- **Unconditionally filters out any user whose `labels` includes `root`** from the result — no exception for the root caller. This matches the documented policy ("Ver root en listados: ❌" for every viewer) and is intentionally stricter than `excludeGhostUsers()` in `roles.js` (which has a root-sees-everything exception) — that helper is not reused here.
- Returns `{ ok: true, data: { users: [{ $id, name, email, phone, labels, status, registration }], hasMore, nextCursor } }` (only the fields the UI needs — never the full Appwrite user object). `hasMore`/`nextCursor` are deliberately derived from the raw fetched page *before* root-filtering (a page can legitimately contain fewer visible users than the limit while `hasMore` is still `true`) — basing them on the filtered result would break keyset pagination. No `total` count is returned: filtering root server-side makes an offset/total count misleading, so pagination is cursor-based only.

**`handleManualAssignment` authorization is tightened**: the existing check
```js
if (!callerLabels.includes("admin") && !callerLabels.includes("root")) { ... 403 ... }
```
becomes root-only:
```js
if (!callerLabels.includes("root")) { ... 403 ... }
```
Rationale: since the UI for granting/revoking `admin` is now root-exclusive, the backend must enforce the same boundary — otherwise an `admin` user could call the Function directly (curl/Postman) to self-escalate or grant `admin` to others, even with no UI path to do so. Verified no existing frontend caller relies on `admin` being allowed here.

**New `remove` flag on the existing manual-assignment body**: `{ targetUserId, label, remove: true }` removes `label` from the target's labels array instead of adding it (still root-only, still rejects `label === "root"`). If removing would leave the target with zero labels, reject with 400 `ERR_LABEL_LAST_ROLE` — every user must keep at least one role label.

The JSDoc header of `assign-user-label/src/main.js` is updated to reflect the new action, the tightened authorization, and the `remove` flag.

### 2. Frontend routing & guard

In [App.jsx](../../../src/App.jsx), inside the `/admin` route block, add a `users` route gated the same way `audit` already is (nested `RequireLabel` inside the outer admin `ProtectedRoute`):

```jsx
<Route element={<RequireLabel labels={[ROLES.ROOT]} />}>
  <Route path="users" element={<UserListPage />} />
</Route>
```

- **`AdminSidebar.jsx`**: add a `users` nav item (icon: `ShieldCheck` from `lucide-react`, distinct from the `Users` icon already used for `clients`) in the `system` section, with `rootOnly: true` — same mechanism already used for `admin.sidebar.audit`. Requires adding the new `admin.sidebar.users` i18n key (the existing `admin.breadcrumbs.users` key is unrelated and already wired).
- **`UserMenuDropdown.jsx`**: the existing "Gestión de usuarios" `DropdownMenuItem` (line ~147) currently renders whenever `isAdmin` is true (which includes root). Change its guard to `isRoot` only, matching the new access rule.

### 3. Data layer — `useAdminUsers` hook

New `src/hooks/useAdminUsers.js`, parallel in shape to `useAdminClients.js` but backed by the Function instead of a database collection:

- `useAdminUsers({ search })` — calls `functions.createExecution(env.functionAssignLabel, JSON.stringify({ action: "list-users", search }))`, parses the execution response body, exposes `{ data, loading, error, refetch }`.
- `assignLabel(userId, label)` / `removeLabel(userId, label)` — call the same Function with `{ targetUserId, label }` / `{ targetUserId, label, remove: true }`, and trigger a refetch on success.
- As defense in depth, the hook also filters out any `root`-labeled entry client-side before returning `data` (never trust a single layer).

### 4. Page — `UserListPage`

New `src/pages/admin/UserListPage.jsx` + a presentational table component, following the responsive pattern already used in [PricingTierTable.jsx](../../../src/components/admin/pricing/PricingTierTable.jsx) (desktop `<table>`, mobile stacked `Card`s):

- Search input (name/email) wired to `useAdminUsers({ search })`, debounced 300ms inside the hook (same pattern as `useDocsSearch.js`) so typing doesn't fire a Function execution per keystroke.
- Per row: name, email, current labels as `Badge`s, and label-management controls — one action per assignable label (`admin`, `operator`, `client`) toggled on/off, calling `assignLabel`/`removeLabel`. Disable the toggle that would remove a user's last remaining label (matches the backend's `ERR_LABEL_LAST_ROLE`).
- Loading skeleton and error state follow the existing convention (see `AdminAccountPage.jsx`'s loading/error blocks).
- No pagination beyond the Function's cursor param for v1 — a "Load more" button appears whenever `hasMore` is true and appends the next page (kept simple; OMZONE's user base doesn't need virtualized/infinite scroll yet).

### 5. i18n

New keys under `admin.userList.*` in both `en/admin.json` and `es/admin.json`: page heading/subtitle, table headers (name, email, labels, actions), label-action tooltips/confirm text, search placeholder, empty state, loading/error strings — following the naming style of `admin.pricingTierTable.*`.

## Out of Scope

- Editing a user's profile fields (name, email, phone) from this page — that's `AdminAccountPage.jsx` (self-service) and the separate "Clientes" section, unrelated data source.
- Creating new users or deleting/disabling Auth accounts.
- Any change to `excludeGhostUsers()`/`isGhostUser()` in `roles.js` — those stay as-is for their existing callers (the Clientes list); this feature does not reuse them.
- Assigning or revoking the `root` label itself — remains console/script-only, per existing `assign-user-label` behavior.
- Pagination UI beyond a simple "Load more" — no page-number/virtualized grid.
