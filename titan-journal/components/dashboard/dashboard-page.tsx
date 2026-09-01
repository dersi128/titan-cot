"use client"

import dynamic from "next/dynamic"
import { useMemo } from "react"

import { KpiCards } from "@/components/dashboard/kpi-cards"
import { RecentTrades } from "@/components/dashboard/recent-trades"
import { StrategySnapshot } from "@/components/dashboard/strategy-snapshot"
import { KpiSkeleton, TableSkeleton } from "@/components/layout/loading-state"
import { PageFrame, PageHeader } from "@/components/layout/page-header"
import { Skeleton } from "@/components/ui/skeleton"
import { useTrades } from "@/components/trades/trades-provider"
import { copy } from "@/lib/labels"
import {
  buildEquityCurve,
  computeDashboardStats,
} from "@/lib/trade-calculations"

const EquityCurve = dynamic(
  () =>
    import("@/components/dashboard/equity-curve").then((mod) => mod.EquityCurve),
  {
    ssr: false,
    loading: () => <Skeleton className="h-80 w-full rounded-xl" />,
  }
)

export function DashboardPage() {
  const { trades, isReady } = useTrades()

  const stats = useMemo(() => computeDashboardStats(trades), [trades])
  const equity = useMemo(() => buildEquityCurve(trades), [trades])

  return (
    <PageFrame>
      <PageHeader
        title={copy.dashboard.title}
        description={copy.dashboard.description}
      />

      {!isReady ? (
        <div className="space-y-6">
          <KpiSkeleton />
          <TableSkeleton rows={8} />
        </div>
      ) : (
        <div className="space-y-6">
          <KpiCards stats={stats} />
          <EquityCurve data={equity} />
          <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
            <RecentTrades trades={trades} />
            <StrategySnapshot />
          </div>
        </div>
      )}
    </PageFrame>
  )
}
