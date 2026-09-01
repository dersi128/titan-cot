import { Card, CardContent } from "@/components/ui/card"
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
        label="Net PnL"
        value={formatSignedUsd(stats.netPnl)}
        className={signedClassName(stats.netPnl)}
      />
      <KpiCard
        label="Total R"
        value={formatSignedR(stats.totalR)}
        className={signedClassName(stats.totalR)}
      />
      <KpiCard label="Win Rate" value={formatPercent(stats.winRate)} />
      <KpiCard
        label="Profit Factor"
        value={formatNumber(stats.profitFactor)}
        className={signedClassName(
          stats.profitFactor == null ? null : stats.profitFactor - 1
        )}
      />
      <KpiCard
        label="Average R"
        value={formatSignedR(stats.averageR)}
        className={signedClassName(stats.averageR)}
      />
      <KpiCard label="Total Trades" value={String(stats.totalTrades)} />
    </div>
  )
}
