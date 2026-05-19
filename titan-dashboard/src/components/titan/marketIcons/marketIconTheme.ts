import type { InstitutionalMarket } from "../../../config/institutionalMarkets";

export type MarketIconFrame = "circle" | "shield";

/** Matches reference board: forex/metals/energy = circle; ag/softs/indices = shield */
export const MARKET_ICON_FRAME: Record<InstitutionalMarket["category"], MarketIconFrame> = {
  forex: "circle",
  metals: "circle",
  energy: "circle",
  grains: "shield",
  softs: "shield",
  livestock: "circle",
  indices: "shield",
};

export type MarketCategoryTheme = {
  frame: MarketIconFrame;
  accent: string;
  glow: string;
  ring: string;
  glyph: string;
};

export const MARKET_CATEGORY_THEME: Record<InstitutionalMarket["category"], MarketCategoryTheme> = {
  forex: {
    frame: "circle",
    accent: "59, 130, 246",
    glow: "rgba(59, 130, 246, 0.45)",
    ring: "rgba(96, 165, 250, 0.55)",
    glyph: "text-sky-200",
  },
  metals: {
    frame: "circle",
    accent: "212, 175, 55",
    glow: "rgba(212, 175, 55, 0.5)",
    ring: "rgba(240, 208, 96, 0.6)",
    glyph: "text-amber-100",
  },
  energy: {
    frame: "circle",
    accent: "249, 115, 22",
    glow: "rgba(249, 115, 22, 0.45)",
    ring: "rgba(251, 146, 60, 0.55)",
    glyph: "text-orange-200",
  },
  grains: {
    frame: "shield",
    accent: "34, 197, 94",
    glow: "rgba(34, 197, 94, 0.4)",
    ring: "rgba(74, 222, 128, 0.5)",
    glyph: "text-emerald-200",
  },
  softs: {
    frame: "shield",
    accent: "180, 140, 90",
    glow: "rgba(196, 165, 116, 0.42)",
    ring: "rgba(214, 180, 120, 0.52)",
    glyph: "text-amber-100/95",
  },
  livestock: {
    frame: "circle",
    accent: "239, 68, 68",
    glow: "rgba(239, 68, 68, 0.4)",
    ring: "rgba(248, 113, 113, 0.52)",
    glyph: "text-rose-200",
  },
  indices: {
    frame: "shield",
    accent: "168, 85, 247",
    glow: "rgba(168, 85, 247, 0.42)",
    ring: "rgba(192, 132, 252, 0.52)",
    glyph: "text-violet-200",
  },
};

export function getMarketIconTheme(category: InstitutionalMarket["category"]): MarketCategoryTheme {
  return MARKET_CATEGORY_THEME[category];
}
