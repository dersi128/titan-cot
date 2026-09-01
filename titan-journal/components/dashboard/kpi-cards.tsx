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
}: {
  label: string
  value: string
  className?: string
}) {
  return (
    <article className="titan-kpi rounded-[10px] px-5 py-4">
      <p className="text-[11px] font-medium tracking-wide text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "mt-2 font-mono text-[28px] font-medium tracking-tight tabular-nums",
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
}: {
  label: string
  value: string
  className?: string
}) {
  return (
    <article className="titan-kpi rounded-[10px] px-4 py-3">
      <p className="text-[11px] font-medium tracking-wide text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "mt-1.5 font-mono text-[18px] font-medium tabular-nums text-foreground",
          className
        )}
      >
        {value}
      </p>
    </article>
  )
}

export function KpiCards({ stats }: { stats: DashboardStats }) {
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
