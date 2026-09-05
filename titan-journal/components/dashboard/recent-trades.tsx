"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DirectionBadge } from "@/components/trades/trade-badges"
import { ResultR } from "@/components/trades/result-r"
import type { Trade } from "@/types/trade"
import { tradeRowProps } from "@/components/trades/trade-row"
import { formatDate, formatSignedUsd, signedClassName } from "@/lib/format"
import { displayResultR } from "@/lib/trade-outcome"
import { useLabels } from "@/lib/use-labels"

export function RecentTrades({ trades }: { trades: Trade[] }) {
  const { copy } = useLabels()
  const router = useRouter()
  const recent = trades.slice(0, 6)

  return (
    <Card size="sm" className="flex h-full min-h-[240px] flex-col gap-0 py-0">
      <CardHeader className="shrink-0 border-b border-border py-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle>{copy.dashboard.recentTrades}</CardTitle>
          <Link
            href="/journal"
            className="text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {copy.dashboard.viewAllTrades}
          </Link>
        </div>
      </CardHeader>
      <CardContent className="min-h-0 flex-1 overflow-auto px-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="px-4 text-[11px] font-medium text-muted-foreground">
                {copy.dashboard.symbol}
              </TableHead>
              <TableHead className="text-[11px] font-medium text-muted-foreground">
                {copy.dashboard.direction}
              </TableHead>
              <TableHead className="text-[11px] font-medium text-muted-foreground">
                {copy.journal.playbook}
              </TableHead>
              <TableHead className="text-[11px] font-medium text-muted-foreground">
                {copy.dashboard.result}
              </TableHead>
              <TableHead className="text-[11px] font-medium text-muted-foreground">
                {copy.dashboard.r}
              </TableHead>
              <TableHead className="px-4 text-[11px] font-medium text-muted-foreground">
                {copy.journal.date}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recent.map((trade) => (
              <TableRow key={trade.id} {...tradeRowProps(trade.id, router.push)}>
                <TableCell className="px-4 font-medium">{trade.symbol}</TableCell>
                <TableCell>
                  <DirectionBadge direction={trade.direction} />
                </TableCell>
                <TableCell>{trade.strategy}</TableCell>
                <TableCell className={signedClassName(trade.pnl)}>
                  {formatSignedUsd(trade.pnl)}
                </TableCell>
                <TableCell>
                  <ResultR value={displayResultR(trade)} />
                </TableCell>
                <TableCell className="px-4 text-muted-foreground">
                  {formatDate(trade.date)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
