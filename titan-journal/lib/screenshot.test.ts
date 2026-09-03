import { describe, expect, it } from "vitest"

import {
  dataUrlBytes,
  hydrateScreenshot,
  ingestScreenshot,
  isHttpUrl,
} from "@/lib/screenshot"

describe("screenshot helpers", () => {
  it("accepts http(s) urls and data images", () => {
    expect(isHttpUrl("https://charts.example.com/shot.png")).toBe(true)
    expect(isHttpUrl("http://localhost:3001/a.jpg")).toBe(true)
    expect(isHttpUrl("javascript:alert(1)")).toBe(false)
    expect(isHttpUrl("not a url")).toBe(false)
    expect(hydrateScreenshot(" https://img.example/a.png ")).toBe(
      "https://img.example/a.png"
    )
    expect(hydrateScreenshot("data:image/png;base64,abc")).toBe(
      "data:image/png;base64,abc"
    )
    expect(hydrateScreenshot("hello")).toBeNull()
    expect(hydrateScreenshot("")).toBeNull()
  })

  it("stores http urls without fetching them", async () => {
    const result = await ingestScreenshot(
      "https://s3.tradingview.com/snapshots/foo.png"
    )
    expect(result).toEqual({
      ok: true,
      value: "https://s3.tradingview.com/snapshots/foo.png",
    })
  })

  it("rejects non-image text and keeps small data urls", async () => {
    expect(await ingestScreenshot("not-a-url")).toEqual({
      ok: false,
      reason: "invalid-url",
    })
    const tiny = "data:image/png;base64,abc"
    expect(dataUrlBytes(tiny)).toBe(3)
    expect(await ingestScreenshot(tiny)).toEqual({ ok: true, value: tiny })
  })

  it("rejects oversized data urls when canvas is unavailable", async () => {
    const huge = `data:image/png;base64,${"A".repeat(1_000_000)}`
    expect(await ingestScreenshot(huge)).toEqual({
      ok: false,
      reason: "too-large",
    })
  })
})
