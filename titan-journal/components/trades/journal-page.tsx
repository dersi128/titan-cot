"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

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
import { ResultR } from "@/components/trades/result-r"
import {
  DirectionBadge,
  GradeBadge,
  StatusBadge,
} from "@/components/trades/trade-badges"
import { useTrades } from "@/components/trades/trades-provider"
import { tradeRowProps } from "@/components/trades/trade-row"
import { formatDate } from "@/lib/format"
import { copy, LOCATION_LABELS, STATUS_LABELS, TREND_LABELS } from "@/lib/labels"
import {
  EMPTY_TRADE_FILTERS,
  filterTrades,
  type TradeFilters,
} from "@/lib/trade-filters"
import {
  GRADES,
  STRATEGIES,
  TRADE_DIRECTIONS,
  TRADE_STATUSES,
} from "@/types/trade"

function outcomeLabel(resultR: number | null) {
  if (resultR == null) return "—"
  if (resultR > 0) return copy.outcome.win
  if (resultR < 0) return copy.outcome.loss
  return copy.outcome.be
}

export function JournalPage() {
  const router = useRouter()
  const { trades, isReady } = useTrades()
  const [filters, setFilters] = useState<TradeFilters>(EMPTY_TRADE_FILTERS)

  const visible = useMemo(
    () => filterTrades(trades, filters),
    [trades, filters]
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

      <div className="mb-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        <Input
          placeholder={copy.journal.searchSymbol}
          value={filters.query}
          onChange={(event) =>
            setFilters((current) => ({ ...current, query: event.target.value }))
          }
        />
        <Select
          value={filters.strategy}
          onValueChange={(value) =>
            setFilters((current) => ({
              ...current,
              strategy: value as TradeFilters["strategy"],
            }))
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={copy.journal.strategy} />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectItem value="ALL">{copy.journal.allStrategies}</SelectItem>
            {STRATEGIES.map((strategy) => (
              <SelectItem key={strategy} value={strategy}>
                {strategy}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.grade}
          onValueChange={(value) =>
            setFilters((current) => ({
              ...current,
              grade: value as TradeFilters["grade"],
            }))
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={copy.journal.grade} />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectItem value="ALL">{copy.journal.allGrades}</SelectItem>
            {GRADES.map((grade) => (
              <SelectItem key={grade} value={grade}>
                {grade}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
          value={filters.status}
          onValueChange={(value) =>
            setFilters((current) => ({
              ...current,
              status: value as TradeFilters["status"],
            }))
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={copy.journal.status} />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectItem value="ALL">{copy.journal.allStatuses}</SelectItem>
            {TRADE_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {STATUS_LABELS[status]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!isReady ? (
        <TableSkeleton rows={10} />
      ) : (
        <div className="titan-glass overflow-hidden rounded-2xl">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                  {copy.journal.date}
                </TableHead>
                <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                  {copy.journal.symbol}
                </TableHead>
                <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                  {copy.journal.direction}
                </TableHead>
                <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                  {copy.journal.strategy}
                </TableHead>
                <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                  {copy.journal.grade}
                </TableHead>
                <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                  {copy.journal.trend}
                </TableHead>
                <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                  {copy.journal.location}
                </TableHead>
                <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                  {copy.journal.result}
                </TableHead>
                <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                  {copy.journal.r}
                </TableHead>
                <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                  {copy.journal.status}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={10}
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
                    <TableCell>{trade.strategy}</TableCell>
                    <TableCell>
                      <GradeBadge grade={trade.grade} />
                    </TableCell>
                    <TableCell>{TREND_LABELS[trade.htfTrend]}</TableCell>
                    <TableCell>{LOCATION_LABELS[trade.location]}</TableCell>
                    <TableCell>{outcomeLabel(trade.resultR)}</TableCell>
                    <TableCell>
                      <ResultR value={trade.resultR} />
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
