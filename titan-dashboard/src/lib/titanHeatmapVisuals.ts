import type { InstitutionalMarket } from "../config/institutionalMarkets";

export type HeatmapGroupId = "forex" | "metals" | "commodities" | "bonds" | "indices" | "other";

export const HEATMAP_GROUP_ORDER: readonly HeatmapGroupId[] = [
  "forex",
  "metals",
  "commodities",
  "bonds",
  "indices",
  "other",
];

const CATEGORY_TO_GROUP: Record<InstitutionalMarket["category"], HeatmapGroupId> = {
  forex: "forex",
  metals: "metals",
  energy: "commodities",
  grains: "commodities",
  softs: "commodities",
  livestock: "commodities",
  bonds: "bonds",
  indices: "indices",
  other: "other",
};

const COMMODITY_CATEGORY_ORDER: readonly InstitutionalMarket["category"][] = [
  "energy",
  "grains",
  "softs",
  "livestock",
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

export function heatmapGroupForCategory(category: InstitutionalMarket["category"]): HeatmapGroupId {
  return CATEGORY_TO_GROUP[category];
}

export function groupMarketsForHeatmap(markets: readonly InstitutionalMarket[]) {
  return HEATMAP_GROUP_ORDER.map((group) => {
    const inGroup = markets.filter((market) => CATEGORY_TO_GROUP[market.category] === group);
    const ordered =
      group === "commodities"
        ? COMMODITY_CATEGORY_ORDER.flatMap((category) =>
            inGroup.filter((market) => market.category === category),
          )
        : inGroup;
    return { group, markets: ordered };
  }).filter((entry) => entry.markets.length > 0);
}
