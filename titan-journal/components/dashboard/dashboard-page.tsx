"use client"

import dynamic from "next/dynamic"
import Link from "next/link"
import { PlusCircle } from "lucide-react"
import { useMemo } from "react"

import { KpiCards } from "@/components/dashboard/kpi-cards"
import { RecentTrades } from "@/components/dashboard/recent-trades"
import { SnapshotRow } from "@/components/dashboard/snapshot-row"
import { EmptyJournal } from "@/components/layout/empty-journal"
import { useGuide } from "@/components/layout/guide-provider"
import { KpiSkeleton, TableSkeleton } from "@/components/layout/loading-state"
import { PageFrame } from "@/components/layout/page-header"
import { useScopedTrades } from "@/components/layout/use-scoped-trades"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { dashboardSnapshots } from "@/lib/dashboard-snapshots"
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
  const { openGuide } = useGuide()
  const { trades, accountTrades, isReady, range, capital, stats, profile } =
    useScopedTrades()

  const equity = useMemo(
    () => buildEquityCurve(trades, capital),
    [trades, capital]
  )
  const snapshots = useMemo(
    () => dashboardSnapshots(accountTrades),
    [accountTrades]
  )

  return (
    <PageFrame>
      <div className="flex flex-col gap-3 pb-4">
        <header
          className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
          data-guide="overview-head"
        >
          <div className="min-w-0">
            <h1 className="text-[26px] font-semibold tracking-tight text-foreground">
              {copy.dashboard.hello.replace("{name}", profile.displayName)}
            </h1>
            <p className="mt-1 text-[13px] text-muted-foreground">
              {copy.dashboard.overview[range]}
            </p>
          </div>
          <div className="titan-action-bar">
            <Button type="button" variant="outline" onClick={openGuide}>
              {copy.guide.open}
            </Button>
            {accountTrades.length > 0 ? (
              <Button asChild>
                <Link href="/new-trade">
                  <PlusCircle />
                  {copy.nav.newTrade}
                </Link>
              </Button>
            ) : null}
          </div>
        </header>

        {!isReady ? (
          <div className="space-y-3">
            <KpiSkeleton />
            <TableSkeleton rows={6} />
          </div>
        ) : accountTrades.length === 0 ? (
          <EmptyJournal />
        ) : trades.length === 0 ? (
          <p className="titan-glass rounded-[10px] px-5 py-7 text-center text-[13px] text-muted-foreground">
            {copy.journal.empty}
          </p>
        ) : (
          <>
            <div data-guide="overview-stats">
              <KpiCards stats={stats} currency={profile.currency} />
            </div>
            <EquityCurve data={equity} />
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
              <PerformanceBars trades={trades} currency={profile.currency} />
              <MarketDistribution trades={trades} currency={profile.currency} />
            </div>
            <RecentTrades trades={trades} />
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
