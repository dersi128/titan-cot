"use client"

import dynamic from "next/dynamic"
import { useMemo } from "react"

import { AccountStrip } from "@/components/dashboard/account-strip"
import { KpiCards } from "@/components/dashboard/kpi-cards"
import { RecentTrades } from "@/components/dashboard/recent-trades"
import { StrategySnapshot } from "@/components/dashboard/strategy-snapshot"
import { KpiSkeleton, TableSkeleton } from "@/components/layout/loading-state"
import { PageFrame, PageHeader } from "@/components/layout/page-header"
import { useScopedTrades } from "@/components/layout/use-scoped-trades"
import { Skeleton } from "@/components/ui/skeleton"
import { accountEquity } from "@/lib/account-scope"
import { copy } from "@/lib/labels"
import { buildEquityCurve } from "@/lib/trade-calculations"

const EquityCurve = dynamic(
  () =>
    import("@/components/dashboard/equity-curve").then((mod) => mod.EquityCurve),
  {
    ssr: false,
    loading: () => <Skeleton className="h-52 w-full rounded-[10px]" />,
  }
)

export function DashboardPage() {
  const {
    trades,
    isReady,
    account,
    capital,
    riskPercent,
    riskUsd,
    markets,
    stats,
  } = useScopedTrades()

  const equity = useMemo(
    () => buildEquityCurve(trades, capital),
    [trades, capital]
  )

  return (
    <PageFrame>
      <PageHeader
        title={copy.dashboard.title}
        description={copy.dashboard.description}
      />

      {!isReady ? (
        <div className="space-y-4">
          <KpiSkeleton />
          <TableSkeleton rows={8} />
        </div>
      ) : (
        <div className="space-y-4">
          <AccountStrip
            account={account}
            capital={capital}
            equity={accountEquity(capital, stats.netPnl)}
            riskUsd={riskUsd}
            riskPercent={riskPercent}
            markets={markets}
          />
          <KpiCards stats={stats} />
          <EquityCurve data={equity} />
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(280px,0.8fr)]">
            <RecentTrades trades={trades} />
            <StrategySnapshot trades={trades} />
          </div>
        </div>
      )}
    </PageFrame>
  )
}
