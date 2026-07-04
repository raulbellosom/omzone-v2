/**
 * OMZONE — Push all global project variables to Appwrite via CLI
 * Uses values from a chosen env file. All vars are non-secret.
 * Run:
 *   node scripts/push-global-vars.mjs            # uses .env
 *   node scripts/push-global-vars.mjs .env.prod  # uses .env.prod
 */

import { execSync } from "child_process";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envFile = process.argv[2] || ".env";
const envPath = resolve(__dirname, "..", envFile);

try {
  readFileSync(envPath, "utf8");
} catch {
  console.error(`Missing env file: ${envFile}`);
  process.exit(1);
}

// Parse selected env file
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

// Keys to skip (not project-level global vars)
const SKIP_KEYS = new Set([
  "VITE_UNDER_CONSTRUCTION",
  "VITE_SITE_URL",
  "APPWRITE_API_KEY", // never store API key as a var
]);

// Keys to include — all env keys that go into Appwrite global vars
const vars = Object.entries(env).filter(([key]) => !SKIP_KEYS.has(key));

// Use bash so single/double quote handling works correctly on Windows.
// cmd.exe does NOT strip single quotes, causing values like 'omzone_db' literally.
const BASH = "C:\\Program Files\\Git\\bin\\bash.exe";

let ok = 0,
  skip = 0,
  fail = 0;

for (const [key, value] of vars) {
  // Escape double quotes in the value for bash
  const escaped = value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  const cmd = `appwrite project create-variable --key "${key}" --value "${escaped}" --secret false`;
  try {
    execSync(cmd, { shell: BASH, stdio: "pipe" });
    console.log(`✅ ${key}`);
    ok++;
  } catch (e) {
    const out = e.stdout?.toString() || "";
    const err = e.stderr?.toString() || "";
    if (
      out.includes("409") ||
      err.includes("409") ||
      out.includes("already") ||
      err.includes("already")
    ) {
      console.log(`⏭️  ${key} (already exists)`);
      skip++;
    } else {
      console.error(`❌ ${key}: ${err.trim() || out.trim()}`);
      fail++;
    }
  }
}

console.log(`\n══════════════════════════════`);
console.log(`✅ Created: ${ok}  ⏭️ Skipped: ${skip}  ❌ Failed: ${fail}`);
console.log(`══════════════════════════════`);
