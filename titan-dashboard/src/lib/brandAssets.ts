/**
 * Brand images bundled from src/assets/brand/ (hashed URLs in production).
 * Local setup: put files in public/brand/, then run `npm run brand:sync`.
 */
const assets = import.meta.glob<string>("../assets/brand/*.{png,jpg,jpeg,webp}", {
  eager: true,
  query: "?url",
  import: "default",
});

function assetUrl(filename: string): string | undefined {
  const normalized = filename.toLowerCase();
  const hit = Object.entries(assets).find(([path]) =>
    path.replace(/\\/g, "/").toLowerCase().endsWith(`/${normalized}`),
  );
  return hit?.[1];
}

export const TITAN_LOGO_SRC = assetUrl("titan-logo.png") ?? "";

export const TITAN_WORLD_MAP_CANDIDATES = [
  assetUrl("world-map.jpg"),
  assetUrl("world-map.png"),
].filter((u): u is string => Boolean(u));
