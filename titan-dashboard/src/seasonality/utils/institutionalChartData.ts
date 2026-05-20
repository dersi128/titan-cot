import type { SeasonalityComparison } from "../services/seasonalityService";
import type { SeasonalCurvePoint, SeasonalityResult, RollingWindowDays } from "../types";
import {
  CHART_LOOKBACK_ORDER,
  CURRENT_YEAR_CHART_KEY,
  lookbackChartKey,
  MONTHS,
  seasonalCurveToMonthlyValues,
  type SeasonalityChartRow,
} from "./chartData";
import {
  ROLLING_CHART_KEYS,
  ROLLING_CHART_ORDER,
} from "./rollingChartData";

const TRADING_DAYS_PER_MONTH = 21;

/** Shared 0–100 scale across every series on the chart. */
export function normalizeTogether(
  series: Record<string, (number | null)[]>,
): Record<string, (number | null)[]> {
  const nums: number[] = [];
  for (const arr of Object.values(series)) {
    for (const v of arr) {
      if (typeof v === "number" && !Number.isNaN(v)) nums.push(v);
    }
  }
  if (!nums.length) return series;

  const min = Math.min(...nums);
  const max = Math.max(...nums);
  const span = max - min || 1;

  const out: Record<string, (number | null)[]> = {};
  for (const [key, arr] of Object.entries(series)) {
    out[key] = arr.map((v) =>
      typeof v === "number" && !Number.isNaN(v) ? ((v - min) / span) * 100 : null,
    );
  }
  return out;
}

function monthlyFromLiveCurve(curve: SeasonalCurvePoint[], throughMonth: number): (number | null)[] {
  const byMonth = Array.from({ length: 12 }, () => null as number | null);
  for (const p of curve) {
    if (p.month <= throughMonth) {
      byMonth[p.month - 1] = p.value;
    }
  }
  let last: number | null = null;
  return byMonth.map((v, i) => {
    if (i + 1 > throughMonth) return null;
    if (v !== null) last = v;
    return v ?? last;
  });
}

function projectionValueAtOffset(curve: SeasonalCurvePoint[], offset: number): number {
  const exact = curve.find((p) => p.tradingDayOffset === offset);
  if (exact) return exact.value;
  const sorted = [...curve].sort((a, b) => (a.tradingDayOffset ?? 0) - (b.tradingDayOffset ?? 0));
  let prev = sorted[0];
  for (const p of sorted) {
    if ((p.tradingDayOffset ?? 0) >= offset) {
      if (!prev) return p.value;
      const span = (p.tradingDayOffset ?? 0) - (prev.tradingDayOffset ?? 0) || 1;
      const t = (offset - (prev.tradingDayOffset ?? 0)) / span;
      return prev.value + t * (p.value - prev.value);
    }
    prev = p;
  }
  return prev?.value ?? 100;
}

/**
 * Forward projection continues from live anchor at current month (ratio path, no reset).
 */
export function anchoredProjectionMonthly(
  projection: SeasonalCurvePoint[],
  liveAnchor: number,
  currentMonth: number,
): (number | null)[] {
  const months = Array.from({ length: 12 }, () => null as number | null);
  if (!projection.length || liveAnchor <= 0) return months;

  const base = projectionValueAtOffset(projection, 0);
  if (base <= 0) return months;

  for (let m = 1; m <= 12; m++) {
    if (m < currentMonth) continue;
    const forwardDays = Math.max(0, (m - currentMonth) * TRADING_DAYS_PER_MONTH);
    const projected = projectionValueAtOffset(projection, forwardDays);
    months[m - 1] = liveAnchor * (projected / base);
  }

  months[currentMonth - 1] = liveAnchor;

  if (currentMonth > 1) {
    const prev = months[currentMonth - 2];
    if (typeof prev === "number") {
      months[currentMonth - 1] = prev + (liveAnchor - prev) * 0.65;
    }
  }

  return months;
}

export function buildInstitutionalChartRows(
  result: SeasonalityResult,
  comparison: SeasonalityComparison,
  currentMonth: number,
): SeasonalityChartRow[] {
  const raw: Record<string, (number | null)[]> = {};

  for (const lb of CHART_LOOKBACK_ORDER) {
    const res = comparison[lb];
    if (!res) continue;
    raw[lookbackChartKey(lb)] = seasonalCurveToMonthlyValues(res.seasonalCurve);
  }

  const liveRaw = monthlyFromLiveCurve(result.currentYearCurve, currentMonth);
  raw[CURRENT_YEAR_CHART_KEY] = liveRaw;

  const liveAnchor = liveRaw[currentMonth - 1] ?? 100;

  for (const w of ROLLING_CHART_ORDER) {
    const proj = result.rollingProjections?.[w] ?? [];
    raw[ROLLING_CHART_KEYS[w]] = anchoredProjectionMonthly(proj, liveAnchor, currentMonth);
  }

  const normalized = normalizeTogether(raw);
  const monthly = result.currentYearMonthlyReturns ?? [];

  return MONTHS.map((month, i) => {
    const monthIndex = i + 1;
    const row: SeasonalityChartRow = {
      month,
      monthIndex,
      isCurrent: monthIndex === currentMonth,
      monthReturnPct: monthly[i]?.pct ?? null,
    };
    for (const [key, values] of Object.entries(normalized)) {
      row[key] = values[i] ?? null;
    }
    const hist10 = normalized[lookbackChartKey(10)];
    const live = normalized[CURRENT_YEAR_CHART_KEY];
    if (typeof hist10 === "number" && typeof live === "number") {
      row.seasonalIndex = live - hist10;
    } else {
      row.seasonalIndex = null;
    }
    return row;
  });
}

export function windowsForMonthlyChart(comparison: SeasonalityComparison): SeasonalityResult["bullishWindows"] {
  const ref = comparison[10];
  if (!ref) return [];
  return ref.bullishWindows?.length ? ref.bullishWindows : [];
}

export function bearishWindowsForMonthlyChart(comparison: SeasonalityComparison): SeasonalityResult["bearishWindows"] {
  const ref = comparison[10];
  if (!ref) return [];
  return ref.bearishWindows ?? [];
}
