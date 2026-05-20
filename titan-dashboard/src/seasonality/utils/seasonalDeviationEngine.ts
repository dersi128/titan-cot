import type {
  SeasonalCurvePoint,
  SeasonalityAlignment,
  SeasonalityResult,
  SeasonalWindow,
} from "../types";

export type SeasonalDeviationLevel = "LOW" | "MODERATE" | "HIGH" | "EXTREME";
export type SeasonalStability = "STABLE" | "UNSTABLE" | "FRAGMENTED";
export type SeasonalTrackingStatus = "above" | "below" | "on_path";

export type SeasonalDeviationBreakdownMarker = {
  month: string;
  monthIndex: number;
  dayOfYear: number;
};

export type SeasonalDeviationFailure = {
  messageKey: string;
  month: number;
  monthLabel: string;
};

export type SeasonalDeviationMonthlyHeat = {
  month: number;
  avgDistance: number;
  level: SeasonalDeviationLevel;
};

export type SeasonalDeviationAnalysis = {
  level: SeasonalDeviationLevel;
  /** Signed gap vs 10Y expectation at current date (index points, 0–100 scale). */
  deviationPct: number;
  meanAbsDistance: number;
  alignment: SeasonalityAlignment;
  trackingStatus: SeasonalTrackingStatus;
  failure: SeasonalDeviationFailure | null;
  stability: SeasonalStability;
  breakdownMarkers: SeasonalDeviationBreakdownMarker[];
  monthlyDeviationHeat: SeasonalDeviationMonthlyHeat[];
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

type DeviationSample = {
  dayOfYear: number;
  month: number;
  distance: number;
  signedGap: number;
};

function parseDoy(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const start = new Date(date.getFullYear(), 0, 0);
  return Math.floor((date.getTime() - start.getTime()) / 86400000);
}

function histSmoothedAt(curve: SeasonalCurvePoint[], doy: number): number | null {
  const exact = curve.find((p) => p.dayOfYear === doy);
  if (exact) return exact.smoothed;
  const sorted = [...curve].sort((a, b) => a.dayOfYear - b.dayOfYear);
  let prev: SeasonalCurvePoint | null = null;
  for (const p of sorted) {
    if (p.dayOfYear > doy) {
      if (!prev) return p.smoothed;
      const span = p.dayOfYear - prev.dayOfYear || 1;
      const t = (doy - prev.dayOfYear) / span;
      return prev.smoothed + t * (p.smoothed - prev.smoothed);
    }
    prev = p;
  }
  return prev?.smoothed ?? null;
}

function slopeAround(points: SeasonalCurvePoint[], center: number, span = 12): number {
  const samples: number[] = [];
  for (let delta = -span; delta <= span; delta++) {
    const p = points.find(
      (x) =>
        x.tradingDayOffset !== undefined
          ? x.tradingDayOffset === center + delta
          : x.dayOfYear === center + delta,
    );
    if (p) samples.push(p.smoothed);
  }
  if (samples.length < 2) return 0;
  return (samples[samples.length - 1] - samples[0]) / samples.length;
}

function linearSlope(values: number[]): number {
  if (values.length < 2) return 0;
  return (values[values.length - 1] - values[0]) / values.length;
}

function stdDev(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

function classifyDeviationLevel(score: number): SeasonalDeviationLevel {
  if (score >= 22) return "EXTREME";
  if (score >= 14) return "HIGH";
  if (score >= 7) return "MODERATE";
  return "LOW";
}

function histAtOffset(hist: SeasonalCurvePoint[], offset: number): number | null {
  const exact = hist.find((p) => p.tradingDayOffset === offset);
  if (exact) return exact.smoothed;
  return histSmoothedAt(hist, offset);
}

function buildDeviationSamples(reference10Y: SeasonalityResult): DeviationSample[] {
  const hist =
    reference10Y.rollingProjections?.[60] ??
    reference10Y.momentumAdjustedCurve ??
    reference10Y.seasonalCurve;
  const cy = reference10Y.currentYearCurve;
  if (hist.length < 5 || cy.length < 5) return [];

  const samples: DeviationSample[] = [];
  for (const point of cy) {
    const off = point.tradingDayOffset ?? 0;
    const expected =
      hist.find((p) => p.tradingDayOffset === off)?.smoothed ?? histAtOffset(hist, off);
    if (expected === null) continue;
    samples.push({
      dayOfYear: point.dayOfYear,
      month: point.month,
      distance: Math.abs(point.smoothed - expected),
      signedGap: point.smoothed - expected,
    });
  }
  return samples;
}

function computeAlignment(
  samples: DeviationSample[],
  currentGap: number,
  cySlope: number,
  histSlope: number,
  meanAbs: number,
): SeasonalityAlignment {
  if (samples.length < 5) return "ALIGNED";

  const gaps = samples.map((s) => s.signedGap);
  const gapTrend = linearSlope(gaps.slice(-Math.min(18, gaps.length)));
  const opposite =
    (cySlope > 0.22 && histSlope < -0.22) || (cySlope < -0.22 && histSlope > 0.22);
  const widening = gapTrend > 0.45 && Math.abs(currentGap) >= 8;
  const ignoring = Math.abs(currentGap) >= 20 && (opposite || gapTrend > 0.65);
  const pathAligned = !opposite && Math.abs(currentGap) <= 10 && !widening;

  if (ignoring || (meanAbs >= 16 && opposite && Math.abs(currentGap) >= 14)) {
    return "STRONGLY_DIVERGING";
  }
  if (widening || opposite || (Math.abs(currentGap) >= 12 && gapTrend > 0.35)) {
    return "DIVERGING";
  }
  if (pathAligned || (!opposite && Math.abs(currentGap) < 14)) {
    return "ALIGNED";
  }
  return "DIVERGING";
}

function monthInWindow(month: number, window: SeasonalWindow): boolean {
  const startM = new Date(2024, 0, window.startDay).getMonth() + 1;
  const endM = new Date(2024, 0, window.endDay).getMonth() + 1;
  if (startM <= endM) return month >= startM && month <= endM;
  return month >= startM || month <= endM;
}

function monthCurveDelta(curve: SeasonalCurvePoint[], month: number): number | null {
  const pts = curve.filter((p) => p.month === month);
  if (pts.length < 2) return pts[0] ? pts[0].smoothed : null;
  return pts[pts.length - 1].smoothed - pts[0].smoothed;
}

function detectFailure(
  reference10Y: SeasonalityResult,
  throughMonth: number,
): SeasonalDeviationFailure | null {
  const cy = reference10Y.currentYearCurve;
  const hist = reference10Y.seasonalCurve;
  if (cy.length < 3) return null;

  const windows = [
    ...reference10Y.bullishWindows.map((w) => ({ ...w, bias: "bullish" as const })),
    ...reference10Y.bearishWindows.map((w) => ({ ...w, bias: "bearish" as const })),
  ];

  for (let month = 1; month <= throughMonth; month++) {
    const cyDelta = monthCurveDelta(cy, month);
    const histDelta = monthCurveDelta(hist, month);
    if (cyDelta === null || histDelta === null) continue;

    for (const w of windows) {
      if (!monthInWindow(month, w)) continue;
      if (w.bias === "bullish" && cyDelta < -7 && histDelta > 1.5) {
        return {
          messageKey: "seasonality.deviation.failureBullMonth",
          month,
          monthLabel: MONTHS[month - 1],
        };
      }
      if (w.bias === "bearish" && cyDelta > 7 && histDelta < -1.5) {
        return {
          messageKey: "seasonality.deviation.failureBearMonth",
          month,
          monthLabel: MONTHS[month - 1],
        };
      }
    }
  }

  const currentGap = (() => {
    const last = cy[cy.length - 1];
    const exp = histSmoothedAt(hist, last.dayOfYear);
    return exp !== null ? last.smoothed - exp : 0;
  })();

  if (currentGap < -14) {
    return {
      messageKey: "seasonality.deviation.failureBelowPath",
      month: throughMonth,
      monthLabel: MONTHS[throughMonth - 1],
    };
  }

  return null;
}

function detectStability(samples: DeviationSample[]): SeasonalStability {
  if (samples.length < 8) return "STABLE";

  const signed = samples.map((s) => s.signedGap);
  const recent = signed.slice(-Math.min(45, signed.length));
  const variance = stdDev(recent);
  const gapTrend = linearSlope(recent);

  let signFlips = 0;
  for (let i = 1; i < recent.length; i++) {
    if (recent[i - 1] === 0 || recent[i] === 0) continue;
    if (Math.sign(recent[i - 1]) !== Math.sign(recent[i])) signFlips++;
  }

  if (signFlips >= 4 && variance >= 9) return "FRAGMENTED";
  if (gapTrend > 0.75 || variance >= 13) return "UNSTABLE";
  return "STABLE";
}

function detectBreakdownMarkers(samples: DeviationSample[]): SeasonalDeviationBreakdownMarker[] {
  const markers: SeasonalDeviationBreakdownMarker[] = [];
  for (let i = 1; i < samples.length; i++) {
    const jump = samples[i].distance - samples[i - 1].distance;
    if (jump >= 4.5) {
      markers.push({
        month: MONTHS[samples[i].month - 1],
        monthIndex: samples[i].month,
        dayOfYear: samples[i].dayOfYear,
      });
    }
  }
  return markers.slice(-4);
}

function buildMonthlyHeat(samples: DeviationSample[]): SeasonalDeviationMonthlyHeat[] {
  const heat: SeasonalDeviationMonthlyHeat[] = [];
  for (let month = 1; month <= 12; month++) {
    const monthSamples = samples.filter((s) => s.month === month);
    if (monthSamples.length === 0) {
      heat.push({ month, avgDistance: 0, level: "LOW" });
      continue;
    }
    const avgDistance = monthSamples.reduce((s, p) => s + p.distance, 0) / monthSamples.length;
    heat.push({ month, avgDistance, level: classifyDeviationLevel(avgDistance) });
  }
  return heat;
}

/**
 * Institutional interpretation layer: Current Year vs 10Y seasonal expectation.
 * Does not alter core seasonality curve calculations.
 */
export function computeSeasonalDeviation(reference10Y: SeasonalityResult): SeasonalDeviationAnalysis {
  const samples = buildDeviationSamples(reference10Y);
  const currentDoy = parseDoy(reference10Y.currentDate);
  const currentMonth = new Date(reference10Y.currentDate).getMonth() + 1;

  const lastSample = samples[samples.length - 1];
  const currentGap = lastSample?.signedGap ?? 0;
  const meanAbs =
    samples.length > 0 ? samples.reduce((s, p) => s + p.distance, 0) / samples.length : 0;
  const score = Math.max(meanAbs, Math.abs(currentGap));
  const level = classifyDeviationLevel(score);

  const histCurve =
    reference10Y.rollingProjections?.[60] ??
    reference10Y.momentumAdjustedCurve ??
    reference10Y.seasonalCurve;
  const cySlope = slopeAround(reference10Y.currentYearCurve, 0, 5);
  const histSlope = slopeAround(histCurve, 0, 5);
  const alignment = computeAlignment(samples, currentGap, cySlope, histSlope, meanAbs);

  let trackingStatus: SeasonalTrackingStatus = "on_path";
  if (currentGap > 5) trackingStatus = "above";
  else if (currentGap < -5) trackingStatus = "below";

  return {
    level,
    deviationPct: Math.round(currentGap * 10) / 10,
    meanAbsDistance: Math.round(meanAbs * 10) / 10,
    alignment,
    trackingStatus,
    failure: detectFailure(reference10Y, currentMonth),
    stability: detectStability(samples),
    breakdownMarkers: detectBreakdownMarkers(samples),
    monthlyDeviationHeat: buildMonthlyHeat(samples),
  };
}

export function attachSeasonalDeviationAnalysis(result: SeasonalityResult): SeasonalityResult {
  const deviationAnalysis = computeSeasonalDeviation(result);
  return {
    ...result,
    seasonalityAlignment: deviationAnalysis.alignment,
    deviationAnalysis,
  };
}
