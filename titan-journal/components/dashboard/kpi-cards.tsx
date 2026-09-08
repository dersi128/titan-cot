"use client"

import { ArcGauge, OutcomeDots, RingGauge, SplitBar } from "@/components/dashboard/stat-gauges"
import {
  formatNumber,
  formatSignedMoney,
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
}: {
  label: string
  value: string
  className?: string
}) {
  return (
    <article className="titan-kpi rounded-[10px] px-3 py-2.5">
      <p className="text-[11px] font-medium tracking-wide text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 font-mono text-[18px] font-medium tracking-tight tabular-nums",
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
  currency,
}: {
  stats: DashboardStats
  dense?: boolean
  drawdown?: number | null
  currency?: string
}) {
  const { copy } = useLabels()
  const wr = stats.winRate
  const pf = stats.profitFactor
  const avg = stats.averageR
  const money = (value: number) =>
    currency ? formatSignedMoney(value, currency) : formatSignedUsd(value)

  return (
    <div className="space-y-2">
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        <article className="titan-kpi flex items-center justify-between gap-3 rounded-[10px] px-3 py-2.5">
          <div className="min-w-0">
            <p className="text-[11px] font-medium tracking-wide text-muted-foreground">
              {copy.dashboard.winRate}
            </p>
            <p className="mt-1 font-mono text-[20px] font-medium tabular-nums">
              {compactPercent(wr)}
            </p>
            <OutcomeDots wins={stats.wins} be={stats.be} losses={stats.losses} />
          </div>
          <ArcGauge
            progress={wr}
            color={wr != null && wr >= 0.5 ? "var(--bull)" : "var(--bear)"}
            caption={compactPercent(wr)}
          />
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
          <RingGauge
            progress={pf == null ? null : pf / 2}
            color={pf != null && pf >= 1 ? "var(--bull)" : "var(--bear)"}
            caption={formatNumber(pf)}
          />
        </article>

        <article className="titan-kpi flex items-center justify-between gap-3 rounded-[10px] px-3 py-2.5">
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
          <ArcGauge
            progress={avg == null ? null : (avg + 2) / 4}
            color={avg != null && avg >= 0 ? "var(--bull)" : "var(--bear)"}
            caption={formatSignedR(avg)}
          />
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

      <div className={cn("grid gap-2", dense ? "grid-cols-3" : "grid-cols-2 sm:grid-cols-3")}>
        <Metric
          label={copy.dashboard.totalR}
          value={formatSignedR(stats.totalR)}
          className={signedClassName(stats.totalR)}
        />
        <Metric
          label={copy.dashboard.totalTrades}
          value={String(stats.closedTrades)}
        />
        {drawdown !== undefined ? (
          <Metric
            label={copy.dashboard.maxDrawdown}
            value={drawdown == null ? "—" : formatSignedPercentPoints(drawdown * 100)}
            className={signedClassName(drawdown)}
          />
        ) : (
          <Metric
            label={copy.dashboard.totalTrades}
            value={String(stats.totalTrades)}
          />
        )}
      </div>
    </div>
  )
}
