#!/usr/bin/env node
/**
 * Fix global project variables that have single-quote wrappers.
 *
 * Root cause: push-global-vars.mjs ran through cmd.exe which does NOT strip
 * single quotes, so values were stored as `'omzone_db'` instead of `omzone_db`.
 *
 * Usage:
 *   1. First capture the list (must be done in an interactive terminal):
 *        appwrite project list-variables --json > /tmp/appwrite_vars.json
 *   2. Then run this script:
 *        node scripts/fix-global-vars.mjs
 */
import { execSync } from "child_process";
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

// ─── Parse .env ──────────────────────────────────────────────────────────────
const envPath = resolve(root, ".env");
const envRaw = readFileSync(envPath, "utf8");
const envVars = {};
for (const line of envRaw.split("\n")) {
  const t = line.trim();
  if (!t || t.startsWith("#")) continue;
  const idx = t.indexOf("=");
  if (idx === -1) continue;
  envVars[t.slice(0, idx).trim()] = t.slice(idx + 1).trim();
}

// Keys to skip (not stored as global vars, or intentionally kept)
const SKIP = new Set(["VITE_UNDER_CONSTRUCTION", "VITE_SITE_URL"]);

// ─── Load variable list from pre-saved JSON ───────────────────────────────────
// Requires: appwrite project list-variables --json > temp_vars_list.json
// (in bash: /tmp/appwrite_vars.json won't work on Windows Node.js — use project root)
const varListPath = resolve(root, "temp_vars_list.json");
if (!existsSync(varListPath)) {
  console.error("Missing variable list. Run first (in bash):");
  console.error(
    "  appwrite project list-variables --json > /d/RacoonDevs/omzone-v2/temp_vars_list.json",
  );
  process.exit(1);
}
const { variables } = JSON.parse(readFileSync(varListPath, "utf8"));
console.log(
  `Loaded ${variables.length} existing variables from ${varListPath}\n`,
);

// Build map: key -> { id, currentValue }
const idMap = {};
for (const v of variables) {
  idMap[v.key] = { id: v["$id"], currentValue: v.value };
}

// ─── Fix loop ─────────────────────────────────────────────────────────────────
const BASH = "C:\\Program Files\\Git\\bin\\bash.exe";
const sh = (cmd) => execSync(cmd, { shell: BASH, stdio: "pipe" }).toString();
const trysh = (cmd) => {
  try {
    sh(cmd);
    return true;
  } catch {
    return false;
  }
};

let fixed = 0,
  skipped = 0,
  failed = 0;

for (const [key, cleanVal] of Object.entries(envVars)) {
  if (SKIP.has(key)) {
    skipped++;
    continue;
  }

  const entry = idMap[key];
  if (!entry) {
    console.log(`  NOT_IN_AW  ${key}`);
    skipped++;
    continue;
  }

  const { id, currentValue } = entry;

  // Only fix values wrapped in single or double quotes
  const needsFix =
    (currentValue.startsWith("'") && currentValue.endsWith("'")) ||
    (currentValue.startsWith('"') && currentValue.endsWith('"'));

  if (!needsFix) {
    console.log(`  ALREADY_OK ${key}`);
    skipped++;
    continue;
  }

  // Delete existing variable
  if (!trysh(`appwrite project delete-variable --variable-id "${id}"`)) {
    console.error(`  FAIL_DEL   ${key}`);
    failed++;
    continue;
  }

  await new Promise((r) => setTimeout(r, 100));

  // Recreate with clean value — escape double quotes in value for bash
  const escaped = cleanVal.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  if (
    !trysh(
      `appwrite project create-variable --key "${key}" --value "${escaped}" --secret false`,
    )
  ) {
    console.error(`  FAIL_CRE   ${key}`);
    failed++;
    continue;
  }

  console.log(
    `  OK         ${key}  ('${currentValue.slice(1, -1).slice(0, 30)}' → clean)`,
  );
  fixed++;
  await new Promise((r) => setTimeout(r, 100));
}

// ─── Summary ──────────────────────────────────────────────────────────────────
console.log(`\n${"─".repeat(60)}`);
console.log(`Fixed: ${fixed}  |  Skipped: ${skipped}  |  Failed: ${failed}`);
if (fixed > 0) {
  console.log(
    "\nNext: redeploy all functions so they pick up the corrected values:",
  );
  console.log("  appwrite push functions");
}
if (failed > 0) {
  console.log("\nSome variables failed — check errors above and retry.");
}
