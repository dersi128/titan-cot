"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ResultR } from "@/components/trades/result-r"
import type { Trade } from "@/types/trade"
import { formatDate } from "@/lib/format"
import { useLabels } from "@/lib/use-labels"
import { cn } from "@/lib/utils"

export function RecentTrades({ trades }: { trades: Trade[] }) {
  const { copy } = useLabels()
  const router = useRouter()
  const recent = trades.slice(0, 6)

  return (
    <Card size="sm" className="flex h-full min-h-[240px] flex-col gap-0 py-0">
      <CardHeader className="shrink-0 px-4 pt-3 pb-2">
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
      <CardContent className="min-h-0 flex-1 px-0 pb-2">
        {recent.length === 0 ? (
          <p className="px-4 py-6 text-center text-[12px] text-muted-foreground">
            {copy.journal.empty}
          </p>
        ) : (
          <ul>
            {recent.map((trade) => {
              const tone =
                trade.resultR == null
                  ? "bg-border"
                  : trade.resultR > 0
                    ? "bg-bull"
                    : trade.resultR < 0
                      ? "bg-bear"
                      : "bg-border"
              return (
                <li key={trade.id}>
                  <button
                    type="button"
                    onClick={() => router.push(`/journal/${trade.id}`)}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-foreground/[0.04]"
                  >
                    <span className={cn("h-8 w-0.5 shrink-0 rounded-full", tone)} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline gap-2">
                        <span className="truncate text-[13px] font-medium">
                          {trade.symbol}
                        </span>
                        <span
                          className={cn(
                            "text-[10px] font-semibold tracking-wide",
                            trade.direction === "LONG" ? "text-bull" : "text-bear"
                          )}
                        >
                          {trade.direction}
                        </span>
                      </span>
                      <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">
                        {formatDate(trade.date)}
                        {trade.strategy ? ` · ${trade.strategy}` : ""}
                      </span>
                    </span>
                    <ResultR value={trade.resultR} />
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
