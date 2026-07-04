const fs = require("fs");
const current = JSON.parse(
  fs.readFileSync("temp_prod_vars_compare.json", "utf8"),
);
const currentKeys = new Set(current.variables.map((v) => v.key));
const envRaw = fs.readFileSync(".env.prod", "utf8");
const skip = new Set([
  "VITE_UNDER_CONSTRUCTION",
  "VITE_SITE_URL",
  "APPWRITE_API_KEY",
]);
const env = {};
for (const line of envRaw.split("\n")) {
  const t = line.trim();
  if (!t || t.startsWith("#")) continue;
  const i = t.indexOf("=");
  if (i === -1) continue;
  const k = t.slice(0, i).trim();
  if (skip.has(k)) continue;
  env[k] = t.slice(i + 1).trim();
}
if (!env.APPWRITE_FUNCTION_SEND_NOTIFICATION) {
  env.APPWRITE_FUNCTION_SEND_NOTIFICATION = "send-notification";
}
const missing = Object.keys(env).filter((k) => !currentKeys.has(k));
console.log("TOTAL_CURRENT", current.total);
console.log("TOTAL_DESIRED", Object.keys(env).length);
console.log("MISSING");
for (const key of missing) console.log(`${key}=${env[key]}`);
console.log("COUNT", missing.length);
