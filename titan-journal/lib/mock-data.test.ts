import { describe, expect, it } from "vitest"

import { MOCK_TRADES, isSampleJournal, withoutSampleTrades } from "@/lib/mock-data"
import { filterTrades } from "@/lib/trade-filters"

describe("mock journal seed", () => {
  it("contains 47 trades including the three examples", () => {
    expect(MOCK_TRADES).toHaveLength(47)
    expect(MOCK_TRADES[0]).toMatchObject({
      symbol: "AUDUSD",
      direction: "SHORT",
      grade: "A",
      resultR: 2,
    })
    expect(MOCK_TRADES[1]).toMatchObject({
      symbol: "EURUSD",
      direction: "LONG",
      grade: "A+",
      resultR: -1,
    })
    expect(MOCK_TRADES[2]).toMatchObject({
      symbol: "EURAUD",
      direction: "SHORT",
      grade: "B+",
      resultR: 2,
      assetClass: "Forex",
      marketType: "Cross",
      cotEnabled: false,
      cotBias: null,
      commercialsBias: null,
      review: null,
      playbookId: "pb-titan-swing",
    })
  })

  it("seeds mixed asset classes onto Personal trades", () => {
    const personal = MOCK_TRADES.filter((item) => item.account === "Personal")
    const classes = new Set(personal.map((item) => item.assetClass))
    expect(classes.has("Forex")).toBe(true)
    expect(classes.has("Stock")).toBe(true)
    expect(classes.has("Index")).toBe(true)
    expect(classes.has("Metal")).toBe(true)
    expect(classes.has("Commodity")).toBe(true)
    expect(classes.has("Crypto")).toBe(true)
  })

  it("marks only a full mock id set as sample journal", () => {
    expect(isSampleJournal([])).toBe(false)
    expect(isSampleJournal(MOCK_TRADES)).toBe(true)
    expect(isSampleJournal(MOCK_TRADES.slice(0, 3))).toBe(true)
    expect(
      isSampleJournal([{ ...MOCK_TRADES[0], id: "real-1" }])
    ).toBe(false)
    expect(
      isSampleJournal([...MOCK_TRADES, { ...MOCK_TRADES[0], id: "real-1" }])
    ).toBe(false)
  })

  it("drops sample trades so a broker import does not keep fake data", () => {
    const real = { ...MOCK_TRADES[0], id: "real-1" }
    expect(withoutSampleTrades(MOCK_TRADES)).toEqual([])
    expect(withoutSampleTrades([real, MOCK_TRADES[0]])).toEqual([real])
    expect(withoutSampleTrades([real])).toEqual([real])
  })
})

describe("filterTrades", () => {
  it("filters by symbol and direction", () => {
    const result = filterTrades(MOCK_TRADES, {
      query: "aud",
      playbookId: "ALL",
      direction: "SHORT",
      result: "ALL",
      dateFrom: "",
      dateTo: "",
    })

    expect(result.every((trade) => trade.symbol.includes("AUD"))).toBe(true)
    expect(result.every((trade) => trade.direction === "SHORT")).toBe(true)
  })
})
