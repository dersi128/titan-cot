import type { InstitutionalMarket } from "../config/institutionalMarkets";
import { INSTITUTIONAL_MARKETS } from "../config/institutionalMarkets";
import type { CotDashboardData, CotHistoryPoint } from "../types";
import {
  buildCommercialIndexSeries,
  commercialIndexZone,
  evaluateTitanPositioning,
  type CommercialZoneId,
  type MarketRegimeId,
} from "./titanCommercialIndex";
import { calculateCotIndex } from "./titanCotScoringCore";
import { computeTitanDashboardScore, resolveTitanVerdict } from "./titanCotScore";
import type { TitanBiasVerdict } from "./titanCotScore";

/** FX futures (ex-DXY) used for dollar breadth — display order. */
export const DME_FX_ORDER = ["EUR", "GBP", "JPY", "AUD", "CAD", "CHF", "NZD"] as const;

export const DME_FX_MARKETS: InstitutionalMarket[] = DME_FX_ORDER.map((id) => {
  const market = INSTITUTIONAL_MARKETS.find((m) => m.id === id);
  if (!market) throw new Error(`Missing DME FX market: ${id}`);
  return market;
});

export type DollarPressureId = "elevated" | "soft" | "neutral";
export type FxBreadthId = "wide_usd" | "narrow_usd" | "mixed" | "wide_fx";
export type UsdStanceId = "usd_plus" | "usd_minus" | "neutral";
export type UsdPositioningId = "bullish" | "neutral" | "bearish";
export type CotPositioningVerdictId =
  | "strong_bullish"
  | "bullish"
  | "neutral"
  | "bearish"
  | "strong_bearish";
export type RatesLeanId = "rising" | "falling" | "flat" | "unknown";
export type BreadthLeanId = "usd_favoring" | "fx_favoring" | "mixed";
export type MacroAlignmentId =
  | "strong_bullish"
  | "moderate_bullish"
  | "strong_bearish"
  | "moderate_bearish"
  | "mixed"
  | "none";

export type AlignmentContribution = {
  dxy: -1 | 0 | 1;
  breadth: -1 | 0 | 1;
  rates: -1 | 0 | 1;
};

export type MacroAlignmentResult = {
  id: MacroAlignmentId;
  contributions: AlignmentContribution;
};
export type DmeChartMode = "index26w" | "index52w" | "net" | "delta4w";

export type DmeFxPanel = {
  market: InstitutionalMarket;
  score: number;
  verdict: TitanBiasVerdict;
  regime: MarketRegimeId;
  /** True when FX COT score clearly soft → relative USD support vs that pair */
  usdFavoring: boolean;
  stance: UsdStanceId;
  status: "live" | "missing";
};

export type DmeChartPoint = {
  date: string;
  index26w: number | null;
  index52w: number | null;
  net: number;
  delta4w: number | null;
};

export type DmeOverview = {
  dxyAvailable: boolean;
  dxyRegime: MarketRegimeId | null;
  dxyScore: number | null;
  dxyCommercial26w: number | null;
  dxyCommercial52w: number | null;
  dxyWeeklyChange: number | null;
  dxyDelta4w: number | null;
  dxyDelta13w: number | null;
  dxyPersistenceWeeks: number;
  dxyZone: CommercialZoneId | null;
  usdPositioning: UsdPositioningId;
  cotVerdict: CotPositioningVerdictId;
  dollarPressure: DollarPressureId;
  fxBreadth: FxBreadthId;
  breadthLean: BreadthLeanId;
  usdFavoringCount: number;
  fxLiveCount: number;
  fxExtremeCount: number;
  /** USD-favoring share 0–100 for progress bar */
  usdBiasPct: number;
  /** Last N points of DXY commercial 26W index (real history). */
  dxyIndexSpark: number[];
  /** Dated series for the main DXY chart */
  dxyChart: Array<{ date: string; index: number }>;
  /** Multi-series history for chart mode toggles */
  historyChart: DmeChartPoint[];
  panels: DmeFxPanel[];
};

function pressureFromScore(score: number | null): DollarPressureId {
  if (score === null) return "neutral";
  if (score >= 25) return "elevated";
  if (score <= -25) return "soft";
  return "neutral";
}

function usdPositioningFromScore(score: number | null): UsdPositioningId {
  if (score === null) return "neutral";
  if (score >= 25) return "bullish";
  if (score <= -25) return "bearish";
  return "neutral";
}

