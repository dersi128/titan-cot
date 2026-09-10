"use client"

import { useEffect, useMemo, useState, type ReactNode } from "react"
import Link from "next/link"
import { ChevronRight, Hash, Percent, Scale, Sigma, Trash2, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { EmptyJournal } from "@/components/layout/empty-journal"
import { MetricLabel } from "@/components/layout/metric-info"
import { TableSkeleton } from "@/components/layout/loading-state"
import { PageFrame, PageHeader } from "@/components/layout/page-header"
import { useScopedTrades } from "@/components/layout/use-scoped-trades"
import { useWorkspace } from "@/components/layout/workspace-provider"
import { JournalImportButton } from "@/components/trades/journal-file-import"
import { ResultR } from "@/components/trades/result-r"
import { TradePanel } from "@/components/trades/trade-panel"
import {
  DirectionBadge,
  OutcomeBadge,
  StatusBadge,
} from "@/components/trades/trade-badges"
import { accountEdge } from "@/lib/analytics"
import { displayResultR } from "@/lib/trade-outcome"
import {
  formatDate,
  formatNumber,
  formatPercent,
  formatSignedR,
  formatSignedUsd,
  signedClassName,
} from "@/lib/format"
import { JOURNAL_MARKET_FILTERS } from "@/lib/market-classification"
import { formatRRR } from "@/lib/trade-calculations"
import { useLabels } from "@/lib/use-labels"
import { cn } from "@/lib/utils"
import {
  EMPTY_TRADE_FILTERS,
  filterTrades,
  type MarketFilter,
  type ResultFilter,
  type TradeFilters,
} from "@/lib/trade-filters"
import { TRADE_DIRECTIONS, type Trade } from "@/types/trade"

const PAGE_SIZE_OPTIONS = [15, 25, 50, 100]
const filterControlClass = "h-8 w-full text-[12px] lg:w-36"

function avgPlannedRrr(trades: Trade[]): number | null {
  const values = trades
    .map((trade) => trade.plannedRRR)
    .filter((value): value is number => value != null && Number.isFinite(value))
  if (values.length === 0) return null
  return Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 100) / 100
}

function filtersActive(filters: TradeFilters) {
  return (
    filters.query !== "" ||
    filters.playbookId !== "ALL" ||
    filters.direction !== "ALL" ||
    filters.result !== "ALL" ||
    filters.market !== "ALL" ||
    filters.dateFrom !== "" ||
    filters.dateTo !== ""
  )
}

function Stat({
  label,
  value,
  icon,
  valueClassName,
  why,
}: {
  label: string
  value: string
  icon: ReactNode
  valueClassName?: string
  why?: string
}) {
  return (
    <article className="titan-kpi rounded-[10px] px-3 py-2.5">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] text-muted-foreground">
          <MetricLabel label={label} why={why} />
        </p>
        {icon}
      </div>
      <p
        className={cn(
          "mt-1 font-mono text-[16px] font-medium tabular-nums",
          valueClassName
        )}
      >
        {value}
      </p>
    </article>
  )
}

function Pagination({
  total,
  page,
  pageSize,
  onPage,
  onPageSize,
}: {
  total: number
  page: number
  pageSize: number
  onPage: (page: number) => void
  onPageSize: (size: number) => void
}) {
  const { copy } = useLabels()
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)

  const pages = useMemo(() => {
    const set: number[] = []
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) set.push(i)
    } else {
      set.push(1)
      if (page > 3) set.push(-1)
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) set.push(i)
      if (page < totalPages - 2) set.push(-2)
      set.push(totalPages)
    }
    return set
  }, [page, totalPages])

  return (
    <div className="mt-3 flex flex-col gap-3 text-[12px] sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-2 text-muted-foreground">
        <span>{copy.journal.showing}</span>
        <Select
          value={String(pageSize)}
          onValueChange={(value) => {
            onPageSize(Number(value))
            onPage(1)
          }}
        >
          <SelectTrigger className="h-7 w-16 px-2 text-[12px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="popper">
            {PAGE_SIZE_OPTIONS.map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span>{copy.journal.perPage}</span>
        <span className="mx-1 text-border">·</span>
        <span>
          {from}–{to} {copy.journal.of} {total}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-1">
        <Button
          variant="secondary"
          size="sm"
          className="px-2"
          disabled={page === 1}
          onClick={() => onPage(page - 1)}
        >
          ‹
        </Button>
        {pages.map((p, i) =>
          p < 0 ? (
            <span key={p + i} className="px-1 text-muted-foreground">
              …
            </span>
          ) : (
            <Button
              key={p}
              variant={p === page ? "default" : "secondary"}
              size="sm"
              className="w-8 px-0"
              onClick={() => onPage(p)}
            >
              {p}
            </Button>
          )
        )}
        <Button
          variant="secondary"
          size="sm"
          className="px-2"
          disabled={page === totalPages}
          onClick={() => onPage(page + 1)}
        >
          ›
        </Button>
      </div>
    </div>
  )
}

