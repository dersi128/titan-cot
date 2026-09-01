"use client"

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
import {
  DirectionBadge,
  GradeBadge,
} from "@/components/trades/trade-badges"
import { ResultR } from "@/components/trades/result-r"
import type { Trade } from "@/types/trade"
import { tradeRowProps } from "@/components/trades/trade-row"
import { copy } from "@/lib/labels"

export function RecentTrades({ trades }: { trades: Trade[] }) {
  const router = useRouter()
  const recent = trades.slice(0, 5)

  return (
    <Card>
      <CardHeader className="border-b border-white/[0.06] py-3">
        <CardTitle>{copy.dashboard.recentTrades}</CardTitle>
      </CardHeader>
      <CardContent className="px-0">
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
                {copy.dashboard.grade}
              </TableHead>
              <TableHead className="text-[11px] font-medium text-muted-foreground">
                {copy.dashboard.result}
              </TableHead>
              <TableHead className="px-4 text-[11px] font-medium text-muted-foreground">
                {copy.dashboard.r}
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
                <TableCell>
                  <GradeBadge grade={trade.grade} />
                </TableCell>
                <TableCell>
                  {trade.resultR == null
                    ? "—"
                    : trade.resultR > 0
                      ? copy.outcome.win
                      : trade.resultR < 0
                        ? copy.outcome.loss
                        : copy.outcome.be}
                </TableCell>
                <TableCell className="px-4">
                  <ResultR value={trade.resultR} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
