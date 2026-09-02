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

  it("removes a trade and does not restore the seed list", () => {
    installStorage()
    const repo = createLocalStorageRepository()
    repo.subscribe(() => {})
    const first = repo.getAll()[0]
    expect(first).toBeDefined()
    repo.remove(first.id)
    expect(repo.getById(first.id)).toBeUndefined()
    expect(repo.getAll()).toHaveLength(MOCK_TRADES.length - 1)
  })

  it("keeps an empty journal empty after the last delete", () => {
    installStorage()
    const repo = createLocalStorageRepository()
    repo.subscribe(() => {})
    for (const trade of repo.getAll()) {
      repo.remove(trade.id)
    }
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