function TradeDetailPane({
  trade,
  playbookNames,
  onClose,
}: {
  trade: Trade
  playbookNames: Record<string, string>
  onClose: () => void
}) {
  const { copy } = useLabels()

  return (
    <div className="titan-glass rounded-[10px] p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-[11px] text-muted-foreground">{trade.symbol}</p>
          <p className="text-[11px] text-muted-foreground">
            {trade.date}
            {" · "}ID: #{trade.id.slice(0, 12)}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground"
          aria-label={copy.close}
        >
          <X className="size-4" />
        </button>
      </div>
      <TradePanel trade={trade} playbookNames={playbookNames} />
    </div>
  )
}

export function JournalPage() {
  const { copy } = useLabels()
  const { trades, accountTrades, isReady } = useScopedTrades()
  const { playbooks } = useWorkspace()
  const [filters, setFilters] = useState<TradeFilters>(EMPTY_TRADE_FILTERS)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(15)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const visible = useMemo(
    () => filterTrades(trades, filters),
    [trades, filters]
  )
  const stats = useMemo(() => accountEdge(visible), [visible])
  const planned = useMemo(() => avgPlannedRrr(visible), [visible])
  const playbookNames = useMemo(
    () => Object.fromEntries(playbooks.map((item) => [item.id, item.name])),
    [playbooks]
  )

  const totalPages = Math.max(1, Math.ceil(visible.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const paginated = visible.slice((safePage - 1) * pageSize, safePage * pageSize)

  const selectedTrade = selectedId
    ? accountTrades.find((trade) => trade.id === selectedId) ?? null
    : null

  useEffect(() => {
    if (!selectedId) return
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setSelectedId(null)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [selectedId])

  function handleFilter(update: Partial<TradeFilters>) {
    setFilters((current) => ({ ...current, ...update }))
    setPage(1)
    setSelectedId(null)
  }

  function toggleTrade(id: string) {
    setSelectedId((current) => (current === id ? null : id))
  }

  const marketLabels: Record<MarketFilter, string> = {
    ALL: copy.journal.allMarkets,
    MAJOR: copy.journal.majors,
    CROSS: copy.journal.crosses,
    STOCK: copy.journal.stocks,
    COMMODITY: copy.journal.commodities,
    METAL: copy.journal.metals,
  }

  return (
    <PageFrame width="wide">
      <div data-guide="journal">
      <PageHeader
        title={copy.journal.title}
        description={copy.journal.description}
        actions={
          <div className="titan-action-bar">
            <JournalImportButton />
            {accountTrades.length > 0 ? (
              <Button asChild>
                <Link href="/new-trade">{copy.nav.newTrade}</Link>
              </Button>
            ) : null}
          </div>
        }
      />
      </div>

      {!isReady ? (
        <TableSkeleton rows={10} />
      ) : accountTrades.length === 0 ? (
        <EmptyJournal />
      ) : (
        <>
      <div className="mb-4 grid grid-cols-2 gap-2 lg:grid-cols-6">
        <Stat
          label={copy.analytics.tradeCount}
          value={String(stats.trades)}
          icon={<Hash className="size-3.5 text-muted-foreground" />}
        />
        <Stat
          label={copy.dashboard.averageR}
          value={formatSignedR(stats.averageR)}
          valueClassName={signedClassName(stats.averageR)}
          icon={<Sigma className="size-3.5 text-muted-foreground" />}
          why={copy.dashboard.averageRWhy}
        />
        <Stat
          label={copy.dashboard.winRate}
          value={formatPercent(stats.winRate)}
          icon={<Percent className="size-3.5 text-muted-foreground" />}
          why={copy.dashboard.winRateWhy}
        />
        <Stat
          label={copy.dashboard.profitFactor}
          value={formatNumber(stats.profitFactor)}
          icon={<Scale className="size-3.5 text-muted-foreground" />}
          why={copy.dashboard.profitFactorWhy}
        />
        <Stat
          label={copy.dashboard.netPnl}
          value={formatSignedUsd(stats.netPnl)}
          valueClassName={signedClassName(stats.netPnl)}
          icon={<Sigma className="size-3.5 text-muted-foreground" />}
        />
        <Stat
          label={copy.journal.averageRrr}
          value={planned == null ? "—" : formatRRR(planned)}
          icon={<Scale className="size-3.5 text-muted-foreground" />}
          why={copy.journal.averageRrrWhy}
        />
      </div>

      <div data-guide="journal-list">
      <div
        className="mb-4 grid grid-cols-1 gap-2 lg:flex lg:flex-wrap lg:items-center"
        data-guide="journal-filters"
      >
        <Input
          type="date"
          value={filters.dateFrom}
          onChange={(event) => handleFilter({ dateFrom: event.target.value })}
          aria-label={copy.journal.dateFrom}
          className={filterControlClass}
        />
        <Input
          type="date"
          value={filters.dateTo}
          onChange={(event) => handleFilter({ dateTo: event.target.value })}
          aria-label={copy.journal.dateTo}
          className={filterControlClass}
        />
        <Input
          placeholder={copy.journal.searchSymbol}
          value={filters.query}
          onChange={(event) => handleFilter({ query: event.target.value })}
          className="h-8 w-full min-w-0 text-[12px] lg:min-w-[140px] lg:w-auto"
        />
        <Select
          value={filters.market}
          onValueChange={(value) => handleFilter({ market: value as MarketFilter })}
        >
          <SelectTrigger className={filterControlClass} aria-label={copy.journal.market}>
            <SelectValue placeholder={copy.journal.market} />
          </SelectTrigger>
          <SelectContent position="popper">
            {JOURNAL_MARKET_FILTERS.map((market) => (
              <SelectItem key={market} value={market}>
                {marketLabels[market]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.direction}
          onValueChange={(value) =>
            handleFilter({ direction: value as TradeFilters["direction"] })
          }
        >
          <SelectTrigger className={cn(filterControlClass, "lg:w-32")} aria-label={copy.journal.direction}>
            <SelectValue placeholder={copy.journal.direction} />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectItem value="ALL">{copy.journal.allDirections}</SelectItem>
            {TRADE_DIRECTIONS.map((direction) => (
              <SelectItem key={direction} value={direction}>
                {direction}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.playbookId}
          onValueChange={(value) => handleFilter({ playbookId: value })}
        >
          <SelectTrigger className={filterControlClass} aria-label={copy.journal.playbook}>
            <SelectValue placeholder={copy.journal.playbook} />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectItem value="ALL">{copy.journal.allPlaybooks}</SelectItem>
            {playbooks.map((playbook) => (
              <SelectItem key={playbook.id} value={playbook.id}>
                {playbook.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.result}
          onValueChange={(value) =>
            handleFilter({ result: value as ResultFilter })
          }
        >
          <SelectTrigger className={cn(filterControlClass, "lg:w-28")} aria-label={copy.journal.result}>
            <SelectValue placeholder={copy.journal.result} />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectItem value="ALL">{copy.journal.allResults}</SelectItem>
            <SelectItem value="WIN">WIN</SelectItem>
            <SelectItem value="BE">BE</SelectItem>
            <SelectItem value="LOSS">LOSS</SelectItem>
          </SelectContent>
        </Select>
        {filtersActive(filters) ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full lg:w-auto"
            onClick={() => {
              setFilters(EMPTY_TRADE_FILTERS)
              setPage(1)
              setSelectedId(null)
            }}
          >
            <Trash2 className="size-3.5" />
            {copy.journal.clearFilters}
          </Button>
        ) : null}
      </div>

      <div className={cn("flex min-h-0 gap-3", selectedTrade ? "items-start" : "")}>
        <div className={cn("min-w-0 flex-1", selectedTrade ? "lg:max-w-[calc(100%-360px)]" : "")}>
              <div className="hidden overflow-hidden rounded-[10px] lg:block">
                <div className="titan-glass">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{copy.journal.date}</TableHead>
                      <TableHead>{copy.journal.symbol}</TableHead>
                      <TableHead>{copy.journal.direction}</TableHead>
                      <TableHead>{copy.journal.playbook}</TableHead>
                      <TableHead>{copy.journal.result}</TableHead>
                      <TableHead>{copy.journal.r}</TableHead>
                      <TableHead>{copy.journal.pnl}</TableHead>
                      <TableHead>{copy.journal.status}</TableHead>
                      <TableHead className="w-8">
                        <span className="sr-only">{copy.calendar.openDetail}</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginated.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={9}
                          className="h-24 text-center text-muted-foreground"
                        >
                          {copy.journal.empty}
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginated.map((trade) => (
                        <TableRow
                          key={trade.id}
                          onClick={() => toggleTrade(trade.id)}
                          className={cn(
                            "group cursor-pointer select-none hover:bg-foreground/6",
                            selectedId === trade.id && "bg-primary/8"
                          )}
                        >
                          <TableCell className="text-muted-foreground">
                            {formatDate(trade.date)}
                          </TableCell>
                          <TableCell className="font-medium">{trade.symbol}</TableCell>
                          <TableCell>
                            <DirectionBadge direction={trade.direction} />
                          </TableCell>
                          <TableCell>
                            {playbookNames[trade.playbookId] ?? trade.strategy}
                          </TableCell>
                          <TableCell>
                            <OutcomeBadge resultR={trade.resultR} pnl={trade.pnl} />
                          </TableCell>
                          <TableCell>
                            <ResultR value={displayResultR(trade)} />
                          </TableCell>
                          <TableCell className={signedClassName(trade.pnl)}>
                            {formatSignedUsd(trade.pnl)}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={trade.status} />
                          </TableCell>
                          <TableCell className="w-8 text-muted-foreground">
                            <ChevronRight
                              className="size-4 opacity-55 transition-transform group-hover:translate-x-0.5 group-hover:opacity-100"
                              aria-hidden
                            />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
                </div>
              </div>

              <div className="flex flex-col gap-2 lg:hidden">
                {paginated.length === 0 ? (
                  <p className="titan-glass rounded-[10px] px-4 py-8 text-center text-[13px] text-muted-foreground">
                    {copy.journal.empty}
                  </p>
                ) : (
                  paginated.map((trade) => (
                    <button
                      key={trade.id}
                      type="button"
                      onClick={() => toggleTrade(trade.id)}
                      className={cn(
                        "titan-glass cursor-pointer rounded-[10px] px-3 py-3 text-left transition-colors hover:bg-foreground/6",
                        selectedId === trade.id && "bg-primary/8"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-medium">{trade.symbol}</p>
                          <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                            {formatDate(trade.date)}
                            {" · "}
                            {playbookNames[trade.playbookId] ?? trade.strategy}
                          </p>
                        </div>
                        <ChevronRight
                          className="mt-0.5 size-4 shrink-0 text-muted-foreground opacity-70"
                          aria-hidden
                        />
                      </div>
                      <div className="mt-2 flex items-end justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <DirectionBadge direction={trade.direction} />
                          <OutcomeBadge resultR={trade.resultR} pnl={trade.pnl} />
                          <StatusBadge status={trade.status} />
                        </div>
                        <div className="text-right">
                          <p className="font-mono text-[13px] font-medium tabular-nums">
                            <ResultR value={displayResultR(trade)} />
                          </p>
                          <p
                            className={cn(
                              "font-mono text-[11px] tabular-nums",
                              signedClassName(trade.pnl)
                            )}
                          >
                            {formatSignedUsd(trade.pnl)}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
              <Pagination
                total={visible.length}
                page={safePage}
                pageSize={pageSize}
                onPage={setPage}
                onPageSize={setPageSize}
              />
        </div>

        {selectedTrade ? (
          <aside className="hidden w-[340px] shrink-0 lg:block">
            <div className="sticky top-4">
              <TradeDetailPane
                trade={selectedTrade}
                playbookNames={playbookNames}
                onClose={() => setSelectedId(null)}
              />
            </div>
          </aside>
        ) : null}
      </div>
      </div>

      {selectedTrade ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-background/70"
            aria-label={copy.close}
            onClick={() => setSelectedId(null)}
          />
          <div className="absolute inset-x-0 bottom-0 top-8 overflow-y-auto rounded-t-[16px] border-t border-border bg-background shadow-lg">
            <TradeDetailPane
              trade={selectedTrade}
              playbookNames={playbookNames}
              onClose={() => setSelectedId(null)}
            />
          </div>
        </div>
      ) : null}
        </>
      )}
    </PageFrame>
  )
}
