"use client"

import { useMemo } from "react"

import { EdgeBadge, edgeHint } from "@/components/analytics/edge-badge"
import { KpiCards } from "@/components/dashboard/kpi-cards"
import { PageFrame, PageHeader } from "@/components/layout/page-header"
import { useScopedTrades } from "@/components/layout/use-scoped-trades"
import { useWorkspace } from "@/components/layout/workspace-provider"
import {
  accountEdge,
  bestAndWorstPlaybook,
  statsByDirection,
  statsByPlaybook,
  statsBySymbol,
  type GroupStats,
} from "@/lib/analytics"
import {
  formatNumber,
  formatPercent,
  formatSignedR,
  signedClassName,
} from "@/lib/format"
import { useLabels } from "@/lib/use-labels"
import { cn } from "@/lib/utils"

function GroupTable({
  title,
  rows,
  names,
  showEdge = false,
}: {
  title: string
  rows: GroupStats[]
  names?: Record<string, string>
  showEdge?: boolean
}) {
  const { copy } = useLabels()
  return (
    <section className="titan-glass rounded-[10px] p-4">
      <h2 className="text-sm font-semibold">{title}</h2>
      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">{copy.analytics.empty}</p>
      ) : (
        <div className="mt-3 space-y-2">
          {rows.map((row) => (
            <div
              key={row.key}
              className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border py-2 last:border-0"
            >
              <div className="min-w-0">
                <p className="text-sm">{names?.[row.key] ?? row.key}</p>
                {showEdge ? (
                  <p className="mt-0.5 text-[11px]">
                    <EdgeBadge edge={row.edge} />
                  </p>
                ) : null}
              </div>
              <p className="font-mono text-[12px] text-muted-foreground">
                <span className={signedClassName(row.averageR)}>
                  {formatSignedR(row.averageR)}
                </span>
                {" · "}
                {copy.analytics.expectancy}
                {" · "}
                <span className={signedClassName(row.totalR)}>
                  {formatSignedR(row.totalR)}
                </span>
                {" · "}
                {formatPercent(row.winRate)}
                {" · "}
                {row.trades} {copy.analytics.trades}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

function Highlight({
  label,
  row,
  names,
}: {
  label: string
  row: GroupStats | null
  names?: Record<string, string>
}) {
  return (
    <article className="titan-kpi rounded-[10px] px-4 py-3">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium">
        {row ? (names?.[row.key] ?? row.key) : "—"}
      </p>
      <p className={`mt-1 font-mono text-[12px] ${signedClassName(row?.averageR)}`}>
        {formatSignedR(row?.averageR ?? null)}
        {row ? (
          <>
            {" · "}
            <EdgeBadge edge={row.edge} />
          </>
        ) : null}
      </p>
    </article>
  )
}

function Stat({
  label,
  value,
  className,
}: {
  label: string
  value: string
  className?: string
}) {
  return (
    <div>
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className={cn("mt-0.5 font-mono text-[15px] tabular-nums", className)}>
        {value}
      </p>
    </div>
  )
}

function EdgeCard({ stats }: { stats: GroupStats }) {
  const { copy } = useLabels()
  if (stats.trades === 0) {
    return (
      <section className="titan-glass rounded-[10px] p-4">
        <h2 className="text-sm font-semibold">{copy.analytics.edge}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{copy.analytics.empty}</p>
      </section>
    )
  }

  return (
    <section className="titan-glass rounded-[10px] p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] text-muted-foreground">{copy.analytics.edge}</p>
        <EdgeBadge edge={stats.edge} className="text-[11px]" />
      </div>
      <p
        className={cn(
          "mt-2 font-mono text-[28px] font-semibold tracking-tight tabular-nums",
          signedClassName(stats.averageR)
        )}
      >
        {formatSignedR(stats.averageR)}
      </p>
      <p className="mt-0.5 text-[13px] text-muted-foreground">
        {copy.analytics.expectancy}
        {" · "}
        {copy.analytics.perTrade}
      </p>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat
          label={copy.analytics.profitFactor}
          value={formatNumber(stats.profitFactor)}
        />
        <Stat
          label={copy.dashboard.winRate}
          value={formatPercent(stats.winRate)}
        />
        <Stat
          label={copy.analytics.trades}
          value={String(stats.trades)}
        />
        <Stat
          label={copy.dashboard.maxDrawdown}
          value={formatSignedR(stats.maxDrawdownR)}
          className={signedClassName(stats.maxDrawdownR)}
        />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <Stat
          label={copy.analytics.avgWin}
          value={formatSignedR(stats.avgWinR)}
          className="text-bull"
        />
        <Stat
          label={copy.analytics.avgLoss}
          value={formatSignedR(stats.avgLossR)}
          className="text-bear"
        />
      </div>
      <p className="mt-3 text-[11px] text-muted-foreground">{edgeHint(copy)}</p>
    </section>
  )
}

export function AnalyticsPage() {
  const { copy } = useLabels()
  const { playbooks } = useWorkspace()
  const { trades, stats } = useScopedTrades()
  const edge = useMemo(() => accountEdge(trades), [trades])
  const playbookRows = useMemo(() => statsByPlaybook(trades), [trades])
  const directions = useMemo(() => statsByDirection(trades), [trades])
  const symbols = useMemo(() => statsBySymbol(trades).slice(0, 8), [trades])
  const { best, worst } = useMemo(() => bestAndWorstPlaybook(trades), [trades])
  const playbookNames = useMemo(
    () => Object.fromEntries(playbooks.map((item) => [item.id, item.name])),
    [playbooks]
  )

  return (
    <PageFrame>
      <PageHeader
        title={copy.analytics.title}
        description={copy.analytics.description}
      />
      <div className="space-y-4">
        <EdgeCard stats={edge} />
        <KpiCards stats={stats} />
        <div className="grid gap-3 sm:grid-cols-2">
          <Highlight
            label={copy.analytics.best}
            row={best}
            names={playbookNames}
          />
          <Highlight
            label={copy.analytics.worst}
            row={worst}
            names={playbookNames}
          />
        </div>
        <GroupTable
          title={copy.analytics.byPlaybook}
          rows={playbookRows}
          names={playbookNames}
          showEdge
        />
        <GroupTable title={copy.analytics.byDirection} rows={directions} />
        <GroupTable title={copy.analytics.bySymbol} rows={symbols} />
      </div>
    </PageFrame>
  )
}
