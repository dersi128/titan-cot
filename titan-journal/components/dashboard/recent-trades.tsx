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

export function RecentTrades({ trades }: { trades: Trade[] }) {
  const router = useRouter()
  const recent = trades.slice(0, 5)

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>Recent Trades</CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Symbol</TableHead>
              <TableHead>Direction</TableHead>
              <TableHead>Grade</TableHead>
              <TableHead>Result</TableHead>
              <TableHead>R</TableHead>
              <TableHead>Status</TableHead>
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
                      ? "Win"
                      : trade.resultR < 0
                        ? "Loss"
                        : "BE"}
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
