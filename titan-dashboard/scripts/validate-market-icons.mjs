import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { EXPECTED_MARKET_IDS, resolveMarketIconId } from "./market-icon-names.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const iconsDir = path.join(root, "public", "markets", "icons");

console.log("\n=== TITAN — kontrola názvů ikon ===\n");
console.log("Složka:", iconsDir, "\n");

if (!fs.existsSync(iconsDir)) {
  console.log("❌ Složka neexistuje.");
  process.exit(1);
}

const files = fs
  .readdirSync(iconsDir)
  .filter((f) => f.toLowerCase().endsWith(".png"));

if (files.length === 0) {
  console.log("⚠️  Žádné .png soubory — ulož je sem a spusť znovu.\n");
  process.exit(0);
}

const resolved = new Map();
const problems = [];

for (const file of files.sort()) {
  const { id, alias, from, reason } = resolveMarketIconId(file);
  if (!id) {
    problems.push({ file, reason, from });
    continue;
  }
  if (resolved.has(id)) {
    problems.push({ file, reason: `duplicate of ${resolved.get(id)}`, from: id });
    continue;
  }
  resolved.set(id, file);
  const tag = alias ? `✓ (alias ${from} → ${id})` : "✓";
  console.log(`  ${tag.padEnd(28)} ${file}`);
}

if (problems.length) {
  console.log("\n--- Přejmenuj nebo smaž ---\n");
  for (const p of problems) {
    console.log(`  ❌ ${p.file}  →  ${p.reason}${p.from ? ` (${p.from})` : ""}`);
  }
}

const missing = EXPECTED_MARKET_IDS.filter((id) => !resolved.has(id));
console.log(`\nNalezeno PNG: ${files.length}  |  Přiřazeno trhům: ${resolved.size} / ${EXPECTED_MARKET_IDS.length}`);

if (missing.length) {
  console.log("\n--- Chybí (dashboard použije SVG) ---\n");
  for (const id of missing) console.log(`  · ${id}.png`);
}

console.log("\nDalší krok: npm run icons:sync\n");
