/**
 * Push missing global project vars to PROD using .env.prod as source.
 * Create-only strategy: if var already exists (409), skip it.
 * This does not require project.read scope.
 */

import { execSync } from "child_process";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const BASH = "C:\\Program Files\\Git\\bin\\bash.exe";

const envRaw = readFileSync(resolve(root, ".env.prod"), "utf8");
const env = {};
for (const line of envRaw.split("\n")) {
  const t = line.trim();
  if (!t || t.startsWith("#")) continue;
  const i = t.indexOf("=");
  if (i === -1) continue;
  env[t.slice(0, i).trim()] = t.slice(i + 1).trim();
}

// Required extra var not always present in .env.prod historically
env.APPWRITE_FUNCTION_SEND_NOTIFICATION =
  env.APPWRITE_FUNCTION_SEND_NOTIFICATION || "send-notification";

const SKIP_KEYS = new Set([
  "VITE_UNDER_CONSTRUCTION",
  "VITE_SITE_URL",
  "APPWRITE_API_KEY",
]);

let created = 0;
let skipped = 0;
let failed = 0;

for (const [key, value] of Object.entries(env)) {
  if (SKIP_KEYS.has(key)) continue;
  const escaped = value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  const cmd = `appwrite project create-variable --key "${key}" --value "${escaped}" --secret false`;
  try {
    execSync(cmd, { shell: BASH, stdio: "pipe" });
    console.log(`CREATED ${key}`);
    created++;
  } catch (e) {
    const out = (e.stdout?.toString() || "") + (e.stderr?.toString() || "");
    if (out.includes("409") || out.toLowerCase().includes("already")) {
      console.log(`SKIP ${key}`);
      skipped++;
    } else {
      console.log(`FAIL ${key}`);
      failed++;
    }
  }
}

console.log(`\nSUMMARY created=${created} skipped=${skipped} failed=${failed}`);
if (failed > 0) process.exit(1);
