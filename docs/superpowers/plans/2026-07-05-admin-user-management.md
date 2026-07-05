# Admin User Management (root-only) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a root-only `/admin/users` page that lists all Appwrite Auth users (never `root`-labeled ones) and lets root assign or remove the `admin`, `operator`, and `client` labels.

**Architecture:** Extend the existing `functions/assign-user-label` Appwrite Function with a root-only `list-users` action and a `remove` flag on its existing label-assignment action; add a React Query-free polling hook (`useAdminUsers`) that calls the Function; build a list page following the exact pattern already used by `ClientListPage`/`ClientTable`/`ClientCard`; gate the route/sidebar/menu entry to `root` only.

**Tech Stack:** React 18 + Vite, react-router-dom, Appwrite Web SDK (`appwrite`) on the frontend, `node-appwrite@16` in the Function, Tailwind CSS, `lucide-react` icons.

## Global Constraints

- This repo has **no unit test runner** for React components or Appwrite Functions (only two ad-hoc `node file.test.mjs` scripts exist, unrelated to this feature — see `package.json` scripts). Every task below substitutes real, runnable verification for the "write a failing test" step: `node --check` for Function syntax, and explicit dev-server/browser steps for UI, matching how the rest of the admin panel was verified (see `docs/superpowers/specs/2026-07-04-checkin-access-design.md`).
- Root must **never** appear in the `/admin/users` listing, under any circumstance — filtered server-side in the Function and again client-side in the hook (defense in depth).
- The `root` label can never be assigned or removed through this feature — enforced in the Function (`ERR_LABEL_INVALID` if `label === "root"`).
- A target user must always keep at least one label — removing the last one is rejected with `ERR_LABEL_LAST_ROLE`.
- `handleManualAssignment` authorization changes from "`admin` or `root`" to "`root` only" — verified no existing frontend caller depends on `admin` being accepted (only `ensure-profile` calls exist today, in `AuthContext.jsx` and `useUserProfile.js`).
- Follow existing code style exactly: no comments beyond what's already in each file's style, Spanish UI copy (this admin panel is Spanish-first; `en/admin.json` mirrors in English), Tailwind classes matching sibling components (`ClientTable.jsx`, `PricingTierTable.jsx`).

---

### Task 1: Backend — `assign-user-label` Function changes

**Files:**
- Modify: `functions/assign-user-label/src/main.js`

**Interfaces:**
- Produces: HTTP action `{ action: "list-users", search?: string, cursor?: string }` → `{ ok: true, data: { users: Array<{ $id, name, email, phone, labels, status, registration }>, hasMore: boolean, nextCursor: string|null } }` (root-only caller).
- Produces: HTTP body `{ targetUserId: string, label: "admin"|"operator"|"client", remove?: boolean }` → `{ ok: true, data: { userId, labels } }` (root-only caller now, was admin-or-root).
- Consumes: nothing from other tasks — this is the first task.

- [ ] **Step 1: Add `Query` to the node-appwrite import**

In `functions/assign-user-label/src/main.js`, change line 41:

```js
import { Client, Databases, Users } from "node-appwrite";
```
to:
```js
import { Client, Databases, Users, Query } from "node-appwrite";
```

- [ ] **Step 2: Add the `handleListUsers` handler**

Insert this new function immediately after `handleEnsureProfile` (i.e. right before the `/** * Flow B — HTTP POST: Manual label assignment by admin */` comment block that starts `handleManualAssignment`):

```js
/**
 * Flow D — HTTP POST { action: "list-users" }
 * Root-only. Lists Appwrite Auth users, always excluding anyone labeled 'root'.
 */
async function handleListUsers({ req, res, log, error }) {
  const client = initClient(req);
  const users = new Users(client);

  try {
    const body =
      typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    const { search, cursor } = body;

    const callerId = req.headers["x-appwrite-user-id"];
    if (!callerId) {
      return res.json(
        {
          ok: false,
          error: {
            code: "ERR_AUTH_REQUIRED",
            message: "Authentication required",
          },
        },
        401,
      );
    }

    const caller = await users.get(callerId);
    const callerLabels = caller.labels || [];
    if (!callerLabels.includes("root")) {
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

    const limit = 50;
    const queries = [Query.limit(limit)];
    if (cursor && typeof cursor === "string" && cursor.trim()) {
      queries.push(Query.cursorAfter(cursor.trim()));
    }

    const searchTerm =
      search && typeof search === "string" && search.trim()
        ? search.trim()
        : undefined;

    const result = await users.list(queries, searchTerm);

    const nextCursor =
      result.users.length > 0
        ? result.users[result.users.length - 1].$id
        : null;
    const hasMore = result.users.length === limit;

    const visible = result.users
      .filter((u) => !(u.labels || []).includes("root"))
      .map((u) => ({
        $id: u.$id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        labels: u.labels || [],
        status: u.status,
        registration: u.registration,
      }));

    log(`list-users: returned ${visible.length} users (raw batch ${result.users.length}) to root caller ${callerId}`);

    return res.json({
      ok: true,
      data: { users: visible, hasMore, nextCursor },
    });
  } catch (err) {
    error(`List users failed: ${err.message}`);
    return res.json(
      { ok: false, error: { code: "ERR_INTERNAL", message: "Internal error" } },
      500,
    );
  }
}
```

