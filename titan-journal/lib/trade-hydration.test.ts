import { describe, expect, it } from "vitest"

import { hydrateTrade, isLegacyTradeShape } from "@/lib/trade-hydration"

const legacyCross = {
  id: "trd-legacy-cross",
  createdAt: "2026-08-22T08:30:00.000Z",
  date: "2026-08-22",
  symbol: "EURAUD",
  marketType: "Forex",
  pairClass: "Cross",
  direction: "SHORT",
  strategy: "TITAN Swing",
  account: "Personal",
  status: "CLOSED",
  htfTrend: "Downtrend",
  tradeTrend: "Downtrend",
  location: "Premium",
  zoneType: "Supply",
  zoneTimeframe: "Daily",
  original: false,
  fresh: false,
  touchCount: "1",
  hq: false,
  impulse: "Normal",
  mitigation: 18,
  cotBias: "Bearish",
  cotScore: -14,
  seasonalityBias: "Neutral",
  seasonalWindow: false,
  grade: "B+",
  entry: 0.65,
  stopLoss: 0.66,
  takeProfit: 0.64,
  riskPercent: 1,
  plannedRRR: 2,
  resultR: 2,
  pnl: 260,
  notes: "old shape",
}

describe("hydrateTrade", () => {
  it("detects the previous storage shape", () => {
    expect(isLegacyTradeShape(legacyCross)).toBe(true)
  })

  it("migrates a stored Cross trade without crashing and clears COT", () => {
    const trade = hydrateTrade(legacyCross)
    expect(trade).toMatchObject({
      id: "trd-legacy-cross",
      symbol: "EURAUD",
      assetClass: "Forex",
      marketType: "Cross",
      cotEnabled: false,
      cotBias: null,
      cotScore: null,
      commercialsBias: null,
    })
  })

  it("keeps COT on a stored Major", () => {
    const trade = hydrateTrade({
      ...legacyCross,
      id: "trd-legacy-major",
      symbol: "AUDUSD",
      pairClass: "Major",
      cotBias: "Bullish",
      cotScore: 41,
    })
    expect(trade).toMatchObject({
      assetClass: "Forex",
      marketType: "Major",
      cotEnabled: true,
      cotBias: "Bullish",
      cotScore: 41,
    })
  })

  it("returns null for garbage instead of throwing", () => {
    expect(hydrateTrade(null)).toBeNull()
    expect(hydrateTrade({})).toBeNull()
    expect(hydrateTrade("nope")).toBeNull()
  })
})
