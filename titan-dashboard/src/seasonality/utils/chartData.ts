import type { SeasonalCurvePoint } from "../types";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export { MONTHS };

export function seasonalCurveToMonthlyValues(curve: SeasonalCurvePoint[]): number[] {
  const sums = Array.from({ length: 12 }, () => ({ sum: 0, count: 0 }));
  for (const p of curve) {
    const m = p.month - 1;
    sums[m].sum += p.smoothed;
    sums[m].count += 1;
  }
  return sums.map((s) => (s.count ? s.sum / s.count : 0));
}

/** Last smoothed index per month; months after `throughMonth` stay null (YTD line stops). */
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

export const HISTORICAL_CHART_KEY = "historical";
export const CURRENT_YEAR_CHART_KEY = "currentYear";
export const HISTORICAL_LINE_COLOR = "#D4AF37";
export const CURRENT_YEAR_LINE_COLOR = "#9AE8FF";

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
