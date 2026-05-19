import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const srcDir = path.join(root, "public", "markets", "icons");
const destDir = path.join(root, "src", "assets", "markets", "icons");

fs.mkdirSync(destDir, { recursive: true });

if (!fs.existsSync(srcDir)) {
  console.log("[icons:sync] no public/markets/icons — skip");
  process.exit(0);
}

const entries = fs.readdirSync(srcDir, { withFileTypes: true });
let copied = 0;

for (const ent of entries) {
  if (!ent.isFile()) continue;
  const lower = ent.name.toLowerCase();
  if (!lower.endsWith(".png")) continue;
  const base = ent.name.replace(/\.png$/i, "").toUpperCase();
  const dest = path.join(destDir, `${base}.png`);
  fs.copyFileSync(path.join(srcDir, ent.name), dest);
  console.log(`[icons:sync] copied ${ent.name} → src/assets/markets/icons/${base}.png`);
  copied++;
}

if (copied === 0) {
  console.log("[icons:sync] no PNG files in public/markets/icons");
}
