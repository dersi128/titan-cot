import { getConfiguredOhlcProviderId } from "../data/ohlcProviderConfig.js";
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
import { calculateSeasonality } from "../utils/calculateSeasonality.js";
import { slopeAround } from "../utils/rollingSeasonalityClassifiers.js";
import { enrichSeasonalityWithCurrentYear } from "../utils/currentYearOverlay.js";
import {
  filterBarsByPresidentialPhases,
  type PresidentialCyclePhase,
} from "../utils/presidentialCycle.js";
import { filterBarsByExcludedYears } from "../utils/yearSelection.js";
import type { OhlcBar, SeasonalityResult } from "../types.js";

export type SeasonalityServiceOptions = {
  providerId?: OhlcProviderId;
  years?: number;
  yearsLookback?: YearsLookback;
  asOfDate?: string;
  presidentialPhases?: PresidentialCyclePhase[] | null;
  excludedYears?: number[] | null;
};

function latestBarDate(bars: OhlcBar[]): string | undefined {
  if (!bars.length) return undefined;
  let max = bars[0]!.date;
  for (const b of bars) {
    if (b.date > max) max = b.date;
  }
  return max;
}

function resolveAsOfDate(bars: OhlcBar[], asOfDate?: string): string | undefined {
  return asOfDate ?? latestBarDate(bars);
}

function attachCurrentYearOverlay(base: SeasonalityResult, allBars: OhlcBar[]): SeasonalityResult {
  const histSlope = slopeAround(base.seasonalCurve, 0, 8);
  return enrichSeasonalityWithCurrentYear(base, allBars, histSlope);
}

export async function fetchSeasonalityAnalysis(
  symbol: string,
  options: SeasonalityServiceOptions = {},
): Promise<SeasonalityResult> {
  const lookback = options.yearsLookback ?? DEFAULT_YEARS_LOOKBACK;
  const provider = getOhlcProvider(options.providerId ?? getConfiguredOhlcProviderId());
  const fetchYears = Math.max(MAX_OHLC_FETCH_YEARS, options.years ?? MAX_OHLC_FETCH_YEARS);
  const bars = await provider.fetchDailyOHLC(symbol, { years: fetchYears });
  const asOfDate = resolveAsOfDate(bars, options.asOfDate);
  const cycleBars = filterBarsByPresidentialPhases(bars, options.presidentialPhases);
  const yearBars = filterBarsByExcludedYears(cycleBars, options.excludedYears);
  const filtered = filterBarsByLookback(yearBars, lookback, asOfDate);

  if (filtered.length < 180) {
    throw new Error(
      `Insufficient OHLC history for ${symbol} after filters (${filtered.length} bars, ${lookbackLabel(lookback)})`,
    );
  }

  const base = calculateSeasonality({
    symbol,
    bars: filtered,
    asOfDate,
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
  const provider = getOhlcProvider(options.providerId ?? getConfiguredOhlcProviderId());
  const fetchYears = Math.max(MAX_OHLC_FETCH_YEARS, options.years ?? MAX_OHLC_FETCH_YEARS);
  const bars = await provider.fetchDailyOHLC(symbol, { years: fetchYears });
  const asOfDate = resolveAsOfDate(bars, options.asOfDate);
  const cycleBars = filterBarsByPresidentialPhases(bars, options.presidentialPhases);
  const yearBars = filterBarsByExcludedYears(cycleBars, options.excludedYears);

  const comparison: SeasonalityComparison = {};

  for (const lb of lookbacks) {
    const filtered = filterBarsByLookback(yearBars, lb, asOfDate);
    if (filtered.length < 180) continue;
    const base = calculateSeasonality({
      symbol,
      bars: filtered,
      asOfDate,
      yearsLookback: lb,
    });
    comparison[lb] = attachCurrentYearOverlay(base, bars);
  }

  const primary = comparison[DEFAULT_YEARS_LOOKBACK];
  if (!primary) {
    const first = YEARS_LOOKBACK_OPTIONS.find((lb) => comparison[lb]);
    if (!first || !comparison[first]) {
      throw new Error(`Insufficient OHLC history for ${symbol} with selected year / cycle filters`);
    }
  }

  return comparison;
}
