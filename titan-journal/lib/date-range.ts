export const DATE_RANGES = ["30D", "3M", "6M", "YTD", "ALL", "CUSTOM"] as const
export type DateRange = (typeof DATE_RANGES)[number]

export type CustomRange = {
  start: string
  end: string
}

export function isoDateLocal(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function addCalendarMonths(date: Date, months: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + months, date.getDate())
}

export function rangeBounds(
  range: DateRange,
  now = new Date(),
  custom?: CustomRange | null
): { start: string | null; end: string } {
  const today = isoDateLocal(now)
  if (range === "CUSTOM") {
    const start = custom?.start ?? null
    const end = custom?.end ?? today
    if (start && start > end) return { start: end, end: start }
    return { start, end }
  }
  if (range === "ALL") return { start: null, end: today }
  if (range === "YTD") return { start: `${now.getFullYear()}-01-01`, end: today }
  if (range === "6M") {
    return { start: isoDateLocal(addCalendarMonths(now, -6)), end: today }
  }
  if (range === "3M") {
    return { start: isoDateLocal(addCalendarMonths(now, -3)), end: today }
  }
  return {
    start: isoDateLocal(
      new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30)
    ),
    end: today,
  }
}

export function rangeStartIso(
  range: DateRange,
  now = new Date(),
  custom?: CustomRange | null
): string | null {
  return rangeBounds(range, now, custom).start
}

export function tradeInRange(
  trade: { date: string },
  range: DateRange,
  now = new Date(),
  custom?: CustomRange | null
): boolean {
  const { start, end } = rangeBounds(range, now, custom)
  if (start && trade.date < start) return false
  return trade.date <= end
}
