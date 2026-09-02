"use client"

import { useMemo } from "react"

import { useWorkspaceChrome } from "@/components/layout/workspace-chrome"
import { useWorkspace } from "@/components/layout/workspace-provider"
import { useTrades } from "@/components/trades/trades-provider"
import {
  capitalForAccount,
  dollarsPerR,
  filterTradesByAccount,
  filterTradesByScope,
} from "@/lib/account-scope"
import { computeDashboardStats } from "@/lib/trade-calculations"

export function useScopedTrades() {
  const { trades, isReady } = useTrades()
  const { account, range } = useWorkspaceChrome()
  const { profile } = useWorkspace()

  const byAccount = useMemo(
    () => filterTradesByAccount(trades, account),
    [trades, account]
  )
  const scoped = useMemo(
    () => filterTradesByScope(trades, { account, range }),
    [trades, account, range]
  )
  const stats = useMemo(() => computeDashboardStats(scoped), [scoped])
  const capital = capitalForAccount(profile.capital, account)
  const riskUsd = dollarsPerR(capital, profile.riskPercent)

  return {
    trades: scoped,
    accountTrades: byAccount,
    isReady,
    account,
    range,
    capital,
    riskPercent: profile.riskPercent,
    riskUsd,
    markets: profile.markets,
    stats,
    profile,
  }
}
