"use client"

import { useMemo } from "react"

import { KpiCards } from "@/components/dashboard/kpi-cards"
import { PageFrame, PageHeader } from "@/components/layout/page-header"
import { useScopedTrades } from "@/components/layout/use-scoped-trades"
import {
  bestAndWorstPlaybook,
  statsByDirection,
  statsByPlaybook,
  statsBySymbol,
  type GroupStats,
} from "@/lib/analytics"
import { formatPercent, formatSignedR, formatSignedUsd, signedClassName } from "@/lib/format"
import { useLabels } from "@/lib/use-labels"

function GroupTable({ title, rows }: { title: string; rows: GroupStats[] }) {
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
              <p className="text-sm">{row.key}</p>
              <p className="font-mono text-[12px] text-muted-foreground">
                <span className={signedClassName(row.totalR)}>
                  {formatSignedR(row.totalR)}
                </span>
                {" · "}
                {formatSignedUsd(row.netPnl)}
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
}: {
  label: string
  row: GroupStats | null
}) {
  return (
    <article className="titan-kpi rounded-[10px] px-4 py-3">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium">{row?.key ?? "—"}</p>
      <p className={`mt-1 font-mono text-[12px] ${signedClassName(row?.totalR)}`}>
        {formatSignedR(row?.averageR ?? null)} · {formatPercent(row?.winRate)}
      </p>
    </article>
  )
}

export function AnalyticsPage() {
  const { copy } = useLabels()
  const { trades, stats } = useScopedTrades()
  const playbooks = useMemo(() => statsByPlaybook(trades), [trades])
  const directions = useMemo(() => statsByDirection(trades), [trades])
  const symbols = useMemo(() => statsBySymbol(trades).slice(0, 8), [trades])
  const { best, worst } = useMemo(() => bestAndWorstPlaybook(trades), [trades])

  return (
    <PageFrame>
      <PageHeader
        title={copy.analytics.title}
        description={copy.analytics.description}
      />
      <div className="space-y-4">
        <KpiCards stats={stats} />
        <div className="grid gap-3 sm:grid-cols-2">
          <Highlight
            label={copy.analytics.best}
            row={best}
          />
          <Highlight label={copy.analytics.worst} row={worst} />
        </div>
        <GroupTable title={copy.analytics.byPlaybook} rows={playbooks} />
        <GroupTable title={copy.analytics.byDirection} rows={directions} />
        <GroupTable title={copy.analytics.bySymbol} rows={symbols} />
      </div>
    </PageFrame>
  )
}
