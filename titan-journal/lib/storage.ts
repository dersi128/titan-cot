import { sortTrades } from "@/lib/mock-data"
import { hydrateTrades, isLegacyTradeShape } from "@/lib/trade-hydration"
import type { Trade } from "@/types/trade"

/**
 * Persistence adapter. The UI talks only to this interface so
 * localStorage can be replaced with a database later.
 */
export interface TradeRepository {
  getAll(): Trade[]
  getById(id: string): Trade | undefined
  upsert(trade: Trade): Trade
  remove(id: string): void
  replaceAll(trades: Trade[]): void
  subscribe(listener: () => void): () => void
}

export const TRADES_STORAGE_KEY = "titan-journal.trades.v2"

function canUseLocalStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined"
}

function readRaw(): string | null {
  if (!canUseLocalStorage()) return null
  try {
    return window.localStorage.getItem(TRADES_STORAGE_KEY)
  } catch {
    return null
  }
}

function parseTrades(raw: string | null): Trade[] {
  if (!raw) return []
  try {
    return hydrateTrades(JSON.parse(raw))
  } catch {
    return []
  }
}

function looksLegacy(raw: string | null): boolean {
  if (!raw) return false
  try {
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.some(isLegacyTradeShape)
  } catch {
    return false
  }
}

function writeLocal(trades: Trade[]): void {
  if (!canUseLocalStorage()) return
  try {
    window.localStorage.setItem(TRADES_STORAGE_KEY, JSON.stringify(trades))
  } catch {
    // Private mode / quota must not crash the tree.
  }
}

export function createLocalStorageRepository(): TradeRepository {
  const listeners = new Set<() => void>()
  let cachedRaw: string | null | undefined
  let cachedTrades: Trade[] = []

  function storedList(): Trade[] {
    const raw = readRaw()
    if (raw == null) return []
    return parseTrades(raw)
  }

  function snapshot(): Trade[] {
    const raw = readRaw()
    if (raw === cachedRaw) return cachedTrades

    if (raw == null) {
      cachedRaw = raw
      cachedTrades = []
      return cachedTrades
    }

    cachedRaw = raw
    cachedTrades = sortTrades(parseTrades(raw))

    if (looksLegacy(raw)) {
      writeLocal(cachedTrades)
      cachedRaw = readRaw()
    }

    return cachedTrades
  }

  function emit() {
    cachedRaw = undefined
    listeners.forEach((listener) => listener())
  }

  function seedIfEmpty() {
    if (!canUseLocalStorage()) return
    if (readRaw() == null) {
      writeLocal([])
    }
  }

  return {
    getAll() {
      return snapshot()
    },
    getById(id: string) {
      return snapshot().find((trade) => trade.id === id)
    },
    upsert(trade: Trade) {
      const base = storedList()
      const index = base.findIndex((item) => item.id === trade.id)
      if (index >= 0) {
        base[index] = trade
      } else {
        base.unshift(trade)
      }
      writeLocal(base)
      emit()
      return trade
    },
    remove(id: string) {
      writeLocal(storedList().filter((item) => item.id !== id))
      emit()
    },
    replaceAll(trades: Trade[]) {
      writeLocal(trades)
      emit()
    },
    subscribe(listener: () => void) {
      seedIfEmpty()
      listeners.add(listener)
      if (typeof window !== "undefined") {
        window.addEventListener("storage", listener)
      }
      return () => {
        listeners.delete(listener)
        if (typeof window !== "undefined") {
          window.removeEventListener("storage", listener)
        }
      }
    },
  }
}

export const tradeRepository = createLocalStorageRepository()
