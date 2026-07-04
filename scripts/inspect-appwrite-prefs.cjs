const fs = require("fs");
const path = require("path");
const prefsPath = path.join(process.env.USERPROFILE, ".appwrite", "prefs.json");
const prefs = JSON.parse(fs.readFileSync(prefsPath, "utf8"));
console.log("current", prefs.current);
for (const [id, value] of Object.entries(prefs)) {
  if (id === "current") continue;
  if (
    value &&
    value.endpoint === "https://aprod.racoondevs.com/v1" &&
    (value.cookie || value.projectId || value.email || value.key)
  ) {
    console.log(
      id,
      JSON.stringify({
        endpoint: value.endpoint,
        email: value.email || null,
        projectId: value.projectId || null,
        hasCookie: Boolean(value.cookie),
        hasKey: Boolean(value.key),
        selfSigned: Boolean(value.selfSigned),
      }),
    );
  }
}