- [ ] **Step 3: Tighten `handleManualAssignment` authorization to root-only**

Find this block inside `handleManualAssignment`:

```js
    // 6. Authorize — verify caller has admin or root label
    const caller = await users.get(callerId);
    const callerLabels = caller.labels || [];

    if (!callerLabels.includes("admin") && !callerLabels.includes("root")) {
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
```

Replace it with:

```js
    // 6. Authorize — only root may assign/remove admin, operator, or client labels
    const caller = await users.get(callerId);
    const callerLabels = caller.labels || [];

    if (!callerLabels.includes("root")) {
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
```

- [ ] **Step 4: Add `remove` support to `handleManualAssignment`**

Find:

```js
    // 2. Validate input
    const { targetUserId, label } = body;
```

Replace with:

```js
    // 2. Validate input
    const { targetUserId, label, remove } = body;
```

Then find the final block of the function:

```js
    // 8. Merge labels — preserve existing, add new
    const targetLabels = targetUser.labels || [];

    if (targetLabels.includes(label)) {
      log(`User ${targetUserId} already has label '${label}' — no change`);
      return res.json({
        ok: true,
        data: { userId: targetUserId, labels: targetLabels },
      });
    }

    const updatedLabels = [...targetLabels, label];
    await users.updateLabels(targetUserId.trim(), updatedLabels);

    log(`Label '${label}' assigned to user ${targetUserId} by ${callerId}`);

    return res.json({
      ok: true,
      data: { userId: targetUserId, labels: updatedLabels },
    });
```

Replace it with:

```js
    // 8. Merge labels — preserve existing, add or remove the requested one
    const targetLabels = targetUser.labels || [];

    if (remove === true) {
      if (!targetLabels.includes(label)) {
        log(`User ${targetUserId} does not have label '${label}' — no change`);
        return res.json({
          ok: true,
          data: { userId: targetUserId, labels: targetLabels },
        });
      }

      const remainingLabels = targetLabels.filter((l) => l !== label);
      if (remainingLabels.length === 0) {
        return res.json(
          {
            ok: false,
            error: {
              code: "ERR_LABEL_LAST_ROLE",
              message: "User must keep at least one role label",
            },
          },
          400,
        );
      }

      await users.updateLabels(targetUserId.trim(), remainingLabels);
      log(`Label '${label}' removed from user ${targetUserId} by ${callerId}`);

      return res.json({
        ok: true,
        data: { userId: targetUserId, labels: remainingLabels },
      });
    }

    if (targetLabels.includes(label)) {
      log(`User ${targetUserId} already has label '${label}' — no change`);
      return res.json({
        ok: true,
        data: { userId: targetUserId, labels: targetLabels },
      });
    }

    const updatedLabels = [...targetLabels, label];
    await users.updateLabels(targetUserId.trim(), updatedLabels);

    log(`Label '${label}' assigned to user ${targetUserId} by ${callerId}`);

    return res.json({
      ok: true,
      data: { userId: targetUserId, labels: updatedLabels },
    });
```

- [ ] **Step 5: Wire the new action into the routing at the bottom of the file**

Find:

```js
  if (body.action === "ensure-profile") {
    log("Trigger: HTTP POST (ensure-profile)");
    logConfig(log);
    return handleEnsureProfile(context);
  }

  log("Trigger: HTTP POST (manual label assignment)");
  return handleManualAssignment(context);
};
```

Replace with:

```js
  if (body.action === "ensure-profile") {
    log("Trigger: HTTP POST (ensure-profile)");
    logConfig(log);
    return handleEnsureProfile(context);
  }

  if (body.action === "list-users") {
    log("Trigger: HTTP POST (list-users)");
    return handleListUsers(context);
  }

  log("Trigger: HTTP POST (manual label assignment)");
  return handleManualAssignment(context);
};
```

- [ ] **Step 6: Update the file's JSDoc header to reflect the new behavior**

Find:

```js
/**
 * @function assign-user-label
 * @description Assigns default label 'client' to newly registered users and creates
 *   their user_profiles document. Also exposes an HTTP endpoint for admins to
 *   manually assign labels (admin, operator, client) to other users.
 * @trigger Event: users.*.create | HTTP POST (manual label assignment) | HTTP POST { action: "ensure-profile" }
 *
 * @input {Object} payload (HTTP only)
 * @input {string} payload.targetUserId - ID of the user to assign the label to
 * @input {string} payload.label - Label to assign: 'admin' | 'operator' | 'client'
 *
 * @validates
 * - Event: idempotency — skips if user_profiles document already exists for userId
 * - HTTP: Authentication — requires valid JWT (x-appwrite-user-id)
 * - HTTP: Authorization — caller must have label 'admin' or 'root'
 * - HTTP: Input — targetUserId required string, label must be one of allowed values
 * - HTTP: Business — 'root' label cannot be assigned via this Function
 *
 * @entities
 * - Reads: Appwrite Auth (users)
 * - Writes: user_profiles, Appwrite Auth labels
 *
 * @envVars
 * - APPWRITE_FUNCTION_API_ENDPOINT (built-in, auto-injected)
 * - APPWRITE_FUNCTION_PROJECT_ID (built-in, auto-injected)
 * - x-appwrite-key header (dynamic API key, auto-injected at runtime)
 * - APPWRITE_DATABASE_ID (project-level global variable)
 * - APPWRITE_COLLECTION_USER_PROFILES (project-level global variable)
 *
 * @errors
 * - 400: ERR_LABEL_MISSING_FIELDS — targetUserId or label missing
 * - 400: ERR_LABEL_INVALID — label not in allowed list or is 'root'
 * - 401: ERR_AUTH_REQUIRED — no authenticated user
 * - 403: ERR_UNAUTHORIZED — caller lacks admin/root label
 * - 404: ERR_USER_NOT_FOUND — targetUserId does not exist
 * - 500: ERR_INTERNAL — unexpected server error
 *
 * @returns {Object} { ok: true, data: { ... } } | { ok: false, error: { code, message } }
 */
```

Replace with:

```js
/**
 * @function assign-user-label
 * @description Assigns default label 'client' to newly registered users and creates
 *   their user_profiles document. Also exposes root-only HTTP endpoints to list
 *   Appwrite Auth users (excluding root) and to assign/remove labels
 *   (admin, operator, client) on other users.
 * @trigger Event: users.*.create | HTTP POST (manual label assignment) | HTTP POST { action: "ensure-profile" } | HTTP POST { action: "list-users" }
 *
 * @input {Object} payload (HTTP only)
 * @input {string} payload.targetUserId - ID of the user to assign/remove the label on
 * @input {string} payload.label - Label to assign/remove: 'admin' | 'operator' | 'client'
 * @input {boolean} [payload.remove] - If true, removes `label` instead of adding it
 * @input {string} [payload.search] - list-users only: free-text search on users
 * @input {string} [payload.cursor] - list-users only: Appwrite cursor (user $id) for pagination
 *
 * @validates
 * - Event: idempotency — skips if user_profiles document already exists for userId
 * - HTTP: Authentication — requires valid JWT (x-appwrite-user-id)
 * - HTTP: Authorization — caller must have label 'root' (list-users and manual assignment/removal)
 * - HTTP: Input — targetUserId required string, label must be one of allowed values
 * - HTTP: Business — 'root' label cannot be assigned/removed via this Function
 * - HTTP: Business — removing the target's last remaining label is rejected
 * - HTTP: Business — list-users always excludes users labeled 'root' from the response
 *
 * @entities
 * - Reads: Appwrite Auth (users)
 * - Writes: user_profiles, Appwrite Auth labels
 *
 * @envVars
 * - APPWRITE_FUNCTION_API_ENDPOINT (built-in, auto-injected)
 * - APPWRITE_FUNCTION_PROJECT_ID (built-in, auto-injected)
 * - x-appwrite-key header (dynamic API key, auto-injected at runtime)
 * - APPWRITE_DATABASE_ID (project-level global variable)
 * - APPWRITE_COLLECTION_USER_PROFILES (project-level global variable)
 *
 * @errors
 * - 400: ERR_LABEL_MISSING_FIELDS — targetUserId or label missing
 * - 400: ERR_LABEL_INVALID — label not in allowed list or is 'root'
 * - 400: ERR_LABEL_LAST_ROLE — removing label would leave the user with zero labels
 * - 401: ERR_AUTH_REQUIRED — no authenticated user
 * - 403: ERR_UNAUTHORIZED — caller lacks the root label
 * - 404: ERR_USER_NOT_FOUND — targetUserId does not exist
 * - 500: ERR_INTERNAL — unexpected server error
 *
 * @returns {Object} { ok: true, data: { ... } } | { ok: false, error: { code, message } }
 */
```

- [ ] **Step 7: Verify syntax**

Run: `node --check functions/assign-user-label/src/main.js`
Expected: no output, exit code 0.

- [ ] **Step 8: Commit**

```bash
git add functions/assign-user-label/src/main.js
git commit -m "feat(functions): add root-only list-users action and label removal to assign-user-label"
```

---

### Task 2: i18n — new translation keys

**Files:**
- Modify: `src/i18n/en/admin.json`
- Modify: `src/i18n/es/admin.json`

**Interfaces:**
- Produces: `admin.sidebar.users`, consumed by Task 6 (sidebar); and the `admin.userList.*` namespace, consumed by Task 4 (table/card) and Task 5 (page).
- Consumes: nothing.

- [ ] **Step 1: Add the sidebar key to `es/admin.json`**

In `src/i18n/es/admin.json`, inside `"sidebar"` (right after `"audit": "Audit Log",` on line 29), add:

```json
      "audit": "Audit Log",
      "users": "Usuarios",
```

(i.e. insert `"users": "Usuarios",` as a new line right after the existing `"audit"` line, before `"docs": "Docs",`)

