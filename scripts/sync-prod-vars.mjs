/**
 * OMZONE — Sync global project variables to Appwrite PROD (project: omzone)
 *
 * This script:
 *  1. Reads .env.prod as the source of truth for all prod variable values.
 *  2. Lists existing project variables (requires session auth — run appwrite login first).
 *  3. Creates missing vars, updates vars with wrong values.
 *  4. Deletes bad function-level secret vars that override globals (empty, secret=true).
 *
 * Prerequisites:
 *   appwrite login --endpoint https://aprod.racoondevs.com/v1
 *   appwrite client --endpoint https://aprod.racoondevs.com/v1 --project-id omzone
 *
 * Usage:
 *   node scripts/sync-prod-vars.mjs
 */

import { execSync } from "child_process";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const BASH = "C:\\Program Files\\Git\\bin\\bash.exe";

const sh = (cmd) =>
  execSync(cmd, { shell: BASH, stdio: "pipe" }).toString().trim();
const trysh = (cmd) => {
  try {
    sh(cmd);
    return true;
  } catch {
    return false;
  }
};

// ─── Parse .env.prod ──────────────────────────────────────────────────────────
const envRaw = readFileSync(resolve(root, ".env.prod"), "utf8");
const desired = {};
for (const line of envRaw.split("\n")) {
  const t = line.trim();
  if (!t || t.startsWith("#")) continue;
  const idx = t.indexOf("=");
  if (idx === -1) continue;
  desired[t.slice(0, idx).trim()] = t.slice(idx + 1).trim();
}

// Extra vars not in .env.prod but required globally
desired["APPWRITE_FUNCTION_SEND_NOTIFICATION"] = "send-notification";

// Keys to skip (frontend-only flags or secrets that must NOT be stored as vars)
const SKIP_KEYS = new Set([
  "VITE_UNDER_CONSTRUCTION",
  "VITE_SITE_URL",
  "APPWRITE_API_KEY",
]);

const filteredVars = Object.entries(desired).filter(([k]) => !SKIP_KEYS.has(k));
console.log(
  `\n📋 Variables to sync: ${filteredVars.length} (from .env.prod + extras)\n`,
);

// ─── List existing project variables ─────────────────────────────────────────
console.log("⏳ Fetching current project variables...");
let existingVars = [];
try {
  const raw = sh("appwrite project list-variables --json");
  const parsed = JSON.parse(raw);
  existingVars = parsed.variables || [];
  console.log(`   Found ${existingVars.length} existing variables.\n`);
} catch (e) {
  console.error("❌ Could not list project variables.");
  console.error(
    "   Make sure you ran: appwrite login --endpoint https://aprod.racoondevs.com/v1",
  );
  console.error("   Error:", e.message);
  process.exit(1);
}

// Build map: key → { $id, value, secret }
const existingMap = {};
for (const v of existingVars) {
  existingMap[v.key] = { id: v["$id"], value: v.value, secret: v.secret };
}

// ─── Sync global project variables ───────────────────────────────────────────
console.log("═".repeat(60));
console.log("STEP 1 — Syncing global project variables");
console.log("═".repeat(60));

let created = 0,
  updated = 0,
  alreadyOk = 0,
  failed = 0;

for (const [key, value] of filteredVars) {
  const escaped = value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  const existing = existingMap[key];

  if (!existing) {
    const ok = trysh(
      `appwrite project create-variable --key "${key}" --value "${escaped}" --secret false`,
    );
    if (ok) {
      console.log(`  ✅ CREATED   ${key}`);
      created++;
    } else {
      console.error(`  ❌ FAIL_CRE  ${key}`);
      failed++;
    }
  } else if (existing.value === value && !existing.secret) {
    console.log(`  ⏭️  OK        ${key}`);
    alreadyOk++;
  } else {
    const reasonParts = [];
    if (existing.value !== value) {
      reasonParts.push(
        `value: "${existing.value.slice(0, 30)}" → "${value.slice(0, 30)}"`,
      );
    }
    if (existing.secret) reasonParts.push("secret:true → false");
    console.log(`  🔄 UPDATING  ${key}  (${reasonParts.join(", ")})`);

    const del = trysh(
      `appwrite project delete-variable --variable-id "${existing.id}"`,
    );
    if (!del) {
      console.error(`  ❌ FAIL_DEL  ${key}`);
      failed++;
      continue;
    }
    await new Promise((r) => setTimeout(r, 150));

    const ok = trysh(
      `appwrite project create-variable --key "${key}" --value "${escaped}" --secret false`,
    );
    if (ok) {
      updated++;
    } else {
      console.error(`  ❌ FAIL_CRE  ${key} (after delete)`);
      failed++;
    }
  }
  await new Promise((r) => setTimeout(r, 80));
}

console.log(
  `\nGlobal vars: ✅ Created: ${created}  🔄 Updated: ${updated}  ⏭️ Already OK: ${alreadyOk}  ❌ Failed: ${failed}\n`,
);

// ─── Delete bad function-level vars ──────────────────────────────────────────
console.log("═".repeat(60));
console.log("STEP 2 — Deleting incorrect function-level vars");
console.log("         (empty secret vars that override global vars)");
console.log("═".repeat(60));

