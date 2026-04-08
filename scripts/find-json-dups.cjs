const fs = require("fs");

function findDups(file) {
  const content = fs.readFileSync(file, "utf8");
  const lines = content.split("\n");
  const dups = [];

  // Track keys seen at each nesting path
  const seenAtPath = {};
  const pathStack = [];
  let currentKey = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect key
    const km = line.match(/^\s*"([^"]+)"\s*:/);
    if (km) {
      currentKey = km[1];
      const parentPath = pathStack.join(".");
      const fullId = parentPath + "/" + currentKey;

      if (seenAtPath[fullId]) {
        dups.push({
          key: currentKey,
          line: i + 1,
          firstLine: seenAtPath[fullId],
          parent: parentPath || "(root)",
        });
      } else {
        seenAtPath[fullId] = i + 1;
      }
    }

    // Track depth via braces (after key detection)
    for (const ch of line) {
      if (ch === "{") {
        pathStack.push(currentKey || "(obj)");
      } else if (ch === "}") {
        pathStack.pop();
      }
    }
  }

  return dups;
}

console.log("=== EN admin.json duplicates ===");
const enDups = findDups("src/i18n/en/admin.json");
if (enDups.length === 0) console.log("  NONE");
else
  enDups.forEach((d) =>
    console.log(
      `  DUP "${d.key}" at L${d.line} (first at L${d.firstLine}) parent: ${d.parent}`,
    ),
  );

console.log("\n=== ES admin.json duplicates ===");
const esDups = findDups("src/i18n/es/admin.json");
if (esDups.length === 0) console.log("  NONE");
else
  esDups.forEach((d) =>
    console.log(
      `  DUP "${d.key}" at L${d.line} (first at L${d.firstLine}) parent: ${d.parent}`,
    ),
  );
