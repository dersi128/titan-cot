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
  StatusBadge,
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
      <CardHeader className="border-b border-white/[0.06]">
        <CardTitle>{copy.dashboard.recentTrades}</CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{copy.journal.symbol}</TableHead>
              <TableHead>{copy.journal.direction}</TableHead>
              <TableHead>{copy.journal.grade}</TableHead>
              <TableHead>{copy.journal.result}</TableHead>
              <TableHead>{copy.journal.r}</TableHead>
              <TableHead>{copy.journal.status}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recent.map((trade) => (
              <TableRow key={trade.id} {...tradeRowProps(trade.id, router.push)}>
                <TableCell className="font-medium">{trade.symbol}</TableCell>
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
                <TableCell>
                  <ResultR value={trade.resultR} />
                </TableCell>
                <TableCell>
                  <StatusBadge status={trade.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
