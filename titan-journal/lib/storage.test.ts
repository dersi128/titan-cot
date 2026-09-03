import { afterEach, describe, expect, it, vi } from "vitest"

import { MOCK_TRADES } from "@/lib/mock-data"
import {
  TRADES_STORAGE_KEY,
  createLocalStorageRepository,
} from "@/lib/storage"

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
    addEventListener() {},
    removeEventListener() {},
  })
}

describe("trade repository remove", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    memory.clear()
  })

  it("starts empty on first visit", () => {
    installStorage()
    const repo = createLocalStorageRepository()
    repo.subscribe(() => {})
    expect(repo.getAll()).toEqual([])
    expect(memory.get(TRADES_STORAGE_KEY)).toBe("[]")
  })

  it("does not restore mocks after deleting a logged trade", () => {
    installStorage()
    const repo = createLocalStorageRepository()
    repo.subscribe(() => {})
    repo.replaceAll([
      { ...MOCK_TRADES[0], id: "real-1" },
      { ...MOCK_TRADES[1], id: "real-2" },
    ])
    repo.remove("real-1")
    expect(repo.getById("real-1")).toBeUndefined()
    expect(repo.getAll()).toHaveLength(1)
    expect(repo.getAll()[0]?.id).toBe("real-2")
  })

  it("keeps an empty journal empty after the last delete", () => {
    installStorage()
    const repo = createLocalStorageRepository()
    repo.subscribe(() => {})
    repo.replaceAll([{ ...MOCK_TRADES[0], id: "real-1" }])
    repo.remove("real-1")
    expect(repo.getAll()).toEqual([])
    expect(memory.get(TRADES_STORAGE_KEY)).toBe("[]")
  })

  it("adds a trade onto an empty journal without bringing mock rows back", () => {
    installStorage()
    const repo = createLocalStorageRepository()
    repo.subscribe(() => {})
    repo.replaceAll([])
    const created = repo.upsert({
      ...MOCK_TRADES[0],
      id: "trd-only",
      symbol: "AUDUSD",
    })
    const all = repo.getAll()
    expect(all).toHaveLength(1)
    expect(all[0]?.id).toBe(created.id)
  })
})
