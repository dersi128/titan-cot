"use client"

import { EDGE_MIN_TRADES, type EdgeVerdict } from "@/lib/analytics"
import { useLabels } from "@/lib/use-labels"
import { cn } from "@/lib/utils"

export function edgeCopy(
  copy: ReturnType<typeof useLabels>["copy"],
  edge: EdgeVerdict
): string {
  if (edge === "yes") return copy.analytics.edgeYes
  if (edge === "no") return copy.analytics.edgeNo
  return copy.analytics.edgeThin
}

export function EdgeBadge({
  edge,
  className,
}: {
  edge: EdgeVerdict
  className?: string
}) {
  const { copy } = useLabels()
  return (
    <span
      className={cn(
        "font-medium",
        edge === "yes"
          ? "text-bull"
          : edge === "no"
            ? "text-bear"
            : "text-muted-foreground",
        className
      )}
    >
      {edgeCopy(copy, edge)}
    </span>
  )
}

export function edgeHint(copy: ReturnType<typeof useLabels>["copy"]): string {
  return copy.analytics.edgeHint.replace("{n}", String(EDGE_MIN_TRADES))
}
