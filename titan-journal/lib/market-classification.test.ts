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
    expect(formatMarketLabel(classifyMarket("XAUUSD"))).toBe("Metal")
    expect(formatMarketLabel(classifyMarket("AAPL"))).toBe("Stock")
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

  it("treats unmatched tickers as Stock", () => {
    expect(classifyMarket("FOOBAR")).toMatchObject({
      symbol: "FOOBAR",
      assetClass: "Stock",
      marketType: "Unknown",
      cotEnabled: false,
    })
    expect(classifyMarket("MSFT")).toMatchObject({ assetClass: "Stock" })
    expect(classifyMarket("XYZUSD")).toMatchObject({ assetClass: "Stock" })
  })

  it.each([
    ["AAPL", "Stock"],
    ["NVDA", "Stock"],
    ["GOOGL", "Stock"],
    ["TSLA", "Stock"],
    ["XAUUSD", "Metal"],
    ["XAGUSD", "Metal"],
    ["GOLD", "Metal"],
    ["SILVER", "Metal"],
    ["COPPER", "Metal"],
    ["XPTUSD", "Metal"],
    ["US30", "Index"],
    ["NAS100", "Index"],
    ["SPX500", "Index"],
    ["GER40", "Index"],
    ["UK100", "Index"],
    ["USTEC", "Index"],
    ["NASDAQ", "Index"],
    ["US500", "Index"],
    ["JP225", "Index"],
    ["BTCUSD", "Crypto"],
    ["BTCUSDT", "Crypto"],
    ["ETHUSD", "Crypto"],
    ["ETHUSDT", "Crypto"],
    ["SOLUSD", "Crypto"],
    ["COTTON", "Commodity"],
    ["COFFEE", "Commodity"],
    ["CORN", "Commodity"],
    ["WHEAT", "Commodity"],
    ["SOYBEAN", "Commodity"],
    ["USOIL", "Commodity"],
    ["WTI", "Commodity"],
  ] as const)("classifies %s as %s", (symbol, assetClass) => {
    expect(classifyMarket(symbol)).toMatchObject({
      symbol,
      assetClass,
      marketType: "Unknown",
    })
  })

  it.each([
    ["XAUUSD", true],
    ["GOLD", true],
    ["NAS100", true],
    ["USOIL", true],
    ["COFFEE", true],
    ["GER40", false],
    ["BTCUSD", false],
    ["AAPL", false],
  ] as const)("COT enabled for %s is %s", (symbol, enabled) => {
    expect(classifyMarket(symbol).cotEnabled).toBe(enabled)
  })

  it("classifies extra FX legs as Forex, not Stock", () => {
    expect(classifyMarket("EURSEK")).toMatchObject({
      assetClass: "Forex",
      marketType: "Cross",
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
  it("keeps COT for majors and mapped markets, and nulls it for crosses", () => {
    expect(shouldDisplayCot(classifyMarket("AUDUSD"))).toBe(true)
    expect(shouldDisplayCot(classifyMarket("XAUUSD"))).toBe(true)
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
