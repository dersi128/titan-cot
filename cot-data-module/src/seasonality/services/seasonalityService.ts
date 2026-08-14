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
import { calculateSeasonality, slopeAround } from "../utils/calculateSeasonality.js";
import { enrichSeasonalityWithCurrentYear } from "../utils/currentYearOverlay.js";
import {
  filterBarsByPresidentialPhases,
  type PresidentialCyclePhase,
} from "../utils/presidentialCycle.js";
import type { OhlcBar, SeasonalityResult } from "../types.js";

export type SeasonalityServiceOptions = {
  providerId?: OhlcProviderId;
  years?: number;
  yearsLookback?: YearsLookback;
  asOfDate?: string;
  presidentialPhases?: PresidentialCyclePhase[] | null;
};

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
  const cycleBars = filterBarsByPresidentialPhases(bars, options.presidentialPhases);
  const filtered = filterBarsByLookback(cycleBars, lookback, options.asOfDate);

  if (filtered.length < 180) {
    throw new Error(
      `Insufficient OHLC history for ${symbol} after presidential filter (${filtered.length} bars, ${lookbackLabel(lookback)})`,
    );
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
  const provider = getOhlcProvider(options.providerId ?? getConfiguredOhlcProviderId());
  const fetchYears = Math.max(MAX_OHLC_FETCH_YEARS, options.years ?? MAX_OHLC_FETCH_YEARS);
  const bars = await provider.fetchDailyOHLC(symbol, { years: fetchYears });
  const cycleBars = filterBarsByPresidentialPhases(bars, options.presidentialPhases);

  const comparison: SeasonalityComparison = {};

  for (const lb of lookbacks) {
    const filtered = filterBarsByLookback(cycleBars, lb, options.asOfDate);
    if (filtered.length < 180) continue;
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
      throw new Error(`Insufficient OHLC history for ${symbol} with selected presidential cycles`);
    }
  }

  return comparison;
}
