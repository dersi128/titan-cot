import { copy } from "@/lib/labels"
import {
  formatNumber,
  formatSignedR,
  formatSignedUsd,
  signedClassName,
} from "@/lib/format"
import type { DashboardStats } from "@/lib/trade-calculations"
import { cn } from "@/lib/utils"

function compactPercent(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return "—"
  return `${Math.round(value * 100)}%`
}

function PrimaryMetric({
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
      className={cn(
        "titan-kpi rounded-[10px]",
        dense ? "px-3 py-2" : "px-5 py-4"
      )}
    >
      <p className="text-[11px] font-medium tracking-wide text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "font-mono font-medium tracking-tight tabular-nums",
          dense ? "mt-1 text-[18px]" : "mt-2 text-[28px]",
          className
        )}
      >
        {value}
      </p>
    </article>
  )
}

function SecondaryMetric({
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
      className={cn(
        "titan-kpi rounded-[10px]",
        dense ? "px-3 py-2" : "px-4 py-3"
      )}
    >
      <p className="text-[11px] font-medium tracking-wide text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "font-mono font-medium tabular-nums text-foreground",
          dense ? "mt-0.5 text-[16px]" : "mt-1.5 text-[18px]",
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
}: {
  stats: DashboardStats
  dense?: boolean
}) {
  if (dense) {
    return (
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        <PrimaryMetric
          label={copy.dashboard.netPnl}
          value={formatSignedUsd(stats.netPnl)}
          className={signedClassName(stats.netPnl)}
          dense
        />
        <PrimaryMetric
          label={copy.dashboard.totalR}
          value={formatSignedR(stats.totalR)}
          className={signedClassName(stats.totalR)}
          dense
        />
        <SecondaryMetric
          label={copy.dashboard.winRate}
          value={compactPercent(stats.winRate)}
          dense
        />
        <SecondaryMetric
          label={copy.dashboard.profitFactor}
          value={formatNumber(stats.profitFactor)}
          className={signedClassName(
            stats.profitFactor == null ? null : stats.profitFactor - 1
          )}
          dense
        />
        <SecondaryMetric
          label={copy.dashboard.averageR}
          value={formatSignedR(stats.averageR)}
          className={signedClassName(stats.averageR)}
          dense
        />
        <SecondaryMetric
          label={copy.dashboard.totalTrades}
          value={String(stats.totalTrades)}
          dense
        />
      </div>
    )
  }
  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <PrimaryMetric
          label={copy.dashboard.netPnl}
          value={formatSignedUsd(stats.netPnl)}
          className={signedClassName(stats.netPnl)}
        />
        <PrimaryMetric
          label={copy.dashboard.totalR}
          value={formatSignedR(stats.totalR)}
          className={signedClassName(stats.totalR)}
        />
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SecondaryMetric
          label={copy.dashboard.winRate}
          value={compactPercent(stats.winRate)}
        />
        <SecondaryMetric
          label={copy.dashboard.profitFactor}
          value={formatNumber(stats.profitFactor)}
          className={signedClassName(
            stats.profitFactor == null ? null : stats.profitFactor - 1
          )}
        />
        <SecondaryMetric
          label={copy.dashboard.averageR}
          value={formatSignedR(stats.averageR)}
          className={signedClassName(stats.averageR)}
        />
        <SecondaryMetric
          label={copy.dashboard.totalTrades}
          value={String(stats.totalTrades)}
        />
      </div>
    </div>
  )
}
