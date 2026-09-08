import { afterEach, describe, expect, it, vi } from "vitest"

import {
  GUIDE_STORAGE_KEY,
  loadGuideSeen,
  saveGuideSeen,
} from "@/lib/guide-storage"

const memory = new Map<string, string>()

function installStorage() {
  memory.clear()
  vi.stubGlobal("window", {
    localStorage: {
      getItem: (key: string) => memory.get(key) ?? null,
      setItem: (key: string, value: string) => {
        memory.set(key, value)
      },
      removeItem: (key: string) => {
        memory.delete(key)
      },
    },
  })
}

describe("guide seen flag", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("starts unseen", () => {
    installStorage()
    expect(loadGuideSeen()).toBe(false)
  })

  it("remembers skip or finish", () => {
    installStorage()
    saveGuideSeen()
    expect(loadGuideSeen()).toBe(true)
  })

  it("ignores junk in storage", () => {
    installStorage()
    window.localStorage.setItem(GUIDE_STORAGE_KEY, "{")
    expect(loadGuideSeen()).toBe(false)
    window.localStorage.setItem(GUIDE_STORAGE_KEY, JSON.stringify({ seen: "yes" }))
    expect(loadGuideSeen()).toBe(false)
  })
})
