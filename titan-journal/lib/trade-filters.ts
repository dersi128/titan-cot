import type { Trade, TradeDirection } from "@/types/trade"

export type ResultFilter = "ALL" | "WIN" | "LOSS" | "BE"

export type TradeFilters = {
  query: string
  playbookId: string | "ALL"
  direction: TradeDirection | "ALL"
  result: ResultFilter
  dateFrom: string
  dateTo: string
}

export const EMPTY_TRADE_FILTERS: TradeFilters = {
  query: "",
  playbookId: "ALL",
  direction: "ALL",
  result: "ALL",
  dateFrom: "",
  dateTo: "",
}

function resultBucket(resultR: number | null): ResultFilter | null {
  if (resultR == null) return null
  if (resultR > 0) return "WIN"
  if (resultR < 0) return "LOSS"
  return "BE"
}

export function filterTrades(trades: Trade[], filters: TradeFilters): Trade[] {
  const query = filters.query.trim().toUpperCase()

  return trades.filter((trade) => {
    if (query) {
      const inSymbol = trade.symbol.toUpperCase().includes(query)
      const inNotes = trade.notes.toUpperCase().includes(query)
      if (!inSymbol && !inNotes) return false
    }
    if (filters.playbookId !== "ALL" && trade.playbookId !== filters.playbookId) {
      return false
    }
    if (filters.direction !== "ALL" && trade.direction !== filters.direction) {
      return false
    }
    if (filters.result !== "ALL" && resultBucket(trade.resultR) !== filters.result) {
      return false
    }
    if (filters.dateFrom && trade.date < filters.dateFrom) return false
    if (filters.dateTo && trade.date > filters.dateTo) return false
    return true
  })
}
