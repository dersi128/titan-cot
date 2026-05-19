/**
 * Brand images bundled from src/assets/brand/ (hashed URLs in production).
 * Local: public/brand/ → npm run brand:sync
 */
const assets = import.meta.glob<string>("../assets/brand/*.{png,jpg,jpeg,webp}", {
  eager: true,
  query: "?url",
  import: "default",
});

function assetUrl(...filenames: string[]): string | undefined {
  for (const filename of filenames) {
    const normalized = filename.toLowerCase();
    const hit = Object.entries(assets).find(([path]) =>
      path.replace(/\\/g, "/").toLowerCase().endsWith(`/${normalized}`),
    );
    if (hit?.[1]) return hit[1];
  }
  return undefined;
}

export const TITAN_LOGO_SRC =
  assetUrl("titan-logo.png", "titan-logo.png.png") ?? "";

export const TITAN_WORLD_MAP_CANDIDATES = [
  assetUrl("world-map.png", "world-map.png.png", "world-map.jpg"),
].filter((u): u is string => Boolean(u));
