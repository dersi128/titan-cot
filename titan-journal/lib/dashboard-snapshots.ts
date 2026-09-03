import { isoDateLocal } from "@/lib/date-range"
import { isRealizedTradeStatus, type EquityPoint } from "@/lib/trade-calculations"
import type { Trade } from "@/types/trade"

export type PeriodSnapshot = {
  pnl: number
  r: number
  winRate: number | null
  trades: number
}

export type DashboardSnapshots = {
  wins: number
  losses: number
  winShare: number
  lossShare: number
  last7Days: PeriodSnapshot & { spark: number[] }
  thisMonth: PeriodSnapshot
  lastMonth: PeriodSnapshot
  vsLastMonth: number | null
}

function realized(trades: Trade[]): Trade[] {
  return trades.filter(
    (trade) => isRealizedTradeStatus(trade.status) && trade.resultR != null
  )
}

function monthKey(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, "0")}`
}

function snapshot(trades: Trade[]): PeriodSnapshot {
  const closed = realized(trades)
  const pnl = closed.reduce((sum, trade) => sum + (trade.pnl ?? 0), 0)
  const r = closed.reduce((sum, trade) => sum + (trade.resultR ?? 0), 0)
  const wins = closed.filter((trade) => (trade.resultR ?? 0) > 0).length
  const losses = closed.filter((trade) => (trade.resultR ?? 0) < 0).length
  const decided = wins + losses
  return {
    pnl: Math.round(pnl * 100) / 100,
    r: Math.round(r * 100) / 100,
    winRate: decided > 0 ? wins / decided : null,
    trades: closed.length,
  }
}

export function maxDrawdown(points: EquityPoint[]): number | null {
  if (points.length === 0) return null
  let peak = points[0]!.equity
  let worst = 0
  for (const point of points) {
    peak = Math.max(peak, point.equity)
    if (peak > 0) {
      worst = Math.min(worst, (point.equity - peak) / peak)
    }
  }
  return worst
}

export function dashboardSnapshots(
  trades: Trade[],
  now = new Date()
): DashboardSnapshots {
  const closed = realized(trades)
  const wins = closed.filter((trade) => (trade.resultR ?? 0) > 0).length
  const losses = closed.filter((trade) => (trade.resultR ?? 0) < 0).length
  const decided = wins + losses

  const days = 7
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (days - 1))
  const startIso = isoDateLocal(start)
  const last7 = closed.filter((trade) => trade.date >= startIso)
  const spark = Array.from({ length: days }, () => 0)
  for (const trade of last7) {
    const [year, month, day] = trade.date.split("-").map(Number)
    if (!year || !month || !day) continue
    const index = Math.round(
      (Date.UTC(year, month - 1, day) -
        Date.UTC(start.getFullYear(), start.getMonth(), start.getDate())) /
        86_400_000
    )
    if (index >= 0 && index < days) spark[index] += trade.pnl ?? 0
  }
  let running = 0
  const sparkCumulative = spark.map((value) => {
    running += value
    return Math.round(running * 100) / 100
  })

  const thisKey = monthKey(now.getFullYear(), now.getMonth() + 1)
  const previous = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const lastKey = monthKey(previous.getFullYear(), previous.getMonth() + 1)
  const thisMonth = snapshot(closed.filter((trade) => trade.date.startsWith(thisKey)))
  const lastMonth = snapshot(closed.filter((trade) => trade.date.startsWith(lastKey)))
  const vsLastMonth =
    lastMonth.pnl === 0
      ? null
      : Math.round(((thisMonth.pnl - lastMonth.pnl) / Math.abs(lastMonth.pnl)) * 1000) /
        10

  return {
    wins,
    losses,
    winShare: decided > 0 ? wins / decided : 0,
    lossShare: decided > 0 ? losses / decided : 0,
    last7Days: { ...snapshot(last7), spark: sparkCumulative },
    thisMonth,
    lastMonth,
    vsLastMonth,
  }
}
