import { formatMonthShort, parseIsoDate } from "@/lib/pnl-calendar"
import { isRealizedTradeStatus } from "@/lib/trade-calculations"
import type { Language } from "@/types/playbook"
import type { Trade } from "@/types/trade"

export const PERFORMANCE_PERIODS = [
  "week",
  "month",
  "weekday",
  "monthWeek",
  "yearMonth",
] as const
export type PerformancePeriod = (typeof PERFORMANCE_PERIODS)[number]

export type PerformanceCandle = {
  period: string
  open: number
  high: number
  low: number
  close: number
  pnl: number
  pnlPercent: number
  resultR: number
}

export type ParsedPerformancePeriod =
  | { kind: "week"; year: number; week: number }
  | { kind: "month"; year: number; month: number }
  | { kind: "weekday"; weekday: number }
  | { kind: "monthWeek"; year: number; month: number; week: number }

function round2(value: number): number {
  return Math.round(value * 100) / 100
}

function round1(value: number): number {
  return Math.round(value * 10) / 10
}

function realized(trades: Trade[]): Trade[] {
  return trades
    .filter((trade) => isRealizedTradeStatus(trade.status) && trade.resultR != null)
    .slice()
    .sort(
      (a, b) =>
        a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt)
    )
}

export function isoWeekPeriod(iso: string): string | null {
  const parsed = parseIsoDate(iso)
  if (!parsed) return null
  const date = new Date(Date.UTC(parsed.year, parsed.month - 1, parsed.day))
  const dayNum = date.getUTCDay() || 7
  date.setUTCDate(date.getUTCDate() + 4 - dayNum)
  const isoYear = date.getUTCFullYear()
  const yearStart = new Date(Date.UTC(isoYear, 0, 1))
  const week = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
  return `${isoYear}-W${String(week).padStart(2, "0")}`
}

export function monthPeriod(iso: string): string | null {
  const parsed = parseIsoDate(iso)
  if (!parsed) return null
  return `${parsed.year}-${String(parsed.month).padStart(2, "0")}`
}

export function weekdayPeriod(iso: string): string | null {
  const parsed = parseIsoDate(iso)
  if (!parsed) return null
  const js = new Date(Date.UTC(parsed.year, parsed.month - 1, parsed.day)).getUTCDay()
  const weekday = js === 0 ? 7 : js
  return `WD-${weekday}`
}

export function monthWeekPeriod(iso: string): string | null {
  const parsed = parseIsoDate(iso)
  if (!parsed) return null
  const week = Math.ceil(parsed.day / 7)
  return `${parsed.year}-${String(parsed.month).padStart(2, "0")}-w${week}`
}

export function periodKey(
  iso: string,
  period: PerformancePeriod
): string | null {
  if (period === "week") return isoWeekPeriod(iso)
  if (period === "weekday") return weekdayPeriod(iso)
  if (period === "monthWeek") return monthWeekPeriod(iso)
  return monthPeriod(iso)
}

export function parsePerformancePeriod(
  period: string
): ParsedPerformancePeriod | null {
  const weekday = /^WD-([1-7])$/.exec(period)
  if (weekday) {
    return { kind: "weekday", weekday: Number(weekday[1]) }
  }
  const monthWeek = /^(\d{4})-(\d{2})-w([1-5])$/.exec(period)
  if (monthWeek) {
    const monthNumber = Number(monthWeek[2])
    if (monthNumber < 1 || monthNumber > 12) return null
    return {
      kind: "monthWeek",
      year: Number(monthWeek[1]),
      month: monthNumber,
      week: Number(monthWeek[3]),
    }
  }
  const week = /^(\d{4})-W(\d{2})$/.exec(period)
  if (week) {
    return { kind: "week", year: Number(week[1]), week: Number(week[2]) }
  }
  const month = /^(\d{4})-(\d{2})$/.exec(period)
  if (month) {
    const monthNumber = Number(month[2])
    if (monthNumber < 1 || monthNumber > 12) return null
    return { kind: "month", year: Number(month[1]), month: monthNumber }
  }
  return null
}

export function performanceTickLabel(
  period: string,
  language: Language,
  weekdays: readonly string[],
  monthWeekShowMonth = false
): string {
  const parsed = parsePerformancePeriod(period)
  if (!parsed) return period
  const weekPrefix = language === "cs" ? "T" : "W"
  if (parsed.kind === "weekday") {
    return weekdays[parsed.weekday - 1] ?? period
  }
  if (parsed.kind === "week") return `${weekPrefix}${parsed.week}`
  if (parsed.kind === "monthWeek") {
    const week = `${weekPrefix}${parsed.week}`
    if (!monthWeekShowMonth) return week
    return `${formatMonthShort({ year: parsed.year, month: parsed.month }, language)} ${week}`
  }
  return formatMonthShort({ year: parsed.year, month: parsed.month }, language)
}

function summedCandle(
  period: string,
  pnl: number,
  resultR: number,
  startCapital: number
): PerformanceCandle {
  const value = round2(pnl)
  return {
    period,
    open: 0,
    high: Math.max(0, value),
    low: Math.min(0, value),
    close: value,
    pnl: value,
    pnlPercent:
      startCapital === 0 ? 0 : round1((value / startCapital) * 100),
    resultR: round2(resultR),
  }
}

function monthKeysThroughLastTrade(closed: Trade[]): string[] {
  const lastByYear = new Map<number, number>()
  for (const trade of closed) {
    const parsed = parseIsoDate(trade.date)
    if (!parsed) continue
    lastByYear.set(
      parsed.year,
      Math.max(lastByYear.get(parsed.year) ?? 1, parsed.month)
    )
  }
  return [...lastByYear.keys()]
    .sort((a, b) => a - b)
    .flatMap((year) => {
      const lastMonth = lastByYear.get(year) ?? 1
      return Array.from({ length: lastMonth }, (_, index) => {
        const month = String(index + 1).padStart(2, "0")
        return `${year}-${month}`
      })
    })
}

function monthWeekKeys(closed: Trade[]): string[] {
  const months = new Set<string>()
  for (const trade of closed) {
    const key = monthPeriod(trade.date)
    if (key) months.add(key)
  }
  return [...months].sort().flatMap((month) =>
    [1, 2, 3, 4, 5].map((week) => `${month}-w${week}`)
  )
}

export function buildPerformanceCandles(
  trades: Trade[],
  startCapital = 0,
  period: PerformancePeriod = "week"
): PerformanceCandle[] {
  const closed = realized(trades)
  if (closed.length === 0) return []

  const buckets = new Map<string, { pnl: number; resultR: number }>()
  for (const trade of closed) {
    const key = periodKey(trade.date, period)
    if (!key) continue
    const current = buckets.get(key) ?? { pnl: 0, resultR: 0 }
    current.pnl += trade.pnl ?? 0
    current.resultR += trade.resultR ?? 0
    buckets.set(key, current)
  }

  let keys: string[]
  if (period === "weekday") {
    keys = ["WD-1", "WD-2", "WD-3", "WD-4", "WD-5", "WD-6", "WD-7"]
  } else if (period === "yearMonth") {
    keys = monthKeysThroughLastTrade(closed)
  } else if (period === "monthWeek") {
    keys = monthWeekKeys(closed)
  } else {
    keys = [...buckets.keys()].sort()
  }

  return keys.map((key) => {
    const bucket = buckets.get(key) ?? { pnl: 0, resultR: 0 }
    return summedCandle(key, bucket.pnl, bucket.resultR, startCapital)
  })
}
