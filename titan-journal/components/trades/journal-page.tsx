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
import { useScopedTrades } from "@/components/layout/use-scoped-trades"
import { useWorkspace } from "@/components/layout/workspace-provider"
import { ResultR } from "@/components/trades/result-r"
import { DirectionBadge } from "@/components/trades/trade-badges"
import { tradeRowProps } from "@/components/trades/trade-row"
import { formatDate, formatSignedUsd, signedClassName } from "@/lib/format"
import { useLabels } from "@/lib/use-labels"
import type { Copy } from "@/lib/labels"
import {
  EMPTY_TRADE_FILTERS,
  filterTrades,
  type ResultFilter,
  type TradeFilters,
} from "@/lib/trade-filters"
import { TRADE_DIRECTIONS } from "@/types/trade"

function outcomeLabel(resultR: number | null, copy: Copy) {
  if (resultR == null) return "—"
  if (resultR > 0) return copy.outcome.win
  if (resultR < 0) return copy.outcome.loss
  return copy.outcome.be
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

      <div className="mb-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-6">
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
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
                    <TableCell>{outcomeLabel(trade.resultR, copy)}</TableCell>
                    <TableCell>
                      <ResultR value={trade.resultR} />
                    </TableCell>
                    <TableCell className={signedClassName(trade.pnl)}>
                      {formatSignedUsd(trade.pnl)}
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
