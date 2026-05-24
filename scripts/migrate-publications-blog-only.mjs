/**
 * Migration: publications → blog-only
 *
 * What this does:
 *  1. Fetches ALL publications (including archived).
 *  2. For each publication:
 *     - Sets category = "blog" (was: landing | blog | highlight | institutional | faq)
 *     - Maps the old category to a tag so context is preserved:
 *         faq          → tags include "faq"
 *         institutional → tags include "institutional"
 *         landing      → tags include "landing"
 *         highlight    → tags include "featured"
 *         blog         → no extra tag added
 *     - Copies experienceId → suggestedExperienceId (if set)
 *  3. Only updates documents that actually need changing (idempotent).
 *
 * Usage:
 *   # Dry run (no writes):
 *   APPWRITE_API_KEY=<key> node scripts/migrate-publications-blog-only.mjs
 *
 *   # Real run:
 *   APPWRITE_API_KEY=<key> node scripts/migrate-publications-blog-only.mjs --apply
 */

import { Client, Databases, Query } from "node-appwrite";

const DRY_RUN = !process.argv.includes("--apply");

const client = new Client()
  .setEndpoint("https://aprod.racoondevs.com/v1")
  .setProject("omzone-dev")
  .setKey(process.env.APPWRITE_API_KEY);

const db = new Databases(client);
const DB = "omzone_db";
const COL = "publications";

const CATEGORY_TAG_MAP = {
  faq: "faq",
  institutional: "institutional",
  landing: "landing",
  highlight: "featured",
  blog: null, // no extra tag
};

// ─── Fetch all publications (paginated) ──────────────────────────────────────

async function fetchAll() {
  const all = [];
  let cursor = null;

  while (true) {
    const queries = [Query.limit(100), Query.orderAsc("$id")];
    if (cursor) queries.push(Query.cursorAfter(cursor));

    const res = await db.listDocuments(DB, COL, queries);
    all.push(...res.documents);

    if (res.documents.length < 100) break;
    cursor = res.documents[res.documents.length - 1].$id;
  }

  return all;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function run() {
  console.log(`\n📋  Publications → blog-only migration`);
  console.log(`    Mode: ${DRY_RUN ? "DRY RUN (no writes)" : "APPLY"}\n`);

  let docs;
  try {
    docs = await fetchAll();
  } catch (err) {
    console.error("❌  Failed to fetch publications:", err.message);
    process.exit(1);
  }

  console.log(`  Found ${docs.length} publications.\n`);

  let updated = 0;
  let skipped = 0;
  let errored = 0;

  for (const doc of docs) {
    const oldCategory = doc.category;
    const oldExperienceId = doc.experienceId || null;
    const existingTags = Array.isArray(doc.tags) ? [...doc.tags] : [];

    // Determine extra tag from old category
    const extraTag = CATEGORY_TAG_MAP[oldCategory] ?? null;

    // Build new tags array (add extraTag if not already present)
    const newTags =
      extraTag && !existingTags.includes(extraTag)
        ? [...existingTags, extraTag]
        : existingTags;

    // Determine suggestedExperienceId
    const newSuggestedExperienceId =
      doc.suggestedExperienceId || oldExperienceId || null;

    // Check if anything needs to change
    const needsCategoryFix = oldCategory !== "blog";
    const needsTagFix = extraTag && !existingTags.includes(extraTag);
    const needsExpIdMigration = oldExperienceId && !doc.suggestedExperienceId;

    if (!needsCategoryFix && !needsTagFix && !needsExpIdMigration) {
      console.log(`  ⊘  ${doc.$id} — already up to date (${doc.slug})`);
      skipped++;
      continue;
    }

    const patch = {};
    if (needsCategoryFix) patch.category = "blog";
    if (needsTagFix) patch.tags = newTags;
    if (needsExpIdMigration)
      patch.suggestedExperienceId = newSuggestedExperienceId;

    const changes = Object.entries(patch)
      .map(([k, v]) => `${k}=${JSON.stringify(v)}`)
      .join(", ");

    console.log(`  ✎  ${doc.$id} (${doc.slug})`);
    console.log(
      `       was: category=${oldCategory}, experienceId=${oldExperienceId}`,
    );
    console.log(`       set: ${changes}`);

    if (!DRY_RUN) {
      try {
        await db.updateDocument(DB, COL, doc.$id, patch);
        updated++;
      } catch (err) {
        console.error(`     ❌  Update failed: ${err.message}`);
        errored++;
      }
    } else {
      updated++;
    }
  }

  console.log(`\n─────────────────────────────────────────`);
  console.log(`  Total:   ${docs.length}`);
  console.log(`  Updated: ${updated}${DRY_RUN ? " (dry run)" : ""}`);
  console.log(`  Skipped: ${skipped}`);
  if (errored) console.log(`  Errors:  ${errored}`);
  console.log(`─────────────────────────────────────────\n`);

  if (DRY_RUN) {
    console.log(
      "  ℹ️  This was a dry run. Re-run with --apply to make changes.\n",
    );
  } else {
    console.log("  ✅  Migration complete.\n");
  }
}

run();
