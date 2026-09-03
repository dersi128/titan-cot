"use client"

import dynamic from "next/dynamic"
import Link from "next/link"
import { PlusCircle } from "lucide-react"
import { useMemo } from "react"

import { KpiCards } from "@/components/dashboard/kpi-cards"
import { RecentTrades } from "@/components/dashboard/recent-trades"
import { SnapshotRow } from "@/components/dashboard/snapshot-row"
import { KpiSkeleton, TableSkeleton } from "@/components/layout/loading-state"
import { PageFrame } from "@/components/layout/page-header"
import { useScopedTrades } from "@/components/layout/use-scoped-trades"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { dashboardSnapshots, maxDrawdown } from "@/lib/dashboard-snapshots"
import { useLabels } from "@/lib/use-labels"
import { buildEquityCurve } from "@/lib/trade-calculations"

const EquityCurve = dynamic(
  () =>
    import("@/components/dashboard/equity-curve").then((mod) => mod.EquityCurve),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[260px] w-full rounded-[10px]" />,
  }
)

const MarketDistribution = dynamic(
  () =>
    import("@/components/dashboard/market-distribution").then(
      (mod) => mod.MarketDistribution
    ),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[260px] w-full rounded-[10px]" />,
  }
)

const PerformanceBars = dynamic(
  () =>
    import("@/components/dashboard/performance-bars").then(
      (mod) => mod.PerformanceBars
    ),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[240px] w-full rounded-[10px]" />,
  }
)

export function DashboardPage() {
  const { copy } = useLabels()
  const { trades, accountTrades, isReady, range, capital, stats, profile } =
    useScopedTrades()

  const equity = useMemo(
    () => buildEquityCurve(trades, capital),
    [trades, capital]
  )
  const drawdown = useMemo(() => maxDrawdown(equity), [equity])
  const snapshots = useMemo(
    () => dashboardSnapshots(accountTrades),
    [accountTrades]
  )

  return (
    <PageFrame>
      <div className="flex flex-col gap-3 pb-4">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-[26px] font-semibold tracking-tight text-foreground">
              {copy.dashboard.hello.replace("{name}", profile.displayName)}
            </h1>
            <p className="mt-1 text-[13px] text-muted-foreground">
              {copy.dashboard.overview[range]}
            </p>
          </div>
          <Button asChild variant="outline" className="border-primary/60 text-primary">
            <Link href="/new-trade">
              <PlusCircle />
              {copy.nav.newTrade}
            </Link>
          </Button>
        </header>

        {!isReady ? (
          <div className="space-y-3">
            <KpiSkeleton />
            <TableSkeleton rows={6} />
          </div>
        ) : (
          <>
            <KpiCards stats={stats} dense drawdown={drawdown} />
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1.85fr)_minmax(220px,0.72fr)]">
              <EquityCurve data={equity} />
              <MarketDistribution trades={trades} currency={profile.currency} />
            </div>
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
              <PerformanceBars
                trades={trades}
                startCapital={capital}
                currency={profile.currency}
              />
              <RecentTrades trades={trades} />
            </div>
            <SnapshotRow snapshots={snapshots} currency={profile.currency} />
            <p className="pt-1 text-center text-[11px] tracking-[0.16em] text-muted-foreground/80 uppercase">
              {copy.dashboard.motto}
            </p>
          </>
        )}
      </div>
    </PageFrame>
  )
}
