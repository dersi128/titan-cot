"use client"

import { ArcGauge, OutcomeDots, RingGauge, SplitBar } from "@/components/dashboard/stat-gauges"
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
    <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
      <article className="titan-kpi flex items-center justify-between gap-3 overflow-visible rounded-[10px] px-3 py-2.5">
        <div className="min-w-0">
          <p className="text-[11px] font-medium tracking-wide text-muted-foreground">
            {copy.dashboard.winRate}
          </p>
          <p className="mt-1 font-mono text-[20px] font-medium tabular-nums">
            {compactPercent(wr)}
          </p>
          <OutcomeDots wins={stats.wins} be={stats.be} losses={stats.losses} />
        </div>
        <ArcGauge progress={wr} />
      </article>

      <article className="titan-kpi flex items-center justify-between gap-3 rounded-[10px] px-3 py-2.5">
        <div className="min-w-0">
          <p className="text-[11px] font-medium tracking-wide text-muted-foreground">
            {copy.dashboard.profitFactor}
          </p>
          <p
            className={cn(
              "mt-1 font-mono text-[20px] font-medium tabular-nums",
              signedClassName(pf == null ? null : pf - 1)
            )}
          >
            {formatNumber(pf)}
          </p>
          <OutcomeDots wins={stats.wins} be={stats.be} losses={stats.losses} />
        </div>
        <RingGauge progress={pf == null ? null : pf / 2} />
      </article>

      <article className="titan-kpi flex items-center justify-between gap-3 overflow-visible rounded-[10px] px-3 py-2.5">
        <div className="min-w-0">
          <p className="text-[11px] font-medium tracking-wide text-muted-foreground">
            {copy.dashboard.averageR}
          </p>
          <p
            className={cn(
              "mt-1 font-mono text-[20px] font-medium tabular-nums",
              signedClassName(avg)
            )}
          >
            {formatSignedR(avg)}
          </p>
          <OutcomeDots wins={stats.wins} be={stats.be} losses={stats.losses} />
        </div>
        <ArcGauge progress={avg == null ? null : (avg + 2) / 4} />
      </article>

      <article className="titan-kpi rounded-[10px] px-3 py-2.5">
        <p className="text-[11px] font-medium tracking-wide text-muted-foreground">
          {copy.dashboard.netPnl}
        </p>
        <p
          className={cn(
            "mt-1 font-mono text-[20px] font-medium tabular-nums",
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
