import { describe, expect, it } from "vitest"

import { marketDistribution } from "@/lib/market-distribution"
import { MOCK_TRADES } from "@/lib/mock-data"
import type { AssetClass, Trade } from "@/types/trade"

function trade(partial: Partial<Trade> & Pick<Trade, "assetClass">): Trade {
  return {
    id: partial.id ?? "t",
    createdAt: "2026-08-01T00:00:00.000Z",
    date: "2026-08-01",
    symbol: partial.symbol ?? "EURUSD",
    assetClass: partial.assetClass,
    marketType: partial.marketType ?? "Unknown",
    cotEnabled: false,
    direction: "LONG",
    strategy: "Swing",
    playbookId: "pb-titan-swing",
    account: "Personal",
    status: partial.status ?? "CLOSED",
    htfTrend: "Uptrend",
    tradeTrend: "Uptrend",
    location: "Discount",
    zoneType: "Demand",
    zoneTimeframe: "Daily",
    original: true,
    fresh: true,
    touchCount: "0",
    hq: true,
    impulse: "Normal",
    mitigation: 8,
    cotBias: null,
    cotScore: null,
    commercialsBias: null,
    seasonalityBias: "Neutral",
    seasonalWindow: false,
    grade: "A",
    entry: 1,
    stopLoss: 0.9,
    takeProfit: 1.2,
    riskPercent: 1,
    plannedRRR: 2,
    resultR: partial.resultR ?? 1,
    pnl: partial.pnl ?? 100,
    notes: "",
    screenshot: null,
    fieldValues: [],
    review: null,
  }
}

describe("marketDistribution", () => {
  it("groups by trades and hides empty classes", () => {
    const result = marketDistribution(
      [
        trade({ assetClass: "Forex", resultR: 2, pnl: 200 }),
        trade({ id: "2", assetClass: "Forex", resultR: 1, pnl: 100 }),
        trade({ id: "3", assetClass: "Stock", resultR: 1, pnl: 80 }),
      ],
      "trades"
    )

    expect(result.totalTrades).toBe(3)
    expect(result.slices.map((slice) => slice.assetClass)).toEqual(["Forex", "Stock"])
    expect(result.slices[0]).toMatchObject({ trades: 2, share: 2 / 3 })
    expect(result.slices.find((slice) => slice.assetClass === "Crypto")).toBeUndefined()
  })

  it("uses absolute R for slice size and keeps signed totals", () => {
    const result = marketDistribution(
      [
        trade({ assetClass: "Forex", resultR: 8.4, pnl: 1240 }),
        trade({ assetClass: "Commodity", resultR: -1.2, pnl: -180 }),
      ],
      "r"
    )

    expect(result.slices).toHaveLength(2)
    const forex = result.slices.find((slice) => slice.assetClass === "Forex")
    const commodity = result.slices.find((slice) => slice.assetClass === "Commodity")
    expect(forex).toMatchObject({ totalR: 8.4, slice: 8.4, value: 8.4 })
    expect(commodity).toMatchObject({ totalR: -1.2, slice: 1.2, value: -1.2 })
  })

  it("uses monetary PnL for the pnl metric", () => {
    const result = marketDistribution(
      [
        trade({ assetClass: "Stock", resultR: 1, pnl: 920 }),
        trade({ assetClass: "Crypto", resultR: 0.5, pnl: 95 }),
      ],
      "pnl"
    )
    expect(result.slices[0]).toMatchObject({ assetClass: "Stock", netPnl: 920 })
    expect(result.slices[1]).toMatchObject({ assetClass: "Crypto", netPnl: 95 })
  })

  it("skips cancelled trades", () => {
    const result = marketDistribution(
      [
        trade({ assetClass: "Index", status: "CANCELLED" }),
        trade({ id: "live", assetClass: "Index" }),
      ],
      "trades"
    )
    expect(result.totalTrades).toBe(1)
    expect(result.slices[0]?.trades).toBe(1)
  })
})

describe("mock journal covers every asset class", () => {
  it("includes Forex, Stocks, Commodities, Metals, Indices, and Crypto", () => {
    const classes = new Set(MOCK_TRADES.map((item) => item.assetClass))
    const expected: AssetClass[] = [
      "Forex",
      "Stock",
      "Commodity",
      "Metal",
      "Index",
      "Crypto",
    ]
    for (const assetClass of expected) {
      expect(classes.has(assetClass)).toBe(true)
    }
  })
})
