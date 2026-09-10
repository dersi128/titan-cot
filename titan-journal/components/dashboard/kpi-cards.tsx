"use client"

import { ArcGauge, OutcomeDots, RingGauge, SplitBar } from "@/components/dashboard/stat-gauges"
import { MetricLabel } from "@/components/layout/metric-info"
import {
  formatNumber,
  formatSignedMoney,
  formatSignedR,
  formatSignedUsd,
  signedClassName,
} from "@/lib/format"
import type { DashboardStats } from "@/lib/trade-calculations"
import { useLabels } from "@/lib/use-labels"
import { cn } from "@/lib/utils"

function compactPercent(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return "—"
  return `${Math.round(value * 100)}%`
}

export function KpiCards({
  stats,
  currency,
}: {
  stats: DashboardStats
  currency?: string
}) {
  const { copy } = useLabels()
  const wr = stats.winRate
  const pf = stats.profitFactor
  const avg = stats.averageR
  const money = (value: number) =>
    currency ? formatSignedMoney(value, currency) : formatSignedUsd(value)

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4" data-guide="overview">
      <article className="titan-kpi titan-kpi--win flex items-center justify-between gap-3 overflow-visible rounded-[12px] px-4 py-3">
        <div className="min-w-0">
          <p className="text-[11px] font-medium tracking-wide text-muted-foreground">
            <MetricLabel
              label={copy.dashboard.winRate}
              why={copy.dashboard.winRateWhy}
            />
          </p>
          <p className="mt-1 font-mono text-[22px] font-semibold tabular-nums">
            {compactPercent(wr)}
          </p>
          <OutcomeDots wins={stats.wins} be={stats.be} losses={stats.losses} />
        </div>
        <ArcGauge progress={wr} wins={stats.wins} be={stats.be} losses={stats.losses} />
      </article>

      <article className="titan-kpi titan-kpi--pf flex items-center justify-between gap-3 rounded-[12px] px-4 py-3">
        <div className="min-w-0">
          <p className="text-[11px] font-medium tracking-wide text-muted-foreground">
            <MetricLabel
              label={copy.dashboard.profitFactor}
              why={copy.dashboard.profitFactorWhy}
            />
          </p>
          <p
            className={cn(
              "mt-1 font-mono text-[22px] font-semibold tabular-nums",
              signedClassName(pf == null ? null : pf - 1)
            )}
          >
            {formatNumber(pf)}
          </p>
        </div>
        <RingGauge
          progress={pf == null ? null : pf / 2}
          wins={stats.wins}
          be={stats.be}
          losses={stats.losses}
        />
      </article>

      <article className="titan-kpi titan-kpi--avg flex items-center justify-between gap-3 overflow-visible rounded-[12px] px-4 py-3">
        <div className="min-w-0">
          <p className="text-[11px] font-medium tracking-wide text-muted-foreground">
            <MetricLabel
              label={copy.dashboard.averageR}
              why={copy.dashboard.averageRWhy}
            />
          </p>
          <p
            className={cn(
              "mt-1 font-mono text-[22px] font-semibold tabular-nums",
              signedClassName(avg)
            )}
          >
            {formatSignedR(avg)}
          </p>
        </div>
        <ArcGauge
          progress={avg == null ? null : (avg + 2) / 4}
          wins={stats.wins}
          be={stats.be}
          losses={stats.losses}
        />
      </article>

      <article className="titan-kpi rounded-[12px] px-4 py-3">
        <p className="text-[11px] font-medium tracking-wide text-muted-foreground">
          {copy.dashboard.netPnl}
        </p>
        <p
          className={cn(
            "mt-1 font-mono text-[22px] font-semibold tabular-nums",
            signedClassName(stats.netPnl)
          )}
        >
          {money(stats.netPnl)}
        </p>
        <div className="mt-3">
          <SplitBar profit={stats.grossProfit} loss={stats.grossLoss} />
        </div>
        <div className="mt-2 flex items-center justify-between text-[11px] font-mono tabular-nums">
          <span className="text-bull">{money(stats.grossProfit)}</span>
          <span className="text-bear">{money(-stats.grossLoss)}</span>
        </div>
      </article>
    </div>
  )
}
