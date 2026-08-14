import type { OhlcBar, SeasonalBias, MonthlyStat } from "../types";
import { parseIso } from "./tradingDays";

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri"];

export type WeekdayStat = {
  /** 1=Mon … 5=Fri */
  weekday: number;
  weekdayLabel: string;
  avgReturn: number;
  winRate: number;
  bias: SeasonalBias;
};

function mean(values: number[]): number {
  if (!values.length) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function biasFromReturn(avg: number, bull = 0.0005, bear = -0.0005): SeasonalBias {
  if (avg > bull) return "BULLISH";
  if (avg < bear) return "BEARISH";
  return "NEUTRAL";
}

/**
 * Seasonax-style: average of each year's calendar-month return (not mean of daily).
 */
export function buildCalendarMonthlyStats(bars: OhlcBar[]): {
  monthlyStats: MonthlyStat[];
  winRateByMonth: Record<number, number>;
  averageReturnByMonth: Record<number, number>;
} {
  const sorted = [...bars].sort((a, b) => a.date.localeCompare(b.date));
  const byYearMonth = new Map<string, OhlcBar[]>();

  for (const bar of sorted) {
    const d = parseIso(bar.date);
    const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
    const list = byYearMonth.get(key) ?? [];
    list.push(bar);
    byYearMonth.set(key, list);
  }

  const monthYearRets = new Map<number, number[]>();

  for (const [key, monthBars] of byYearMonth) {
    if (monthBars.length < 2) continue;
    const [, monthStr] = key.split("-");
    const month = Number(monthStr);
    const first = monthBars[0];
    const last = monthBars[monthBars.length - 1];
    if (first.close <= 0 || last.close <= 0) continue;
    const ret = last.close / first.close - 1;
    const list = monthYearRets.get(month) ?? [];
    list.push(ret);
    monthYearRets.set(month, list);
  }

  const monthlyStats: MonthlyStat[] = [];
  const winRateByMonth: Record<number, number> = {};
  const averageReturnByMonth: Record<number, number> = {};

  for (let m = 1; m <= 12; m++) {
    const rets = monthYearRets.get(m) ?? [];
    const avg = rets.length ? mean(rets) : 0;
    const winRate = rets.length ? (rets.filter((x) => x > 0).length / rets.length) * 100 : 0;
    winRateByMonth[m] = winRate;
    averageReturnByMonth[m] = avg;
    monthlyStats.push({
      month: m,
      monthLabel: MONTH_LABELS[m - 1],
      avgReturn: avg,
      winRate,
      bias: biasFromReturn(avg, 0.001, -0.001),
    });
  }

  return { monthlyStats, winRateByMonth, averageReturnByMonth };
}

/** Seasonax-style average daily return by weekday (Mon–Fri). */
export function buildWeekdayStats(bars: OhlcBar[]): WeekdayStat[] {
  const sorted = [...bars].sort((a, b) => a.date.localeCompare(b.date));
  const byWd = new Map<number, number[]>();

  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const cur = sorted[i];
    if (prev.close <= 0 || cur.close <= 0) continue;
    const d = parseIso(cur.date);
    const jsDay = d.getDay(); // 0=Sun … 6=Sat
    if (jsDay < 1 || jsDay > 5) continue;
    const ret = cur.close / prev.close - 1;
    const list = byWd.get(jsDay) ?? [];
    list.push(ret);
    byWd.set(jsDay, list);
  }

  return WEEKDAY_LABELS.map((label, i) => {
    const weekday = i + 1;
    const rets = byWd.get(weekday) ?? [];
    const avg = rets.length ? mean(rets) : 0;
    const winRate = rets.length ? (rets.filter((x) => x > 0).length / rets.length) * 100 : 0;
    return {
      weekday,
      weekdayLabel: label,
      avgReturn: avg,
      winRate,
      bias: biasFromReturn(avg),
    };
  });
}
