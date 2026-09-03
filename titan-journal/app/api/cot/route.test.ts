import { afterEach, describe, expect, it, vi } from "vitest"

import { GET } from "@/app/api/cot/route"

describe("GET /api/cot", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it("returns unsupported for a market without a COT link", async () => {
    const response = await GET(
      new Request("http://journal.test/api/cot?symbol=EURAUD")
    )
    expect(response.status).toBe(404)
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "unsupported",
    })
  })

  it("compacts a Titan-COT payload for the journal symbol", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          market: "JAPANESE YEN",
          reportDate: "2026-08-25",
          commercials: { bias: "bullish" },
          cotScore: 40,
          cotVerdict: "B LONG",
        }),
      })
    )

    const response = await GET(
      new Request("http://journal.test/api/cot?symbol=USDJPY")
    )
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      symbol: "USDJPY",
      slug: "japanese-yen",
      invert: true,
      commercialsBias: "Bullish",
      pairBias: "Bearish",
      cotScore: -40,
    })
  })

  it("returns unavailable when Titan-COT is down", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("timeout")))

    const response = await GET(
      new Request("http://journal.test/api/cot?symbol=EURUSD")
    )
    expect(response.status).toBe(502)
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "unavailable",
    })
  })
})