- [ ] **Step 2: Add the `userList` namespace to `es/admin.json`**

Right after the `"clientDetail": { ... }` block closes (after line 1103, right before `"settings": {` on line 1104), insert a new top-level `"userList"` object:

```json
    "userList": {
      "title": "Gestión de usuarios",
      "subtitle": "Asigna o quita roles de administración a los usuarios de la plataforma.",
      "searchPlaceholder": "Buscar por nombre o email…",
      "name": "Nombre",
      "email": "Email",
      "roles": "Roles",
      "status": "Estado",
      "registered": "Registro",
      "actions": "Acciones",
      "active": "Activo",
      "inactive": "Inactivo",
      "roleAdmin": "Admin",
      "roleOperator": "Operador",
      "roleClient": "Cliente",
      "makeAdmin": "Hacer admin",
      "removeAdmin": "Quitar admin",
      "makeOperator": "Hacer operador",
      "removeOperator": "Quitar operador",
      "makeClient": "Hacer cliente",
      "removeClient": "Quitar cliente",
      "lastRoleWarning": "El usuario debe conservar al menos un rol",
      "emptyTitle": "Sin usuarios",
      "emptyDefault": "Aún no hay usuarios registrados.",
      "emptyFiltered": "Ningún usuario coincide con la búsqueda.",
      "loadMore": "Cargar más",
      "loadingMore": "Cargando…",
      "errorGeneric": "No se pudo completar la acción. Intenta de nuevo."
    },
```

- [ ] **Step 3: Mirror both additions in `en/admin.json`**

In `src/i18n/en/admin.json`, inside `"sidebar"`, add (matching whatever line the `"audit"` key is on in that file — same insertion pattern as Step 1):

```json
      "audit": "Audit Log",
      "users": "Users",
```

