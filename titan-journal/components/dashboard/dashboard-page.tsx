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
import { useLabels } from "@/lib/use-labels"
import { buildEquityCurve } from "@/lib/trade-calculations"

const EquityCurve = dynamic(
  () =>
    import("@/components/dashboard/equity-curve").then((mod) => mod.EquityCurve),
  {
    ssr: false,
    loading: () => <Skeleton className="h-full min-h-[140px] w-full rounded-[10px]" />,
  }
)

const MarketDistribution = dynamic(
  () =>
    import("@/components/dashboard/market-distribution").then(
      (mod) => mod.MarketDistribution
    ),
  {
    ssr: false,
    loading: () => <Skeleton className="h-full min-h-[140px] w-full rounded-[10px]" />,
  }
)

const PerformanceCandles = dynamic(
  () =>
    import("@/components/dashboard/performance-candles").then(
      (mod) => mod.PerformanceCandles
    ),
  {
    ssr: false,
    loading: () => <Skeleton className="h-full min-h-[140px] w-full rounded-[10px]" />,
  }
)

export function DashboardPage() {
  const { copy } = useLabels()
  const {
    trades,
    isReady,
    account,
    capital,
    riskPercent,
    riskUsd,
    markets,
    stats,
    profile,
  } = useScopedTrades()

  const equity = useMemo(
    () => buildEquityCurve(trades, capital),
    [trades, capital]
  )

  return (
    <PageFrame fill>
      <div className="flex min-h-0 flex-1 flex-col gap-2">
        <PageHeader
          title={copy.dashboard.title}
          description={copy.dashboard.description}
          compact
        />

        {!isReady ? (
          <div className="space-y-3">
            <KpiSkeleton />
            <TableSkeleton rows={6} />
          </div>
        ) : (
          <>
            <AccountStrip
              account={account}
              capital={capital}
              equity={accountEquity(capital, stats.netPnl)}
              riskUsd={riskUsd}
              riskPercent={riskPercent}
              markets={markets}
            />
            <KpiCards stats={stats} dense />
            <div className="grid min-h-0 flex-1 grid-cols-1 gap-2 lg:grid-cols-[minmax(0,1.65fr)_minmax(260px,0.9fr)] lg:grid-rows-[minmax(0,1fr)] lg:overflow-hidden">
              <div className="grid min-h-[200px] gap-2 lg:h-full lg:min-h-0 lg:grid-cols-[minmax(0,1.15fr)_minmax(240px,0.9fr)] lg:grid-rows-[minmax(0,1.15fr)_minmax(128px,0.85fr)] lg:overflow-hidden">
                <div className="min-h-[140px] lg:col-start-1 lg:row-start-1 lg:min-h-0 lg:overflow-hidden">
                  <EquityCurve data={equity} fill />
                </div>
                <div className="min-h-[140px] lg:col-start-1 lg:row-start-2 lg:min-h-0 lg:overflow-hidden">
                  <PerformanceCandles
                    trades={trades}
                    startCapital={capital}
                    currency={profile.currency}
                    fill
                  />
                </div>
                <div className="min-h-[160px] lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:min-h-0 lg:overflow-hidden">
                  <MarketDistribution
                    trades={trades}
                    currency={profile.currency}
                    fill
                  />
                </div>
              </div>
              <div className="grid min-h-0 gap-2 lg:h-full lg:grid-rows-[minmax(0,1fr)_auto] lg:overflow-hidden">
                <RecentTrades trades={trades} fill />
                <StrategySnapshot trades={trades} compact />
              </div>
            </div>
          </>
        )}
      </div>
    </PageFrame>
  )
}
