/**
 * Seed-all runner — executes all OMZONE seed scripts in dependency order.
 *
 * Run with:  APPWRITE_API_KEY=<key> node scripts/seed-all.mjs
 *
 * Order:
 *  1. seed-test-data.mjs               (locations, rooms, resources, addons, addon assignments, slots, slot resources)
 *  2. seed-experiences.mjs              (tags, experiences, editions, pricing tiers, exp-tags)
 *  3. seed-pricing-rules.mjs           (pricing rules for tiers)
 *  4. seed-passes.mjs                  (pass templates)
 *  5. seed-packages.mjs                (packages, package items)
 *  6. seed-publications.mjs            (publications, sections)
 *  7. seed-notification-templates.mjs  (email templates)
 *  8. seed-reminder-template.mjs       (reminder templates)
 *  9. seed-settings.mjs                (site settings)
 */

import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const scripts = [
  "seed-test-data.mjs",
  "seed-experiences.mjs",
  "seed-pricing-rules.mjs",
  "seed-passes.mjs",
  "seed-packages.mjs",
  "seed-publications.mjs",
  "seed-notification-templates.mjs",
  "seed-reminder-template.mjs",
  "seed-settings.mjs",
];

console.log("🌿 OMZONE — Running all seed scripts\n");

for (const script of scripts) {
  const scriptPath = join(__dirname, script);
  console.log(`\n${"═".repeat(60)}`);
  console.log(`▶ ${script}`);
  console.log("═".repeat(60));
  try {
    execFileSync("node", [scriptPath], {
      stdio: "inherit",
      env: process.env,
    });
  } catch {
    console.error(`\n✗ ${script} failed — continuing with next script.`);
  }
}

console.log(`\n${"═".repeat(60)}`);
console.log("✅ All seed scripts executed.");
console.log("═".repeat(60));
