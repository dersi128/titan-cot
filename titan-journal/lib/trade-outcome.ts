export type TradeOutcome = "WIN" | "LOSS" | "BE"

export const BREAKEVEN_PNL_USD = 130

type OutcomeInput = {
  resultR?: number | null
  pnl?: number | null
}

export function tradeOutcome(trade: OutcomeInput): TradeOutcome | null {
  const r = trade.resultR ?? null
  const pnl = trade.pnl ?? null
  if (r == null && pnl == null) return null
  if (r === 0) return "BE"
  if (pnl != null && Math.abs(pnl) <= BREAKEVEN_PNL_USD && Math.abs(r ?? 0) < 1) {
    return "BE"
  }
  const sign = r ?? pnl ?? 0
  if (sign > 0) return "WIN"
  if (sign < 0) return "LOSS"
  return "BE"
}

export function statsResultR(trade: OutcomeInput): number {
  if (tradeOutcome(trade) === "BE") return 0
  return trade.resultR ?? 0
}

export function displayResultR(trade: OutcomeInput): number | null {
  if (trade.resultR == null && trade.pnl == null) return null
  if (tradeOutcome(trade) === "BE") return 0
  return trade.resultR ?? null
}
