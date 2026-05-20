import type {
  OhlcBar,
  SeasonalBias,
  SeasonalCurvePoint,
  SeasonalityAlignment,
  SeasonalityResult,
} from "../types";
import { buildTradingDaySeries, parseIso } from "./tradingDays";
import { computeCurrentYearMonthlyReturns } from "./monthlyYearReturns";

const DYNAMIC_LOOKBACK_DAYS = 60;

/**
 * Rolling-anchored YTD path: base 100 at window start (no full-year min-max squash).
 */
export function buildDynamicCurrentYearCurve(
  allBars: OhlcBar[],
  asOfDate: string,
  lookbackTradingDays = DYNAMIC_LOOKBACK_DAYS,
): SeasonalCurvePoint[] {
  const rows = buildTradingDaySeries(allBars);
  const asOfYear = parseIso(asOfDate).getFullYear();
  const yearRows = rows.filter((r) => r.year === asOfYear && r.date <= asOfDate);
  if (yearRows.length < 2) return [];

  const window = yearRows.slice(-lookbackTradingDays);
  const raw: number[] = [100];
  for (let i = 1; i < window.length; i++) {
    raw.push(raw[i - 1] * (1 + window[i].ret));
  }

  return window.map((row, i) => ({
    dayOfYear: row.tdy,
    month: row.month,
    value: raw[i],
    smoothed: raw[i],
    tradingDayOffset: i - (window.length - 1),
  }));
}

function slopeAroundCurve(points: SeasonalCurvePoint[], centerOffset = 0, span = 5): number {
  const samples: number[] = [];
  for (let delta = -span; delta <= span; delta++) {
    const p = points.find((x) => x.tradingDayOffset === centerOffset + delta);
    if (p) samples.push(p.smoothed);
  }
  if (samples.length < 2) return 0;
  return (samples[samples.length - 1] - samples[0]) / samples.length;
}

export function computeSeasonalityAlignment(
  historicalBias: SeasonalBias,
  historicalSlope: number,
  currentYearCurve: SeasonalCurvePoint[],
  _asOfDate: string,
): SeasonalityAlignment {
  if (currentYearCurve.length < 5) return "ALIGNED";

  const cySlope = slopeAroundCurve(currentYearCurve, 0, 5);
  const histDir =
    historicalBias === "BULLISH" ? 1 : historicalBias === "BEARISH" ? -1 : historicalSlope > 0.25 ? 1 : historicalSlope < -0.25 ? -1 : 0;
  const cyDir = cySlope > 0.15 ? 1 : cySlope < -0.15 ? -1 : 0;

  if (histDir === 0 || cyDir === 0 || histDir === cyDir) return "ALIGNED";
  if (Math.abs(historicalSlope) >= 0.45 && Math.abs(cySlope) >= 0.45) return "STRONGLY_DIVERGING";
  return "DIVERGING";
}

export function enrichSeasonalityWithCurrentYear(
  result: SeasonalityResult,
  allBars: OhlcBar[],
  historicalSlope: number,
): SeasonalityResult {
  const currentYearCurve = buildDynamicCurrentYearCurve(allBars, result.currentDate);
  const lastPoint = currentYearCurve[currentYearCurve.length - 1];
  const firstPoint = currentYearCurve[0];
  const currentYearPerformance =
    firstPoint && lastPoint && firstPoint.value > 0
      ? (lastPoint.value / firstPoint.value - 1) * 100
      : 0;

  const seasonalityAlignment = computeSeasonalityAlignment(
    result.seasonalBias,
    historicalSlope,
    currentYearCurve,
    result.currentDate,
  );

  return {
    ...result,
    currentYearCurve,
    seasonalityAlignment,
    currentYearPerformance,
    historicalPerformance: result.momentumAdjustedCurve?.[0]?.smoothed ?? result.currentCurveLevel,
    currentYearMonthlyReturns: computeCurrentYearMonthlyReturns(allBars, result.currentDate),
  };
}
