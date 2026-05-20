/**
 * Copies seasonality engine from titan-dashboard into cot-data-module for API builds.
 * Run before `npm run build` in cot-data-module.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../..");
const src = path.join(root, "titan-dashboard/src/seasonality");
const dest = path.join(here, "../src/seasonality");

function copyDir(from, to) {
  fs.rmSync(to, { recursive: true, force: true });
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const fromPath = path.join(from, entry.name);
    const toPath = path.join(to, entry.name);
    if (entry.isDirectory()) {
      copyDir(fromPath, toPath);
    } else {
      fs.copyFileSync(fromPath, toPath);
    }
  }
}

if (!fs.existsSync(src)) {
  console.error("Seasonality source not found:", src);
  process.exit(1);
}

copyDir(src, dest);
console.log("Synced seasonality engine → cot-data-module/src/seasonality");
