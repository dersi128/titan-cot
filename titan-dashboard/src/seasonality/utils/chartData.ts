import type { SeasonalCurvePoint } from "../types";
import { LOOKBACK_CHART_KEYS, type YearsLookback } from "../yearsLookback";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export { MONTHS };

export const CURRENT_YEAR_CHART_KEY = "currentYear";
export const CURRENT_YEAR_LINE_COLOR = "#F5F5F4";

export const CHART_LOOKBACK_ORDER: readonly YearsLookback[] = [5, 10, 15, 20];

export function lookbackChartKey(lb: YearsLookback): string {
  return LOOKBACK_CHART_KEYS[lb];
}

export function seasonalCurveToMonthlyValues(curve: SeasonalCurvePoint[]): number[] {
  const sums = Array.from({ length: 12 }, () => ({ sum: 0, count: 0 }));
  for (const p of curve) {
    const m = p.month - 1;
    sums[m].sum += p.smoothed;
    sums[m].count += 1;
  }
  return sums.map((s) => (s.count ? s.sum / s.count : 0));
}

export function currentYearCurveToMonthlyValues(
  curve: SeasonalCurvePoint[],
  throughMonth: number,
): (number | null)[] {
  const byMonth = Array.from({ length: 12 }, () => null as number | null);
  for (const p of curve) {
    if (p.month <= throughMonth) {
      byMonth[p.month - 1] = p.smoothed;
    }
  }
  let last: number | null = null;
  return byMonth.map((v, i) => {
    if (i + 1 > throughMonth) return null;
    if (v !== null) last = v;
    return v ?? last;
  });
}

export function buildMonthlyChartRows(
  series: { key: string; values: (number | null)[] | number[] }[],
  currentMonth: number,
): Record<string, string | number | boolean | null>[] {
  return MONTHS.map((month, i) => {
    const row: Record<string, string | number | boolean | null> = {
      month,
      monthIndex: i + 1,
      isCurrent: i + 1 === currentMonth,
    };
    for (const s of series) {
      const v = s.values[i];
      row[s.key] = v === undefined ? null : v;
    }
    return row;
  });
}
