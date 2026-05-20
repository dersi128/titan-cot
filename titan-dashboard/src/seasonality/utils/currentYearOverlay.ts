import type {
  OhlcBar,
  SeasonalBias,
  SeasonalCurvePoint,
  SeasonalityAlignment,
  SeasonalityResult,
} from "../types";

function parseDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function dayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  return Math.floor((date.getTime() - start.getTime()) / 86400000);
}

function normalizeToScale(raw: number[]): number[] {
  if (raw.length === 0) return [];
  const min = Math.min(...raw);
  const max = Math.max(...raw);
  const span = max - min || 1;
  return raw.map((v) => ((v - min) / span) * 100);
}

/**
 * YTD cumulative performance from daily closes (base 100), mapped to calendar days.
 */
export function buildCurrentYearCurve(allBars: OhlcBar[], asOfDate: string): SeasonalCurvePoint[] {
  const sorted = [...allBars].sort((a, b) => a.date.localeCompare(b.date));
  if (sorted.length < 2) return [];

  const asOf = parseDate(asOfDate);
  const targetYear = asOf.getFullYear();

  const yearBars = sorted.filter((b) => {
    const d = parseDate(b.date);
    return d.getFullYear() === targetYear && b.date <= asOfDate;
  });

  if (yearBars.length === 0) return [];

  const firstYearDate = yearBars[0].date;
  const priorIdx = sorted.findIndex((b) => b.date === firstYearDate) - 1;
  const anchorClose = priorIdx >= 0 ? sorted[priorIdx].close : yearBars[0].open;

  const raw: number[] = [];
  const meta: { dayOfYear: number; month: number }[] = [];
  let level = 100;
  let prevClose = anchorClose > 0 ? anchorClose : yearBars[0].close;

  for (const bar of yearBars) {
    if (prevClose > 0 && bar.close > 0) {
      level *= bar.close / prevClose;
    }
    const d = parseDate(bar.date);
    raw.push(level);
    meta.push({ dayOfYear: dayOfYear(d), month: d.getMonth() + 1 });
    prevClose = bar.close;
  }

  const smoothed = normalizeToScale(raw);

  return meta.map((m, i) => ({
    dayOfYear: m.dayOfYear,
    month: m.month,
    value: raw[i],
    smoothed: smoothed[i],
  }));
}

function slopeAroundCurve(points: SeasonalCurvePoint[], centerDoy: number, span = 12): number {
  const samples: number[] = [];
  for (let delta = -span; delta <= span; delta++) {
    const p = points.find((x) => x.dayOfYear === centerDoy + delta);
    if (p) samples.push(p.smoothed);
  }
  if (samples.length < 2) return 0;
  return (samples[samples.length - 1] - samples[0]) / samples.length;
}

export function computeSeasonalityAlignment(
  historicalBias: SeasonalBias,
  historicalSlope: number,
  currentYearCurve: SeasonalCurvePoint[],
  asOfDate: string,
): SeasonalityAlignment {
  if (currentYearCurve.length < 5) return "ALIGNED";

  const doy = dayOfYear(parseDate(asOfDate));
  const cySlope = slopeAroundCurve(currentYearCurve, doy, 12);

  const histDir =
    historicalBias === "BULLISH" ? 1 : historicalBias === "BEARISH" ? -1 : historicalSlope > 0.25 ? 1 : historicalSlope < -0.25 ? -1 : 0;
  const cyDir = cySlope > 0.25 ? 1 : cySlope < -0.25 ? -1 : 0;

  if (histDir === 0 || cyDir === 0 || histDir === cyDir) return "ALIGNED";
  if (Math.abs(historicalSlope) >= 0.55 && Math.abs(cySlope) >= 0.55) return "STRONGLY_DIVERGING";
  return "DIVERGING";
}

export function enrichSeasonalityWithCurrentYear(
  result: SeasonalityResult,
  allBars: OhlcBar[],
  historicalSlope: number,
): SeasonalityResult {
  const currentYearCurve = buildCurrentYearCurve(allBars, result.currentDate);
  const lastPoint = currentYearCurve[currentYearCurve.length - 1];
  const currentYearPerformance = lastPoint ? (lastPoint.value / 100 - 1) * 100 : 0;
  const historicalPerformance = result.currentCurveLevel;
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
    historicalPerformance,
  };
}
