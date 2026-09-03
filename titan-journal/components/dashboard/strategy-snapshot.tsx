"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatSignedR, signedClassName } from "@/lib/format"
import { bestAndWorstPlaybook } from "@/lib/analytics"
import { useLabels } from "@/lib/use-labels"
import { cn } from "@/lib/utils"
import type { Trade } from "@/types/trade"

export function StrategySnapshot({
  trades,
  compact = false,
}: {
  trades: Trade[]
  compact?: boolean
}) {
  const { copy } = useLabels()
  const { best, worst } = bestAndWorstPlaybook(trades)

  return (
    <Card size="sm" className={compact ? "shrink-0 gap-0 py-0" : undefined}>
      <CardHeader className="border-b border-border py-2">
        <CardTitle>{copy.dashboard.strategySnapshot}</CardTitle>
      </CardHeader>
      <CardContent className={compact ? "grid grid-cols-2 gap-2 py-2" : "grid gap-3 pt-4"}>
        {[
          { label: copy.dashboard.bestSetup, row: best },
          { label: copy.dashboard.weakestSetup, row: worst },
        ].map((item) => (
          <div
            key={item.label}
            className={
              compact
                ? "rounded-[10px] border border-border bg-elevated/60 px-2.5 py-1.5"
                : "rounded-[10px] border border-border bg-elevated/60 px-3 py-2"
            }
          >
            <p className="text-[11px] font-medium text-muted-foreground">
              {item.label}
            </p>
            <p className={compact ? "mt-0.5 truncate text-[13px] font-medium" : "mt-1 text-[13px] font-medium"}>
              {item.row?.key ?? "—"}
            </p>
            <p
              className={cn(
                compact
                  ? "mt-0.5 font-mono text-[12px] tabular-nums"
                  : "mt-1 font-mono text-[12px] tabular-nums",
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
