/**
 * Migration: Normalize legacy status="archived" documents
 *
 * Background:
 *   The "archived" enum value was removed from status fields in experiences,
 *   publications, and packages. Documents that still have status="archived" in
 *   the database now fail Appwrite's enum validation on any write operation,
 *   including archiving via the new archivedAt system.
 *
 * What this script does:
 *   For each target collection, it fetches all documents and filters those with
 *   status="archived". It then patches each one in a single call:
 *     { status: "draft", archivedAt: <now>, archiveReason: "migrated-from-legacy-status" }
 *   This is safe because Appwrite validates the FINAL merged state — supplying
 *   a valid status in the same patch resolves the invalid stored value.
 *
 * Run once from project root:
 *   node scripts/migrate-archived-status.mjs
 */

const ENDPOINT = "https://aprod.racoondevs.com/v1";
const PROJECT = "omzone-dev";
const API_KEY =
  "standard_3f208275bdff3b3bbf147f2a41f64240c737bbcde0a4a2cb209bf2fa91bedeff07ecca04ae6ea2470f11e316ce9dfb19778c778fb8d0247ddd864a17e369af111529327d007a07404012242ecfc88078e3308cbc9a4d5f1dbefbc2ad9fdaec71e016d763ccb81d67feb8d5858353b5f26fa371ce422b8774c21eead8af21e9aa";
const DATABASE = "omzone_db";

// Collections that had status="archived" as a valid value in the old schema
const TARGET_COLLECTIONS = ["experiences", "publications", "packages"];

const headers = {
  "Content-Type": "application/json",
  "X-Appwrite-Project": PROJECT,
  "X-Appwrite-Key": API_KEY,
};

async function apiFetch(method, path, body) {
  const url = `${ENDPOINT}${path}`;
  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(url, opts);
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text };
  }
  return { status: res.status, ok: res.ok, json };
}

/**
 * Fetch ALL documents from a collection using cursor pagination.
 * Does NOT filter by status — we filter in JS to avoid enum query issues.
 */
async function fetchAllDocuments(collectionId) {
  const all = [];
  let cursor = null;

  while (true) {
    const queryParams = new URLSearchParams({ limit: "100" });
    if (cursor) queryParams.set("cursor", cursor);

    const { ok, json } = await apiFetch(
      "GET",
      `/databases/${DATABASE}/collections/${collectionId}/documents?${queryParams}`,
    );

    if (!ok) {
      console.error(
        `  ✗ Failed to list ${collectionId}: ${JSON.stringify(json)}`,
      );
      break;
    }

    const docs = json.documents || [];
    all.push(...docs);

    if (docs.length < 100) break; // last page
    cursor = docs[docs.length - 1].$id;
  }

  return all;
}

async function migrateCollection(collectionId) {
  console.log(`\n── ${collectionId} ──`);

  const all = await fetchAllDocuments(collectionId);
  console.log(`  fetched ${all.length} total documents`);

  const legacy = all.filter((doc) => doc.status === "archived");
  console.log(`  found ${legacy.length} with status="archived"`);

  if (legacy.length === 0) {
    console.log("  nothing to migrate ✓");
    return { migrated: 0, failed: 0 };
  }

  const nowIso = new Date().toISOString();
  let migrated = 0;
  let failed = 0;

  for (const doc of legacy) {
    const payload = {
      status: "draft",
      // Only set archivedAt if not already set (shouldn't be, but be safe)
      ...(doc.archivedAt
        ? {}
        : {
            archivedAt: nowIso,
            archiveReason: "migrated-from-legacy-status",
          }),
    };

    const { ok, json } = await apiFetch(
      "PATCH",
      `/databases/${DATABASE}/collections/${collectionId}/documents/${doc.$id}`,
      { data: payload },
    );

    if (ok) {
      console.log(`  ✓ ${doc.$id}  ${doc.name || doc.publicName || ""}`);
      migrated++;
    } else {
      console.error(`  ✗ ${doc.$id} — ${JSON.stringify(json)}`);
      failed++;
    }
  }

  return { migrated, failed };
}

async function run() {
  console.log("=== migrate-archived-status ===");
  console.log(`Target: ${TARGET_COLLECTIONS.join(", ")}\n`);

  let totalMigrated = 0;
  let totalFailed = 0;

  for (const col of TARGET_COLLECTIONS) {
    const { migrated, failed } = await migrateCollection(col);
    totalMigrated += migrated;
    totalFailed += failed;
  }

  console.log("\n=== Summary ===");
  console.log(`  Migrated: ${totalMigrated}`);
  console.log(`  Failed:   ${totalFailed}`);

  if (totalFailed > 0) {
    console.error("\n⚠ Some documents failed. Check errors above.");
    process.exit(1);
  } else {
    console.log("\n✓ All done.");
  }
}

run().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
