import "../data/ohlcProviderConfig";
import { fetchOhlcWithFallback, getDefaultOhlcProviderId } from "../data/ohlcProviderConfig";
import type { OhlcProviderId } from "../data/types";
import type { OhlcBar, SeasonalityResult } from "../types";
import {
  CHART_COMPARISON_LOOKBACKS,
  DEFAULT_YEARS_LOOKBACK,
  filterBarsByLookback,
  lookbackLabel,
  MAX_OHLC_FETCH_YEARS,
  type YearsLookback,
} from "../yearsLookback";
import { calculateSeasonality, slopeAround } from "../utils/calculateSeasonality";
import { enrichSeasonalityWithCurrentYear } from "../utils/currentYearOverlay";
import { attachSeasonalDeviationAnalysis } from "../utils/seasonalDeviationEngine";

export type SeasonalityServiceOptions = {
  providerId?: OhlcProviderId;
  /** @deprecated Use yearsLookback. Kept for provider fetch sizing only. */
  years?: number;
  yearsLookback?: YearsLookback;
  asOfDate?: string;
};

function attachCurrentYearOverlay(
  base: SeasonalityResult,
  allBars: OhlcBar[],
): SeasonalityResult {
  const histSlope = slopeAround(base.seasonalCurve, 0, 8);
  return enrichSeasonalityWithCurrentYear(base, allBars, histSlope);
}

/**
 * Loads daily OHLC via configured provider and runs the seasonality engine.
 */
export async function fetchSeasonalityAnalysis(
  symbol: string,
  options: SeasonalityServiceOptions = {},
): Promise<SeasonalityResult> {
  const lookback = options.yearsLookback ?? DEFAULT_YEARS_LOOKBACK;
  const fetchYears = Math.max(MAX_OHLC_FETCH_YEARS, options.years ?? MAX_OHLC_FETCH_YEARS);
  const { bars } = await fetchOhlcWithFallback(
    symbol,
    fetchYears,
    options.providerId ?? getDefaultOhlcProviderId(),
  );
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

  let result = attachCurrentYearOverlay(base, bars);
  if (lookback === 10) {
    result = attachSeasonalDeviationAnalysis(result);
  }
  return result;
}

export type SeasonalityComparison = Partial<Record<YearsLookback, SeasonalityResult>>;

/**
 * One OHLC fetch, multiple lookback curves + current-year overlay per window.
 */
export async function fetchSeasonalityComparison(
  symbol: string,
  options: Omit<SeasonalityServiceOptions, "yearsLookback"> & {
    lookbacks?: readonly YearsLookback[];
  } = {},
): Promise<SeasonalityComparison> {
  const fetchYears = Math.max(MAX_OHLC_FETCH_YEARS, options.years ?? MAX_OHLC_FETCH_YEARS);
  const { bars } = await fetchOhlcWithFallback(
    symbol,
    fetchYears,
    options.providerId ?? getDefaultOhlcProviderId(),
  );
  return buildComparisonFromBars(symbol, bars, options);
}

export async function fetchSeasonalityComparisonWithSource(
  symbol: string,
  options: Omit<SeasonalityServiceOptions, "yearsLookback"> & {
    lookbacks?: readonly YearsLookback[];
  } = {},
): Promise<{ comparison: SeasonalityComparison; ohlcSource: OhlcProviderId }> {
  const fetchYears = Math.max(MAX_OHLC_FETCH_YEARS, options.years ?? MAX_OHLC_FETCH_YEARS);
  const { bars, source } = await fetchOhlcWithFallback(
    symbol,
    fetchYears,
    options.providerId ?? getDefaultOhlcProviderId(),
  );
  const comparison = await buildComparisonFromBars(symbol, bars, options);
  return { comparison, ohlcSource: source };
}

async function buildComparisonFromBars(
  symbol: string,
  bars: OhlcBar[],
  options: Omit<SeasonalityServiceOptions, "yearsLookback"> & { lookbacks?: readonly YearsLookback[] },
): Promise<SeasonalityComparison> {
  const lookbacks = options.lookbacks ?? CHART_COMPARISON_LOOKBACKS;
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
    let enriched = attachCurrentYearOverlay(base, bars);
    if (lb === 10) {
      enriched = attachSeasonalDeviationAnalysis(enriched);
    }
    comparison[lb] = enriched;
  }

  if (!comparison[DEFAULT_YEARS_LOOKBACK] && !comparison[10]) {
    throw new Error(`Insufficient OHLC history for ${symbol}`);
  }

  return comparison;
}
