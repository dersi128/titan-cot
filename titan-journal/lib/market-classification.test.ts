import { describe, expect, it } from "vitest"

import {
  classifyMarket,
  formatMarketLabel,
  shouldDisplayCot,
} from "@/lib/market-classification"
import { FEATURE_FLAGS } from "@/lib/feature-flags"

describe("classifyMarket", () => {
  it("classifies majors", () => {
    expect(classifyMarket("AUDUSD")).toEqual({
      symbol: "AUDUSD",
      marketType: "Forex",
      pairClass: "Major",
    })
    expect(classifyMarket("eur/usd")).toEqual({
      symbol: "EURUSD",
      marketType: "Forex",
      pairClass: "Major",
    })
    expect(formatMarketLabel(classifyMarket("GBPUSD"))).toBe("Forex · Major")
  })

  it("classifies crosses", () => {
    expect(classifyMarket("EURAUD").pairClass).toBe("Cross")
    expect(classifyMarket("GBPNZD").pairClass).toBe("Cross")
    expect(classifyMarket("AUDNZD").pairClass).toBe("Cross")
    expect(formatMarketLabel(classifyMarket("EURAUD"))).toBe("Forex · Cross")
  })

  it("keeps COT visible for crosses until the flag is enabled", () => {
    expect(FEATURE_FLAGS.hideCotForCrossPairs).toBe(false)
    expect(shouldDisplayCot(classifyMarket("EURAUD"))).toBe(true)
    expect(shouldDisplayCot(classifyMarket("AUDUSD"))).toBe(true)
  })
})
