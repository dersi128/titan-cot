"use client"

import { useMemo, useState } from "react"
import Link from "next/link"

import { EdgeBadge } from "@/components/analytics/edge-badge"
import { PageFrame, PageHeader } from "@/components/layout/page-header"
import { useScopedTrades } from "@/components/layout/use-scoped-trades"
import { useWorkspace } from "@/components/layout/workspace-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  accountEdge,
  statsByDirection,
  statsByPlaybook,
  statsBySymbol,
} from "@/lib/analytics"
import {
  formatNumber,
  formatPercent,
  formatSignedR,
  signedClassName,
} from "@/lib/format"
import { useLabels } from "@/lib/use-labels"
import { cn } from "@/lib/utils"
import type { Playbook } from "@/types/playbook"
import type { Trade } from "@/types/trade"

function playbookTrades(trades: Trade[], playbook: Playbook) {
  return trades.filter(
    (trade) => trade.playbookId === playbook.id || trade.strategy === playbook.name
  )
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
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className={cn("mt-1 font-mono text-[15px] font-medium tabular-nums", className)}>
        {value}
      </p>
    </article>
  )
}

export function PlaybookListPage() {
  const { copy } = useLabels()
  const { playbooks, savePlaybook } = useWorkspace()
  const { accountTrades } = useScopedTrades()
  const [query, setQuery] = useState("")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const edgeByPlaybook = Object.fromEntries(
    statsByPlaybook(accountTrades).map((row) => [row.key, row])
  )
  const visible = playbooks.filter((playbook) =>
    playbook.name.toLowerCase().includes(query.trim().toLowerCase())
  )
  const selected =
    visible.find((playbook) => playbook.id === selectedId) ?? visible[0] ?? null
  const selectedTrades = selected ? playbookTrades(accountTrades, selected) : []
  const selectedStats = useMemo(
    () => accountEdge(selectedTrades),
    [selectedTrades]
  )
  const directions = useMemo(
    () => statsByDirection(selectedTrades),
    [selectedTrades]
  )
  const markets = useMemo(
    () => statsBySymbol(selectedTrades).slice(0, 6),
    [selectedTrades]
  )
  const marketMax = Math.max(1, ...markets.map((row) => row.trades))

  return (
    <PageFrame>
      <PageHeader
        title={copy.playbook.title}
        description={copy.playbook.description}
        actions={
          <Button asChild>
            <Link href="/playbook/new">{copy.playbook.new}</Link>
          </Button>
        }
      />

      {playbooks.length === 0 ? (
        <p className="text-sm text-muted-foreground">{copy.playbook.empty}</p>
      ) : (
        <>
          <div className="mb-4">
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={copy.playbook.search}
            />
          </div>
          <div className="grid gap-4 lg:grid-cols-[minmax(240px,0.9fr)_minmax(0,1.4fr)]">
            <div className="space-y-2">
              <p className="text-[11px] text-muted-foreground">
                {copy.playbook.all} · {visible.length}
              </p>
              {visible.map((playbook) => {
                const edge =
                  edgeByPlaybook[playbook.id] ?? edgeByPlaybook[playbook.name]
                const active = selected?.id === playbook.id
                return (
                  <button
                    key={playbook.id}
                    type="button"
                    onClick={() => setSelectedId(playbook.id)}
                    className={cn(
                      "w-full rounded-[10px] border p-3 text-left transition-colors",
                      active
                        ? "border-primary/50 bg-primary/10"
                        : "titan-glass border-transparent"
                    )}
                    style={
                      playbook.color
                        ? { borderLeft: `3px solid ${playbook.color}` }
                        : undefined
                    }
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold">{playbook.name}</p>
                      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                        {playbook.status === "archived"
                          ? copy.playbook.archived
                          : copy.playbook.active}
                      </span>
                    </div>
                    {edge ? (
                      <p className="mt-2 font-mono text-[11px] text-muted-foreground">
                        {formatPercent(edge.winRate)}
                        {" · "}
                        <span className={signedClassName(edge.averageR)}>
                          {formatSignedR(edge.averageR)}
                        </span>
                        {" · PF "}
                        {formatNumber(edge.profitFactor)}
                        {" · "}
                        {edge.trades} {copy.analytics.trades}
                      </p>
                    ) : (
                      <p className="mt-2 text-[11px] text-muted-foreground">
                        {playbook.fields.length} {copy.playbook.fieldCount}
                      </p>
                    )}
                  </button>
                )
              })}
            </div>

            {selected ? (
              <section className="titan-glass space-y-4 rounded-[10px] p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-semibold">{selected.name}</h2>
                      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                        {selected.status === "archived"
                          ? copy.playbook.archived
                          : copy.playbook.active}
                      </span>
                    </div>
                    {selected.description ? (
                      <p className="mt-1 text-[13px] text-muted-foreground">
                        {selected.description}
                      </p>
                    ) : null}
                    {selectedStats.trades > 0 ? (
                      <p className="mt-1 text-[12px]">
                        <EdgeBadge edge={selectedStats.edge} />
                      </p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/playbook/${selected.id}`}>{copy.playbook.edit}</Link>
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      type="button"
                      onClick={() =>
                        savePlaybook({
                          ...selected,
                          status:
                            selected.status === "archived" ? "active" : "archived",
                        })
                      }
                    >
                      {selected.status === "archived"
                        ? copy.playbook.restore
                        : copy.playbook.archive}
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <Metric
                    label={copy.analytics.tradeCount}
                    value={String(selectedStats.trades)}
                  />
                  <Metric
                    label={copy.dashboard.winRate}
                    value={formatPercent(selectedStats.winRate)}
                  />
                  <Metric
                    label={copy.analytics.expectancy}
                    value={formatSignedR(selectedStats.averageR)}
                    className={signedClassName(selectedStats.averageR)}
                  />
                  <Metric
                    label={copy.dashboard.profitFactor}
                    value={formatNumber(selectedStats.profitFactor)}
                  />
                </div>

                {selected.fields.length > 0 ? (
                  <div>
                    <p className="text-sm font-medium">{copy.playbook.fields}</p>
                    <ul className="mt-2 grid gap-1 text-[13px] sm:grid-cols-2">
                      {selected.fields.map((field) => (
                        <li key={field.id} className="text-muted-foreground">
                          <span className="text-foreground">{field.name}</span>
                          {field.options.length > 0
                            ? ` · ${field.options.join(", ")}`
                            : ""}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {directions.length > 0 ? (
                  <div>
                    <p className="text-sm font-medium">{copy.analytics.byDirection}</p>
                    <div className="mt-2 space-y-1.5 text-[13px]">
                      {directions.map((row) => (
                        <p key={row.key} className="flex justify-between gap-3">
                          <span>{row.key}</span>
                          <span className="font-mono text-muted-foreground">
                            {row.trades} · {formatPercent(row.winRate)} ·{" "}
                            <span className={signedClassName(row.averageR)}>
                              {formatSignedR(row.averageR)}
                            </span>
                          </span>
                        </p>
                      ))}
                    </div>
                  </div>
                ) : null}

                {markets.length > 0 ? (
                  <div>
                    <p className="text-sm font-medium">{copy.playbook.topMarkets}</p>
                    <ul className="mt-2 space-y-2">
                      {markets.map((row) => (
                        <li key={row.key} className="grid grid-cols-[5rem_1fr_auto] items-center gap-2 text-[12px]">
                          <span className="truncate font-medium">{row.key}</span>
                          <div className="h-1.5 rounded-full bg-muted/80">
                            <div
                              className="h-full rounded-full bg-primary"
                              style={{
                                width: `${Math.round((row.trades / marketMax) * 100)}%`,
                              }}
                            />
                          </div>
                          <span className="font-mono text-muted-foreground">
                            {row.trades}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </section>
            ) : null}
          </div>
        </>
      )}
    </PageFrame>
  )
}
