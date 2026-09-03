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
      playbookId: "pb-titan-swing",
      strategy: "Swing",
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
      cotReportDate: "2026-08-22",
    })
    expect(trade).toMatchObject({
      assetClass: "Forex",
      marketType: "Major",
      cotEnabled: true,
      cotBias: "Bullish",
      cotScore: 41,
      cotReportDate: "2026-08-22",
    })
  })

  it("defaults missing review to null and does not crash", () => {
    const trade = hydrateTrade(legacyCross)
    expect(trade?.review).toBeNull()
  })

  it("hydrates REVIEWED status and recomputes a stored review", () => {
    const trade = hydrateTrade({
      ...legacyCross,
      status: "REVIEWED",
      review: {
        completed: true,
        planFollowed: "Yes",
        setupValid: true,
        wouldTakeAgain: true,
        executionQuality: "Good",
        tags: ["Good Patience"],
        executionScore: 1,
        tradeQuality: "Needs Review",
      },
    })

    expect(trade?.status).toBe("REVIEWED")
    expect(trade?.review).toMatchObject({
      completed: true,
      executionScore: 94,
      tradeQuality: "Good Trade",
      tags: ["Good Patience"],
    })
  })

  it("maps legacy TITAN fields onto the default playbook", () => {
    const trade = hydrateTrade(legacyCross)
    expect(trade?.playbookId).toBe("pb-titan-swing")
    expect(trade?.fieldValues).toEqual(
      expect.arrayContaining([
        { fieldId: "titan-trend", value: "Downtrend" },
        { fieldId: "titan-location", value: "Premium" },
        { fieldId: "titan-zone", value: "Supply" },
        { fieldId: "titan-grade", value: "B+" },
      ])
    )
  })

  it("keeps an explicit empty fieldValues list from Simple mode", () => {
    const trade = hydrateTrade({
      ...legacyCross,
      playbookId: "pb-titan-swing",
      fieldValues: [],
    })
    expect(trade?.fieldValues).toEqual([])
  })

  it("reclassifies stored metals on hydrate", () => {
    const trade = hydrateTrade({
      ...legacyCross,
      id: "trd-metal",
      symbol: "XAUUSD",
    })
    expect(trade).toMatchObject({
      symbol: "XAUUSD",
      assetClass: "Metal",
      marketType: "Unknown",
      cotEnabled: true,
    })
  })

  it("maps a stored Challenge account onto Backtesting", () => {
    const trade = hydrateTrade({
      ...legacyCross,
      account: "Challenge",
    })
    expect(trade?.account).toBe("Backtesting")
  })
})
