import { describe, expect, it } from "vitest"

import { THEME_LOGOS } from "@/lib/brand"
import { THEMES } from "@/types/playbook"

describe("theme logos", () => {
  it("maps every theme to a lockup file", () => {
    for (const theme of THEMES) {
      expect(THEME_LOGOS[theme]).toBe(`/brand/logo-${theme}.webp`)
    }
  })
})
