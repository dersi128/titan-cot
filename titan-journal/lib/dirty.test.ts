import { describe, expect, it } from "vitest"

import { isDirty, stableStringify } from "@/lib/dirty"

describe("isDirty", () => {
  it("treats key order as irrelevant", () => {
    expect(stableStringify({ b: 1, a: 2 })).toBe(stableStringify({ a: 2, b: 1 }))
    expect(isDirty({ name: "A" }, { name: "A" })).toBe(false)
    expect(isDirty({ name: "A" }, { name: "B" })).toBe(true)
  })

  it("treats undefined like null", () => {
    expect(isDirty({ note: undefined }, { note: null })).toBe(false)
  })
})
