import { describe, expect, it } from "vitest"

import {
  applyCotAsOf,
  compactCotFromApi,
  cotAlignment,
  formatCotScore,
  hasCotLink,
  invertBias,
  pairOrientedScore,
  resolveCotLink,
  resolveSavedCot,
} from "@/lib/cot-link"

describe("resolveCotLink", () => {
  it("maps majors and inverts quote-currency COT", () => {
    expect(resolveCotLink("eur/usd")).toMatchObject({
      slug: "euro-fx",
      futuresSymbol: "6E1!",
      invert: false,
    })
    expect(resolveCotLink("USDJPY")).toMatchObject({
      slug: "japanese-yen",
      invert: true,
    })
    expect(resolveCotLink("USDCAD")).toMatchObject({ invert: true })
    expect(resolveCotLink("USDCHF")).toMatchObject({ invert: true })
    expect(resolveCotLink("GBPUSD")?.invert).toBe(false)
    expect(resolveCotLink("AUDUSD")?.invert).toBe(false)
    expect(resolveCotLink("NZDUSD")?.invert).toBe(false)
  })

  it("maps metals, indices, and commodities through aliases", () => {
    expect(resolveCotLink("XAUUSD")?.slug).toBe("gold")
    expect(resolveCotLink("GOLD")?.slug).toBe("gold")
    expect(resolveCotLink("XAGUSD")?.slug).toBe("silver")
    expect(resolveCotLink("NAS100")?.slug).toBe("nasdaq")
    expect(resolveCotLink("USTEC")?.slug).toBe("nasdaq")
    expect(resolveCotLink("US500")?.slug).toBe("sp500")
    expect(resolveCotLink("US30")?.slug).toBe("e-mini-dow")
    expect(resolveCotLink("USOIL")?.slug).toBe("crude-oil")
    expect(resolveCotLink("WTI")?.slug).toBe("crude-oil")
    expect(resolveCotLink("COFFEE")?.slug).toBe("coffee")
  })

  it("leaves crosses and unknown markets unmapped", () => {
    expect(resolveCotLink("EURAUD")).toBeNull()
    expect(resolveCotLink("EURJPY")).toBeNull()
    expect(resolveCotLink("GER40")).toBeNull()
    expect(resolveCotLink("AAPL")).toBeNull()
    expect(resolveCotLink("BTCUSD")).toBeNull()
    expect(hasCotLink("")).toBe(false)
  })
})

describe("pair-oriented COT", () => {
  it("inverts bias and score for USDJPY", () => {
    expect(invertBias("Bullish")).toBe("Bearish")
    expect(invertBias("Neutral")).toBe("Neutral")
    expect(pairOrientedScore(40, true)).toBe(-40)
    expect(pairOrientedScore(40, false)).toBe(40)
  })

  it("compacts a Titan-COT payload for EURUSD and USDJPY", () => {
    const payload = {
      market: "EURO FX",
      reportDate: "2026-08-25",
      commercials: { bias: "bullish" },
      cotScore: 55,
      cotVerdict: "B LONG",
    }

    expect(
      compactCotFromApi("EURUSD", resolveCotLink("EURUSD")!, payload)
    ).toMatchObject({
      ok: true,
      slug: "euro-fx",
      invert: false,
      commercialsBias: "Bullish",
      pairBias: "Bullish",
      cotScore: 55,
      futuresScore: 55,
    })

    expect(
      compactCotFromApi("USDJPY", resolveCotLink("USDJPY")!, {
        ...payload,
        market: "JAPANESE YEN",
        commercials: { bias: "bullish" },
        cotScore: 40,
      })
    ).toMatchObject({
      invert: true,
      commercialsBias: "Bullish",
      pairBias: "Bearish",
      cotScore: -40,
      futuresScore: 40,
    })
  })

  it("aligns pair lean with trade direction", () => {
    expect(cotAlignment("LONG", "Bullish")).toBe("aligned")
    expect(cotAlignment("SHORT", "Bearish")).toBe("aligned")
    expect(cotAlignment("LONG", "Bearish")).toBe("against")
    expect(cotAlignment("LONG", "Neutral")).toBe("neutral")
    expect(formatCotScore(42)).toBe("+42")
    expect(formatCotScore(-8)).toBe("-8")
  })
})

describe("resolveSavedCot", () => {
  const live = {
    pairBias: "Bullish" as const,
    commercialsBias: "Bullish" as const,
    cotScore: 55,
    reportDate: "2026-08-25",
  }

  it("nulls COT when the market has no link", () => {
    expect(
      resolveSavedCot({
        cotEnabled: false,
        editing: false,
        live,
      })
    ).toEqual({
      cotBias: null,
      commercialsBias: null,
      cotScore: null,
      cotReportDate: null,
    })
  })

  it("fills a new trade from the live snapshot", () => {
    expect(
      resolveSavedCot({
        cotEnabled: true,
        editing: false,
        live,
      })
    ).toEqual({
      cotBias: "Bullish",
      commercialsBias: "Bullish",
      cotScore: 55,
      cotReportDate: "2026-08-25",
    })
  })

  it("keeps stored values when editing", () => {
    expect(
      resolveSavedCot({
        cotEnabled: true,
        editing: true,
        live,
        stored: {
          cotBias: "Bearish",
          commercialsBias: "Bullish",
          cotScore: -12,
          cotReportDate: "2026-07-14",
        },
      })
    ).toEqual({
      cotBias: "Bearish",
      commercialsBias: "Bullish",
      cotScore: -12,
      cotReportDate: "2026-07-14",
    })
  })

  it("lets an advanced playbook field override bias", () => {
    expect(
      resolveSavedCot({
        cotEnabled: true,
        editing: false,
        live,
        override: { cotBias: "Neutral", commercialsBias: "Neutral" },
      })
    ).toEqual({
      cotBias: "Neutral",
      commercialsBias: "Neutral",
      cotScore: 55,
      cotReportDate: "2026-08-25",
    })
  })

  it("falls back to Neutral when the API is down on create", () => {
    expect(
      resolveSavedCot({
        cotEnabled: true,
        editing: false,
        live: null,
      })
    ).toEqual({
      cotBias: "Neutral",
      commercialsBias: "Neutral",
      cotScore: 0,
      cotReportDate: null,
    })
  })
})

describe("applyCotAsOf", () => {
  const payload = {
    market: "EURO FX",
    reportDate: "2026-08-25",
    commercials: { bias: "bullish" },
    cotScore: 55,
    history: [
      { reportDate: "2026-08-11", commercialNet: -10000 },
      { reportDate: "2026-08-18", commercialNet: 80000 },
      { reportDate: "2026-08-25", commercialNet: 90000 },
    ],
  }

  it("keeps the latest week when the trade date is on or after it", () => {
    expect(applyCotAsOf(payload, "2026-08-26")).toBe(payload)
    expect(applyCotAsOf(payload, "2026-08-25")).toBe(payload)
  })

  it("binds an older trade date to the last report on or before it", () => {
    const asOf = applyCotAsOf(payload, "2026-08-20") as {
      reportDate: string
      commercials: { bias: string }
    }
    expect(asOf.reportDate).toBe("2026-08-18")
    expect(asOf.commercials.bias).toBe("neutral")
  })
})
