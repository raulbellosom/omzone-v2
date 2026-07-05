const fs = require("fs");
const path = require("path");
const root = path.resolve(__dirname, "..");
const raw = fs.readFileSync(path.join(root, ".env.prod"), "utf8");
const SKIP = new Set([
  "APPWRITE_API_KEY",
  "VITE_UNDER_CONSTRUCTION",
  "VITE_SITE_URL",
]);
const vars = {};
for (const line of raw.split("\n")) {
  const t = line.trim();
  if (!t || t[0] === "#") continue;
  const i = t.indexOf("=");
  if (i === -1) continue;
  const k = t.slice(0, i).trim();
  const v = t.slice(i + 1).trim();
  if (!SKIP.has(k)) vars[k] = v;
}
fs.writeFileSync(
  path.join(root, "temp_prod_site_vars.json"),
  JSON.stringify(vars, null, 2),
);
console.log("Total vars:", Object.keys(vars).length);
Object.entries(vars)
  .slice(0, 5)
  .forEach(([k, v]) => console.log(k, "=", v));
