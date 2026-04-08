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

import { Client, Databases, Users } from "node-appwrite";

const ALLOWED_LABELS = ["admin", "operator", "client"];

const DB = process.env.APPWRITE_DATABASE_ID || "omzone_db";
const COLLECTION_PROFILES =
  process.env.APPWRITE_COLLECTION_USER_PROFILES || "user_profiles";

function initClient(req) {
  return new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(req.headers["x-appwrite-key"]);
}

/**
 * Flow A — Event trigger: users.*.create
 * Creates user_profiles document and assigns 'client' label.
 */
async function handleSignupEvent({ req, res, log, error }) {
  const client = initClient(req);
  const db = new Databases(client);
  const users = new Users(client);

  try {
    // Extract user data from event payload
    const eventUser = req.body ? JSON.parse(req.body) : null;

    if (!eventUser || !eventUser.$id) {
      error("Event payload missing user $id");
      return res.json(
        {
          ok: false,
          error: {
            code: "ERR_EVENT_INVALID",
            message: "Invalid event payload",
          },
        },
        400,
      );
    }

    const userId = eventUser.$id;
    const userName = eventUser.name || "";
    const userEmail = eventUser.email || "";

    log(`Processing signup for user: ${userId}`);

    // Idempotency check — skip if profile doc with $id = userId already exists
    try {
      await db.getDocument(DB, COLLECTION_PROFILES, userId);
      log(`Profile already exists for user ${userId} — skipping`);
      return res.json({
        ok: true,
        data: { message: "Profile already exists", userId },
      });
    } catch {
      // Document not found — proceed to create
    }

    // Parse firstName / lastName from Auth name
    const nameParts = userName.trim().split(/\s+/);
    const firstName = nameParts[0] || "";
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

    // Derive displayName: prefer name, fallback to email prefix
    const displayName = userName || (userEmail ? userEmail.split("@")[0] : "");

    // Create user_profiles document — $id = Auth userId
    await db.createDocument(
      DB,
      COLLECTION_PROFILES,
      userId,
      {
        displayName,
        firstName,
        lastName,
        language: "es",
      },
      [
        `read("user:${userId}")`,
        `update("user:${userId}")`,
        `read("label:admin")`,
        `update("label:admin")`,
      ],
    );

    log(`Profile created for user ${userId}`);

    // Read current labels and merge with 'client'
    const user = await users.get(userId);
    const currentLabels = user.labels || [];

    if (!currentLabels.includes("client")) {
      const updatedLabels = [...currentLabels, "client"];
      await users.updateLabels(userId, updatedLabels);
      log(`Label 'client' assigned to user ${userId}`);
    } else {
      log(`User ${userId} already has 'client' label — skipping`);
    }

    return res.json({
      ok: true,
      data: {
        userId,
        displayName,
        labels: currentLabels.includes("client")
          ? currentLabels
          : [...currentLabels, "client"],
      },
    });
  } catch (err) {
    error(`Signup handler failed: ${err.message}`);
    return res.json(
      { ok: false, error: { code: "ERR_INTERNAL", message: "Internal error" } },
      500,
    );
  }
}

/**
 * Flow C — HTTP POST { action: "ensure-profile" }
 * Any authenticated user can call this to guarantee their own profile exists.
 * Idempotent: returns existing profile if already created.
 */
