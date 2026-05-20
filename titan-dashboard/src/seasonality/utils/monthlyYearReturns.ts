import type { OhlcBar } from "../types";
import { MONTHS } from "./chartData";

export type MonthlyYearReturn = {
  month: number;
  monthLabel: string;
  /** Calendar-month return (%). Null = not yet occurred. */
  pct: number | null;
  isCurrent: boolean;
};

function parseDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Real calendar-month returns for the active year (from daily OHLC).
 * January uses prior year's last close as start anchor.
 */
export function computeCurrentYearMonthlyReturns(
  allBars: OhlcBar[],
  asOfDate: string,
): MonthlyYearReturn[] {
  const sorted = [...allBars].sort((a, b) => a.date.localeCompare(b.date));
  const asOf = parseDate(asOfDate);
  const year = asOf.getFullYear();
  const currentMonth = asOf.getMonth() + 1;

  const yearBars = sorted.filter((b) => {
    const d = parseDate(b.date);
    return d.getFullYear() === year && b.date <= asOfDate;
  });

  const closeAtEndOfMonth = (month: number): number | null => {
    const bars = yearBars.filter((b) => parseDate(b.date).getMonth() + 1 === month);
    if (bars.length === 0) return null;
    return bars[bars.length - 1].close;
  };

  return MONTHS.map((monthLabel, i) => {
    const month = i + 1;
    if (month > currentMonth) {
      return { month, monthLabel, pct: null, isCurrent: false };
    }

    const endClose = closeAtEndOfMonth(month);
    if (endClose === null || endClose <= 0) {
      return { month, monthLabel, pct: null, isCurrent: month === currentMonth };
    }

    let startClose: number | null = null;
    if (month === 1) {
      const firstBar = yearBars.find((b) => parseDate(b.date).getMonth() + 1 === 1);
      if (firstBar) {
        const priorIdx = sorted.findIndex((b) => b.date === firstBar.date) - 1;
        startClose = priorIdx >= 0 ? sorted[priorIdx].close : firstBar.open;
      }
    } else {
      startClose = closeAtEndOfMonth(month - 1);
    }

    if (startClose === null || startClose <= 0) {
      return { month, monthLabel, pct: null, isCurrent: month === currentMonth };
    }

    const pct = ((endClose - startClose) / startClose) * 100;
    return {
      month,
      monthLabel,
      pct: Math.round(pct * 100) / 100,
      isCurrent: month === currentMonth,
    };
  });
}