Then, in the same file, right after the `"clientDetail": { ... }` block closes (mirroring Step 2's position — immediately before `"settings": {`), insert:

```json
    "userList": {
      "title": "User management",
      "subtitle": "Grant or revoke admin-level roles for platform users.",
      "searchPlaceholder": "Search by name or email…",
      "name": "Name",
      "email": "Email",
      "roles": "Roles",
      "status": "Status",
      "registered": "Registered",
      "actions": "Actions",
      "active": "Active",
      "inactive": "Inactive",
      "roleAdmin": "Admin",
      "roleOperator": "Operator",
      "roleClient": "Client",
      "makeAdmin": "Make admin",
      "removeAdmin": "Remove admin",
      "makeOperator": "Make operator",
      "removeOperator": "Remove operator",
      "makeClient": "Make client",
      "removeClient": "Remove client",
      "lastRoleWarning": "The user must keep at least one role",
      "emptyTitle": "No users",
      "emptyDefault": "No users registered yet.",
      "emptyFiltered": "No user matches the search.",
      "loadMore": "Load more",
      "loadingMore": "Loading…",
      "errorGeneric": "Couldn't complete the action. Please try again."
    },
```

- [ ] **Step 4: Verify both files are valid JSON**

Run: `node -e "JSON.parse(require('fs').readFileSync('src/i18n/es/admin.json','utf8')); JSON.parse(require('fs').readFileSync('src/i18n/en/admin.json','utf8')); console.log('OK')"`
Expected output: `OK`

- [ ] **Step 5: Commit**

```bash
git add src/i18n/en/admin.json src/i18n/es/admin.json
git commit -m "feat(i18n): add admin.sidebar.users and admin.userList translation keys"
```

---

### Task 3: `useAdminUsers` hook

**Files:**
- Create: `src/hooks/useAdminUsers.js`

**Interfaces:**
- Consumes: `functions` and `env` from `@/lib/appwrite` / `@/config/env` (`env.functionAssignLabel`, already `"assign-user-label"`).
- Produces: `useAdminUsers({ search }) => { data, total, loading, loadingMore, error, hasMore, loadMore, assignLabel, removeLabel, refetch }`, consumed by Task 5 (`UserListPage`). `data` items shape: `{ $id, name, email, phone, labels: string[], status: boolean, registration: string }`, guaranteed to never include an item whose `labels` contains `"root"`.

- [ ] **Step 1: Write the hook**

```js
import { useState, useEffect, useCallback } from "react";
import { functions } from "@/lib/appwrite";
import env from "@/config/env";

const ROOT_LABEL = "root";

function stripRoot(users) {
  return (users || []).filter((u) => !(u.labels || []).includes(ROOT_LABEL));
}

async function callAssignLabelFunction(payload) {
  const execution = await functions.createExecution(
    env.functionAssignLabel,
    JSON.stringify(payload),
    false,
    "/",
    "POST",
  );

  let parsed;
  try {
    parsed = JSON.parse(execution.responseBody || "{}");
  } catch {
    throw new Error("Respuesta inválida del servidor");
  }

  if (!parsed.ok) {
    throw new Error(parsed.error?.message || "Error desconocido");
  }

  return parsed.data;
}

/**
 * Root-only hook for listing Appwrite Auth users (never root) and
 * assigning/removing admin, operator, and client labels on them.
 */
export function useAdminUsers({ search = "" } = {}) {
  const [data, setData] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  const fetchFirstPage = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await callAssignLabelFunction({
        action: "list-users",
        search,
      });
      setData(stripRoot(result.users));
      setCursor(result.nextCursor ?? null);
      setHasMore(!!result.hasMore);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchFirstPage();
  }, [fetchFirstPage]);

  const loadMore = useCallback(async () => {
    if (!hasMore || !cursor || loadingMore) return;
    setLoadingMore(true);
    setError(null);
    try {
      const result = await callAssignLabelFunction({
        action: "list-users",
        search,
        cursor,
      });
      setData((prev) => [...prev, ...stripRoot(result.users)]);
      setCursor(result.nextCursor ?? null);
      setHasMore(!!result.hasMore);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingMore(false);
    }
  }, [search, cursor, hasMore, loadingMore]);

  const assignLabel = useCallback(
    async (userId, label) => {
      await callAssignLabelFunction({ targetUserId: userId, label });
      await fetchFirstPage();
    },
    [fetchFirstPage],
  );

  const removeLabel = useCallback(
    async (userId, label) => {
      await callAssignLabelFunction({
        targetUserId: userId,
        label,
        remove: true,
      });
      await fetchFirstPage();
    },
    [fetchFirstPage],
  );

  return {
    data,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    assignLabel,
    removeLabel,
    refetch: fetchFirstPage,
  };
}
```

- [ ] **Step 2: Verify syntax**

Run: `node --check src/hooks/useAdminUsers.js`

This will fail because `node --check` doesn't understand JSX-free-but-`@/`-aliased ESM imports resolved by Vite — that's expected and fine; instead verify with the project's existing lint command:

Run: `npx eslint src/hooks/useAdminUsers.js`
Expected: no errors (warnings about unresolved `@/` alias are suppressed by the project's existing eslint import resolver config — if the command reports an unresolved-import error unrelated to syntax, that's a pre-existing lint-config characteristic, not a bug in this file; a clean run reports 0 problems).

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useAdminUsers.js
git commit -m "feat(admin): add useAdminUsers hook for root-only user/label management"
```

---

### Task 4: Presentational components — `UserTable` and `UserCard`

**Files:**
- Create: `src/components/admin/users/UserTable.jsx`
- Create: `src/components/admin/users/UserCard.jsx`

**Interfaces:**
- Consumes: `data` items from Task 3's `useAdminUsers` (`{ $id, name, email, phone, labels, status, registration }`), and `assignLabel(userId, label)` / `removeLabel(userId, label)` callbacks (both `async`, may throw — caller catches).
- Produces: `<UserTable users={[]} loading={false} onAssign={(userId, label) => {}} onRemove={(userId, label) => {}} pendingUserId={null} />` and `<UserCard user={{}} onAssign={...} onRemove={...} pendingUserId={null} />`, consumed by Task 5 (`UserListPage`). `pendingUserId` is the `$id` of a user currently mid-mutation (disables its own row's buttons only).

- [ ] **Step 1: Write `UserTable.jsx`**

```jsx
import { Badge } from "@/components/common/Badge";
import { useLanguage } from "@/hooks/useLanguage";

const MANAGED_LABELS = ["admin", "operator", "client"];

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function LabelBadges({ labels, t }) {
  if (!labels || labels.length === 0) {
    return <span className="text-charcoal-subtle">—</span>;
  }
  return (
    <div className="flex flex-wrap gap-1">
      {labels.map((label) => (
        <Badge key={label} variant={label === "admin" ? "sage" : "warm"}>
          {t(`admin.userList.role${label.charAt(0).toUpperCase()}${label.slice(1)}`)}
        </Badge>
      ))}
    </div>
  );
}

function LabelActions({ user, onAssign, onRemove, pending, t }) {
  return (
    <div className="flex flex-wrap justify-end gap-1.5">
      {MANAGED_LABELS.map((label) => {
        const has = user.labels.includes(label);
        const wouldBeLast = has && user.labels.length === 1;
        const capitalized = `${label.charAt(0).toUpperCase()}${label.slice(1)}`;
        const actionKey = has
          ? `admin.userList.remove${capitalized}`
          : `admin.userList.make${capitalized}`;
        return (
          <button
            key={label}
            type="button"
            disabled={pending || (has && wouldBeLast)}
            title={has && wouldBeLast ? t("admin.userList.lastRoleWarning") : undefined}
            onClick={() =>
              has ? onRemove(user.$id, label) : onAssign(user.$id, label)
            }
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
              has
                ? "bg-red-50 text-red-700 hover:bg-red-100"
                : "bg-sage/10 text-sage-dark hover:bg-sage/20"
            }`}
          >
            {t(actionKey)}
          </button>
        );
      })}
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr className="border-b border-sand-dark/40 animate-pulse">
      <td className="px-4 py-3">
        <div className="h-4 w-36 rounded bg-warm-gray" />
      </td>
      <td className="px-4 py-3 hidden md:table-cell">
        <div className="h-4 w-40 rounded bg-warm-gray" />
      </td>
      <td className="px-4 py-3 hidden lg:table-cell">
        <div className="h-4 w-24 rounded bg-warm-gray" />
      </td>
      <td className="px-4 py-3 text-right">
        <div className="h-4 w-32 rounded bg-warm-gray ml-auto" />
      </td>
    </tr>
  );
}

export default function UserTable({
  users,
  loading,
  onAssign,
  onRemove,
  pendingUserId,
}) {
  const { t } = useLanguage();

  return (
    <div className="overflow-x-auto rounded-xl border border-sand-dark">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-sand-dark bg-warm-gray/60">
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-charcoal-muted">
              {t("admin.userList.name")}
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-charcoal-muted hidden md:table-cell">
              {t("admin.userList.email")}
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-charcoal-muted hidden lg:table-cell">
              {t("admin.userList.roles")}
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-charcoal-muted">
              {t("admin.userList.actions")}
            </th>
          </tr>
        </thead>
        <tbody>
          {loading &&
            Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}

          {!loading && users.length === 0 && (
            <tr>
              <td
                colSpan={4}
                className="px-4 py-12 text-center text-sm text-charcoal-subtle"
              >
                {t("admin.userList.emptyDefault")}
              </td>
            </tr>
          )}

          {!loading &&
            users.map((user) => (
              <tr
                key={user.$id}
                className="border-b border-sand last:border-0 hover:bg-warm-gray/30 transition-colors"
              >
                <td className="px-4 py-3 font-medium text-charcoal">
                  {user.name || "—"}
                </td>
                <td className="px-4 py-3 hidden md:table-cell text-charcoal-muted">
                  {user.email || "—"}
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <LabelBadges labels={user.labels} t={t} />
                </td>
                <td className="px-4 py-3">
                  <LabelActions
                    user={user}
                    onAssign={onAssign}
                    onRemove={onRemove}
                    pending={pendingUserId === user.$id}
                    t={t}
                  />
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

export { formatDate };
```

- [ ] **Step 2: Write `UserCard.jsx`**

```jsx
import { Card } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";
import { useLanguage } from "@/hooks/useLanguage";

const MANAGED_LABELS = ["admin", "operator", "client"];

export default function UserCard({ user, onAssign, onRemove, pendingUserId }) {
  const { t } = useLanguage();
  const pending = pendingUserId === user.$id;

  return (
    <Card className="p-4 space-y-3">
      <div className="min-w-0">
        <p className="font-medium text-charcoal truncate">
          {user.name || "—"}
        </p>
        <p className="text-xs text-charcoal-muted truncate">
          {user.email || "—"}
        </p>
      </div>

      {user.labels.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {user.labels.map((label) => (
            <Badge key={label} variant={label === "admin" ? "sage" : "warm"}>
              {t(
                `admin.userList.role${label.charAt(0).toUpperCase()}${label.slice(1)}`,
              )}
            </Badge>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-1.5">
        {MANAGED_LABELS.map((label) => {
          const has = user.labels.includes(label);
          const wouldBeLast = has && user.labels.length === 1;
          const capitalized = `${label.charAt(0).toUpperCase()}${label.slice(1)}`;
          const actionKey = has
            ? `admin.userList.remove${capitalized}`
            : `admin.userList.make${capitalized}`;
          return (
            <button
              key={label}
              type="button"
              disabled={pending || (has && wouldBeLast)}
              title={
                has && wouldBeLast
                  ? t("admin.userList.lastRoleWarning")
                  : undefined
              }
              onClick={() =>
                has ? onRemove(user.$id, label) : onAssign(user.$id, label)
              }
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                has
                  ? "bg-red-50 text-red-700 hover:bg-red-100"
                  : "bg-sage/10 text-sage-dark hover:bg-sage/20"
              }`}
            >
              {t(actionKey)}
            </button>
          );
        })}
      </div>
    </Card>
  );
}
```

- [ ] **Step 3: Verify syntax**

Run: `npx eslint src/components/admin/users/UserTable.jsx src/components/admin/users/UserCard.jsx`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/admin/users/UserTable.jsx src/components/admin/users/UserCard.jsx
git commit -m "feat(admin): add UserTable and UserCard components for user management page"
```

