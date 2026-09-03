import { describe, expect, it } from "vitest"

import { EMPTY_TRADE_FILTERS, filterTrades } from "@/lib/trade-filters"
import { MOCK_TRADES } from "@/lib/mock-data"

describe("filterTrades", () => {
  it("finds a trade by note text", () => {
    const withNote = MOCK_TRADES.map((trade, index) =>
      index === 0 ? { ...trade, notes: "London session pullback" } : trade
    )
    const matches = filterTrades(withNote, {
      ...EMPTY_TRADE_FILTERS,
      query: "london",
    })
    expect(matches.some((trade) => trade.notes.includes("London"))).toBe(true)
  })
})
