import type { Grade, Strategy, Trade, TradeDirection, TradeStatus } from "@/types/trade"

export type TradeFilters = {
  query: string
  strategy: Strategy | "ALL"
  grade: Grade | "ALL"
  direction: TradeDirection | "ALL"
  status: TradeStatus | "ALL"
}

export const EMPTY_TRADE_FILTERS: TradeFilters = {
  query: "",
  strategy: "ALL",
  grade: "ALL",
  direction: "ALL",
  status: "ALL",
}

export function filterTrades(trades: Trade[], filters: TradeFilters): Trade[] {
  const query = filters.query.trim().toUpperCase()

  return trades.filter((trade) => {
    if (query && !trade.symbol.includes(query)) return false
    if (filters.strategy !== "ALL" && trade.strategy !== filters.strategy) return false
    if (filters.grade !== "ALL" && trade.grade !== filters.grade) return false
    if (filters.direction !== "ALL" && trade.direction !== filters.direction) return false
    if (filters.status !== "ALL" && trade.status !== filters.status) return false
    return true
  })
}
