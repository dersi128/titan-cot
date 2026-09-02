"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatSignedR, signedClassName } from "@/lib/format"
import { copy } from "@/lib/labels"
import { bestAndWorstPlaybook } from "@/lib/analytics"
import { cn } from "@/lib/utils"
import type { Trade } from "@/types/trade"

export function StrategySnapshot({ trades }: { trades: Trade[] }) {
  const { best, worst } = bestAndWorstPlaybook(trades)

  return (
    <Card>
      <CardHeader className="border-b border-border py-3">
        <CardTitle>{copy.dashboard.strategySnapshot}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 pt-4">
        {[
          { label: copy.dashboard.bestSetup, row: best },
          { label: copy.dashboard.weakestSetup, row: worst },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-[10px] border border-border bg-elevated/60 px-3.5 py-3"
          >
            <p className="text-[11px] font-medium text-muted-foreground">
              {item.label}
            </p>
            <p className="mt-1.5 text-[14px] font-medium">
              {item.row?.key ?? "—"}
            </p>
            <p
              className={cn(
                "mt-2 font-mono text-[12px] tabular-nums",
                signedClassName(item.row?.averageR)
              )}
            >
              {formatSignedR(item.row?.averageR ?? null)} {copy.dashboard.expectancy}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
