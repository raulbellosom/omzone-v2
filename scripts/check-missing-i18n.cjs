/**
 * Cross-reference all t("admin.*") calls in src/ against EN and ES JSON.
 * Reports keys used in code but missing from either locale file.
 */
const fs = require("fs");
const { execSync } = require("child_process");

function flatten(obj, prefix) {
  const result = {};
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (typeof v === "object" && v !== null) {
      Object.assign(result, flatten(v, key));
    } else {
      result[key] = v;
    }
  }
  return result;
}

const en = flatten(JSON.parse(fs.readFileSync("src/i18n/en/admin.json", "utf8")));
const es = flatten(JSON.parse(fs.readFileSync("src/i18n/es/admin.json", "utf8")));

function walk(dir) {
  let results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = require("path").join(dir, entry.name);
    if (entry.isDirectory()) results = results.concat(walk(full));
    else if (/\.(jsx?|js)$/.test(entry.name)) results.push(full);
  }
  return results;
}
const files = walk("src");

const usedKeys = new Set();
const re = /t\(["']([^"']+)["']\)/g;

for (const f of files) {
  try {
    const content = fs.readFileSync(f, "utf8");
    let m;
    while ((m = re.exec(content)) !== null) {
      if (m[1].startsWith("admin.")) usedKeys.add(m[1]);
    }
  } catch (e) {
    // skip unreadable
  }
}

const missEN = [];
const missES = [];
for (const k of usedKeys) {
  if (!(k in en)) missEN.push(k);
  if (!(k in es)) missES.push(k);
}

if (missEN.length) {
  console.log("Missing in EN (" + missEN.length + "):");
  missEN.sort().forEach((k) => console.log("  " + k));
}
if (missES.length) {
  console.log("Missing in ES (" + missES.length + "):");
  missES.sort().forEach((k) => console.log("  " + k));
}
if (missEN.length === 0 && missES.length === 0) {
  console.log("All " + usedKeys.size + " admin.* keys present in both EN and ES");
}

// Also write to file for easy inspection
const lines = [];
if (missEN.length) {
  lines.push("Missing in EN (" + missEN.length + "):");
  missEN.sort().forEach((k) => lines.push("  " + k));
}
if (missES.length) {
  lines.push("Missing in ES (" + missES.length + "):");
  missES.sort().forEach((k) => lines.push("  " + k));
}
if (lines.length === 0) {
  lines.push("All " + usedKeys.size + " admin.* keys present in both EN and ES");
}
fs.writeFileSync("tmp-i18n-report.txt", lines.join("\n") + "\n");
console.log("Report written to tmp-i18n-report.txt (" + lines.length + " lines)");
