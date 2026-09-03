import { parseIsoDate } from "@/lib/pnl-calendar"
import { isRealizedTradeStatus } from "@/lib/trade-calculations"
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

function closePeriod(candle: Omit<PerformanceCandle, "pnl" | "pnlPercent">): PerformanceCandle {
  const pnl = round2(candle.close - candle.open)
  const pnlPercent =
    candle.open === 0 ? 0 : round1((pnl / candle.open) * 100)
  return {
    ...candle,
    high: round2(candle.high),
    low: round2(candle.low),
    close: round2(candle.close),
    open: round2(candle.open),
    pnl,
    pnlPercent,
    resultR: round2(candle.resultR),
  }
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

function buildEquityCandles(
  closed: Trade[],
  startCapital: number,
  period: PerformancePeriod
): PerformanceCandle[] {
  let equity = round2(startCapital)
  const candles: PerformanceCandle[] = []
  let current: Omit<PerformanceCandle, "pnl" | "pnlPercent"> | null = null

  for (const trade of closed) {
    const key = periodKey(trade.date, period)
    if (!key) continue
    if (!current || current.period !== key) {
      if (current) candles.push(closePeriod(current))
      current = {
        period: key,
        open: equity,
        high: equity,
        low: equity,
        close: equity,
        resultR: 0,
      }
    }
    equity = round2(equity + (trade.pnl ?? 0))
    current.close = equity
    current.high = Math.max(current.high, equity)
    current.low = Math.min(current.low, equity)
    current.resultR += trade.resultR ?? 0
  }

  if (current) candles.push(closePeriod(current))
  return candles
}

function buildSummedCandles(
  closed: Trade[],
  startCapital: number,
  period: PerformancePeriod
): PerformanceCandle[] {
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
    const years = new Set<number>()
    for (const trade of closed) {
      const parsed = parseIsoDate(trade.date)
      if (parsed) years.add(parsed.year)
    }
    keys = [...years]
      .sort((a, b) => a - b)
      .flatMap((year) =>
        Array.from({ length: 12 }, (_, index) => {
          const month = String(index + 1).padStart(2, "0")
          return `${year}-${month}`
        })
      )
  } else {
    keys = [...buckets.keys()].sort()
  }

  return keys.map((key) => {
    const bucket = buckets.get(key) ?? { pnl: 0, resultR: 0 }
    return summedCandle(key, bucket.pnl, bucket.resultR, startCapital)
  })
}

export function buildPerformanceCandles(
  trades: Trade[],
  startCapital = 0,
  period: PerformancePeriod = "week"
): PerformanceCandle[] {
  const closed = realized(trades)
  if (closed.length === 0) return []
  if (period === "weekday" || period === "monthWeek" || period === "yearMonth") {
    return buildSummedCandles(closed, startCapital, period)
  }
  return buildEquityCandles(closed, startCapital, period)
}
