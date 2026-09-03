"use client"

import {
  formatNumber,
  formatSignedPercentPoints,
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

function Metric({
  label,
  value,
  className,
  dense = false,
}: {
  label: string
  value: string
  className?: string
  dense?: boolean
}) {
  return (
    <article
      className={cn("titan-kpi rounded-[10px]", dense ? "px-3 py-2.5" : "px-4 py-3")}
    >
      <p className="text-[11px] font-medium tracking-wide text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "font-mono font-medium tracking-tight tabular-nums",
          dense ? "mt-1 text-[18px]" : "mt-1.5 text-[18px]",
          className
        )}
      >
        {value}
      </p>
    </article>
  )
}

export function KpiCards({
  stats,
  dense = false,
  drawdown,
}: {
  stats: DashboardStats
  dense?: boolean
  drawdown?: number | null
}) {
  const { copy } = useLabels()
  const sixth =
    drawdown !== undefined ? (
      <Metric
        label={copy.dashboard.maxDrawdown}
        value={drawdown == null ? "—" : formatSignedPercentPoints(drawdown * 100)}
        className={signedClassName(drawdown)}
        dense={dense}
      />
    ) : (
      <Metric
        label={copy.dashboard.totalTrades}
        value={String(stats.totalTrades)}
        dense={dense}
      />
    )

  if (dense) {
    return (
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        <Metric
          label={copy.dashboard.netPnl}
          value={formatSignedUsd(stats.netPnl)}
          className={signedClassName(stats.netPnl)}
          dense
        />
        <Metric
          label={copy.dashboard.totalR}
          value={formatSignedR(stats.totalR)}
          className={signedClassName(stats.totalR)}
          dense
        />
        <Metric label={copy.dashboard.winRate} value={compactPercent(stats.winRate)} dense />
        <Metric
          label={copy.dashboard.profitFactor}
          value={formatNumber(stats.profitFactor)}
          className={signedClassName(
            stats.profitFactor == null ? null : stats.profitFactor - 1
          )}
          dense
        />
        <Metric
          label={copy.dashboard.averageR}
          value={formatSignedR(stats.averageR)}
          className={signedClassName(stats.averageR)}
          dense
        />
        {sixth}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Metric
          label={copy.dashboard.netPnl}
          value={formatSignedUsd(stats.netPnl)}
          className={signedClassName(stats.netPnl)}
        />
        <Metric
          label={copy.dashboard.totalR}
          value={formatSignedR(stats.totalR)}
          className={signedClassName(stats.totalR)}
        />
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Metric label={copy.dashboard.winRate} value={compactPercent(stats.winRate)} />
        <Metric
          label={copy.dashboard.profitFactor}
          value={formatNumber(stats.profitFactor)}
          className={signedClassName(
            stats.profitFactor == null ? null : stats.profitFactor - 1
          )}
        />
        <Metric
          label={copy.dashboard.averageR}
          value={formatSignedR(stats.averageR)}
          className={signedClassName(stats.averageR)}
        />
        <Metric label={copy.dashboard.totalTrades} value={String(stats.totalTrades)} />
      </div>
    </div>
  )
}
