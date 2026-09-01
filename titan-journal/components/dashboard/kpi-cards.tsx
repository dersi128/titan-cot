import { Card, CardContent } from "@/components/ui/card"
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
}: {
  label: string
  value: string
  className?: string
}) {
  return (
    <Card size="sm">
      <CardContent className="pt-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={cn("mt-2 font-mono text-lg tabular-nums", className)}>
          {value}
        </p>
      </CardContent>
    </Card>
  )
}

export function KpiCards({ stats }: { stats: DashboardStats }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <KpiCard
        label={copy.dashboard.netPnl}
        value={formatSignedUsd(stats.netPnl)}
        className={signedClassName(stats.netPnl)}
      />
      <KpiCard
        label={copy.dashboard.totalR}
        value={formatSignedR(stats.totalR)}
        className={signedClassName(stats.totalR)}
      />
      <KpiCard label={copy.dashboard.winRate} value={formatPercent(stats.winRate)} />
      <KpiCard
        label={copy.dashboard.profitFactor}
        value={formatNumber(stats.profitFactor)}
        className={signedClassName(
          stats.profitFactor == null ? null : stats.profitFactor - 1
        )}
      />
      <KpiCard
        label={copy.dashboard.averageR}
        value={formatSignedR(stats.averageR)}
        className={signedClassName(stats.averageR)}
      />
      <KpiCard label={copy.dashboard.totalTrades} value={String(stats.totalTrades)} />
    </div>
  )
}
