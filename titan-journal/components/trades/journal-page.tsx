"use client"

import { useMemo, useState, type ReactNode } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
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
import {
  DirectionBadge,
  OutcomeBadge,
  StatusBadge,
} from "@/components/trades/trade-badges"
import { tradeRowProps } from "@/components/trades/trade-row"
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

export function JournalPage() {
  const { copy } = useLabels()
  const router = useRouter()
  const { accountTrades, isReady } = useScopedTrades()
  const { playbooks } = useWorkspace()
  const [filters, setFilters] = useState<TradeFilters>(EMPTY_TRADE_FILTERS)
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

      <div className="mb-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-7">
        <Input
          type="date"
          value={filters.dateFrom}
          onChange={(event) =>
            setFilters((current) => ({ ...current, dateFrom: event.target.value }))
          }
          aria-label={copy.journal.dateFrom}
        />
        <Input
          type="date"
          value={filters.dateTo}
          onChange={(event) =>
            setFilters((current) => ({ ...current, dateTo: event.target.value }))
          }
          aria-label={copy.journal.dateTo}
        />
        <Input
          placeholder={copy.journal.searchSymbol}
          value={filters.query}
          onChange={(event) =>
            setFilters((current) => ({ ...current, query: event.target.value }))
          }
        />
        <Select
          value={filters.direction}
          onValueChange={(value) =>
            setFilters((current) => ({
              ...current,
              direction: value as TradeFilters["direction"],
            }))
          }
        >
          <SelectTrigger className="w-full">
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
          onValueChange={(value) =>
            setFilters((current) => ({ ...current, playbookId: value }))
          }
        >
          <SelectTrigger className="w-full">
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
            setFilters((current) => ({
              ...current,
              result: value as ResultFilter,
            }))
          }
        >
          <SelectTrigger className="w-full">
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
            onClick={() => setFilters(EMPTY_TRADE_FILTERS)}
          >
            <Trash2 className="size-3.5" />
            {copy.journal.clearFilters}
          </Button>
        ) : (
          <div className="hidden lg:block" />
        )}
      </div>

      {!isReady ? (
        <TableSkeleton rows={10} />
      ) : (
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
              {visible.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="h-24 text-center text-muted-foreground"
                  >
                    {copy.journal.empty}
                  </TableCell>
                </TableRow>
              ) : (
                visible.map((trade) => (
                  <TableRow key={trade.id} {...tradeRowProps(trade.id, router.push)}>
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
      )}
    </PageFrame>
  )
}
