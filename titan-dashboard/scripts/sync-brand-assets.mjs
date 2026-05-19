/**
 * Copies public/brand/* → src/assets/brand/ so Vite bundles images into dist/.
 * Run: npm run brand:sync
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const fromDir = path.join(root, "public", "brand");
const toDir = path.join(root, "src", "assets", "brand");

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
  fs.copyFileSync(src, path.join(toDir, name));
  count += 1;
  console.log("copied", name);
}

if (count === 0) {
  console.error("No files in public/brand — add titan-logo.png and world-map.jpg");
  process.exit(1);
}

console.log(`Done: ${count} file(s) → src/assets/brand/`);
