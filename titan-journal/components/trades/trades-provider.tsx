"use client"

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from "react"

import { MOCK_TRADES, sortTrades } from "@/lib/mock-data"
import { tradeRepository } from "@/lib/storage"
import type { NewTradeInput, Trade } from "@/types/trade"

const SERVER_SNAPSHOT = sortTrades(MOCK_TRADES)

type TradesContextValue = {
  trades: Trade[]
  isReady: boolean
  getById: (id: string) => Trade | undefined
  saveTrade: (input: NewTradeInput) => Trade
  updateTrade: (trade: Trade) => Trade
}

const TradesContext = createContext<TradesContextValue | null>(null)

export function TradesProvider({ children }: { children: React.ReactNode }) {
  const trades = useSyncExternalStore(
    tradeRepository.subscribe,
    tradeRepository.getAll,
    () => SERVER_SNAPSHOT
  )

  const getById = useCallback(
    (id: string) => trades.find((trade) => trade.id === id),
    [trades]
  )

  const saveTrade = useCallback((input: NewTradeInput) => {
    const trade: Trade = {
      ...input,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      review: input.review ?? null,
    }
    return tradeRepository.upsert(trade)
  }, [])

  const updateTrade = useCallback((trade: Trade) => {
    return tradeRepository.upsert(trade)
  }, [])

  const value = useMemo(
    () => ({ trades, isReady: true, getById, saveTrade, updateTrade }),
    [trades, getById, saveTrade, updateTrade]
  )

  return <TradesContext.Provider value={value}>{children}</TradesContext.Provider>
}

export function useTrades() {
  const context = useContext(TradesContext)
  if (!context) {
    throw new Error("useTrades must be used within TradesProvider")
  }
  return context
}
