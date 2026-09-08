import { describe, expect, it } from "vitest"

import { prefersMoneyMetrics } from "@/lib/locale"

describe("prefersMoneyMetrics", () => {
  it("defaults Czech and Slovak views to money instead of R", () => {
    expect(prefersMoneyMetrics("cs")).toBe(true)
    expect(prefersMoneyMetrics("sk")).toBe(true)
    expect(prefersMoneyMetrics("en")).toBe(false)
  })
})
