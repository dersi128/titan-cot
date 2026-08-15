import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "public", "markets", "icons");
fs.mkdirSync(outDir, { recursive: true });

const assets =
  "C:/Users/dersi/.cursor/projects/c-Users-dersi-Documents-titan-cot-git/assets";

/** Individual circular forex badges → market id */
const MAP = [
  ["c__Users_dersi_AppData_Roaming_Cursor_User_workspaceStorage_bac34fd398a69078f50e4d8001a9cbce_images_image-e5e2d8fa-67e0-4309-ad5d-4c0c864ecf23.png", "DXY"],
  ["c__Users_dersi_AppData_Roaming_Cursor_User_workspaceStorage_bac34fd398a69078f50e4d8001a9cbce_images_image-f43408bd-c3c5-4fe3-8062-e1be6083c233.png", "EUR"],
  ["c__Users_dersi_AppData_Roaming_Cursor_User_workspaceStorage_bac34fd398a69078f50e4d8001a9cbce_images_image-a500290d-c02d-4bdd-b6d4-a78c89f586fe.png", "GBP"],
  ["c__Users_dersi_AppData_Roaming_Cursor_User_workspaceStorage_bac34fd398a69078f50e4d8001a9cbce_images_image-ee001b64-8df1-4ceb-bffc-912829353047.png", "JPY"],
  ["c__Users_dersi_AppData_Roaming_Cursor_User_workspaceStorage_bac34fd398a69078f50e4d8001a9cbce_images_image-7b987d5f-b9fc-4233-8279-fdc3d5bc424c.png", "AUD"],
  ["c__Users_dersi_AppData_Roaming_Cursor_User_workspaceStorage_bac34fd398a69078f50e4d8001a9cbce_images_image-61c54b6d-ddd4-490e-88a9-e5cb97f54003.png", "CAD"],
  ["c__Users_dersi_AppData_Roaming_Cursor_User_workspaceStorage_bac34fd398a69078f50e4d8001a9cbce_images_image-911e2fa8-9ede-467b-88a2-5e6bc06ba93a.png", "CHF"],
  ["c__Users_dersi_AppData_Roaming_Cursor_User_workspaceStorage_bac34fd398a69078f50e4d8001a9cbce_images_image-defcb856-a0e1-4df2-bd79-7d1e7781920e.png", "NZD"],
];

const size = 256;

for (const [file, id] of MAP) {
  const src = path.join(assets, file);
  if (!fs.existsSync(src)) {
    console.error("missing", src);
    process.exit(1);
  }

  const meta = await sharp(src).metadata();
  const side = Math.min(meta.width ?? size, meta.height ?? size);
  const left = Math.floor(((meta.width ?? side) - side) / 2);
  const top = Math.floor(((meta.height ?? side) - side) / 2);

  const circle = Buffer.from(
    `<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="white"/></svg>`,
  );

  await sharp(src)
    .extract({ left, top, width: side, height: side })
    .resize(size, size)
    .ensureAlpha()
    .composite([{ input: circle, blend: "dest-in" }])
    .png()
    .toFile(path.join(outDir, `${id}.png`));

  console.log(`[forex] ${id}.png`);
}

console.log(`\nDone → ${outDir}`);
