"use client"

import { useMemo, useState, type ReactNode } from "react"
import Link from "next/link"
import { X } from "lucide-react"
import { Hash, Percent, Scale, Sigma, Trash2 } from "lucide-react"

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
import { TableSkeleton } from "@/components/layout/loading-state"
import { PageFrame, PageHeader } from "@/components/layout/page-header"
import { useScopedTrades } from "@/components/layout/use-scoped-trades"
import { useWorkspace } from "@/components/layout/workspace-provider"
import { ResultR } from "@/components/trades/result-r"
import { TradePanel } from "@/components/trades/trade-panel"
import {
  DirectionBadge,
  OutcomeBadge,
  StatusBadge,
} from "@/components/trades/trade-badges"
import { accountEdge } from "@/lib/analytics"
import {
  formatDate,
  formatNumber,
  formatPercent,
  formatSignedR,
  formatSignedUsd,
  signedClassName,
} from "@/lib/format"
import { formatRRR } from "@/lib/trade-calculations"
import { useLabels } from "@/lib/use-labels"
import { cn } from "@/lib/utils"
import {
  EMPTY_TRADE_FILTERS,
  filterTrades,
  type ResultFilter,
  type TradeFilters,
} from "@/lib/trade-filters"
import { TRADE_DIRECTIONS, type Trade } from "@/types/trade"

const PAGE_SIZE_OPTIONS = [15, 25, 50, 100]

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
    filters.dateFrom !== "" ||
    filters.dateTo !== ""
  )
}

function Stat({
  label,
  value,
  icon,
  valueClassName,
}: {
  label: string
  value: string
  icon: ReactNode
  valueClassName?: string
}) {
  return (
    <article className="titan-kpi rounded-[10px] px-3 py-2.5">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] text-muted-foreground">{label}</p>
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
    <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-[12px]">
      <div className="flex items-center gap-2 text-muted-foreground">
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
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          className="h-7 px-2 text-[12px]"
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
              variant={p === page ? "default" : "outline"}
              size="sm"
              className="h-7 w-7 p-0 text-[12px]"
              onClick={() => onPage(p)}
            >
              {p}
            </Button>
          )
        )}
        <Button
          variant="outline"
          size="sm"
          className="h-7 px-2 text-[12px]"
          disabled={page === totalPages}
          onClick={() => onPage(page + 1)}
        >
          ›
        </Button>
      </div>
    </div>
  )
}

export function JournalPage() {
  const { copy } = useLabels()
  const { accountTrades, isReady } = useScopedTrades()
  const { playbooks } = useWorkspace()
  const [filters, setFilters] = useState<TradeFilters>(EMPTY_TRADE_FILTERS)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(15)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const visible = useMemo(
    () => filterTrades(accountTrades, filters),
    [accountTrades, filters]
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

  function handleFilter(update: Partial<TradeFilters>) {
    setFilters((current) => ({ ...current, ...update }))
    setPage(1)
    setSelectedId(null)
  }

  return (
    <PageFrame width="wide">
      <PageHeader
        title={copy.journal.title}
        description={copy.journal.description}
        actions={
          <Button asChild>
            <Link href="/new-trade">{copy.nav.newTrade}</Link>
          </Button>
        }
      />

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
        />
        <Stat
          label={copy.dashboard.winRate}
          value={formatPercent(stats.winRate)}
          icon={<Percent className="size-3.5 text-muted-foreground" />}
        />
        <Stat
          label={copy.dashboard.profitFactor}
          value={formatNumber(stats.profitFactor)}
          icon={<Scale className="size-3.5 text-muted-foreground" />}
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
        />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Input
          type="date"
          value={filters.dateFrom}
          onChange={(event) => handleFilter({ dateFrom: event.target.value })}
          aria-label={copy.journal.dateFrom}
          className="h-8 w-36 text-[12px]"
        />
        <Input
          type="date"
          value={filters.dateTo}
          onChange={(event) => handleFilter({ dateTo: event.target.value })}
          aria-label={copy.journal.dateTo}
          className="h-8 w-36 text-[12px]"
        />
        <Input
          placeholder={copy.journal.searchSymbol}
          value={filters.query}
          onChange={(event) => handleFilter({ query: event.target.value })}
          className="h-8 min-w-[140px] text-[12px]"
        />
        <Select
          value={filters.direction}
          onValueChange={(value) =>
            handleFilter({ direction: value as TradeFilters["direction"] })
          }
        >
          <SelectTrigger className="h-8 w-32 text-[12px]">
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
          <SelectTrigger className="h-8 w-36 text-[12px]">
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
          <SelectTrigger className="h-8 w-28 text-[12px]">
            <SelectValue placeholder={copy.journal.result} />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectItem value="ALL">{copy.journal.allResults}</SelectItem>
            <SelectItem value="WIN">{copy.outcome.win}</SelectItem>
            <SelectItem value="LOSS">{copy.outcome.loss}</SelectItem>
            <SelectItem value="BE">{copy.outcome.be}</SelectItem>
          </SelectContent>
        </Select>
        {filtersActive(filters) ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 text-[12px]"
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
          {!isReady ? (
            <TableSkeleton rows={10} />
          ) : (
            <>
              <div className="titan-glass overflow-hidden rounded-[10px]">
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
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginated.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={8}
                          className="h-24 text-center text-muted-foreground"
                        >
                          {copy.journal.empty}
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginated.map((trade) => (
                        <TableRow
                          key={trade.id}
                          onClick={() =>
                            setSelectedId((current) =>
                              current === trade.id ? null : trade.id
                            )
                          }
                          className={cn(
                            "cursor-pointer select-none",
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
                            <OutcomeBadge resultR={trade.resultR} />
                          </TableCell>
                          <TableCell>
                            <ResultR value={trade.resultR} />
                          </TableCell>
                          <TableCell className={signedClassName(trade.pnl)}>
                            {formatSignedUsd(trade.pnl)}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={trade.status} />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              <Pagination
                total={visible.length}
                page={safePage}
                pageSize={pageSize}
                onPage={setPage}
                onPageSize={setPageSize}
              />
            </>
          )}
        </div>

        {selectedTrade ? (
          <aside className="hidden w-[340px] shrink-0 lg:block">
            <div className="titan-glass sticky top-4 rounded-[10px] p-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-muted-foreground">
                    {selectedTrade.symbol}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {selectedTrade.date}
                    {" · "}ID: #{selectedTrade.id.slice(0, 12)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedId(null)}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label="Zavřít"
                >
                  <X className="size-4" />
                </button>
              </div>
              <TradePanel trade={selectedTrade} playbookNames={playbookNames} />
            </div>
          </aside>
        ) : null}
      </div>
    </PageFrame>
  )
}
