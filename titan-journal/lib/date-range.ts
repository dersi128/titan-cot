export const DATE_RANGES = ["7D", "30D", "3M", "1Y", "YTD", "ALL"] as const
export type DateRange = (typeof DATE_RANGES)[number]

export function isoDateLocal(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function rangeStartIso(range: DateRange, now = new Date()): string | null {
  if (range === "ALL") return null
  if (range === "YTD") return `${now.getFullYear()}-01-01`
  if (range === "1Y") {
    return isoDateLocal(
      new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
    )
  }
  const days = range === "7D" ? 7 : range === "30D" ? 30 : 90
  return isoDateLocal(
    new Date(now.getFullYear(), now.getMonth(), now.getDate() - days)
  )
}

export function tradeInRange(
  trade: { date: string },
  range: DateRange,
  now = new Date()
): boolean {
  const start = rangeStartIso(range, now)
  if (start == null) return true
  return trade.date >= start
}
