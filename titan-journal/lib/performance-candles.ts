import { parseIsoDate } from "@/lib/pnl-calendar"
import { isRealizedTradeStatus } from "@/lib/trade-calculations"
import type { Trade } from "@/types/trade"

export const PERFORMANCE_PERIODS = ["week", "month"] as const
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

function round2(value: number): number {
  return Math.round(value * 100) / 100
}

function round1(value: number): number {
  return Math.round(value * 10) / 10
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

export function periodKey(
  iso: string,
  period: PerformancePeriod
): string | null {
  return period === "week" ? isoWeekPeriod(iso) : monthPeriod(iso)
}

export function parsePerformancePeriod(
  period: string
):
  | { kind: "week"; year: number; week: number }
  | { kind: "month"; year: number; month: number }
  | null {
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

export function buildPerformanceCandles(
  trades: Trade[],
  startCapital = 0,
  period: PerformancePeriod = "week"
): PerformanceCandle[] {
  const closed = trades
    .filter(
      (trade) => isRealizedTradeStatus(trade.status) && trade.resultR != null
    )
    .slice()
    .sort(
      (a, b) =>
        a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt)
    )

  if (closed.length === 0) return []

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
