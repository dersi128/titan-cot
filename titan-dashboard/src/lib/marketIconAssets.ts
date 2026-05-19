import iconIds from "../generated/market-icons.json";

/** Bundled PNGs (after `npm run icons:sync`) */
const modules = import.meta.glob<string>("../assets/markets/icons/*.png", {
  eager: true,
  import: "default",
});

const BUNDLED = new Map<string, string>();
const AVAILABLE = new Set(iconIds.map((id) => id.toUpperCase()));

for (const [path, url] of Object.entries(modules)) {
  const match = path.match(/\/([^/]+)\.png$/i);
  if (match) BUNDLED.set(match[1].toUpperCase(), url);
}

/** Bundled URL first, else static file from public/markets/icons (Vercel) */
export function getMarketIconUrl(marketId: string): string | undefined {
  const id = marketId.toUpperCase();
  if (!AVAILABLE.has(id)) return undefined;
  return BUNDLED.get(id) ?? `/markets/icons/${id}.png`;
}

export function hasMarketIcon(marketId: string): boolean {
  return AVAILABLE.has(marketId.toUpperCase());
}