function cotVerdictFromZone(zone: CommercialZoneId | null, score: number | null): CotPositioningVerdictId {
  if (zone === "extreme_long" || zone === "strong_long") return "strong_bullish";
  if (zone === "extreme_short" || zone === "strong_short") return "strong_bearish";
  if (zone === "bullish") return "bullish";
  if (zone === "bearish") return "bearish";
  if (zone === "neutral") return "neutral";
  // Fallback to score if zone missing
  if (score === null) return "neutral";
  if (score >= 55) return "strong_bullish";
  if (score >= 25) return "bullish";
  if (score <= -55) return "strong_bearish";
  if (score <= -25) return "bearish";
  return "neutral";
}

function breadthFromCounts(usdFavoring: number, live: number): FxBreadthId {
  if (live === 0) return "mixed";
  const pct = usdFavoring / live;
  if (pct >= 0.67) return "wide_usd";
  if (pct >= 0.5) return "narrow_usd";
  if (pct <= 0.33) return "wide_fx";
  return "mixed";
}

function breadthLeanFromId(id: FxBreadthId): BreadthLeanId {
  if (id === "wide_usd" || id === "narrow_usd") return "usd_favoring";
  if (id === "wide_fx") return "fx_favoring";
  return "mixed";
}

function stanceFromScore(score: number): UsdStanceId {
  if (score <= -12) return "usd_plus";
  if (score >= 12) return "usd_minus";
  return "neutral";
}

function buildCommercialIndex52Series(history: CotHistoryPoint[]): number[] {
  if (history.length < 52) return [];
  const out: number[] = [];
  for (let i = 51; i < history.length; i += 1) {
    const window = history.slice(i - 51, i + 1).map((h) => h.commercialNet);
    out.push(calculateCotIndex(window, window[window.length - 1]!));
  }
  return out;
}

function buildHistoryChart(history: CotHistoryPoint[]): DmeChartPoint[] {
  if (history.length < 2) return [];
  const series26 = buildCommercialIndexSeries(history);
  const series52 = buildCommercialIndex52Series(history);
  const start26 = 25;
  const start52 = 51;
  const out: DmeChartPoint[] = [];

  for (let i = 0; i < history.length; i += 1) {
    const point = history[i]!;
    const net = point.commercialNet;
    const prev4 = i >= 4 ? history[i - 4]!.commercialNet : null;
    out.push({
      date: point.reportDate.slice(0, 10),
      index26w: i >= start26 ? Math.round(series26[i - start26]!) : null,
      index52w: i >= start52 ? Math.round(series52[i - start52]!) : null,
      net: Math.round(net),
      delta4w: prev4 === null ? null : Math.round(net - prev4),
    });
  }

  // Prefer a readable window; keep full span when shorter
  return out.length > 260 ? out.slice(-260) : out;
}

export function buildDmeOverview(bundle: Record<string, CotDashboardData>): DmeOverview {
  const dxy = bundle["DX1!"];
  const dxyAvailable = Boolean(dxy);
  const dxyRead = dxy ? evaluateTitanPositioning(dxy) : null;
  const dxyScore = dxy && Number.isFinite(dxy.cotScore) ? Math.round(computeTitanDashboardScore(dxy)) : null;
  const dxyCommercial26w =
    dxy && Number.isFinite(dxy.commercials.index26w) ? Math.round(dxy.commercials.index26w) : null;
  const dxyCommercial52w =
    dxy && Number.isFinite(dxy.commercials.index52w) ? Math.round(dxy.commercials.index52w) : null;
  const dxyWeeklyChange =
    dxy && Number.isFinite(dxy.commercials.weeklyChange) ? dxy.commercials.weeklyChange : null;
  const dxyDelta4w = dxy && Number.isFinite(dxy.commercials.delta4w) ? dxy.commercials.delta4w : null;
  const dxyDelta13w = dxy && Number.isFinite(dxy.commercials.delta13w) ? dxy.commercials.delta13w : null;
  const dxyZone = dxyRead?.commercialZone ?? (dxyCommercial26w !== null ? commercialIndexZone(dxyCommercial26w) : null);

  const history = dxy?.history ?? [];
  const historyChart = buildHistoryChart(history);
  const dxyChart = historyChart
    .filter((p) => p.index26w !== null)
    .slice(-52)
    .map((p) => ({ date: p.date, index: p.index26w as number }));
  const dxyIndexSpark = dxyChart.slice(-12).map((p) => p.index);

  const panels: DmeFxPanel[] = DME_FX_MARKETS.map((market) => {
    const data = bundle[market.symbol];
    if (!data) {
      return {
        market,
        score: 0,
        verdict: "NEUTRAL",
        regime: "neutral",
        usdFavoring: false,
        stance: "neutral",
        status: "missing",
      };
    }
    const score = Math.round(computeTitanDashboardScore(data));
    const stance = stanceFromScore(score);
    return {
      market,
      score,
      verdict: resolveTitanVerdict(data),
      regime: evaluateTitanPositioning(data)?.regime ?? "neutral",
      usdFavoring: stance === "usd_plus",
      stance,
      status: "live",
    };
  });

  const livePanels = panels.filter((p) => p.status === "live");
  const usdFavoringCount = livePanels.filter((p) => p.stance === "usd_plus").length;
  const fxExtremeCount = livePanels.filter((p) => Math.abs(p.score) >= 40).length;
  const usdBiasPct =
    livePanels.length > 0 ? Math.round((usdFavoringCount / livePanels.length) * 100) : 0;
  const fxBreadth = breadthFromCounts(usdFavoringCount, livePanels.length);

  return {
    dxyAvailable,
    dxyRegime: dxyRead?.regime ?? (dxyAvailable ? "neutral" : null),
    dxyScore,
    dxyCommercial26w,
    dxyCommercial52w,
    dxyWeeklyChange,
    dxyDelta4w,
    dxyDelta13w,
    dxyPersistenceWeeks: dxyRead?.commercialPersistenceWeeks ?? 0,
    dxyZone,
    usdPositioning: usdPositioningFromScore(dxyScore),
    cotVerdict: cotVerdictFromZone(dxyZone, dxyScore),
    dollarPressure: pressureFromScore(dxyScore),
    fxBreadth,
    breadthLean: breadthLeanFromId(fxBreadth),
    usdFavoringCount,
    fxLiveCount: livePanels.length,
    fxExtremeCount,
    usdBiasPct,
    dxyIndexSpark: dxyIndexSpark.length >= 2 ? dxyIndexSpark : [50, 50],
    dxyChart: dxyChart.length >= 2 ? dxyChart : [],
    historyChart,
    panels,
  };
}

