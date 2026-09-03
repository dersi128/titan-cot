import {
  isoDateLocal,
  rangeBounds,
  type CustomRange,
  type DateRange,
} from "@/lib/date-range"
import { formatMonthShort, parseIsoDate } from "@/lib/pnl-calendar"
import { isRealizedTradeStatus } from "@/lib/trade-calculations"
import type { Language } from "@/types/playbook"
import type { Trade } from "@/types/trade"

export type PerformanceAggregation = "day" | "week" | "month"

export type PerformanceBucket = {
  key: string
  startDate: string
  endDate: string
  trades: number
  wins: number
  losses: number
  winRate: number | null
  netR: number
  pnl: number
  incomplete: boolean
}

export type PerformanceByPeriod = {
  aggregation: PerformanceAggregation
  buckets: PerformanceBucket[]
  totals: Omit<PerformanceBucket, "key" | "startDate" | "endDate" | "incomplete">
}

function round2(value: number): number {
  return Math.round(value * 100) / 100
}

function round1(value: number): number {
  return Math.round(value * 10) / 10
}

function utcIso(date: Date): string {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, "0")
  const day = String(date.getUTCDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function utcFromIso(iso: string): Date {
  const parsed = parseIsoDate(iso)
  if (!parsed) return new Date(NaN)
  return new Date(Date.UTC(parsed.year, parsed.month - 1, parsed.day))
}

export function addDays(iso: string, days: number): string {
  const date = utcFromIso(iso)
  date.setUTCDate(date.getUTCDate() + days)
  return utcIso(date)
}

export function isoWeekStart(iso: string): string | null {
  const parsed = parseIsoDate(iso)
  if (!parsed) return null
  const date = new Date(Date.UTC(parsed.year, parsed.month - 1, parsed.day))
  const day = date.getUTCDay() || 7
  date.setUTCDate(date.getUTCDate() - (day - 1))
  return utcIso(date)
}

export function isoWeekNumber(iso: string): number | null {
  const parsed = parseIsoDate(iso)
  if (!parsed) return null
  const date = new Date(Date.UTC(parsed.year, parsed.month - 1, parsed.day))
  const dayNum = date.getUTCDay() || 7
  date.setUTCDate(date.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
  return Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}

export function aggregationForRange(
  range: DateRange,
  start: string | null,
  end: string
): PerformanceAggregation {
  if (range === "30D") return "day"
  if (range === "3M") return "week"
  if (range === "6M" || range === "YTD" || range === "ALL") return "month"
  if (!start) return "month"
  const startDate = utcFromIso(start)
  const endDate = utcFromIso(end)
  const days = Math.round((endDate.getTime() - startDate.getTime()) / 86400000) + 1
  if (days <= 45) return "day"
  if (days <= 140) return "week"
  return "month"
}

function realizedInRange(
  trades: Trade[],
  start: string | null,
  end: string
): Trade[] {
  return trades.filter((trade) => {
    if (!isRealizedTradeStatus(trade.status) || trade.resultR == null) return false
    if (start && trade.date < start) return false
    return trade.date <= end
  })
}

function summarizeTrades(closed: Trade[]): {
  trades: number
  wins: number
  losses: number
  winRate: number | null
  netR: number
  pnl: number
} {
  let netR = 0
  let pnl = 0
  let wins = 0
  let losses = 0
  for (const trade of closed) {
    const r = trade.resultR ?? 0
    netR += r
    pnl += trade.pnl ?? 0
    if (r > 0) wins += 1
    else if (r < 0) losses += 1
  }
  const trades = closed.length
  return {
    trades,
    wins,
    losses,
    winRate: trades === 0 ? null : round1((wins / trades) * 100),
    netR: round2(netR),
    pnl: round2(pnl),
  }
}

function monthStart(iso: string): string | null {
  const parsed = parseIsoDate(iso)
  if (!parsed) return null
  return `${parsed.year}-${String(parsed.month).padStart(2, "0")}-01`
}

function monthEnd(iso: string): string | null {
  const parsed = parseIsoDate(iso)
  if (!parsed) return null
  const date = new Date(Date.UTC(parsed.year, parsed.month, 0))
  return utcIso(date)
}

function nextMonthStart(iso: string): string {
  const parsed = parseIsoDate(iso)!
  const date = new Date(Date.UTC(parsed.year, parsed.month, 1))
  return utcIso(date)
}

function clip(start: string, end: string, min: string, max: string): {
  startDate: string
  endDate: string
} {
  return {
    startDate: start < min ? min : start,
    endDate: end > max ? max : end,
  }
}

function bucketWindows(
  aggregation: PerformanceAggregation,
  start: string,
  end: string
): Array<{ key: string; startDate: string; endDate: string }> {
  const windows: Array<{ key: string; startDate: string; endDate: string }> = []
  if (aggregation === "day") {
    for (let day = start; day <= end; day = addDays(day, 1)) {
      windows.push({ key: day, startDate: day, endDate: day })
    }
    return windows
  }
  if (aggregation === "week") {
    let week = isoWeekStart(start)
    if (!week) return windows
    while (week <= end) {
      const rawEnd = addDays(week, 6)
      const clipped = clip(week, rawEnd, start, end)
      windows.push({
        key: week,
        startDate: clipped.startDate,
        endDate: clipped.endDate,
      })
      week = addDays(week, 7)
    }
    return windows
  }
  let cursor = monthStart(start)
  if (!cursor) return windows
  while (cursor <= end) {
    const rawEnd = monthEnd(cursor)!
    const clipped = clip(cursor, rawEnd, start, end)
    windows.push({
      key: cursor.slice(0, 7),
      startDate: clipped.startDate,
      endDate: clipped.endDate,
    })
    cursor = nextMonthStart(cursor)
  }
  return windows
}

export function getPerformanceByPeriod(
  trades: Trade[],
  dateRange: DateRange,
  now = new Date(),
  custom?: CustomRange | null
): PerformanceByPeriod {
  const bounds = rangeBounds(dateRange, now, custom)
  const today = isoDateLocal(now)
  const closed = realizedInRange(trades, bounds.start, bounds.end)
  const end = bounds.end
  const start = bounds.start ?? closed[0]?.date ?? end
  const aggregation = aggregationForRange(dateRange, start, end)
  if (closed.length === 0 && dateRange === "ALL") {
    return {
      aggregation,
      buckets: [],
      totals: { trades: 0, wins: 0, losses: 0, winRate: null, netR: 0, pnl: 0 },
    }
  }

  const grouped = new Map<string, Trade[]>()
  const windows = bucketWindows(aggregation, start, end)
  for (const window of windows) grouped.set(window.key, [])
  for (const trade of closed) {
    const key =
      aggregation === "day"
        ? trade.date
        : aggregation === "week"
          ? isoWeekStart(trade.date)
          : trade.date.slice(0, 7)
    if (!key) continue
    const list = grouped.get(key)
    if (list) list.push(trade)
    else grouped.set(key, [trade])
  }

  const buckets: PerformanceBucket[] = []
  for (const window of windows) {
    const stats = summarizeTrades(grouped.get(window.key) ?? [])
    const incomplete = window.startDate <= today && window.endDate >= today
    if (incomplete && stats.trades === 0) continue
    buckets.push({
      key: window.key,
      startDate: window.startDate,
      endDate: window.endDate,
      incomplete,
      ...stats,
    })
  }

  return {
    aggregation,
    buckets,
    totals: summarizeTrades(closed),
  }
}

function formatDayNum(iso: string): string {
  const parsed = parseIsoDate(iso)
  if (!parsed) return iso
  return `${parsed.day}.`
}

function formatDayMonth(iso: string): string {
  const parsed = parseIsoDate(iso)
  if (!parsed) return iso
  return `${parsed.day}.${parsed.month}.`
}

export function performanceTickLabel(
  bucket: PerformanceBucket,
  aggregation: PerformanceAggregation,
  language: Language,
  compact: boolean
): string {
  if (aggregation === "month") {
    const parsed = parseIsoDate(bucket.startDate)
    if (!parsed) return bucket.key
    return formatMonthShort({ year: parsed.year, month: parsed.month }, language)
  }
  if (aggregation === "day") {
    return compact ? formatDayNum(bucket.startDate) : formatDayMonth(bucket.startDate)
  }
  const week = isoWeekNumber(bucket.key)
  if (compact && week != null) {
    return language === "cs" ? `T${week}` : `W${week}`
  }
  if (bucket.startDate.slice(0, 7) === bucket.endDate.slice(0, 7)) {
    const start = parseIsoDate(bucket.startDate)
    const end = parseIsoDate(bucket.endDate)
    if (!start || !end) return bucket.key
    return `${start.day}.–${end.day}.${end.month}.`
  }
  return `${formatDayMonth(bucket.startDate).replace(/\.$/, "")}–${formatDayMonth(bucket.endDate)}`
}

export function performanceRangeLabel(bucket: PerformanceBucket): string {
  const start = parseIsoDate(bucket.startDate)
  const end = parseIsoDate(bucket.endDate)
  if (!start || !end) return bucket.key
  if (bucket.startDate === bucket.endDate) {
    return `${start.day}. ${start.month}. ${start.year}`
  }
  if (start.year === end.year && start.month === end.month) {
    return `${start.day}.–${end.day}. ${end.month}. ${end.year}`
  }
  if (start.year === end.year) {
    return `${start.day}. ${start.month}. – ${end.day}. ${end.month}. ${end.year}`
  }
  return `${start.day}. ${start.month}. ${start.year} – ${end.day}. ${end.month}. ${end.year}`
}
