const fs = require("fs");
const data = JSON.parse(
  fs.readFileSync(process.env.TEMP + "/vars_full.json", "utf8"),
);
const envContent = fs.readFileSync(".env", "utf8");

// Parse .env keys (exclude VITE_, APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, APPWRITE_API_KEY)
const SKIP = [
  "VITE_SITE_URL",
  "APPWRITE_ENDPOINT",
  "APPWRITE_PROJECT_ID",
  "APPWRITE_API_KEY",
];
const envKeys = envContent
  .split("\n")
  .filter((l) => l.trim() && !l.startsWith("#"))
  .map((l) => l.split("=")[0].trim())
  .filter((k) => !SKIP.includes(k));

const globalKeys = data.variables.map((v) => v.key);

const inEnvNotGlobal = envKeys.filter((k) => !globalKeys.includes(k));
const inGlobalNotEnv = globalKeys.filter((k) => !envKeys.includes(k));

console.log("ENV keys (server-side):", envKeys.length);
console.log("Global vars in Appwrite:", globalKeys.length);
console.log("");

if (inEnvNotGlobal.length) {
  console.log(
    "In .env but NOT in global vars (" + inEnvNotGlobal.length + "):",
  );
  inEnvNotGlobal.forEach((k) => console.log("  MISSING: " + k));
} else {
  console.log("All .env keys are covered in global vars");
}
console.log("");
if (inGlobalNotEnv.length) {
  console.log(
    "In global vars but NOT in .env (" + inGlobalNotEnv.length + "):",
  );
  inGlobalNotEnv.forEach((k) => console.log("  EXTRA: " + k));
} else {
  console.log("No extra vars beyond .env");
}

console.log("\n--- All 54 global keys ---");
globalKeys.sort().forEach((k) => console.log("  " + k));
