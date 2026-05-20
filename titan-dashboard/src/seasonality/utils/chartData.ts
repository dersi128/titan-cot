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

export function buildMonthlyChartRows(
  series: { key: string; values: number[] }[],
  currentMonth: number,
): Record<string, string | number | boolean>[] {
  return MONTHS.map((month, i) => {
    const row: Record<string, string | number | boolean> = {
      month,
      monthIndex: i + 1,
      isCurrent: i + 1 === currentMonth,
    };
    for (const s of series) {
      row[s.key] = s.values[i] ?? 0;
    }
    return row;
  });
}
