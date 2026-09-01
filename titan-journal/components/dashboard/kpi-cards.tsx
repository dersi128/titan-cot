import { copy } from "@/lib/labels"
import {
  formatNumber,
  formatPercent,
  formatSignedR,
  formatSignedUsd,
  signedClassName,
} from "@/lib/format"
import type { DashboardStats } from "@/lib/trade-calculations"
import { cn } from "@/lib/utils"

function KpiCard({
  label,
  value,
  className,
  delayMs = 0,
}: {
  label: string
  value: string
  className?: string
  delayMs?: number
}) {
  return (
    <article
      className="titan-kpi animate-fade-up rounded-xl p-4"
      style={{ animationDelay: `${delayMs}ms` }}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">
        {label}
      </p>
      <p className={cn("mt-2 font-mono text-xl font-medium tabular-nums text-stone-50", className)}>
        {value}
      </p>
    </article>
  )
}

export function KpiCards({ stats }: { stats: DashboardStats }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <KpiCard
        label={copy.dashboard.netPnl}
        value={formatSignedUsd(stats.netPnl)}
        className={signedClassName(stats.netPnl)}
        delayMs={0}
      />
      <KpiCard
        label={copy.dashboard.totalR}
        value={formatSignedR(stats.totalR)}
        className={signedClassName(stats.totalR)}
        delayMs={40}
      />
      <KpiCard
        label={copy.dashboard.winRate}
        value={formatPercent(stats.winRate)}
        delayMs={80}
      />
      <KpiCard
        label={copy.dashboard.profitFactor}
        value={formatNumber(stats.profitFactor)}
        className={signedClassName(
          stats.profitFactor == null ? null : stats.profitFactor - 1
        )}
        delayMs={120}
      />
      <KpiCard
        label={copy.dashboard.averageR}
        value={formatSignedR(stats.averageR)}
        className={signedClassName(stats.averageR)}
        delayMs={160}
      />
      <KpiCard
        label={copy.dashboard.totalTrades}
        value={String(stats.totalTrades)}
        delayMs={200}
      />
    </div>
  )
}
