import { Client, Databases, Users, ID, Query } from "node-appwrite";

// ── Constants ──────────────────────────────────────────────────────────────

const DB = "omzone_db";

/** Collections that support admin soft-archive */
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

/** Operator label is allowed to archive only these collections */
const OPERATOR_ARCHIVABLE = new Set(["slots", "bookings", "booking_requests"]);

/** Collections whose cascade should be triggered when archiving the parent */
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

async function assertCanArchive(users, userId, collectionId) {
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
    const err = new Error("Insufficient permissions to archive documents");
    err.status = 403;
    throw err;
  }

  // Operators have restricted collection access
  if (isOperator && !isRoot && !isAdmin) {
    if (!OPERATOR_ARCHIVABLE.has(collectionId)) {
      const err = new Error(
        `Operators cannot archive collection: ${collectionId}`,
      );
      err.status = 403;
      throw err;
    }
  }

  return { userId, labels };
}

function _roleSnapshot(labels) {
  if (labels.includes("admin")) return "admin";
  if (labels.includes("operator")) return "operator";
  return "client";
}

async function logActivity(
  db,
  action,
  entityType,
  entityId,
  actorId,
  labels,
  details = {},
  opts = {},
) {
  try {
    if (labels.includes("root")) return; // ghost-user rule: root leaves no trace
    const detailsStr = JSON.stringify(details).slice(0, 4000);
    const { ipAddress, source = "function", route, requestId } = opts;
    await db.createDocument(DB, "admin_activity_logs", ID.unique(), {
      userId: actorId,
      action,
      entityType,
      entityId,
      details: detailsStr,
      severity: opts.severity || "info",
      result: opts.result || "ok",
      source,
      actorRoleSnapshot: _roleSnapshot(labels),
      ...(ipAddress ? { ipAddress } : {}),
      ...(route ? { route } : {}),
      ...(requestId ? { requestId } : {}),
    });
  } catch {
    // Non-critical — don't fail the whole operation because of a log error
  }
}

/**
 * Archives all child documents for cascade operations.
 * Sets archiveReason to "cascade-of:PARENT_ID" so restoring can reverse this.
 */
async function cascadeArchive(
  db,
  parentCollection,
  parentId,
  actorId,
  now,
  reason,
) {
  const cascadeConfig = CASCADE_MAP[parentCollection];
  if (!cascadeConfig) return;

  for (const [childCollection, foreignKey] of Object.entries(cascadeConfig)) {
    const isSlotsCollection = childCollection === "slots";
    const nowIso = now.toISOString();

    try {
      let queries = [
        Query.equal(foreignKey, parentId),
        Query.isNull("archivedAt"),
        Query.limit(500),
      ];

      // For slots: only archive FUTURE slots (past ones are historical)
      if (isSlotsCollection) {
        queries.push(Query.greaterThanEqual("startDatetime", nowIso));
      }

      const { documents } = await db.listDocuments(
        DB,
        childCollection,
        queries,
      );

      for (const doc of documents) {
        await db.updateDocument(DB, childCollection, doc.$id, {
          archivedAt: nowIso,
          archivedBy: actorId,
          archiveReason: `cascade-of:${parentId}${reason ? ` | ${reason}` : ""}`,
        });
      }
    } catch (err) {
      // Log but don't abort the parent archive
      console.error(
        `Cascade archive failed for ${childCollection}: ${err.message}`,
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

  const { collectionId, documentId, reason = "", cascade = true } = body || {};

  // Validate inputs
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
        error: `Collection "${collectionId}" does not support archiving`,
      },
      400,
    );
  }

  try {
    // Check permissions
    const { labels: actorLabels } = await assertCanArchive(
      users,
      userId,
      collectionId,
    );

    // Get current document
    const doc = await db.getDocument(DB, collectionId, documentId);

    // Idempotent: already archived
    if (doc.archivedAt) {
      log(
        `Document ${documentId} in ${collectionId} is already archived — returning OK`,
      );
      return res.json({ ok: true, alreadyArchived: true });
    }

    const now = new Date();
    const nowIso = now.toISOString();

    // Build update payload — normalize legacy status="archived" in the same patch
    // so Appwrite's enum validation on the merged document doesn't fail.
    const updatePayload = {
      archivedAt: nowIso,
      archivedBy: userId,
      archiveReason: reason || null,
    };
    if (doc.status === "archived") {
      updatePayload.status = "draft";
      log(
        `Normalizing legacy status="archived" for ${collectionId}/${documentId}`,
      );
    }

    // Archive the document
    await db.updateDocument(DB, collectionId, documentId, updatePayload);

    log(`Archived ${collectionId}/${documentId} by ${userId}`);

    // Cascade to children if applicable
    if (cascade && CASCADE_MAP[collectionId]) {
      await cascadeArchive(db, collectionId, documentId, userId, now, reason);
      log(`Cascaded archive from ${collectionId}/${documentId}`);
    }

    // Log activity
    await logActivity(
      db,
      "archive",
      collectionId,
      documentId,
      userId,
      actorLabels,
      { reason, cascade, cascaded: cascade && !!CASCADE_MAP[collectionId] },
      { ipAddress: ip, source: "function" },
    );

    return res.json({ ok: true });
  } catch (err) {
    error(`archive-document error: ${err.message}`);
    return res.json({ ok: false, error: err.message }, err.status || 500);
  }
};
