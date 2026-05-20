import type { SeasonalEventMarker, SeasonalEventType } from "../types";

export type { SeasonalEventMarker, SeasonalEventType };

/** Third Friday of month (OPEX). */
function thirdFriday(year: number, month: number): string {
  const d = new Date(year, month - 1, 1);
  let fridays = 0;
  while (d.getMonth() === month - 1) {
    if (d.getDay() === 5) {
      fridays += 1;
      if (fridays === 3) return d.toISOString().slice(0, 10);
    }
    d.setDate(d.getDate() + 1);
  }
  return `${year}-${String(month).padStart(2, "0")}-15`;
}

/** Typical FOMC months (Wed announcement — approximate mid-month). */
const FOMC_MONTHS = [1, 3, 5, 6, 7, 9, 11, 12];

function fomcDates(year: number): string[] {
  return FOMC_MONTHS.map((m) => `${year}-${String(m).padStart(2, "0")}-15`);
}

function cpiDates(year: number): string[] {
  return Array.from({ length: 12 }, (_, i) => `${year}-${String(i + 1).padStart(2, "0")}-12`);
}

const NVDA_MONTHS = [2, 5, 8, 11];

function nvdaEarnings(year: number): string[] {
  return NVDA_MONTHS.map((m) => `${year}-${String(m).padStart(2, "0")}-20`);
}

function electionDates(year: number): string[] {
  return year % 2 === 0 ? [`${year}-11-05`] : [];
}

export function buildSeasonalEvents(asOfDate: string, windowDays = 120): SeasonalEventMarker[] {
  const asOf = new Date(asOfDate);
  const y = asOf.getFullYear();
  const markers: { type: SeasonalEventType; date: string; label: string }[] = [];

  for (const year of [y - 1, y, y + 1]) {
    for (const d of fomcDates(year)) markers.push({ type: "FOMC", date: d, label: "FOMC" });
    for (const d of cpiDates(year)) markers.push({ type: "CPI", date: d, label: "CPI" });
    for (let m = 1; m <= 12; m++) markers.push({ type: "OPEX", date: thirdFriday(year, m), label: "OPEX" });
    for (const d of nvdaEarnings(year)) markers.push({ type: "NVDA_EARNINGS", date: d, label: "NVDA" });
    for (const d of electionDates(year)) markers.push({ type: "ELECTION", date: d, label: "ELECTION" });
  }

  const msPerDay = 86400000;
  const asOfMs = asOf.getTime();

  return markers
    .map((m) => {
      const eventMs = new Date(m.date).getTime();
      const dayOffset = Math.round((eventMs - asOfMs) / msPerDay);
      return { ...m, tdyOffset: dayOffset };
    })
    .filter((m) => Math.abs(m.tdyOffset) <= windowDays)
    .sort((a, b) => a.tdyOffset - b.tdyOffset);
}

export const EVENT_COLORS: Record<SeasonalEventType, string> = {
  FOMC: "#D4AF37",
  CPI: "#9AE8FF",
  OPEX: "#B48CFF",
  NVDA_EARNINGS: "#4FD4A0",
  ELECTION: "#E87898",
};
