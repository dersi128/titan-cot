/**
 * TITAN Commercial Index — matches TradingView indicator logic.
 * Visualization-only layer on CFTC Legacy Futures COT data.
 */

import type { CotDashboardData, CotHistoryPoint } from "../types";
import { calculateCotIndex } from "./titanCotScoringCore";

/** TradingView thresholds */
export const THR_HIGH = 75;
export const THR_LOW = 25;

export type CommercialZoneId =
  | "extreme_short"
  | "strong_short"
  | "bearish"
  | "neutral"
  | "bullish"
  | "strong_long"
  | "extreme_long";

export type ReversalStateId =
  | "none"
  | "potential_top"
  | "potential_bottom"
  | "confirmed_top"
  | "confirmed_bottom";

export type DivergenceStateId = "none" | "bearish" | "bullish" | "unavailable";

export type MarketRegimeId = "accumulation" | "distribution" | "range" | "trend";

export type TitanPositioningRead = {
  /** Current commercial 26W index (0–100) */
  commercialIndex: number;
  commercialZone: CommercialZoneId;
  commercialGlow: number;
  /** Current retail 26W index */
  retailIndex: number;
  retailZone: CommercialZoneId;
  reversal: ReversalStateId;
  smTurnDown: boolean;
  smTurnUp: boolean;
  retailConfirmsTop: boolean;
  retailConfirmsBottom: boolean;
  divergence: DivergenceStateId;
  regime: MarketRegimeId;
  prevCommercialIndex: number | null;
};

export function commercialIndexZone(index: number): CommercialZoneId {
  const idx = clampIndex(index);
  if (idx < 10) return "extreme_short";
  if (idx < 25) return "strong_short";
  if (idx < 40) return "bearish";
  if (idx <= 60) return "neutral";
  if (idx <= 75) return "bullish";
  if (idx <= 90) return "strong_long";
  return "extreme_long";
}

/** Glow 0–100 — stronger near extremes */
export function commercialGlowIntensity(index: number): number {
  const idx = clampIndex(index);
  return Math.round(Math.max(Math.abs(idx - 50) * 2, idx > 75 || idx < 25 ? 72 : 24));
}

export function buildCommercialIndexSeries(history: CotHistoryPoint[]): number[] {
  if (history.length < 26) return [];
  const out: number[] = [];
  for (let i = 25; i < history.length; i++) {
    const window = history.slice(i - 25, i + 1).map((h) => h.commercialNet);
    out.push(calculateCotIndex(window, window[window.length - 1]!));
  }
  return out;
}

export function buildRetailIndexSeries(history: CotHistoryPoint[]): number[] {
  if (history.length < 26) return [];
  const out: number[] = [];
  for (let i = 25; i < history.length; i++) {
    const window = history.slice(i - 25, i + 1).map((h) => h.retailNet);
    out.push(calculateCotIndex(window, window[window.length - 1]!));
  }
  return out;
}

function crossunder(prev: number, curr: number, level: number): boolean {
  return prev >= level && curr < level;
}

function crossover(prev: number, curr: number, level: number): boolean {
  return prev <= level && curr > level;
}

/**
 * Optional positioning divergence (COT net vs index — no price feed).
 * Bearish: net near 26W high while index rolls over.
 * Bullish: net near 26W low while index lifts.
 */
export function evaluatePositioningDivergence(history: CotHistoryPoint[]): DivergenceStateId {
  if (history.length < 27) return "unavailable";

  const commSeries = buildCommercialIndexSeries(history);
  if (commSeries.length < 2) return "unavailable";

  const nets = history.slice(-26).map((h) => h.commercialNet);
  const prevIdx = commSeries[commSeries.length - 2]!;
  const currIdx = commSeries[commSeries.length - 1]!;
  const maxNet = Math.max(...nets);
  const minNet = Math.min(...nets);
  const currNet = nets[nets.length - 1]!;

  if (currNet >= maxNet * 0.98 && currIdx < prevIdx - 3) return "bearish";
  if (currNet <= minNet * 1.02 && currIdx > prevIdx + 3) return "bullish";
  return "none";
}

export function marketRegimeFromCot(data: CotDashboardData): MarketRegimeId {
  const idx = data.commercials.index26w;
  const d1 = data.commercials.weeklyChange;
  const d4 = data.commercials.delta4w;

  if (idx >= 40 && idx <= 60 && Math.abs(d1) < Math.abs(d4) * 0.15 + 1) return "range";
  if (d1 > 0 && d4 > 0) return "accumulation";
  if (d1 < 0 && d4 < 0) return "distribution";
  if (idx >= THR_HIGH || idx <= THR_LOW) return "trend";
  if (d1 > 0) return "accumulation";
  if (d1 < 0) return "distribution";
  return "range";
}

export function evaluateTitanPositioning(data: CotDashboardData): TitanPositioningRead {
  const commercialIndex = clampIndex(data.commercials.index26w);
  const retailIndex = clampIndex(data.retail.index26w);
  const history = data.history ?? [];

  const commSeries = buildCommercialIndexSeries(history);
  const prevCommercialIndex = commSeries.length >= 2 ? commSeries[commSeries.length - 2]! : null;

  const smTurnDown =
    prevCommercialIndex !== null && crossunder(prevCommercialIndex, commercialIndex, THR_HIGH);
  const smTurnUp =
    prevCommercialIndex !== null && crossover(prevCommercialIndex, commercialIndex, THR_LOW);

  const retailConfirmsTop = smTurnDown && retailIndex <= THR_LOW;
  const retailConfirmsBottom = smTurnUp && retailIndex >= THR_HIGH;

  let reversal: ReversalStateId = "none";
  if (retailConfirmsTop) reversal = "confirmed_top";
  else if (retailConfirmsBottom) reversal = "confirmed_bottom";
  else if (smTurnDown) reversal = "potential_top";
  else if (smTurnUp) reversal = "potential_bottom";

  return {
    commercialIndex,
    commercialZone: commercialIndexZone(commercialIndex),
    commercialGlow: commercialGlowIntensity(commercialIndex),
    retailIndex,
    retailZone: commercialIndexZone(retailIndex),
    reversal,
    smTurnDown,
    smTurnUp,
    retailConfirmsTop,
    retailConfirmsBottom,
    divergence: evaluatePositioningDivergence(history),
    regime: marketRegimeFromCot(data),
    prevCommercialIndex,
  };
}

function clampIndex(n: number): number {
  if (!Number.isFinite(n)) return 50;
  return Math.max(0, Math.min(100, Math.round(n * 100) / 100));
}
