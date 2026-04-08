const fs = require("fs");

function findDuplicateKeys(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const duplicates = [];

  // Custom JSON parser that tracks duplicate keys
  function checkLevel(obj, path) {
    // Parse JSON tracking keys at each level
  }

  // Use a reviver approach: parse manually
  // Actually, let's use a simpler approach - search for repeated keys at each nesting level
  const lines = content.split("\n");
  const keyStack = [{}]; // track keys seen at each nesting level
  let depth = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Count braces to track depth
    for (const ch of line) {
      if (ch === "{") {
        depth++;
        keyStack[depth] = {};
      } else if (ch === "}") {
        depth--;
      }
    }

    // Extract key from line like:  "someKey": ...
    const match = line.match(/^\s*"([^"]+)"\s*:/);
    if (match) {
      const key = match[1];
      if (keyStack[depth] && keyStack[depth][key]) {
        duplicates.push({
          line: i + 1,
          key,
          depth,
          firstLine: keyStack[depth][key],
        });
      } else {
        if (!keyStack[depth]) keyStack[depth] = {};
        keyStack[depth][key] = i + 1;
      }
    }
  }

  return duplicates;
}

console.log("=== EN admin.json duplicates ===");
const enDups = findDuplicateKeys("./src/i18n/en/admin.json");
enDups.forEach((d) =>
  console.log(
    `  Key "${d.key}" at line ${d.line} (first at line ${d.firstLine}), depth ${d.depth}`,
  ),
);
if (!enDups.length) console.log("  NONE");

console.log("\n=== ES admin.json duplicates ===");
const esDups = findDuplicateKeys("./src/i18n/es/admin.json");
esDups.forEach((d) =>
  console.log(
    `  Key "${d.key}" at line ${d.line} (first at line ${d.firstLine}), depth ${d.depth}`,
  ),
);
if (!esDups.length) console.log("  NONE");