---

### Task 5: `UserListPage`

**Files:**
- Create: `src/pages/admin/UserListPage.jsx`

**Interfaces:**
- Consumes: `useAdminUsers` (Task 3), `UserTable`/`UserCard` (Task 4).
- Produces: default export `UserListPage`, a route element consumed by Task 6 (`App.jsx`).

- [ ] **Step 1: Write the page**

```jsx
import { useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { useAdminUsers } from "@/hooks/useAdminUsers";
import { Card } from "@/components/common/Card";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import UserTable from "@/components/admin/users/UserTable";
import UserCard from "@/components/admin/users/UserCard";
import { Search, ShieldCheck } from "lucide-react";

export default function UserListPage() {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [pendingUserId, setPendingUserId] = useState(null);
  const [actionError, setActionError] = useState(null);

  const {
    data,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    assignLabel,
    removeLabel,
  } = useAdminUsers({ search });

  async function handleAssign(userId, label) {
    setActionError(null);
    setPendingUserId(userId);
    try {
      await assignLabel(userId, label);
    } catch (err) {
      setActionError(err.message || t("admin.userList.errorGeneric"));
    } finally {
      setPendingUserId(null);
    }
  }

  async function handleRemove(userId, label) {
    setActionError(null);
    setPendingUserId(userId);
    try {
      await removeLabel(userId, label);
    } catch (err) {
      setActionError(err.message || t("admin.userList.errorGeneric"));
    } finally {
      setPendingUserId(null);
    }
  }

  const hasFilters = !!search;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-semibold text-charcoal">
          {t("admin.userList.title")}
        </h1>
        <p className="text-sm text-charcoal-muted mt-1">
          {t("admin.userList.subtitle")}
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-muted pointer-events-none" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("admin.userList.searchPlaceholder")}
          className="pl-9 h-10"
        />
      </div>

      {/* Errors */}
      {error && (
        <Card className="p-4 border-red-200 bg-red-50">
          <p className="text-sm text-red-700">{error}</p>
        </Card>
      )}
      {actionError && (
        <Card className="p-4 border-red-200 bg-red-50">
          <p className="text-sm text-red-700">{actionError}</p>
        </Card>
      )}

      {/* Empty state */}
      {!loading && !error && data.length === 0 && (
        <Card className="p-10 text-center">
          <ShieldCheck className="h-10 w-10 text-charcoal-muted mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-charcoal mb-1">
            {t("admin.userList.emptyTitle")}
          </h2>
          <p className="text-sm text-charcoal-muted">
            {hasFilters
              ? t("admin.userList.emptyFiltered")
              : t("admin.userList.emptyDefault")}
          </p>
        </Card>
      )}

      {/* Desktop table */}
      <div className="hidden md:block">
        <UserTable
          users={data}
          loading={loading}
          onAssign={handleAssign}
          onRemove={handleRemove}
          pendingUserId={pendingUserId}
        />
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {loading &&
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-4 space-y-2 animate-pulse">
              <div className="h-4 w-36 rounded bg-warm-gray" />
              <div className="h-3 w-24 rounded bg-warm-gray" />
            </Card>
          ))}

        {!loading &&
          data.map((user) => (
            <UserCard
              key={user.$id}
              user={user}
              onAssign={handleAssign}
              onRemove={handleRemove}
              pendingUserId={pendingUserId}
            />
          ))}
      </div>

      {/* Load more */}
      {hasMore && (
        <div className="flex justify-center pt-2">
          <Button variant="outline" onClick={loadMore} loading={loadingMore}>
            {t("admin.userList.loadMore")}
          </Button>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify syntax**

Run: `npx eslint src/pages/admin/UserListPage.jsx`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/pages/admin/UserListPage.jsx
git commit -m "feat(admin): add UserListPage"
```

