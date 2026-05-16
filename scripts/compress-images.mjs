/**
 * compress-images.mjs
 * Converts PNG images in public/images/ to WebP and compresses JPGs in-place.
 * Run with: node scripts/compress-images.mjs
 */

import sharp from "sharp";
import { readdirSync, statSync, renameSync, unlinkSync } from "fs";
import { join, extname, basename } from "path";

const IMAGES_DIR = new URL(
  "../public/images/",
  import.meta.url,
).pathname.replace(/^\/([A-Z]:)/, "$1");
const WEBP_QUALITY = 82; // 80-85 is a good balance for premium visuals
const JPG_QUALITY = 85;

const files = readdirSync(IMAGES_DIR).filter((f) =>
  /\.(png|jpg|jpeg)$/i.test(f),
);

console.log(`Found ${files.length} images in ${IMAGES_DIR}\n`);

let totalBefore = 0;
let totalAfter = 0;

for (const file of files) {
  const inputPath = join(IMAGES_DIR, file);
  const ext = extname(file).toLowerCase();
  const nameWithoutExt = basename(file, extname(file));
  const outputPath = join(IMAGES_DIR, `${nameWithoutExt}.webp`);

  const before = statSync(inputPath).size;
  totalBefore += before;

  try {
    if (ext === ".jpg" || ext === ".jpeg") {
      // Compress JPG in-place (overwrite)
      const tempPath = inputPath + ".tmp";
      await sharp(inputPath)
        .jpeg({ quality: JPG_QUALITY, progressive: true })
        .toFile(tempPath);
      const after = statSync(tempPath).size;
      totalAfter += after;
      unlinkSync(inputPath);
      renameSync(tempPath, inputPath);
      console.log(
        `✓ ${file}: ${kb(before)} → ${kb(after)} (${pct(before, after)}% smaller)`,
      );
    } else {
      // Convert PNG → WebP
      await sharp(inputPath).webp({ quality: WEBP_QUALITY }).toFile(outputPath);
      const after = statSync(outputPath).size;
      totalAfter += after;
      // Remove original PNG
      unlinkSync(inputPath);
      console.log(
        `✓ ${file} → ${nameWithoutExt}.webp: ${kb(before)} → ${kb(after)} (${pct(before, after)}% smaller)`,
      );
    }
  } catch (err) {
    console.error(`✗ Failed: ${file} — ${err.message}`);
    totalAfter += before; // count original size if failed
  }
}

console.log(
  `\nTotal: ${mb(totalBefore)} MB → ${mb(totalAfter)} MB (saved ${mb(totalBefore - totalAfter)} MB)`,
);

function kb(bytes) {
  return (bytes / 1024).toFixed(0) + "KB";
}
function mb(bytes) {
  return (bytes / 1024 / 1024).toFixed(2);
}
function pct(before, after) {
  return (((before - after) / before) * 100).toFixed(0);
}
