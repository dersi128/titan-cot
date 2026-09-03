"use client"

import {
  formatNumber,
  formatSignedMoney,
  formatSignedPercentPoints,
  formatSignedR,
  signedClassName,
} from "@/lib/format"
import type { DashboardSnapshots } from "@/lib/dashboard-snapshots"
import type { DashboardStats } from "@/lib/trade-calculations"
import { useLabels } from "@/lib/use-labels"
import { cn } from "@/lib/utils"

function compactPercent(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return "—"
  return `${Math.round(value * 100)}%`
}

function SideMetric({
  label,
  value,
  className,
  split = false,
}: {
  label: string
  value: string
  className?: string
  split?: boolean
}) {
  return (
    <div className={cn("min-w-0 px-4 py-3", split && "border-r border-border")}>
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
    </div>
  )
}

export function KpiCards({
  stats,
  drawdown,
  snapshots,
  currency,
}: {
  stats: DashboardStats
  drawdown?: number | null
  snapshots?: Pick<DashboardSnapshots, "winShare" | "lossShare" | "wins" | "losses">
  currency: string
}) {
  const { copy } = useLabels()
  const decided = snapshots ? snapshots.wins + snapshots.losses : 0
  const winPct = snapshots ? Math.round(snapshots.winShare * 100) : 0
  const lossPct = snapshots ? Math.round(snapshots.lossShare * 100) : 0

  return (
    <section className="titan-glass relative overflow-hidden rounded-[10px]">
      <span
        aria-hidden
        className={cn(
          "absolute inset-y-0 left-0 w-[3px]",
          stats.netPnl > 0 ? "bg-bull" : stats.netPnl < 0 ? "bg-bear" : "bg-border"
        )}
      />
      <div className="grid lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <div className="px-5 py-5 sm:px-6">
          <p className="text-[11px] font-medium tracking-wide text-muted-foreground">
            {copy.dashboard.netPnl}
          </p>
          <p
            className={cn(
              "mt-1 font-mono text-[34px] leading-none font-semibold tracking-tight tabular-nums sm:text-[40px]",
              signedClassName(stats.netPnl)
            )}
          >
            {formatSignedMoney(stats.netPnl, currency)}
          </p>
          <p className="mt-2 text-[13px] text-muted-foreground">
            <span className={cn("font-mono tabular-nums", signedClassName(stats.totalR))}>
              {formatSignedR(stats.totalR)}
            </span>
            <span className="mx-1.5 text-border">·</span>
            {stats.totalTrades} {copy.dashboard.totalTrades.toLowerCase()}
          </p>
          {snapshots && decided > 0 ? (
            <div className="mt-4 max-w-sm">
              <div className="flex h-1.5 overflow-hidden rounded-full bg-muted">
                <span className="h-full bg-bull" style={{ width: `${winPct}%` }} />
                <span className="h-full bg-bear" style={{ width: `${lossPct}%` }} />
              </div>
              <p className="mt-1.5 text-[11px] text-muted-foreground">
                <span className="text-bull">{winPct}%</span> {copy.dashboard.wins}
                <span className="mx-1.5 text-border">·</span>
                <span className="text-bear">{lossPct}%</span> {copy.dashboard.losses}
              </p>
            </div>
          ) : null}
        </div>

        <div className="grid grid-cols-2 border-t border-border lg:border-t-0 lg:border-l">
          <SideMetric
            label={copy.dashboard.winRate}
            value={compactPercent(stats.winRate)}
            split
          />
          <SideMetric
            label={copy.dashboard.profitFactor}
            value={formatNumber(stats.profitFactor)}
            className={signedClassName(
              stats.profitFactor == null ? null : stats.profitFactor - 1
            )}
          />
          <div className="col-span-2 grid grid-cols-2 border-t border-border">
            <SideMetric
              label={copy.dashboard.averageR}
              value={formatSignedR(stats.averageR)}
              className={signedClassName(stats.averageR)}
              split
            />
            <SideMetric
              label={copy.dashboard.maxDrawdown}
              value={
                drawdown == null ? "—" : formatSignedPercentPoints(drawdown * 100)
              }
              className={signedClassName(drawdown)}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
