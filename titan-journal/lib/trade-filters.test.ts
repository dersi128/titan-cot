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

  it("keeps WIN, BE, and LOSS mutually exclusive and hides open plans", () => {
    const wins = filterTrades(MOCK_TRADES, { ...EMPTY_TRADE_FILTERS, result: "WIN" })
    const bes = filterTrades(MOCK_TRADES, { ...EMPTY_TRADE_FILTERS, result: "BE" })
    const losses = filterTrades(MOCK_TRADES, { ...EMPTY_TRADE_FILTERS, result: "LOSS" })

    expect(wins.every((trade) => trade.resultR != null && trade.resultR >= 0.05)).toBe(true)
    expect(bes.every((trade) => trade.resultR != null && Math.abs(trade.resultR) < 0.05)).toBe(true)
    expect(losses.every((trade) => trade.resultR != null && trade.resultR <= -0.05)).toBe(true)
    expect(
      [...wins, ...bes, ...losses].every((trade) =>
        ["IDEA", "PLANNED", "ACTIVE"].includes(trade.status) === false
      )
    ).toBe(true)
  })

  it("filters by market using classifyMarket", () => {
    const majors = filterTrades(MOCK_TRADES, { ...EMPTY_TRADE_FILTERS, market: "MAJOR" })
    const crosses = filterTrades(MOCK_TRADES, { ...EMPTY_TRADE_FILTERS, market: "CROSS" })
    const stocks = filterTrades(MOCK_TRADES, { ...EMPTY_TRADE_FILTERS, market: "STOCK" })
    const commodities = filterTrades(MOCK_TRADES, {
      ...EMPTY_TRADE_FILTERS,
      market: "COMMODITY",
    })
    const metals = filterTrades(MOCK_TRADES, { ...EMPTY_TRADE_FILTERS, market: "METAL" })

    expect(majors.every((trade) => trade.marketType === "Major")).toBe(true)
    expect(crosses.every((trade) => trade.marketType === "Cross")).toBe(true)
    expect(stocks.every((trade) => trade.assetClass === "Stock")).toBe(true)
    expect(commodities.every((trade) => trade.assetClass === "Commodity")).toBe(true)
    expect(metals.every((trade) => trade.assetClass === "Metal")).toBe(true)
    expect(majors.some((trade) => trade.symbol === "EURUSD")).toBe(true)
    expect(crosses.some((trade) => trade.symbol === "EURAUD")).toBe(true)
    expect(stocks.some((trade) => trade.symbol === "AAPL")).toBe(true)
    expect(commodities.some((trade) => trade.symbol === "COFFEE")).toBe(true)
    expect(metals.some((trade) => trade.symbol === "XAUUSD")).toBe(true)
    expect(metals.some((trade) => trade.symbol === "GOLD")).toBe(true)
  })

  it("combines market with result, direction, search, playbook, and dates", () => {
    const matches = filterTrades(MOCK_TRADES, {
      ...EMPTY_TRADE_FILTERS,
      market: "MAJOR",
      result: "WIN",
      direction: "SHORT",
      query: "AUD",
      playbookId: MOCK_TRADES[0]?.playbookId ?? "ALL",
      dateFrom: "2026-08-01",
      dateTo: "2026-08-31",
    })
    expect(matches.length).toBeGreaterThan(0)
    expect(
      matches.every(
        (trade) =>
          trade.marketType === "Major" &&
          trade.direction === "SHORT" &&
          trade.symbol.includes("AUD") &&
          trade.date >= "2026-08-01" &&
          trade.date <= "2026-08-31"
      )
    ).toBe(true)
  })
})
