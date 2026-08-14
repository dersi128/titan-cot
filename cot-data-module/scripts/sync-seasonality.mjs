/**
 * OPTIONAL: copies seasonality engine from titan-dashboard into cot-data-module.
 *
 * Do NOT run during Render `npm run build` — the API keeps a Node-compatible
 * copy under src/seasonality (with .js import extensions). Blind sync overwrites
 * it with Vite/React sources and breaks `tsc` (NodeNext).
 *
 * Force only when intentionally porting engine changes:
 *   ALLOW_SEASONALITY_SYNC=1 npm run sync:seasonality
 * Then fix relative imports to use .js extensions before deploying.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../..");
const src = path.join(root, "titan-dashboard/src/seasonality");
const dest = path.join(here, "../src/seasonality");

console.warn(
  "[sync:seasonality] Manual only. Overwrites Node API seasonality with Vite sources.",
);

if (process.env.ALLOW_SEASONALITY_SYNC !== "1") {
  console.warn("[sync:seasonality] Skipping (set ALLOW_SEASONALITY_SYNC=1 to force).");
  process.exit(0);
}

function copyDir(from, to) {
  fs.rmSync(to, { recursive: true, force: true });
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const fromPath = path.join(from, entry.name);
    const toPath = path.join(to, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "components") continue;
      copyDir(fromPath, toPath);
    } else if (entry.name.endsWith(".ts") && !entry.name.endsWith(".tsx")) {
      if (entry.name === "index.ts" || entry.name === "seasonalityApi.ts") continue;
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
console.warn("Review .js import extensions before committing / deploying.");
