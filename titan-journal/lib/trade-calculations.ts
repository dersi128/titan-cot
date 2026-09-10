import type { Trade, TradeDirection, TradeStatus } from "@/types/trade"
import { statsResultR, tradeOutcome } from "@/lib/trade-outcome"

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

export function isFiniteNumber(
  value: number | null | undefined
): value is number {
  return typeof value === "number" && Number.isFinite(value)
}

function pnlTotals(amounts: number[]) {
  const netPnl = amounts.reduce((sum, value) => sum + value, 0)
  const grossProfit = amounts
    .filter((value) => value > 0)
    .reduce((sum, value) => sum + value, 0)
  const grossLoss = Math.abs(
    amounts.filter((value) => value < 0).reduce((sum, value) => sum + value, 0)
  )
  return { netPnl, grossProfit, grossLoss }
}

export function monetaryKpis(trades: Trade[]) {
  const amounts: number[] = []
  const pfAmounts: number[] = []
  for (const trade of trades) {
    if (!isRealizedTradeStatus(trade.status) || !isFiniteNumber(trade.pnl)) continue
    amounts.push(trade.pnl)
    if (tradeOutcome(trade) !== "BE") pfAmounts.push(trade.pnl)
  }
  const money = pnlTotals(amounts)
  const pf = pnlTotals(pfAmounts)
  return {
    ...money,
    profitFactor: pf.grossLoss > 0 ? pf.grossProfit / pf.grossLoss : null,
  }
}

export type DashboardStats = {
  netPnl: number
  totalR: number
  winRate: number | null
  profitFactor: number | null
  averageR: number | null
  totalTrades: number
  closedTrades: number
  wins: number
  losses: number
  be: number
  grossProfit: number
  grossLoss: number
}

export function computeDashboardStats(trades: Trade[]): DashboardStats {
  const closedForR = trades.filter(
    (trade) =>
      isRealizedTradeStatus(trade.status) && isFiniteNumber(trade.resultR)
  )
  const money = monetaryKpis(trades)

  const totalR = closedForR.reduce((sum, trade) => sum + statsResultR(trade), 0)
  const winners = closedForR.filter((trade) => tradeOutcome(trade) === "WIN")
  const losers = closedForR.filter((trade) => tradeOutcome(trade) === "LOSS")
  const be = closedForR.filter((trade) => tradeOutcome(trade) === "BE").length
  const decided = winners.length + losers.length

  return {
    netPnl: money.netPnl,
    totalR,
    winRate: decided > 0 ? winners.length / decided : null,
    profitFactor: money.profitFactor,
    averageR: decided > 0 ? totalR / decided : null,
    totalTrades: trades.length,
    closedTrades: closedForR.length,
    wins: winners.length,
    losses: losers.length,
    be,
    grossProfit: Math.round(money.grossProfit * 100) / 100,
    grossLoss: Math.round(money.grossLoss * 100) / 100,
  }
}

export type EquityPoint = {
  date: string
  label: string
  equity: number
  r: number
}

export function buildEquityCurve(
  trades: Trade[],
  startCapital = 0
): EquityPoint[] {
  const closed = trades
    .filter((trade) => isRealizedTradeStatus(trade.status) && trade.resultR != null)
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt))

  const start = Math.round(startCapital * 100) / 100
  const startDate = closed[0]?.date ?? ""
  const points: EquityPoint[] = [
    {
      date: startDate,
      label: "Start",
      equity: start,
      r: 0,
    },
  ]

  let equity = start
  let r = 0
  for (const trade of closed) {
    equity += trade.pnl ?? 0
    r += statsResultR(trade)
    points.push({
      date: trade.date,
      label: trade.date.slice(5),
      equity: Math.round(equity * 100) / 100,
      r: Math.round(r * 100) / 100,
    })
  }

  return points
}