async function handleEnsureProfile({ req, res, log, error }) {
  const client = initClient(req);
  const db = new Databases(client);
  const users = new Users(client);

  try {
    const userId = req.headers["x-appwrite-user-id"];
    if (!userId) {
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

    // Idempotency — if profile exists, return immediately
    try {
      const existing = await db.getDocument(DB, COLLECTION_PROFILES, userId);
      log(`ensure-profile: profile already exists for ${userId}`);
      return res.json({
        ok: true,
        data: { userId, existed: true, displayName: existing.displayName },
      });
    } catch {
      // Not found — proceed to create
    }

    // Fetch Auth user for name/email
    const authUser = await users.get(userId);
    const userName = authUser.name || "";
    const userEmail = authUser.email || "";

    const nameParts = userName.trim().split(/\s+/);
    const firstName = nameParts[0] || "";
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";
    const displayName = userName || (userEmail ? userEmail.split("@")[0] : "");

    try {
      await db.createDocument(
        DB,
        COLLECTION_PROFILES,
        userId,
        { displayName, firstName, lastName, language: "es" },
        [
          `read("user:${userId}")`,
          `update("user:${userId}")`,
          `read("label:admin")`,
          `update("label:admin")`,
        ],
      );
      log(`ensure-profile: created profile for ${userId}`);
    } catch (createErr) {
      // Handle race condition — another call may have created the profile
      if (createErr.code === 409) {
        log(
          `ensure-profile: profile already exists (race condition) for ${userId}`,
        );
      } else {
        throw createErr;
      }
    }

    // Also ensure 'client' label exists
    const currentLabels = authUser.labels || [];
    if (!currentLabels.includes("client")) {
      await users.updateLabels(userId, [...currentLabels, "client"]);
      log(`ensure-profile: assigned 'client' label to ${userId}`);
    }

    return res.json({
      ok: true,
      data: { userId, existed: false, displayName },
    });
  } catch (err) {
    error(`ensure-profile failed: ${err.message}`);
    return res.json(
      { ok: false, error: { code: "ERR_INTERNAL", message: "Internal error" } },
      500,
    );
  }
}

/**
 * Flow B — HTTP POST: Manual label assignment by admin
 */
async function handleManualAssignment({ req, res, log, error }) {
  const client = initClient(req);
  const users = new Users(client);

  try {
    // 1. Parse
    const body = JSON.parse(req.body || "{}");

    // 2. Validate input
    const { targetUserId, label } = body;

    if (
      !targetUserId ||
      typeof targetUserId !== "string" ||
      !targetUserId.trim()
    ) {
      return res.json(
        {
          ok: false,
          error: {
            code: "ERR_LABEL_MISSING_FIELDS",
            message: "targetUserId is required",
          },
        },
        400,
      );
    }

    if (!label || typeof label !== "string" || !label.trim()) {
      return res.json(
        {
          ok: false,
          error: {
            code: "ERR_LABEL_MISSING_FIELDS",
            message: "label is required",
          },
        },
        400,
      );
    }

    // 3. Reject 'root' label
    if (label === "root") {
      return res.json(
        {
          ok: false,
          error: {
            code: "ERR_LABEL_INVALID",
            message: "root label cannot be assigned via this endpoint",
          },
        },
        400,
      );
    }

    // 4. Validate label is in allowed list
    if (!ALLOWED_LABELS.includes(label)) {
      return res.json(
        {
          ok: false,
          error: {
            code: "ERR_LABEL_INVALID",
            message: `label must be one of: ${ALLOWED_LABELS.join(", ")}`,
          },
        },
        400,
      );
    }

    // 5. Authenticate — verify caller
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

    // 7. Fetch target user
    let targetUser;
    try {
      targetUser = await users.get(targetUserId.trim());
    } catch (fetchErr) {
      if (fetchErr.code === 404) {
        return res.json(
          {
            ok: false,
            error: {
              code: "ERR_USER_NOT_FOUND",
              message: "Target user not found",
            },
          },
          404,
        );
      }
      throw fetchErr;
    }

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
  } catch (err) {
    error(`Manual assignment failed: ${err.message}`);
    return res.json(
      { ok: false, error: { code: "ERR_INTERNAL", message: "Internal error" } },
      500,
    );
  }
}

export default async (context) => {
  const { req, log } = context;

  // Route based on trigger type:
  // Event triggers have 'x-appwrite-event' header
  // HTTP requests don't
  const isEvent = req.headers["x-appwrite-trigger"] === "event";

  if (isEvent) {
    log("Trigger: event (users.*.create)");
    return handleSignupEvent(context);
  }

  // HTTP request — only POST allowed
  if (req.method !== "POST") {
    return context.res.json(
      {
        ok: false,
        error: {
          code: "ERR_METHOD_NOT_ALLOWED",
          message: "Only POST is allowed",
        },
      },
      405,
    );
  }

  // Route by action field or default to manual label assignment
  let body = {};
  try {
    body = JSON.parse(req.body || "{}");
  } catch {
    /* invalid JSON handled by sub-handler */
  }

  if (body.action === "ensure-profile") {
    log("Trigger: HTTP POST (ensure-profile)");
    return handleEnsureProfile(context);
  }

  log("Trigger: HTTP POST (manual label assignment)");
  return handleManualAssignment(context);
};
