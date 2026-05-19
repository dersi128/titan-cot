/** Bundled market PNGs — run `npm run icons:sync` after adding files to public/markets/icons/ */
const modules = import.meta.glob<string>("../assets/markets/icons/*.png", {
  eager: true,
  import: "default",
});

const BY_ID = new Map<string, string>();

for (const [path, url] of Object.entries(modules)) {
  const match = path.match(/\/([^/]+)\.png$/i);
  if (match) BY_ID.set(match[1].toUpperCase(), url);
}

export function getBundledMarketIconUrl(marketId: string): string | undefined {
  return BY_ID.get(marketId.toUpperCase());
}

export function hasBundledMarketIcon(marketId: string): boolean {
  return BY_ID.has(marketId.toUpperCase());
}
