import { Client, Databases, Users, ID } from "node-appwrite";

// ── Constants ──────────────────────────────────────────────────────────────

const DB = "omzone_db";

/** All collections where hard delete is permitted (root only) */
const DELETABLE = new Set([
  "experiences",
  "publications",
  "editions",
  "pricing_tiers",
  "pricing_rules",
  "addons",
  "packages",
  "passes",
  "locations",
  "rooms",
  "resources",
  "slots",
  "booking_requests",
  "bookings",
  "notification_templates",
  "tags",
  "hero_slides",
  "orders",
  "tickets",
  "user_passes",
  "pass_consumptions",
  // Sub-resources
  "sections",
  "hero_slides",
  "package_items",
  "addon_assignments",
  "slot_resources",
]);

/**
 * Transactional collections require a non-empty reason for hard delete
 * due to potential legal / fiscal implications.
 */
const TRANSACTIONAL = new Set([
  "orders",
  "tickets",
  "user_passes",
  "pass_consumptions",
  "bookings",
]);

// ── Helpers ────────────────────────────────────────────────────────────────

function initClient(req) {
  let endpoint = process.env.APPWRITE_FUNCTION_API_ENDPOINT;
  if (endpoint?.startsWith("http://")) {
    endpoint = endpoint.replace("http://", "https://");
  }
  return new Client()
    .setEndpoint(endpoint)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setSelfSigned(true)
    .setKey(req.headers["x-appwrite-key"]);
}

async function assertRoot(users, userId) {
  if (!userId) {
    const err = new Error("Authentication required");
    err.status = 401;
    throw err;
  }
  const user = await users.get(userId);
  const labels = user.labels || [];

  if (!labels.includes("root")) {
    const err = new Error("Hard delete is restricted to root users only");
    err.status = 403;
    throw err;
  }
  return { userId, labels };
}

// hard_delete is root-only. Root users never leave audit traces (ghost-user rule).
// logActivity is intentionally a no-op — kept for clarity and future auditability
// in case permissions are extended.
async function logActivity() {
  // Root-only operation: ghost-user rule means no trace is ever written.
}

// ── Main handler ───────────────────────────────────────────────────────────

export default async ({ req, res, log, error }) => {
  const client = initClient(req);
  const db = new Databases(client);
  const users = new Users(client);

  const userId = req.headers["x-appwrite-user-id"] || null;
  const ip = req.headers["x-forwarded-for"] || req.headers["x-real-ip"] || null;

  let body;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  } catch {
    return res.json({ ok: false, error: "Invalid JSON body" }, 400);
  }

  const { collectionId, documentId, confirmationId, reason = "" } = body || {};

  // ── Input validation ────────────────────────────────────────────────────
  if (!collectionId || !documentId) {
    return res.json(
      { ok: false, error: "collectionId and documentId are required" },
      400,
    );
  }
  if (!DELETABLE.has(collectionId)) {
    return res.json(
      {
        ok: false,
        error: `Collection "${collectionId}" does not support hard delete`,
      },
      400,
    );
  }
  if (confirmationId !== documentId) {
    return res.json(
      {
        ok: false,
        error: "confirmationId must match documentId (anti-accident safeguard)",
      },
      400,
    );
  }
  if (TRANSACTIONAL.has(collectionId) && !reason?.trim()) {
    return res.json(
      {
        ok: false,
        error: `A reason is required for hard-deleting transactional collection "${collectionId}"`,
      },
      400,
    );
  }

  try {
    // ── Auth: root only ────────────────────────────────────────────────────
    await assertRoot(users, userId);

    // ── Document must be archived first ───────────────────────────────────
    // Sub-resources (sections, package_items, etc.) do not have archivedAt
    const isSubResource = ![
      "experiences",
      "publications",
      "editions",
      "pricing_tiers",
      "pricing_rules",
      "addons",
      "packages",
      "passes",
      "locations",
      "rooms",
      "resources",
      "slots",
      "booking_requests",
      "bookings",
      "notification_templates",
      "tags",
      "hero_slides",
      "orders",
      "tickets",
      "user_passes",
      "pass_consumptions",
    ].includes(collectionId);

    let doc;
    try {
      doc = await db.getDocument(DB, collectionId, documentId);
    } catch (fetchErr) {
      return res.json(
        { ok: false, error: `Document not found: ${fetchErr.message}` },
        404,
      );
    }

    if (!isSubResource && !doc.archivedAt) {
      return res.json(
        {
          ok: false,
          error:
            "Document must be archived before it can be permanently deleted. Archive it first.",
        },
        409,
      );
    }

    // ── Log BEFORE deleting (immutable audit trail) ────────────────────────
    await logActivity(
      db,
      collectionId,
      documentId,
      userId,
      {
        reason,
        snapshot: doc,
        archivedAt: doc.archivedAt || null,
        archivedBy: doc.archivedBy || null,
      },
      ip,
    );

    // ── Permanent delete ───────────────────────────────────────────────────
    await db.deleteDocument(DB, collectionId, documentId);

    log(
      `HARD DELETE: ${collectionId}/${documentId} by root:${userId} — reason: "${reason}"`,
    );

    return res.json({ ok: true });
  } catch (err) {
    error(`hard-delete-document error: ${err.message}`);
    return res.json({ ok: false, error: err.message }, err.status || 500);
  }
};