---

### Task 6: Routing, sidebar, and menu — root-only wiring

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/components/admin/layout/AdminSidebar.jsx`
- Modify: `src/components/common/UserMenuDropdown.jsx`

**Interfaces:**
- Consumes: `UserListPage` (Task 5), `RequireLabel` (existing, `src/routes/guards.jsx`), `ROLES` (existing, `src/constants/roles.js`), `admin.sidebar.users` (Task 2).
- Produces: navigable, root-gated `/admin/users` route.

- [ ] **Step 1: Add the lazy import in `App.jsx`**

Find (around line 120):

```js
const ClientDetailPage = lazy(() => import("@/pages/admin/ClientDetailPage"));
const SettingsPage = lazy(() => import("@/pages/admin/SettingsPage"));
```

Replace with:

```js
const ClientDetailPage = lazy(() => import("@/pages/admin/ClientDetailPage"));
const UserListPage = lazy(() => import("@/pages/admin/UserListPage"));
const SettingsPage = lazy(() => import("@/pages/admin/SettingsPage"));
```

- [ ] **Step 2: Add the root-gated route**

Find (inside the `/admin` route block):

```jsx
              <Route
                element={<RequireLabel labels={[ROLES.ADMIN, ROLES.ROOT]} />}
              >
                <Route path="hero-slides" element={<HeroSlidesPage />} />
                <Route element={<RequireLabel labels={[ROLES.ROOT]} />}>
                  <Route path="audit" element={<AuditLogPage />} />
                </Route>
              </Route>
```

Replace with:

```jsx
              <Route
                element={<RequireLabel labels={[ROLES.ADMIN, ROLES.ROOT]} />}
              >
                <Route path="hero-slides" element={<HeroSlidesPage />} />
                <Route element={<RequireLabel labels={[ROLES.ROOT]} />}>
                  <Route path="audit" element={<AuditLogPage />} />
                  <Route path="users" element={<UserListPage />} />
                </Route>
              </Route>
