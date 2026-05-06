import { Client, Databases, Users, ID, Query } from "node-appwrite";

// ── Constants ──────────────────────────────────────────────────────────────

const DB = "omzone_db";

const ARCHIVABLE = new Set([
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
]);

const OPERATOR_ARCHIVABLE = new Set(["slots", "bookings", "booking_requests"]);

const CASCADE_MAP = {
  experiences: { editions: "experienceId", slots: "experienceId" },
};

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

async function assertCanRestore(users, userId, collectionId) {
  if (!userId) {
    const err = new Error("Authentication required");
    err.status = 401;
    throw err;
  }
  const user = await users.get(userId);
  const labels = user.labels || [];

  const isRoot = labels.includes("root");
  const isAdmin = labels.includes("admin");
  const isOperator = labels.includes("operator");

  if (!isRoot && !isAdmin && !isOperator) {
    const err = new Error("Insufficient permissions to restore documents");
    err.status = 403;
    throw err;
  }

  if (isOperator && !isRoot && !isAdmin) {
    if (!OPERATOR_ARCHIVABLE.has(collectionId)) {
      const err = new Error(
        `Operators cannot restore collection: ${collectionId}`,
      );
      err.status = 403;
      throw err;
    }
  }

  return { userId, labels };
}

async function logActivity(
  db,
  action,
  entityType,
  entityId,
  actorId,
  details = {},
  ipAddress = null,
) {
  try {
    await db.createDocument(DB, "admin_activity_logs", ID.unique(), {
      userId: actorId,
      action,
      entityType,
      entityId,
      details: JSON.stringify(details),
      ...(ipAddress ? { ipAddress } : {}),
    });
  } catch {
    // Non-critical
  }
}

/**
 * Restores child documents that were cascade-archived from this parent.
 * Identifies them by archiveReason starting with "cascade-of:PARENT_ID".
 */
async function cascadeRestore(db, parentCollection, parentId) {
  const cascadeConfig = CASCADE_MAP[parentCollection];
  if (!cascadeConfig) return;

  const cascadeMarker = `cascade-of:${parentId}`;

  for (const [childCollection] of Object.entries(cascadeConfig)) {
    try {
      // Find documents archived as part of this cascade
      const { documents } = await db.listDocuments(DB, childCollection, [
        Query.startsWith("archiveReason", cascadeMarker),
        Query.isNotNull("archivedAt"),
        Query.limit(500),
      ]);

      for (const doc of documents) {
        await db.updateDocument(DB, childCollection, doc.$id, {
          archivedAt: null,
          archivedBy: null,
          archiveReason: null,
        });
      }
    } catch (err) {
      console.error(
        `Cascade restore failed for ${childCollection}: ${err.message}`,
      );
    }
  }
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

  const { collectionId, documentId, cascade = true } = body || {};

  if (!collectionId || !documentId) {
    return res.json(
      { ok: false, error: "collectionId and documentId are required" },
      400,
    );
  }
  if (!ARCHIVABLE.has(collectionId)) {
    return res.json(
      {
        ok: false,
        error: `Collection "${collectionId}" does not support restore`,
      },
      400,
    );
  }

  try {
    await assertCanRestore(users, userId, collectionId);

    const doc = await db.getDocument(DB, collectionId, documentId);

    // Idempotent: already active
    if (!doc.archivedAt) {
      log(
        `Document ${documentId} in ${collectionId} is not archived — returning OK`,
      );
      return res.json({ ok: true, alreadyActive: true });
    }

    // Restore the document
    await db.updateDocument(DB, collectionId, documentId, {
      archivedAt: null,
      archivedBy: null,
      archiveReason: null,
    });

    log(`Restored ${collectionId}/${documentId} by ${userId}`);

    // Cascade restore children
    if (cascade && CASCADE_MAP[collectionId]) {
      await cascadeRestore(db, collectionId, documentId);
      log(`Cascaded restore from ${collectionId}/${documentId}`);
    }

    await logActivity(
      db,
      "restore",
      collectionId,
      documentId,
      userId,
      { cascade, cascaded: cascade && !!CASCADE_MAP[collectionId] },
      ip,
    );

    return res.json({ ok: true });
  } catch (err) {
    error(`restore-document error: ${err.message}`);
    return res.json({ ok: false, error: err.message }, err.status || 500);
  }
};
