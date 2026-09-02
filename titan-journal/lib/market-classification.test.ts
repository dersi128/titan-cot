import { describe, expect, it } from "vitest"

import {
  classifyMarket,
  cotFieldsForClassification,
  formatMarketLabel,
  normalizeSymbol,
  shouldDisplayCot,
} from "@/lib/market-classification"

describe("normalizeSymbol", () => {
  it("uppercases and strips spaces and slashes", () => {
    expect(normalizeSymbol("audusd")).toBe("AUDUSD")
    expect(normalizeSymbol("AUD/USD")).toBe("AUDUSD")
    expect(normalizeSymbol("AUD USD")).toBe("AUDUSD")
  })
})

describe("classifyMarket", () => {
  it.each([
    "AUDUSD",
    "EURUSD",
    "USDJPY",
    "NZDUSD",
  ] as const)("classifies %s as Forex Major with COT", (symbol) => {
    expect(classifyMarket(symbol)).toEqual({
      symbol,
      assetClass: "Forex",
      marketType: "Major",
      cotEnabled: true,
    })
  })

  it("normalizes messy major input", () => {
    expect(classifyMarket("eur/usd")).toEqual({
      symbol: "EURUSD",
      assetClass: "Forex",
      marketType: "Major",
      cotEnabled: true,
    })
    expect(formatMarketLabel(classifyMarket("GBPUSD"))).toBe("Forex · Major")
  })

  it.each([
    "EURAUD",
    "EURNZD",
    "GBPNZD",
    "AUDNZD",
    "EURJPY",
  ] as const)("classifies %s as Forex Cross without COT", (symbol) => {
    expect(classifyMarket(symbol)).toEqual({
      symbol,
      assetClass: "Forex",
      marketType: "Cross",
      cotEnabled: false,
    })
  })

  it("does not guess unsupported markets", () => {
    expect(classifyMarket("TESLA")).toMatchObject({
      symbol: "TESLA",
      assetClass: "Unknown",
      marketType: "Unknown",
      cotEnabled: false,
    })
    expect(classifyMarket("BTCUSD")).toMatchObject({
      assetClass: "Unknown",
      cotEnabled: false,
    })
    expect(classifyMarket("XAUUSD")).toMatchObject({
      assetClass: "Unknown",
      cotEnabled: false,
    })
  })

  it("never throws on empty or junk input", () => {
    expect(classifyMarket("")).toEqual({
      symbol: "",
      assetClass: "Unknown",
      marketType: "Unknown",
      cotEnabled: false,
    })
    expect(classifyMarket("!!!")).toEqual({
      symbol: "!!!",
      assetClass: "Unknown",
      marketType: "Unknown",
      cotEnabled: false,
    })
  })
})

describe("COT payload", () => {
  it("keeps COT for majors and nulls it for crosses", () => {
    expect(shouldDisplayCot(classifyMarket("AUDUSD"))).toBe(true)
    expect(shouldDisplayCot(classifyMarket("EURAUD"))).toBe(false)

    expect(
      cotFieldsForClassification(classifyMarket("EURAUD"), {
        cotBias: "Bullish",
        cotScore: 40,
        commercialsBias: "Bearish",
      })
    ).toEqual({
      cotBias: null,
      cotScore: null,
      commercialsBias: null,
    })

    expect(
      cotFieldsForClassification(classifyMarket("AUDUSD"), {
        cotBias: "Bullish",
        cotScore: 140,
        commercialsBias: "Neutral",
      })
    ).toEqual({
      cotBias: "Bullish",
      cotScore: 100,
      commercialsBias: "Neutral",
    })
  })
})
