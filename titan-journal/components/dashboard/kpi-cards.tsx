"use client"

import { ArcGauge, OutcomeDots, SplitBar } from "@/components/dashboard/stat-gauges"
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

const titleClass =
  "text-[11px] font-medium tracking-wide text-muted-foreground"
const valueClass = "mt-1 font-mono text-[22px] font-semibold tabular-nums"
const captionClass = "mt-2 text-[11px] leading-snug text-muted-foreground"

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
      <article className="titan-kpi titan-kpi--win overflow-visible rounded-[12px] px-4 py-3">
        <p className={titleClass}>
          <MetricLabel
            label={copy.dashboard.winRate}
            why={copy.dashboard.winRateWhy}
          />
        </p>
        <p className={valueClass}>{compactPercent(wr)}</p>
        <div className="mt-2 flex items-end justify-between gap-3">
          <OutcomeDots wins={stats.wins} be={stats.be} losses={stats.losses} />
          <ArcGauge progress={wr} wins={stats.wins} be={stats.be} losses={stats.losses} />
        </div>
      </article>

      <article className="titan-kpi titan-kpi--pf rounded-[12px] px-4 py-3">
        <p className={titleClass}>
          <MetricLabel
            label={copy.dashboard.profitFactor}
            why={copy.dashboard.profitFactorWhy}
          />
        </p>
        <p
          className={cn(
            valueClass,
            signedClassName(pf == null ? null : pf - 1)
          )}
        >
          {formatNumber(pf)}
        </p>
        <p className={captionClass}>{copy.dashboard.profitFactorCaption}</p>
      </article>

      <article className="titan-kpi titan-kpi--avg rounded-[12px] px-4 py-3">
        <p className={titleClass}>
          <MetricLabel
            label={copy.dashboard.averageR}
            why={copy.dashboard.averageRWhy}
          />
        </p>
        <p className={cn(valueClass, signedClassName(avg))}>
          {formatSignedR(avg)}
        </p>
        <p className={captionClass}>{copy.dashboard.averageRCaption}</p>
      </article>

      <article className="titan-kpi rounded-[12px] px-4 py-3">
        <p className={titleClass}>{copy.dashboard.netPnl}</p>
        <p className={cn(valueClass, signedClassName(stats.netPnl))}>
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
