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

export type CalendarDayTrade = {
  id: string
  symbol: string
  pnl: number
}

export type CalendarDay = {
  date: string
  day: number
  inMonth: boolean
  pnl: number
  totalR: number
  trades: number
  items: CalendarDayTrade[]
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
  items: CalendarDayTrade[]
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

const MONTH_SHORT_CS = [
  "Led",
  "Úno",
  "Bře",
  "Dub",
  "Kvě",
  "Čvn",
  "Čvc",
  "Srp",
  "Zář",
  "Říj",
  "Lis",
  "Pro",
] as const

const MONTH_SHORT_EN = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const

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

export function formatMonthShort(
  cursor: MonthCursor,
  language: Language
): string {
  const names = language === "cs" ? MONTH_SHORT_CS : MONTH_SHORT_EN
  return names[cursor.month - 1] ?? String(cursor.month)
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
    const bucket = buckets.get(date) ?? { pnl: 0, totalR: 0, items: [] }
    bucket.items.push({
      id: trade.id,
      symbol: trade.symbol,
      pnl: trade.pnl != null && Number.isFinite(trade.pnl) ? trade.pnl : 0,
    })
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
    const items = bucket?.items ?? []
    days.push({
      date,
      day: cellDay,
      inMonth: cellYear === year && cellMonth === month,
      pnl: roundMoney(bucket?.pnl ?? 0),
      totalR: roundMoney(bucket?.totalR ?? 0),
      trades: items.length,
      items,
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

export function calendarDayHref(day: Pick<CalendarDay, "items" | "inMonth">): string | null {
  if (!day.inMonth || day.items.length !== 1) return null
  return `/journal/${day.items[0].id}`
}

export function formatCalendarDayTitle(
  iso: string,
  language: Language
): string {
  const parsed = parseIsoDate(iso)
  if (!parsed) return iso
  const month = formatMonthShort(parsed, language)
  if (language === "cs") return `${parsed.day}. ${month.toLowerCase()} ${parsed.year}`
  return `${parsed.day} ${month} ${parsed.year}`
}

export function defaultSelectedDate(
  calendar: MonthCalendar,
  today: string
): string {
  const inMonth = calendar.days.filter((day) => day.inMonth)
  if (inMonth.some((day) => day.date === today)) return today
  const withTrades = inMonth.filter((day) => day.trades > 0)
  return withTrades.at(-1)?.date ?? inMonth.at(-1)?.date ?? today
}

export type CalendarWeek = {
  index: number
  totalR: number
  trades: number
}

export type CalendarWeekday = {
  weekday: number
  averageR: number | null
  trades: number
}

export type CalendarProgressPoint = {
  date: string
  day: number
  cumulativeR: number
}

export type CalendarInsights = {
  bestDay: CalendarDay | null
  worstDay: CalendarDay | null
  tradingDays: number
  weeks: CalendarWeek[]
  weekdays: CalendarWeekday[]
  progress: CalendarProgressPoint[]
}

export function calendarInsights(calendar: MonthCalendar): CalendarInsights {
  const inMonth = calendar.days.filter((day) => day.inMonth)
  const traded = inMonth.filter((day) => day.trades > 0)
  let bestDay: CalendarDay | null = null
  let worstDay: CalendarDay | null = null
  for (const day of traded) {
    if (
      !bestDay ||
      day.totalR > bestDay.totalR ||
      (day.totalR === bestDay.totalR && day.pnl > bestDay.pnl)
    ) {
      bestDay = day
    }
    if (
      !worstDay ||
      day.totalR < worstDay.totalR ||
      (day.totalR === worstDay.totalR && day.pnl < worstDay.pnl)
    ) {
      worstDay = day
    }
  }

  const weeks: CalendarWeek[] = []
  for (let week = 0; week < 6; week += 1) {
    const slice = calendar.days.slice(week * 7, week * 7 + 7).filter((day) => day.inMonth)
    if (slice.length === 0) continue
    weeks.push({
      index: weeks.length + 1,
      totalR: roundMoney(slice.reduce((sum, day) => sum + day.totalR, 0)),
      trades: slice.reduce((sum, day) => sum + day.trades, 0),
    })
  }

  const weekdayBuckets = Array.from({ length: 7 }, () => ({ r: 0, trades: 0, days: 0 }))
  for (const day of traded) {
    const parsed = parseIsoDate(day.date)
    if (!parsed) continue
    const weekday = isoWeekday(parsed.year, parsed.month, parsed.day)
    const bucket = weekdayBuckets[weekday]!
    bucket.r += day.totalR
    bucket.trades += day.trades
    bucket.days += 1
  }
  const weekdays: CalendarWeekday[] = weekdayBuckets.map((bucket, weekday) => ({
    weekday,
    averageR: bucket.days > 0 ? roundMoney(bucket.r / bucket.days) : null,
    trades: bucket.trades,
  }))

  let cumulativeR = 0
  const progress: CalendarProgressPoint[] = inMonth.map((day) => {
    cumulativeR = roundMoney(cumulativeR + day.totalR)
    return { date: day.date, day: day.day, cumulativeR }
  })

  return {
    bestDay,
    worstDay,
    tradingDays: traded.length,
    weeks,
    weekdays,
    progress,
  }
}
