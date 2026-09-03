import { describe, expect, it } from "vitest"

import { hydrateChrome, hydrateCustomRange } from "@/lib/chrome-storage"

describe("chrome persistence", () => {
  it("keeps a custom od–do range", () => {
    expect(
      hydrateChrome({
        account: "Funded",
        range: "CUSTOM",
        custom: { start: "2026-07-01", end: "2026-07-15" },
      })
    ).toEqual({
      account: "Funded",
      range: "CUSTOM",
      custom: { start: "2026-07-01", end: "2026-07-15" },
    })
  })

  it("falls back when custom dates are missing", () => {
    const snapshot = hydrateChrome({ account: "Personal", range: "CUSTOM" })
    expect(snapshot?.range).toBe("CUSTOM")
    expect(snapshot?.custom?.start).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(snapshot?.custom?.end).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it("ignores junk", () => {
    expect(hydrateChrome(null)).toBeNull()
    expect(hydrateCustomRange({ start: "July", end: "2026-01-01" })).toBeNull()
    expect(hydrateChrome({ range: "nope", account: "Challenge" })).toEqual({
      account: "Backtesting",
      range: "ALL",
      custom: null,
    })
  })
})
