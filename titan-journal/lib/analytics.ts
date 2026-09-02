import { isRealizedTradeStatus } from "@/lib/trade-calculations"
import type { Trade } from "@/types/trade"

export type GroupStats = {
  key: string
  trades: number
  netPnl: number
  totalR: number
  winRate: number | null
  averageR: number | null
}

function groupStats(trades: Trade[], keyOf: (trade: Trade) => string): GroupStats[] {
  const realized = trades.filter(
    (trade) => isRealizedTradeStatus(trade.status) && trade.resultR != null
  )
  const groups = new Map<string, Trade[]>()
  for (const trade of realized) {
    const key = keyOf(trade) || "—"
    const list = groups.get(key) ?? []
    list.push(trade)
    groups.set(key, list)
  }

  return [...groups.entries()]
    .map(([key, list]) => {
      const totalR = list.reduce((sum, trade) => sum + (trade.resultR ?? 0), 0)
      const netPnl = list.reduce((sum, trade) => sum + (trade.pnl ?? 0), 0)
      const wins = list.filter((trade) => (trade.resultR ?? 0) > 0).length
      const losses = list.filter((trade) => (trade.resultR ?? 0) < 0).length
      const decided = wins + losses
      return {
        key,
        trades: list.length,
        netPnl,
        totalR,
        winRate: decided > 0 ? wins / decided : null,
        averageR: list.length > 0 ? totalR / list.length : null,
      }
    })
    .sort((a, b) => b.totalR - a.totalR)
}

export function statsByPlaybook(trades: Trade[]): GroupStats[] {
  return groupStats(trades, (trade) => trade.strategy)
}

export function statsByDirection(trades: Trade[]): GroupStats[] {
  return groupStats(trades, (trade) => trade.direction)
}

export function statsBySymbol(trades: Trade[]): GroupStats[] {
  return groupStats(trades, (trade) => trade.symbol)
}

export function bestAndWorstPlaybook(trades: Trade[]): {
  best: GroupStats | null
  worst: GroupStats | null
} {
  const groups = statsByPlaybook(trades).filter((item) => item.trades > 0)
  if (groups.length === 0) return { best: null, worst: null }
  return {
    best: groups[0],
    worst: groups[groups.length - 1],
  }
}