// These were created incorrectly during prod setup and have empty secret values.
// All env vars must be global project-level only.
const BAD_FUNCTION_VARS = [
  // send-confirmation
  {
    functionId: "send-confirmation",
    varId: "6a0a19be8ffac32c9c88",
    key: "EMAIL_PROVIDER",
  },
  {
    functionId: "send-confirmation",
    varId: "6a0a19c7c7e149bae3ff",
    key: "EMAIL_FROM",
  },
  {
    functionId: "send-confirmation",
    varId: "6a0a19cfb1cb17ff7d79",
    key: "SMTP_HOST",
  },
  {
    functionId: "send-confirmation",
    varId: "6a0a19d049022037560f",
    key: "SMTP_PORT",
  },
  {
    functionId: "send-confirmation",
    varId: "6a0a19da8e01c063057e",
    key: "SMTP_USER",
  },
  {
    functionId: "send-confirmation",
    varId: "6a0a19db1e98cbb3676f",
    key: "SMTP_PASS",
  },
  // create-checkout
  {
    functionId: "create-checkout",
    varId: "6a0a19c95a8ddf58f530",
    key: "EMAIL_PROVIDER",
  },
  {
    functionId: "create-checkout",
    varId: "6a0a19d1cd0a79f45af4",
    key: "EMAIL_FROM",
  },
  {
    functionId: "create-checkout",
    varId: "6a0a19ddb11da22485e8",
    key: "SMTP_HOST",
  },
  {
    functionId: "create-checkout",
    varId: "6a0a19de3f174da16bd1",
    key: "SMTP_PORT",
  },
  {
    functionId: "create-checkout",
    varId: "6a0a19e7c55eabe8577d",
    key: "SMTP_USER",
  },
  {
    functionId: "create-checkout",
    varId: "6a0a19e851a413f1a06f",
    key: "SMTP_PASS",
  },
  // send-notification
  {
    functionId: "send-notification",
    varId: "6a0a19c8583cf03ecbf8",
    key: "EMAIL_PROVIDER",
  },
  {
    functionId: "send-notification",
    varId: "6a0a19d0c87eb4b78ba3",
    key: "EMAIL_FROM",
  },
  {
    functionId: "send-notification",
    varId: "6a0a19db9fff8e716d37",
    key: "SMTP_HOST",
  },
  {
    functionId: "send-notification",
    varId: "6a0a19dc2c38dd52fbbf",
    key: "SMTP_PORT",
  },
  {
    functionId: "send-notification",
    varId: "6a0a19e5aecd54bf5b8c",
    key: "SMTP_USER",
  },
  {
    functionId: "send-notification",
    varId: "6a0a19e63ff91bd148a2",
    key: "SMTP_PASS",
  },
  // send-reminder
  {
    functionId: "send-reminder",
    varId: "6a0a19c8d37827ca30ec",
    key: "EMAIL_PROVIDER",
  },
  {
    functionId: "send-reminder",
    varId: "6a0a19d14e472c04e5d4",
    key: "EMAIL_FROM",
  },
  {
    functionId: "send-reminder",
    varId: "6a0a19dca7ac14e98d1d",
    key: "SMTP_HOST",
  },
  {
    functionId: "send-reminder",
    varId: "6a0a19dd3410cb0b3991",
    key: "SMTP_PORT",
  },
  {
    functionId: "send-reminder",
    varId: "6a0a19e6b9e26bd6dc89",
    key: "SMTP_USER",
  },
  {
    functionId: "send-reminder",
    varId: "6a0a19e74274ba8102a4",
    key: "SMTP_PASS",
  },
];

let delOk = 0,
  delFail = 0,
  delSkip = 0;
for (const { functionId, varId, key } of BAD_FUNCTION_VARS) {
  // First check if it still exists via list-variables for this function
  let exists = true;
  try {
    const raw = sh(
      `appwrite functions list-variables --function-id "${functionId}" --json`,
    );
    const parsed = JSON.parse(raw);
    exists = (parsed.variables || []).some((v) => v["$id"] === varId);
  } catch {
    // If we can't list, try to delete anyway
  }

  if (!exists) {
    console.log(`  ⏭️  ALREADY_GONE  [${functionId}] ${key}`);
    delSkip++;
    continue;
  }

  const ok = trysh(
    `appwrite functions delete-variable --function-id "${functionId}" --variable-id "${varId}"`,
  );
  if (ok) {
    console.log(`  ✅ DELETED    [${functionId}] ${key}`);
    delOk++;
  } else {
    console.error(`  ❌ FAIL_DEL   [${functionId}] ${key} (${varId})`);
    delFail++;
  }
  await new Promise((r) => setTimeout(r, 100));
}

console.log(
  `\nFunction vars: ✅ Deleted: ${delOk}  ⏭️ Already gone: ${delSkip}  ❌ Failed: ${delFail}\n`,
);

// ─── Summary ──────────────────────────────────────────────────────────────────
console.log("═".repeat(60));
console.log("SYNC COMPLETE");
console.log("═".repeat(60));
if (failed > 0 || delFail > 0) {
  console.log("⚠️  Some operations failed — review errors above.");
} else {
  console.log("✅ All operations succeeded!");
}
console.log(
  "\nNext step: redeploy functions so they pick up updated env vars:",
);
console.log("  appwrite push functions");
console.log("  → Select all (press 'a' then Enter)\n");
