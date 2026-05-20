import { getOhlcProvider } from "../data/providers.js";
import type { OhlcProviderId } from "../data/types.js";
import {
  CHART_COMPARISON_LOOKBACKS,
  DEFAULT_YEARS_LOOKBACK,
  filterBarsByLookback,
  lookbackLabel,
  MAX_OHLC_FETCH_YEARS,
  YEARS_LOOKBACK_OPTIONS,
  type YearsLookback,
} from "../yearsLookback.js";
import { calculateSeasonality, slopeAround } from "../utils/calculateSeasonality.js";
import { enrichSeasonalityWithCurrentYear } from "../utils/currentYearOverlay.js";
import type { OhlcBar, SeasonalityResult } from "../types.js";

export type SeasonalityServiceOptions = {
  providerId?: OhlcProviderId;
  years?: number;
  yearsLookback?: YearsLookback;
  asOfDate?: string;
};

function dayOfYearFromIso(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const start = new Date(date.getFullYear(), 0, 0);
  return Math.floor((date.getTime() - start.getTime()) / 86400000);
}

function attachCurrentYearOverlay(base: SeasonalityResult, allBars: OhlcBar[]): SeasonalityResult {
  const currentDoy = dayOfYearFromIso(base.currentDate);
  const histSlope = slopeAround(base.seasonalCurve, currentDoy, 15);
  return enrichSeasonalityWithCurrentYear(base, allBars, histSlope);
}

export async function fetchSeasonalityAnalysis(
  symbol: string,
  options: SeasonalityServiceOptions = {},
): Promise<SeasonalityResult> {
  const lookback = options.yearsLookback ?? DEFAULT_YEARS_LOOKBACK;
  const provider = getOhlcProvider(options.providerId ?? "mock");
  const fetchYears = Math.max(MAX_OHLC_FETCH_YEARS, options.years ?? MAX_OHLC_FETCH_YEARS);
  const bars = await provider.fetchDailyOHLC(symbol, { years: fetchYears });
  const filtered = filterBarsByLookback(bars, lookback, options.asOfDate);

  if (filtered.length < 252) {
    throw new Error(`Insufficient OHLC history for ${symbol} (${filtered.length} bars, ${lookbackLabel(lookback)})`);
  }

  const base = calculateSeasonality({
    symbol,
    bars: filtered,
    asOfDate: options.asOfDate,
    yearsLookback: lookback,
  });

  return attachCurrentYearOverlay(base, bars);
}

export type SeasonalityComparison = Partial<Record<YearsLookback, SeasonalityResult>>;

export async function fetchSeasonalityComparison(
  symbol: string,
  options: Omit<SeasonalityServiceOptions, "yearsLookback"> & {
    lookbacks?: readonly YearsLookback[];
  } = {},
): Promise<SeasonalityComparison> {
  const lookbacks = options.lookbacks ?? CHART_COMPARISON_LOOKBACKS;
  const provider = getOhlcProvider(options.providerId ?? "mock");
  const fetchYears = Math.max(MAX_OHLC_FETCH_YEARS, options.years ?? MAX_OHLC_FETCH_YEARS);
  const bars = await provider.fetchDailyOHLC(symbol, { years: fetchYears });

  const comparison: SeasonalityComparison = {};

  for (const lb of lookbacks) {
    const filtered = filterBarsByLookback(bars, lb, options.asOfDate);
    if (filtered.length < 252) continue;
    const base = calculateSeasonality({
      symbol,
      bars: filtered,
      asOfDate: options.asOfDate,
      yearsLookback: lb,
    });
    comparison[lb] = attachCurrentYearOverlay(base, bars);
  }

  const primary = comparison[DEFAULT_YEARS_LOOKBACK];
  if (!primary) {
    const first = YEARS_LOOKBACK_OPTIONS.find((lb) => comparison[lb]);
    if (!first || !comparison[first]) {
      throw new Error(`Insufficient OHLC history for ${symbol}`);
    }
  }

  return comparison;
}
