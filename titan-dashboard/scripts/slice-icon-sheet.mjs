import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const src =
  process.argv[2] ||
  "C:/Users/dersi/.cursor/projects/c-Users-dersi-Documents-titan-cot-git/assets/c__Users_dersi_AppData_Roaming_Cursor_User_workspaceStorage_bac34fd398a69078f50e4d8001a9cbce_images_image-61ab0a62-b63c-42c9-b29e-8d51087fb578.png";

const outDir = path.join(root, "public", "markets", "icons");
fs.mkdirSync(outDir, { recursive: true });

const meta = await sharp(src).metadata();
const W = meta.width ?? 1024;
const H = meta.height ?? 1024;
const cols = 3;
const rows = 3;
const cellW = Math.floor(W / cols);
const cellH = Math.floor(H / rows);
const inset = Math.round(cellW * 0.02);
const size = 256;

/** row-major labels → market id (or spare name) */
const grid = [
  ["SP500", "NAS100", "DOW"],
  ["RUSSELL", "VIX", "OIL"],
  ["BRENT", "NATGAS", "GASOLINE"],
];

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

console.log(`\nDone → ${outDir}`);
