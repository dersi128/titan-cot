import { isRealizedTradeStatus } from "@/lib/trade-calculations"
import type { Trade } from "@/types/trade"

export const EDGE_MIN_TRADES = 20

export type EdgeVerdict = "yes" | "no" | "thin"

export type GroupStats = {
  key: string
  trades: number
  netPnl: number
  totalR: number
  winRate: number | null
  averageR: number | null
  profitFactor: number | null
  avgWinR: number | null
  avgLossR: number | null
  payoff: number | null
  edge: EdgeVerdict
}

function round2(value: number): number {
  return Math.round(value * 100) / 100
}

export function edgeVerdict(
  trades: number,
  expectancyR: number | null
): EdgeVerdict {
  if (trades < EDGE_MIN_TRADES) return "thin"
  return (expectancyR ?? 0) > 0 ? "yes" : "no"
}

function statsFor(key: string, list: Trade[]): GroupStats {
  const totalR = list.reduce((sum, trade) => sum + (trade.resultR ?? 0), 0)
  const netPnl = list.reduce((sum, trade) => sum + (trade.pnl ?? 0), 0)
  const winners = list.filter((trade) => (trade.resultR ?? 0) > 0)
  const losers = list.filter((trade) => (trade.resultR ?? 0) < 0)
  const decided = winners.length + losers.length
  const grossProfit = winners.reduce((sum, trade) => sum + (trade.pnl ?? 0), 0)
  const grossLoss = Math.abs(
    losers.reduce((sum, trade) => sum + (trade.pnl ?? 0), 0)
  )
  const winR = winners.reduce((sum, trade) => sum + (trade.resultR ?? 0), 0)
  const lossR = losers.reduce((sum, trade) => sum + (trade.resultR ?? 0), 0)
  const avgWinR = winners.length > 0 ? winR / winners.length : null
  const avgLossR = losers.length > 0 ? lossR / losers.length : null
  const expectancyR = list.length > 0 ? round2(totalR / list.length) : null
  const payoff =
    avgWinR != null && avgLossR != null && avgLossR !== 0
      ? avgWinR / Math.abs(avgLossR)
      : null

  return {
    key,
    trades: list.length,
    netPnl: round2(netPnl),
    totalR: round2(totalR),
    winRate: decided > 0 ? winsRate(winners.length, decided) : null,
    averageR: expectancyR,
    profitFactor: grossLoss > 0 ? round2(grossProfit / grossLoss) : null,
    avgWinR: avgWinR == null ? null : round2(avgWinR),
    avgLossR: avgLossR == null ? null : round2(avgLossR),
    payoff: payoff == null ? null : round2(payoff),
    edge: edgeVerdict(list.length, expectancyR),
  }
}

function winsRate(wins: number, decided: number): number {
  return wins / decided
}

function realized(trades: Trade[]): Trade[] {
  return trades.filter(
    (trade) => isRealizedTradeStatus(trade.status) && trade.resultR != null
  )
}

function groupStats(trades: Trade[], keyOf: (trade: Trade) => string): GroupStats[] {
  const groups = new Map<string, Trade[]>()
  for (const trade of realized(trades)) {
    const key = keyOf(trade) || "—"
    const list = groups.get(key) ?? []
    list.push(trade)
    groups.set(key, list)
  }

  return [...groups.entries()]
    .map(([key, list]) => statsFor(key, list))
    .sort((a, b) => b.totalR - a.totalR)
}

export function accountEdge(trades: Trade[]): GroupStats {
  return statsFor("all", realized(trades))
}

export function statsByPlaybook(trades: Trade[]): GroupStats[] {
  return groupStats(trades, (trade) => trade.playbookId || trade.strategy)
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
