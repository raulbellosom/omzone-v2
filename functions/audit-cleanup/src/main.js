/**
 * audit-cleanup — OMZONE Audit Retention Cron
 *
 * Deletes audit log documents older than 90 days from:
 *   - admin_activity_logs
 *   - system_event_logs
 *
 * Runs daily at 03:00 UTC (schedule: "0 3 * * *").
 * Processes in batches of 100 to stay within timeout budget (300s).
 *
 * Runtime: node-22
 * Scopes:  documents.read, documents.write, databases.read, collections.read
 */

import { Client, Databases, Query } from "node-appwrite";

// ── Constants ──────────────────────────────────────────────────────────────

const DB = process.env.APPWRITE_DATABASE_ID || "omzone_db";
const COL_ACTIVITY = "admin_activity_logs";
const COL_SYSTEM =
  process.env.APPWRITE_COLLECTION_SYSTEM_EVENT_LOGS || "system_event_logs";
const BATCH = 100;
const RETENTION_DAYS = 90;

// ── Helpers ────────────────────────────────────────────────────────────────

function initClient() {
  let endpoint = process.env.APPWRITE_FUNCTION_API_ENDPOINT;
  if (endpoint?.startsWith("http://")) {
    endpoint = endpoint.replace("http://", "https://");
  }
  return new Client()
    .setEndpoint(endpoint)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setSelfSigned(true)
    .setKey(process.env.APPWRITE_API_KEY);
}

/**
 * Deletes all documents in `collectionId` older than `cutoff` in batches.
 * Returns total deleted count.
 */
async function deleteOlderThan(db, collectionId, cutoff, log, error) {
  let total = 0;

  while (true) {
    let docs;
    try {
      const result = await db.listDocuments(DB, collectionId, [
        Query.lessThan("$createdAt", cutoff),
        Query.limit(BATCH),
      ]);
      docs = result.documents;
    } catch (err) {
      error(`[${collectionId}] listDocuments failed: ${err.message}`);
      break;
    }

    if (!docs || docs.length === 0) break;

    for (const doc of docs) {
      try {
        await db.deleteDocument(DB, collectionId, doc.$id);
        total += 1;
      } catch (err) {
        error(
          `[${collectionId}] deleteDocument ${doc.$id} failed: ${err.message}`,
        );
      }
    }

    log(
      `[${collectionId}] Deleted batch of ${docs.length} (running total: ${total})`,
    );

    // If we got fewer than BATCH, we're done
    if (docs.length < BATCH) break;
  }

  return total;
}

// ── Main handler ───────────────────────────────────────────────────────────

export default async ({ res, log, error }) => {
  const cutoff = new Date(
    Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000,
  ).toISOString();
  log(`Audit cleanup started. Deleting records older than ${cutoff}`);

  const client = initClient();
  const db = new Databases(client);

  const activityDeleted = await deleteOlderThan(
    db,
    COL_ACTIVITY,
    cutoff,
    log,
    error,
  );
  const systemDeleted = await deleteOlderThan(
    db,
    COL_SYSTEM,
    cutoff,
    log,
    error,
  );

  const summary = {
    cutoff,
    admin_activity_logs: activityDeleted,
    system_event_logs: systemDeleted,
    total: activityDeleted + systemDeleted,
  };

  log(`Audit cleanup complete: ${JSON.stringify(summary)}`);
  return res.json({ ok: true, ...summary });
};
