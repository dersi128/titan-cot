import type { Trade, TradeDirection, TradeStatus } from "@/types/trade"

export const ZONE_INVALID_MITIGATION_PERCENT = 25

export function isRealizedTradeStatus(status: TradeStatus): boolean {
  return status === "CLOSED" || status === "REVIEWED"
}

export function calculatePlannedRRR(params: {
  direction: TradeDirection
  entry: number
  stopLoss: number
  takeProfit: number
}): number | null {
  const { direction, entry, stopLoss, takeProfit } = params

  if (![entry, stopLoss, takeProfit].every(Number.isFinite)) {
    return null
  }

  const reward = direction === "LONG" ? takeProfit - entry : entry - takeProfit
  const risk = direction === "LONG" ? entry - stopLoss : stopLoss - entry

  if (risk <= 0 || reward <= 0) {
    return null
  }

  return reward / risk
}

export function formatRRR(rrr: number | null | undefined): string {
  if (rrr == null || !Number.isFinite(rrr)) {
    return "—"
  }

  const rounded = Math.round(rrr * 100) / 100
  const display = Number.isInteger(rounded)
    ? String(rounded)
    : rounded.toFixed(2).replace(/0+$/, "").replace(/\.$/, "")

  return `1:${display}`
}

export function isZoneInvalid(mitigation: number): boolean {
  return mitigation > ZONE_INVALID_MITIGATION_PERCENT
}

export function parseOptionalNumber(value: string): number | null {
  if (value.trim() === "") return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

export type DashboardStats = {
  netPnl: number
  totalR: number
  winRate: number | null
  profitFactor: number | null
  averageR: number | null
  totalTrades: number
  closedTrades: number
}

export function computeDashboardStats(trades: Trade[]): DashboardStats {
  const closed = trades.filter(
    (trade) => isRealizedTradeStatus(trade.status) && trade.resultR != null
  )

  const totalR = closed.reduce((sum, trade) => sum + (trade.resultR ?? 0), 0)
  const netPnl = closed.reduce((sum, trade) => sum + (trade.pnl ?? 0), 0)

  const winners = closed.filter((trade) => (trade.resultR ?? 0) > 0)
  const losers = closed.filter((trade) => (trade.resultR ?? 0) < 0)
  const decided = winners.length + losers.length

  const grossProfit = winners.reduce(
    (sum, trade) => sum + (trade.pnl ?? 0),
    0
  )
  const grossLoss = Math.abs(
    losers.reduce((sum, trade) => sum + (trade.pnl ?? 0), 0)
  )

  return {
    netPnl,
    totalR,
    winRate: decided > 0 ? winners.length / decided : null,
    profitFactor: grossLoss > 0 ? grossProfit / grossLoss : null,
    averageR: closed.length > 0 ? totalR / closed.length : null,
    totalTrades: trades.length,
    closedTrades: closed.length,
  }
}

export type EquityPoint = {
  date: string
  label: string
  equity: number
  r: number
}

export function buildEquityCurve(trades: Trade[]): EquityPoint[] {
  const closed = trades
    .filter((trade) => isRealizedTradeStatus(trade.status) && trade.resultR != null)
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt))

  let equity = 0
  let r = 0
  const points: EquityPoint[] = [
    {
      date: closed[0]?.date ?? "",
      label: "Start",
      equity: 0,
      r: 0,
    },
  ]

  for (const trade of closed) {
    equity += trade.pnl ?? 0
    r += trade.resultR ?? 0
    points.push({
      date: trade.date,
      label: trade.date.slice(5),
      equity: Math.round(equity * 100) / 100,
      r: Math.round(r * 100) / 100,
    })
  }

  return points
}
