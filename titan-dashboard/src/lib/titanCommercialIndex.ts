/**
 * TITAN positioning read — deterministic institutional framing on legacy COT data.
 */

import type { CotDashboardData, CotHistoryPoint } from "../types";
import { calculateCotIndex } from "./titanCotScoringCore";
import {
  horizonDeltas,
  horizonFlowTone,
  horizonPanelTrend,
} from "../components/titan/deltaFlowHorizon";

/** Index thresholds (26W rolling, 0–100 scale). */
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

/** Structural conflict between commercial structure, flow, and trend participation (not RSI-style). */
export type DivergenceStateId = "aligned" | "bearish" | "bullish" | "unavailable";

export type MarketRegimeId =
  | "accumulation"
  | "distribution"
  | "trending"
  | "rotation"
  | "exhaustion"
  | "transition"
  | "neutral";

export type DeltaFlowRow = {
  label: "1W" | "4W" | "13W";
  delta: number;
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
 * Strong structural divergence only (deterministic COT rules — no OHLC feed).
 * Commercial net vs rolling index, delta flow, and non-commercial trend participation.
 */
export function evaluateInstitutionalDivergence(data: CotDashboardData): DivergenceStateId {
  const history = data.history ?? [];
  if (history.length < 27) return "unavailable";

  const commSeries = buildCommercialIndexSeries(history);
  if (commSeries.length < 2) return "unavailable";

  const nets = history.slice(-26).map((h) => h.commercialNet);
  const prevIdx = commSeries[commSeries.length - 2]!;
  const currIdx = commSeries[commSeries.length - 1]!;
  const maxNet = Math.max(...nets);
  const minNet = Math.min(...nets);
  const currNet = nets[nets.length - 1]!;

  const c = data.commercials;
  const nc = data.nonCommercials;
  const w1 = c.weeklyChange;
  const d4 = c.delta4w;

  const structuralBear =
    currNet >= maxNet * 0.98 && currIdx < prevIdx - 3 && c.index26w >= 52;

  const ncChasingLong =
    nc.index26w >= 62 &&
    nc.weeklyChange > 0 &&
    ((w1 < 0 && d4 <= 0) || (w1 < 0 && currIdx < prevIdx - 1));

  const commAddsShort = w1 < 0 && d4 < 0 && c.index26w > 38;
  const bearish =
    structuralBear ||
    ncChasingLong ||
    (commAddsShort && nc.index26w >= 58 && (nc.delta4w >= 0 || nc.weeklyChange > 0));

  const structuralBull =
    currNet <= minNet * 1.02 && currIdx > prevIdx + 3 && c.index26w <= 48;

  const ncStaysBearish = nc.index26w <= 42 && nc.weeklyChange <= 0 && nc.delta4w <= 0;

  const commAccumulating = w1 > 0 && d4 > 0;
  const bullish = structuralBull || (ncStaysBearish && commAccumulating && c.index26w < 58);

  if (bearish && bullish) {
    if (structuralBear && !structuralBull) return "bearish";
    if (structuralBull && !structuralBear) return "bullish";
    return "aligned";
  }
  if (bearish) return "bearish";
  if (bullish) return "bullish";

  return "aligned";
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

export function buildDeltaFlow(data: CotDashboardData): DeltaFlowRow[] {
  const c = data.commercials;
  return [
    { label: "1W", delta: c.weeklyChange },
    { label: "4W", delta: c.delta4w },
    { label: "13W", delta: c.delta13w },
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
    divergence === "aligned" ||
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

/**
 * Institutional environment from commercial bias, persistence, crowd, flow, and divergence.
 */
export function evaluatePositioningMarketRegime(
  data: CotDashboardData,
  commercialZone: CommercialZoneId,
  retailZone: CommercialZoneId,
  commercialPersistenceWeeks: number,
  divergence: DivergenceStateId,
): MarketRegimeId {
  const c = data.commercials;
  const r = data.retail;
  const w1 = c.weeklyChange;
  const d4 = c.delta4w;
  const idx = clampIndex(c.index26w);
  const retailIdx = clampIndex(r.index26w);

  const { w1: f1, w4: f4, w13: f13 } = horizonDeltas(buildDeltaFlow(data));
  const tone = horizonFlowTone(f1, f4, f13);
  const panelTrend = horizonPanelTrend(f1, f4, f13);
  const flowBull = tone === "bull";
  const flowBear = tone === "bear";
  const flowMixed = tone === "mixed";

  const commExtremeLong = commercialZone === "extreme_long" || commercialZone === "strong_long";
  const commExtremeShort = commercialZone === "extreme_short" || commercialZone === "strong_short";
  const persist = commercialPersistenceWeeks;

  const retailLongCrowd =
    retailIdx >= 58 ||
    retailZone === "extreme_long" ||
    retailZone === "strong_long" ||
    (retailZone === "bullish" && retailIdx >= 52);

  const retailShortCrowd =
    retailIdx <= 42 ||
    retailZone === "extreme_short" ||
    retailZone === "strong_short" ||
    (retailZone === "bearish" && retailIdx <= 48);

  if (commExtremeLong && persist >= 2 && flowBull && retailShortCrowd) {
    return "accumulation";
  }
  if (commExtremeShort && persist >= 2 && flowBear && retailLongCrowd) {
    return "distribution";
  }

  const weakeningFlow = panelTrend === "weakening_bear" || panelTrend === "weakening_bull";
  const divStress = divergence === "bearish" || divergence === "bullish";
  if (
    (commercialZone === "extreme_long" || commercialZone === "extreme_short") &&
    persist >= 3 &&
    (weakeningFlow || (divStress && flowMixed))
  ) {
    return "exhaustion";
  }

  if ((w1 > 0 && d4 < 0) || (w1 < 0 && d4 > 0)) {
    return "transition";
  }
  if ((divergence === "bearish" || divergence === "bullish") && flowMixed && persist <= 2) {
    return "transition";
  }

  const dirFlowAligned =
    (idx >= 52 && flowBull && !flowMixed) || (idx <= 48 && flowBear && !flowMixed);
  if (dirFlowAligned && divergence === "aligned" && Math.abs(idx - 50) >= 12) {
    return "trending";
  }

  if (flowMixed && persist < 5 && Math.abs(idx - 50) <= 28) {
    return "rotation";
  }

  if (Math.abs(idx - 50) <= 16 && flowMixed) {
    return "neutral";
  }

  if (flowBear && idx >= 55) return "transition";
  if (flowBull && idx <= 45) return "transition";

  return "neutral";
}

/** Single source of truth for market regime (scanner + detail). */
export function resolveMarketRegime(data: CotDashboardData): MarketRegimeId {
  return evaluateTitanPositioning(data)?.regime ?? "neutral";
}

export function evaluateTitanPositioning(data: CotDashboardData): TitanPositioningRead | null {
  if (!data.commercials || !data.retail) {
    return null;
  }

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
  const divergence = evaluateInstitutionalDivergence(data);
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
    regime: evaluatePositioningMarketRegime(
      data,
      commercialIndexZone(commercialIndex),
      commercialIndexZone(retailIndex),
      weeksInExtremeZone(commSeries),
      divergence,
    ),
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
