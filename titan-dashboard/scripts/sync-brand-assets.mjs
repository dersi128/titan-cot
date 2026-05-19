/**
 * Copies public/brand/* → src/assets/brand/ so Vite bundles images into dist/.
 * Fixes double extensions like titan-logo.png.png → titan-logo.png
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const fromDir = path.join(root, "public", "brand");
const toDir = path.join(root, "src", "assets", "brand");

function normalizeBrandFilename(name) {
  const lower = name.toLowerCase();
  if (lower.endsWith(".png.png")) return name.slice(0, -4);
  if (lower.endsWith(".jpg.png")) return name.slice(0, -4);
  if (lower.endsWith(".jpeg.png")) return name.slice(0, -4);
  return name;
}

if (!fs.existsSync(fromDir)) {
  console.error("Missing folder:", fromDir);
  process.exit(1);
}

fs.mkdirSync(toDir, { recursive: true });

let count = 0;
for (const name of fs.readdirSync(fromDir)) {
  if (name.startsWith(".")) continue;
  const src = path.join(fromDir, name);
  if (!fs.statSync(src).isFile()) continue;
  const destName = normalizeBrandFilename(name);
  fs.copyFileSync(src, path.join(toDir, destName));
  count += 1;
  console.log(destName === name ? `copied ${name}` : `copied ${name} → ${destName}`);
}

if (count === 0) {
  console.error("No files in public/brand — add titan-logo.png and world-map.png");
  process.exit(1);
}

console.log(`Done: ${count} file(s) → src/assets/brand/`);
