import { todayIsoDate } from "@/lib/locale"
import { isRealizedTradeStatus } from "@/lib/trade-calculations"
import type { Language } from "@/types/playbook"
import type { Trade } from "@/types/trade"

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/
const CELL_COUNT = 42

export type MonthCursor = {
  year: number
  month: number
}

export type CalendarDay = {
  date: string
  day: number
  inMonth: boolean
  pnl: number
  totalR: number
  trades: number
}

export type MonthCalendar = MonthCursor & {
  key: string
  days: CalendarDay[]
  netPnl: number
  totalR: number
  tradeCount: number
}

type DayBucket = {
  pnl: number
  totalR: number
  trades: number
}

export function monthKey(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, "0")}`
}

export function parseIsoDate(
  iso: string
): { year: number; month: number; day: number } | null {
  const match = ISO_DATE.exec(iso.slice(0, 10))
  if (!match) return null
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  if (month < 1 || month > 12 || day < 1 || day > 31) return null
  return { year, month, day }
}

export function shiftMonth(cursor: MonthCursor, delta: number): MonthCursor {
  const date = new Date(Date.UTC(cursor.year, cursor.month - 1 + delta, 1))
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1 }
}

export function formatMonthTitle(
  cursor: MonthCursor,
  language: Language
): string {
  const locale = language === "cs" ? "cs-CZ" : "en-US"
  return new Date(Date.UTC(cursor.year, cursor.month - 1, 1)).toLocaleDateString(
    locale,
    { month: "long", year: "numeric", timeZone: "UTC" }
  )
}

function isoWeekday(year: number, month: number, day: number): number {
  const js = new Date(Date.UTC(year, month - 1, day)).getUTCDay()
  return js === 0 ? 6 : js - 1
}

function padDate(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100
}

function bucketsFor(trades: Trade[]): Map<string, DayBucket> {
  const buckets = new Map<string, DayBucket>()
  for (const trade of trades) {
    if (!isRealizedTradeStatus(trade.status) || trade.resultR == null) continue
    const parsed = parseIsoDate(trade.date)
    if (!parsed) continue
    const date = padDate(parsed.year, parsed.month, parsed.day)
    const bucket = buckets.get(date) ?? { pnl: 0, totalR: 0, trades: 0 }
    bucket.trades += 1
    bucket.totalR += trade.resultR
    if (trade.pnl != null && Number.isFinite(trade.pnl)) {
      bucket.pnl += trade.pnl
    }
    buckets.set(date, bucket)
  }
  return buckets
}

function toCursor(iso: string, fallback: MonthCursor): MonthCursor {
  const parsed = parseIsoDate(iso)
  if (!parsed) return fallback
  return { year: parsed.year, month: parsed.month }
}

export function initialCalendarMonth(
  trades: Trade[],
  today = todayIsoDate()
): MonthCursor {
  const current = toCursor(today, { year: 2026, month: 1 })
  const currentKey = monthKey(current.year, current.month)

  let latest: string | null = null
  let currentHasTrades = false
  for (const trade of trades) {
    if (!isRealizedTradeStatus(trade.status) || trade.resultR == null) continue
    const parsed = parseIsoDate(trade.date)
    if (!parsed) continue
    const date = padDate(parsed.year, parsed.month, parsed.day)
    if (date.startsWith(currentKey)) currentHasTrades = true
    if (latest == null || date > latest) latest = date
  }

  if (currentHasTrades || latest == null) return current
  return toCursor(latest, current)
}

export function buildMonthCalendar(
  trades: Trade[],
  cursor: MonthCursor
): MonthCalendar {
  const { year, month } = cursor
  const key = monthKey(year, month)
  const buckets = bucketsFor(trades)
  const leading = isoWeekday(year, month, 1)
  const start = new Date(Date.UTC(year, month - 1, 1 - leading))

  const days: CalendarDay[] = []
  for (let index = 0; index < CELL_COUNT; index += 1) {
    const cell = new Date(start.getTime() + index * 86_400_000)
    const cellYear = cell.getUTCFullYear()
    const cellMonth = cell.getUTCMonth() + 1
    const cellDay = cell.getUTCDate()
    const date = padDate(cellYear, cellMonth, cellDay)
    const bucket = buckets.get(date)
    days.push({
      date,
      day: cellDay,
      inMonth: cellYear === year && cellMonth === month,
      pnl: roundMoney(bucket?.pnl ?? 0),
      totalR: roundMoney(bucket?.totalR ?? 0),
      trades: bucket?.trades ?? 0,
    })
  }

  let netPnl = 0
  let totalR = 0
  let tradeCount = 0
  for (const day of days) {
    if (!day.inMonth) continue
    netPnl += day.pnl
    totalR += day.totalR
    tradeCount += day.trades
  }

  return {
    year,
    month,
    key,
    days,
    netPnl: roundMoney(netPnl),
    totalR: roundMoney(totalR),
    tradeCount,
  }
}
