import { Client, Databases, Users } from "node-appwrite";

// ── Constants ──────────────────────────────────────────────────────────────

const DB = "omzone_db";

/** Only these collections allow client-personal archiving (userArchivedAt) */
const PERSONAL_ARCHIVE_COLLECTIONS = new Set([
  "orders",
  "tickets",
  "user_passes",
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

// ── Main handler ───────────────────────────────────────────────────────────

export default async ({ req, res, log, error }) => {
  const client = initClient(req);
  const db = new Databases(client);
  const users = new Users(client);

  const userId = req.headers["x-appwrite-user-id"] || null;

  // Must be authenticated
  if (!userId) {
    return res.json({ ok: false, error: "Authentication required" }, 401);
  }

  let body;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  } catch {
    return res.json({ ok: false, error: "Invalid JSON body" }, 400);
  }

  const { collectionId, documentId, action } = body || {};

  // ── Input validation ────────────────────────────────────────────────────
  if (!collectionId || !documentId || !action) {
    return res.json(
      { ok: false, error: "collectionId, documentId and action are required" },
      400,
    );
  }
  if (!PERSONAL_ARCHIVE_COLLECTIONS.has(collectionId)) {
    return res.json(
      {
        ok: false,
        error: `Personal archiving is not available for collection "${collectionId}". Allowed: orders, tickets, user_passes`,
      },
      400,
    );
  }
  if (!["archive", "restore"].includes(action)) {
    return res.json(
      { ok: false, error: 'action must be "archive" or "restore"' },
      400,
    );
  }

  try {
    // ── Verify caller is an authenticated user ─────────────────────────────
    // (Appwrite's x-appwrite-user-id header is injected by the platform
    //  when the Function is called with a user JWT — we trust it here)
    await users.get(userId); // throws if user doesn't exist

    // ── Fetch document and verify ownership ───────────────────────────────
    let doc;
    try {
      doc = await db.getDocument(DB, collectionId, documentId);
    } catch (fetchErr) {
      return res.json(
        { ok: false, error: `Document not found: ${fetchErr.message}` },
        404,
      );
    }

    // Verify ownership: the document must belong to the calling user
    if (doc.userId !== userId) {
      return res.json(
        {
          ok: false,
          error: "You do not have permission to modify this document",
        },
        403,
      );
    }

    // ── Apply action ───────────────────────────────────────────────────────
    if (action === "archive") {
      // Idempotent: already personally archived
      if (doc.userArchivedAt) {
        return res.json({ ok: true, alreadyArchived: true });
      }
      await db.updateDocument(DB, collectionId, documentId, {
        userArchivedAt: new Date().toISOString(),
      });
      log(`Personal archive: ${collectionId}/${documentId} by user ${userId}`);
    } else {
      // Restore
      if (!doc.userArchivedAt) {
        return res.json({ ok: true, alreadyActive: true });
      }
      await db.updateDocument(DB, collectionId, documentId, {
        userArchivedAt: null,
      });
      log(`Personal restore: ${collectionId}/${documentId} by user ${userId}`);
    }

    return res.json({ ok: true });
  } catch (err) {
    error(`archive-personal error: ${err.message}`);
    return res.json({ ok: false, error: err.message }, err.status || 500);
  }
};
