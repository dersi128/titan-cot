import type { InstitutionalMarket } from "../config/institutionalMarkets";

export const HEATMAP_CATEGORY_ORDER: readonly InstitutionalMarket["category"][] = [
  "forex",
  "metals",
  "energy",
  "grains",
  "softs",
  "livestock",
  "indices",
];

export type HeatmapCellTone =
  | "extreme_long"
  | "strong_long"
  | "neutral"
  | "strong_short"
  | "extreme_short"
  | "empty";

export function heatmapToneFromComm26(index: number | null | undefined): HeatmapCellTone {
  if (index === null || index === undefined || !Number.isFinite(index)) return "empty";
  if (index > 80) return "extreme_long";
  if (index > 60) return "strong_long";
  if (index < 20) return "extreme_short";
  if (index < 40) return "strong_short";
  return "neutral";
}

export function isRetailExtreme(index: number | null | undefined): boolean {
  return index !== null && index !== undefined && Number.isFinite(index) && (index > 80 || index < 20);
}

export function groupMarketsByCategory(markets: readonly InstitutionalMarket[]) {
  return HEATMAP_CATEGORY_ORDER.map((category) => ({
    category,
    markets: markets.filter((market) => market.category === category),
  })).filter((group) => group.markets.length > 0);
}
