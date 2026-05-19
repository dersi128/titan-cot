import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { resolveMarketIconId } from "./market-icon-names.mjs";

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
const skipped = [];
const syncedIds = [];

for (const ent of entries) {
  if (!ent.isFile()) continue;
  if (!ent.name.toLowerCase().endsWith(".png")) continue;

  const { id, alias, from, reason } = resolveMarketIconId(ent.name);
  if (!id) {
    skipped.push(`${ent.name} (${reason ?? "unknown"}: ${from ?? "?"})`);
    continue;
  }

  const srcFile = path.join(srcDir, ent.name);
  const dest = path.join(destDir, `${id}.png`);
  fs.copyFileSync(srcFile, dest);
  const canonicalPublic = path.join(srcDir, `${id}.png`);
  if (ent.name.toUpperCase() !== `${id}.PNG` && !fs.existsSync(canonicalPublic)) {
    fs.copyFileSync(srcFile, canonicalPublic);
    console.log(`[icons:sync] public alias copy → ${id}.png`);
  }
  syncedIds.push(id);
  const note = alias ? ` ← ${ent.name} (alias ${from})` : "";
  console.log(`[icons:sync] ${id}.png${note}`);
  copied++;
}

if (skipped.length) {
  console.log("\n[icons:sync] přeskočeno (špatný název?) — spusť: npm run icons:check");
  for (const s of skipped) console.log(`  · ${s}`);
}

const manifestDir = path.join(root, "src", "generated");
const manifestPath = path.join(manifestDir, "market-icons.json");
const ids = [...new Set(syncedIds)].sort();

fs.mkdirSync(manifestDir, { recursive: true });
fs.writeFileSync(manifestPath, JSON.stringify(ids, null, 2) + "\n");
console.log(`[icons:sync] manifest → src/generated/market-icons.json (${ids.length} ids)`);

if (copied === 0) {
  console.log("[icons:sync] no valid PNG files in public/markets/icons");
} else {
  console.log(`\n[icons:sync] ${copied} icon(s) → src/assets/markets/icons/`);
}