```

- [ ] **Step 3: Add the sidebar nav item**

In `src/components/admin/layout/AdminSidebar.jsx`, add `ShieldCheck` to the `lucide-react` import:

Find:

```js
  Settings,
  UserCog,
  BookOpen,
  Shield,
} from "lucide-react";
```

Replace with:

```js
  Settings,
  UserCog,
  BookOpen,
  Shield,
  ShieldCheck,
} from "lucide-react";
```

Then find the `system` section's items array:

```jsx
      {
        nameKey: "admin.sidebar.audit",
        path: ROUTES.ADMIN_AUDIT,
        icon: Shield,
        rootOnly: true,
      },
    ],
  },
```

Replace with:

```jsx
      {
        nameKey: "admin.sidebar.audit",
        path: ROUTES.ADMIN_AUDIT,
        icon: Shield,
        rootOnly: true,
      },
      {
        nameKey: "admin.sidebar.users",
        path: ROUTES.ADMIN_USERS,
        icon: ShieldCheck,
        rootOnly: true,
      },
    ],
  },
```

- [ ] **Step 4: Restrict the "Gestión de usuarios" menu item to root**

In `src/components/common/UserMenuDropdown.jsx`, the destructured hook already includes `isRoot` (line 42: `const { user, labels, logout, isAdmin, isClient, isRoot } = useAuth();` — no change needed there).

Find:

```jsx
              <DropdownMenuItem asChild>
                <Link to={ROUTES.ADMIN_USERS}>
                  <Users className="h-4 w-4 text-charcoal-muted" />
                  Gestión de usuarios
                </Link>
              </DropdownMenuItem>
              {isRoot && (
```

Replace with:

```jsx
              {isRoot && (
                <DropdownMenuItem asChild>
                  <Link to={ROUTES.ADMIN_USERS}>
                    <Users className="h-4 w-4 text-charcoal-muted" />
                    Gestión de usuarios
                  </Link>
                </DropdownMenuItem>
              )}
              {isRoot && (
```

(This wraps only the "Gestión de usuarios" item in its own `isRoot &&` block, leaving the pre-existing `isRoot && (<DropdownMenuItem>... Documentación ...)` block right after it untouched.)

- [ ] **Step 5: Verify syntax**

Run: `npx eslint src/App.jsx src/components/admin/layout/AdminSidebar.jsx src/components/common/UserMenuDropdown.jsx`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/App.jsx src/components/admin/layout/AdminSidebar.jsx src/components/common/UserMenuDropdown.jsx
git commit -m "feat(admin): wire root-only /admin/users route, sidebar item, and menu link"
```

---

### Task 7: End-to-end verification

**Files:** none (verification only).

**Interfaces:** none.

- [ ] **Step 1: Deploy the updated Function**

Run (from the repo root, requires the Appwrite CLI already logged into the `omzone-dev` project per this repo's existing conventions):

```bash
appwrite push function --function-id assign-user-label
```

Expected: deployment succeeds and becomes the active deployment (check via `appwrite functions list-deployments --function-id assign-user-label` or the Appwrite Console).

- [ ] **Step 2: Start the frontend dev server**

Run: `npm run dev`
Expected: Vite starts without errors.

- [ ] **Step 3: Verify root sees the feature**

Log in as a user with the `root` label (per this project's existing test/seed accounts). In the browser:
- Confirm "Usuarios" appears in the sidebar under the "Sistema" section.
- Confirm "Gestión de usuarios" appears in the user menu dropdown (top-right avatar).
- Navigate to `/admin/users`. Confirm the page loads, lists users, and **no user with the root account's own labels (or any other root account) appears in the list**.
- Search by a known user's name/email; confirm the list filters.
- Click "Hacer admin" on a `client`-only test user; confirm the row updates to show the `Admin` badge and the button flips to "Quitar admin".
- Click "Quitar admin" on that same user; confirm it reverts.
- Attempt to remove a user's only remaining label (e.g. a user with only `client`) — confirm the button for that label is disabled with the "must keep at least one role" tooltip.

- [ ] **Step 4: Verify admin (non-root) does NOT see the feature**

Log in as a user with only the `admin` label (no `root`).
- Confirm "Usuarios" is **absent** from the sidebar.
- Confirm "Gestión de usuarios" is **absent** from the user menu dropdown.
- Manually navigate the browser to `/admin/users`. Confirm it redirects to the forbidden/not-authorized route (per `RequireLabel`'s existing behavior — same as attempting `/admin/audit` as a non-root admin).

- [ ] **Step 5: Verify backend authorization directly (optional but recommended)**

Using a valid session/JWT for an `admin` (non-root) test user, call the Function directly (e.g. via `curl` or the Appwrite Console's "Execute now" on the function, passing the JWT as `x-appwrite-user-id` is not something you set manually — instead use the Appwrite Console's function execution UI with that user's session, or a short authenticated script using the Appwrite Web SDK's `functions.createExecution`) with body `{"action":"list-users"}` and separately `{"targetUserId":"<some-id>","label":"admin"}`.
Expected: both return `403 ERR_UNAUTHORIZED` — confirming the backend rejects non-root callers even without the UI.

- [ ] **Step 6: No commit for this task** — it's verification-only. If any step above surfaces a bug, fix it in the relevant task's file, re-run `npx eslint` on that file, and commit the fix with a message like `fix(admin): <description>`.
