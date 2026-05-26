const fs = require("fs");
const path = require("path");

const current = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, "../temp_vars_list.json"), "utf8"),
);
const currentKeys = new Set(current.variables.map((v) => v.key));

const envRaw = fs.readFileSync(path.resolve(__dirname, "../.env"), "utf8");
const SKIP = new Set([
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
  if (!SKIP.has(k)) env[k] = t.slice(i + 1).trim();
}

const missing = Object.keys(env).filter((k) => !currentKeys.has(k));
console.log("Total in Appwrite:", current.total);
console.log("Total in .env (excl skip):", Object.keys(env).length);
console.log("\nMISSING (in .env but NOT in Appwrite):");
missing.forEach((k) => console.log(" -", k, "=", env[k]));
console.log("\nTotal missing:", missing.length);
