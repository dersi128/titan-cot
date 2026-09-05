export type TradeOutcome = "WIN" | "LOSS" | "BE"

export const BREAKEVEN_R = 0.5

type OutcomeInput = {
  resultR?: number | null
  pnl?: number | null
}

export function tradeOutcome(trade: OutcomeInput): TradeOutcome | null {
  const r = trade.resultR ?? null
  const pnl = trade.pnl ?? null
  if (r == null && pnl == null) return null
  if (r != null && Math.abs(r) < BREAKEVEN_R) return "BE"
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
