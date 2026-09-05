import { tradeInRange, type CustomRange, type DateRange } from "@/lib/date-range"
import { parseOptionalNumber } from "@/lib/trade-calculations"
import type { AccountCapital, UserProfile } from "@/types/playbook"
import type { Account, Trade, TradeStatus } from "@/types/trade"

export function filterTradesByAccount(trades: Trade[], account: Account): Trade[] {
  return trades.filter((trade) => trade.account === account)
}

export function filterTradesByScope(
  trades: Trade[],
  scope: { account: Account; range: DateRange; custom?: CustomRange | null },
  now = new Date()
): Trade[] {
  return filterTradesByAccount(trades, scope.account).filter((trade) =>
    tradeInRange(trade, scope.range, now, scope.custom)
  )
}

export function dollarsPerR(capital: number, riskPercent: number): number {
  if (!Number.isFinite(capital) || !Number.isFinite(riskPercent) || capital <= 0) {
    return 0
  }
  return Math.round(capital * (riskPercent / 100) * 100) / 100
}

export function suggestedPnl(
  resultR: number,
  capital: number,
  riskPercent: number
): number {
  return Math.round(resultR * dollarsPerR(capital, riskPercent) * 100) / 100
}

export function accountEquity(capital: number, netPnl: number): number {
  return Math.round((capital + netPnl) * 100) / 100
}

export function capitalForAccount(
  capital: AccountCapital,
  account: Account
): number {
  return capital[account] ?? 0
}

export function riskForAccount(profile: UserProfile, account: Account): number {
  const mapped = profile.riskByAccount?.[account]
  if (typeof mapped === "number" && Number.isFinite(mapped) && mapped >= 0) {
    return mapped
  }
  if (
    typeof profile.riskPercent === "number" &&
    Number.isFinite(profile.riskPercent) &&
    profile.riskPercent >= 0
  ) {
    return profile.riskPercent
  }
  return 1
}

export function realizedResultFromInputs(
  resultR: string,
  pnl: string,
  capital: number,
  riskPercent: number
): { status: Extract<TradeStatus, "CLOSED">; resultR: number; pnl: number } | null {
  const r = parseOptionalNumber(resultR)
  if (r == null) return null
  return {
    status: "CLOSED",
    resultR: r,
    pnl: parseOptionalNumber(pnl) ?? suggestedPnl(r, capital, riskPercent),
  }
}
