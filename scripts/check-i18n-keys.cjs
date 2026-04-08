const en = require("../src/i18n/en/admin.json");
const es = require("../src/i18n/es/admin.json");

function flatten(obj, prefix) {
  let keys = [];
  for (const k of Object.keys(obj)) {
    const path = prefix ? prefix + "." + k : k;
    if (typeof obj[k] === "object" && obj[k] !== null) {
      keys = keys.concat(flatten(obj[k], path));
    } else {
      keys.push(path);
    }
  }
  return keys;
}

const enKeys = new Set(flatten(en, ""));
const esKeys = new Set(flatten(es, ""));

const missingInEs = Array.from(enKeys).filter((k) => !esKeys.has(k));
const missingInEn = Array.from(esKeys).filter((k) => !enKeys.has(k));

console.log("=== Missing in ES (" + missingInEs.length + ") ===");
missingInEs.forEach((k) => console.log("  " + k));

console.log("\n=== Missing in EN (" + missingInEn.length + ") ===");
missingInEn.forEach((k) => console.log("  " + k));

console.log("\n=== EN total keys: " + enKeys.size + " ===");
console.log("=== ES total keys: " + esKeys.size + " ===");