export function dmeSparkTone(pressure: DollarPressureId): "bull" | "bear" | "neutral" {
  if (pressure === "elevated") return "bull";
  if (pressure === "soft") return "bear";
  return "neutral";
}

/** Rates lean from FRED yield Δ1W values (percentage points). */
export function ratesLeanFromChanges(changes: Array<number | null | undefined>): RatesLeanId {
  const vals = changes.filter((v): v is number => typeof v === "number" && Number.isFinite(v));
  if (vals.length === 0) return "unknown";
  const up = vals.filter((v) => v > 0.01).length;
  const down = vals.filter((v) => v < -0.01).length;
  if (up > down && up >= Math.ceil(vals.length / 2)) return "rising";
  if (down > up && down >= Math.ceil(vals.length / 2)) return "falling";
  return "flat";
}

/**
 * Alignment = agreement of input leans only (not a price probability).
 * +1 USD-supportive, −1 USD-opposing, 0 neutral/unknown.
 * Result always carries direction when components agree.
 */
export function computeMacroAlignment(input: {
  usdPositioning: UsdPositioningId;
  breadthLean: BreadthLeanId;
  ratesLean: RatesLeanId;
}): MacroAlignmentResult {
  const dxy: AlignmentContribution["dxy"] =
    input.usdPositioning === "bullish" ? 1 : input.usdPositioning === "bearish" ? -1 : 0;
  const breadth: AlignmentContribution["breadth"] =
    input.breadthLean === "usd_favoring" ? 1 : input.breadthLean === "fx_favoring" ? -1 : 0;
  const rates: AlignmentContribution["rates"] =
    input.ratesLean === "rising" ? 1 : input.ratesLean === "falling" ? -1 : 0;

  const contributions: AlignmentContribution = { dxy, breadth, rates };
  const active = [dxy, breadth, rates].filter((s): s is -1 | 1 => s !== 0);

  if (active.length === 0) {
    return { id: "none", contributions };
  }

  const first = active[0]!;
  const aligned = active.every((s) => s === first);
  if (!aligned) {
    return { id: "mixed", contributions };
  }

  if (active.length === 3) {
    return { id: first === 1 ? "strong_bullish" : "strong_bearish", contributions };
  }
  if (active.length === 2) {
    return { id: first === 1 ? "moderate_bullish" : "moderate_bearish", contributions };
  }
  // Only one directional signal — not enough agreement to claim alignment
  return { id: "none", contributions };
}

export function formatContractsDelta(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "—";
  const rounded = Math.round(value);
  const abs = Math.abs(rounded);
  const compact =
    abs >= 1000 ? `${(rounded / 1000).toFixed(1).replace(/\.0$/, "")}k` : String(rounded);
  return `${rounded > 0 ? "+" : ""}${compact}`;
}
