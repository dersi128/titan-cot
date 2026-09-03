import { afterEach, describe, expect, it, vi } from "vitest"

import { GET, resetCotCache } from "@/app/api/cot/route"

describe("GET /api/cot", () => {
  afterEach(() => {
    resetCotCache()
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
      reportDate: "2026-08-25",
    })
  })

  it("returns the report week on or before the trade date", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          market: "EURO FX",
          reportDate: "2026-08-25",
          commercials: { bias: "bullish" },
          cotScore: 55,
          history: [
            { reportDate: "2026-08-11", commercialNet: -80_000 },
            { reportDate: "2026-08-18", commercialNet: -70_000 },
            { reportDate: "2026-08-25", commercialNet: 10_000 },
          ],
        }),
      })
    )

    const response = await GET(
      new Request("http://journal.test/api/cot?symbol=EURUSD&date=2026-08-20")
    )
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      reportDate: "2026-08-18",
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
