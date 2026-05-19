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

export type DeltaFlowTrend = "accelerating_up" | "accelerating_down" | "steady" | "flat";

export type DeltaFlowRow = {
  label: "1W" | "4W" | "13W";
  delta: number;
  trend: DeltaFlowTrend;
};

export type NetRange26w = {
  min: number;
  max: number;
  current: number;
};

export type ReversalChecklist = {
  crossBelow75: boolean;
  crossAbove25: boolean;
  retailContrarian: boolean;
  divergenceOptional: boolean;
};

export type DivergenceContext = {
  state: DivergenceStateId;
  commercialNetLabel: "new_high" | "new_low" | "mid_range";
  priceLabel: "unavailable" | "aligned_high" | "aligned_low" | "aligned_mid";
  aligned: boolean;
};

export type TitanPositioningRead = {
  commercialIndex: number;
  commercialZone: CommercialZoneId;
  commercialGlow: number;
  commercialPersistenceWeeks: number;
  commercialRange26w: NetRange26w;
  commercialSparkline: number[];
  retailIndex: number;
  retailZone: CommercialZoneId;
  retailPersistenceWeeks: number;
  retailRange26w: NetRange26w;
  retailSparkline: number[];
  deltaFlow: DeltaFlowRow[];
  reversal: ReversalStateId;
  smTurnDown: boolean;
  smTurnUp: boolean;
  retailConfirmsTop: boolean;
  retailConfirmsBottom: boolean;
  checklist: ReversalChecklist;
  divergence: DivergenceStateId;
  divergenceContext: DivergenceContext;
  regime: MarketRegimeId;
  prevCommercialIndex: number | null;
  extremePositioning: boolean;
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

export function netRange26w(history: CotHistoryPoint[], key: "commercialNet" | "retailNet"): NetRange26w {
  const window = history.slice(-26);
  const nets = window.map((h) => h[key]);
  if (nets.length === 0) {
    return { min: 0, max: 0, current: 0 };
  }
  return {
    min: Math.min(...nets),
    max: Math.max(...nets),
    current: nets[nets.length - 1]!,
  };
}

export function weeksInExtremeZone(indexSeries: number[]): number {
  let count = 0;
  for (let i = indexSeries.length - 1; i >= 0; i--) {
    const z = commercialIndexZone(indexSeries[i]!);
    if (z === "extreme_short" || z === "extreme_long") count++;
    else break;
  }
  return count;
}

export function deltaFlowTrend(weekly: number, periodDelta: number, weeks: number): DeltaFlowTrend {
  const avgPerWeek = periodDelta / weeks;
  if (Math.abs(weekly) < 1 && Math.abs(periodDelta) < 1) return "flat";
  if (weekly > 0 && weekly > Math.abs(avgPerWeek) * 1.05) return "accelerating_up";
  if (weekly < 0 && Math.abs(weekly) > Math.abs(avgPerWeek) * 1.05) return "accelerating_down";
  if (weekly > 0 || periodDelta > 0) return "steady";
  if (weekly < 0 || periodDelta < 0) return "steady";
  return "flat";
}

export function buildDeltaFlow(data: CotDashboardData): DeltaFlowRow[] {
  const c = data.commercials;
  return [
    { label: "1W", delta: c.weeklyChange, trend: deltaFlowTrend(c.weeklyChange, c.delta4w, 4) },
    { label: "4W", delta: c.delta4w, trend: deltaFlowTrend(c.delta4w, c.delta13w, 13) },
    { label: "13W", delta: c.delta13w, trend: deltaFlowTrend(c.delta13w, c.delta13w, 13) },
  ];
}

export function evaluateDivergenceContext(
  history: CotHistoryPoint[],
  divergence: DivergenceStateId,
): DivergenceContext {
  if (history.length < 26) {
    return {
      state: divergence,
      commercialNetLabel: "mid_range",
      priceLabel: "unavailable",
      aligned: true,
    };
  }

  const range = netRange26w(history, "commercialNet");
  const tol = Math.max(Math.abs(range.max - range.min) * 0.02, 1);
  let commercialNetLabel: DivergenceContext["commercialNetLabel"] = "mid_range";
  if (range.current >= range.max - tol) commercialNetLabel = "new_high";
  else if (range.current <= range.min + tol) commercialNetLabel = "new_low";

  const aligned =
    divergence === "none" ||
    divergence === "unavailable" ||
    (divergence === "bearish" && commercialNetLabel === "new_high") ||
    (divergence === "bullish" && commercialNetLabel === "new_low");

  return {
    state: divergence,
    commercialNetLabel,
    priceLabel: "unavailable",
    aligned,
  };
}

export function retailPositioningLabel(zone: CommercialZoneId): string {
  if (zone === "extreme_long" || zone === "strong_long") return "heavily_long";
  if (zone === "extreme_short" || zone === "strong_short") return "heavily_short";
  if (zone === "bullish") return "net_long";
  if (zone === "bearish") return "net_short";
  return "neutral";
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
  const retailSeries = buildRetailIndexSeries(history);
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
  const divergence = evaluatePositioningDivergence(history);
  const retailContrarianExtreme =
    (commercialIndex <= THR_LOW && retailIndex >= THR_HIGH) ||
    (commercialIndex >= THR_HIGH && retailIndex <= THR_LOW);

  const checklist: ReversalChecklist = {
    crossBelow75: smTurnDown,
    crossAbove25: smTurnUp,
    retailContrarian: retailConfirmsTop || retailConfirmsBottom || retailContrarianExtreme,
    divergenceOptional: divergence === "bearish" || divergence === "bullish",
  };

  const extremePositioning =
    commercialZoneIsExtreme(commercialIndexZone(commercialIndex)) ||
    commercialZoneIsExtreme(commercialIndexZone(retailIndex));

  return {
    commercialIndex,
    commercialZone: commercialIndexZone(commercialIndex),
    commercialGlow: commercialGlowIntensity(commercialIndex),
    commercialPersistenceWeeks: weeksInExtremeZone(commSeries),
    commercialRange26w: netRange26w(history, "commercialNet"),
    commercialSparkline: commSeries.slice(-16),
    retailIndex,
    retailZone: commercialIndexZone(retailIndex),
    retailPersistenceWeeks: weeksInExtremeZone(retailSeries),
    retailRange26w: netRange26w(history, "retailNet"),
    retailSparkline: retailSeries.slice(-16),
    deltaFlow: buildDeltaFlow(data),
    reversal,
    smTurnDown,
    smTurnUp,
    retailConfirmsTop,
    retailConfirmsBottom,
    checklist,
    divergence,
    divergenceContext: evaluateDivergenceContext(history, divergence),
    regime: marketRegimeFromCot(data),
    prevCommercialIndex,
    extremePositioning,
  };
}

function commercialZoneIsExtreme(zone: CommercialZoneId): boolean {
  return zone === "extreme_short" || zone === "extreme_long";
}

function clampIndex(n: number): number {
  if (!Number.isFinite(n)) return 50;
  return Math.max(0, Math.min(100, Math.round(n * 100) / 100));
}
