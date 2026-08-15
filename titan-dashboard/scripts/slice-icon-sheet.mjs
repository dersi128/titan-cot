import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "public", "markets", "icons");
fs.mkdirSync(outDir, { recursive: true });

/** Named 3×3 presets (row-major market ids / spare names). */
const PRESETS = {
  indicesEnergy: [
    ["SP500", "NAS100", "DOW"],
    ["RUSSELL", "VIX", "OIL"],
    ["BRENT", "NATGAS", "GASOLINE"],
  ],
  metalsGrains: [
    ["HEATOIL", "GOLD", "SILVER"],
    ["COPPER", "PLATINUM", "PALLADIUM"],
    ["CORN", "WHEAT", "SOYBEANS"],
  ],
  softsLivestock: [
    ["SOYMEAL", "SOYOIL", "COFFEE"],
    ["COTTON", "SUGAR", "COCOA"],
    ["CATTLE", "FEEDERCATTLE", "HOGS"],
  ],
};

const src = process.argv[2];
const presetName = process.argv[3] || "indicesEnergy";
const grid = PRESETS[presetName];

if (!src || !grid) {
  console.error("Usage: node scripts/slice-icon-sheet.mjs <sheet.png> <preset>");
  console.error("Presets:", Object.keys(PRESETS).join(", "));
  process.exit(1);
}

const meta = await sharp(src).metadata();
const W = meta.width ?? 1024;
const H = meta.height ?? 1024;
const cols = 3;
const rows = 3;
const cellW = Math.floor(W / cols);
const cellH = Math.floor(H / rows);
const inset = Math.round(cellW * 0.02);
const size = 256;

for (let r = 0; r < rows; r++) {
  for (let c = 0; c < cols; c++) {
    const id = grid[r][c];
    const left = c * cellW + inset;
    const top = r * cellH + inset;
    const width = cellW - inset * 2;
    const height = cellH - inset * 2;

    const circle = Buffer.from(
      `<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="white"/></svg>`,
    );

    await sharp(src)
      .extract({ left, top, width, height })
      .resize(size, size, { fit: "cover" })
      .ensureAlpha()
      .composite([{ input: circle, blend: "dest-in" }])
      .png()
      .toFile(path.join(outDir, `${id}.png`));

    console.log(`[slice] ${id}.png`);
  }
}

console.log(`\nDone (${presetName}) → ${outDir}`);
