/**
 * OMZONE — Sync missing global variables via REST API (no CLI session needed)
 * Uses API key from .env. Creates missing vars, skips existing ones.
 * Run: node scripts/sync-missing-vars.mjs
 */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "../.env");

// Parse .env
const envRaw = readFileSync(envPath, "utf8");
const env = {};
for (const line of envRaw.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const idx = trimmed.indexOf("=");
  if (idx === -1) continue;
  const key = trimmed.slice(0, idx).trim();
  const value = trimmed.slice(idx + 1).trim();
  env[key] = value;
}

const ENDPOINT = env.APPWRITE_ENDPOINT;
const PROJECT_ID = env.APPWRITE_PROJECT_ID;
const API_KEY = env.APPWRITE_API_KEY;

if (!ENDPOINT || !PROJECT_ID || !API_KEY) {
  console.error(
    "❌ Missing APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID or APPWRITE_API_KEY in .env",
  );
  process.exit(1);
}

const SKIP_KEYS = new Set([
  "VITE_UNDER_CONSTRUCTION",
  "VITE_SITE_URL",
  "APPWRITE_API_KEY",
]);

const headers = {
  "Content-Type": "application/json",
  "X-Appwrite-Key": API_KEY,
  "X-Appwrite-Project": PROJECT_ID,
};

// 1. List all existing global variables
async function listVars() {
  const res = await fetch(
    `${ENDPOINT}/project/variables?queries[]=limit(100)`,
    { headers },
  );
  if (!res.ok)
    throw new Error(`Failed to list vars: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.variables || [];
}

// 2. Create a variable
async function createVar(key, value) {
  const res = await fetch(`${ENDPOINT}/project/variables`, {
    method: "POST",
    headers,
    body: JSON.stringify({ key, value, secret: false }),
  });
  return res;
}

// 3. Update an existing variable
async function updateVar(id, key, value) {
  const res = await fetch(`${ENDPOINT}/project/variables/${id}`, {
    method: "PUT",
    headers,
    body: JSON.stringify({ key, value, secret: false }),
  });
  return res;
}

async function main() {
  console.log("🔍 Listing current global variables in Appwrite...\n");

  const existing = await listVars();
  const existingMap = {};
  for (const v of existing) existingMap[v.key] = v;

  console.log(`📦 Found ${existing.length} existing global variables\n`);

  const toProcess = Object.entries(env).filter(([key]) => !SKIP_KEYS.has(key));

  let created = 0,
    skipped = 0,
    failed = 0,
    missing = [];

  for (const [key, value] of toProcess) {
    if (existingMap[key]) {
      // Already exists — skip
      process.stdout.write(`⏭️  ${key}\n`);
      skipped++;
    } else {
      // Missing — create it
      missing.push(key);
      const res = await createVar(key, value);
      if (res.ok) {
        console.log(`✅ CREATED: ${key}`);
        created++;
      } else {
        const body = await res.text();
        console.error(`❌ FAILED:  ${key} → ${res.status} ${body}`);
        failed++;
      }
    }
  }

  console.log(`\n══════════════════════════════════════`);
  console.log(
    `✅ Created: ${created}  ⏭️ Skipped: ${skipped}  ❌ Failed: ${failed}`,
  );
  if (missing.length > 0) {
    console.log(`\n🆕 Variables created:`);
    for (const k of missing) console.log(`   - ${k}`);
  } else if (created === 0) {
    console.log(`\n✔️  All variables already existed — nothing to do.`);
  }
  console.log(`══════════════════════════════════════`);
}

main().catch((e) => {
  console.error("❌ Fatal:", e.message);
  process.exit(1);
});
