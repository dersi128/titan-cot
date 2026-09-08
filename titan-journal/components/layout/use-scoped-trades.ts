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
  riskForAccount,
  withPnlR,
} from "@/lib/account-scope"
import { computeDashboardStats } from "@/lib/trade-calculations"

export function useScopedTrades() {
  const { trades, isReady } = useTrades()
  const { account, range, custom } = useWorkspaceChrome()
  const { profile } = useWorkspace()

  const capital = capitalForAccount(profile.capital, account)
  const riskPercent = riskForAccount(profile, account)
  const riskUsd = dollarsPerR(capital, riskPercent)
  const byAccount = useMemo(
    () =>
      filterTradesByAccount(trades, account).map((trade) =>
        withPnlR(trade, capital, riskPercent)
      ),
    [trades, account, capital, riskPercent]
  )
  const scoped = useMemo(
    () =>
      filterTradesByScope(trades, { account, range, custom }).map((trade) =>
        withPnlR(trade, capital, riskPercent)
      ),
    [trades, account, range, custom, capital, riskPercent]
  )
  const stats = useMemo(() => computeDashboardStats(scoped), [scoped])

  return {
    trades: scoped,
    accountTrades: byAccount,
    isReady,
    account,
    range,
    capital,
    riskPercent,
    riskUsd,
    markets: profile.markets,
    stats,
    profile,
  }
}
