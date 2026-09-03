"use client"

import { Badge } from "@/components/ui/badge"
import { useLabels } from "@/lib/use-labels"
import { cn } from "@/lib/utils"
import type { Grade, TradeDirection, TradeStatus } from "@/types/trade"

export function StatusBadge({ status }: { status: TradeStatus }) {
  const { STATUS_LABELS } = useLabels()
  const styles: Record<TradeStatus, string> = {
    IDEA: "border-border bg-muted/50 text-muted-foreground",
    PLANNED: "border-primary/35 bg-primary/10 text-primary",
    ACTIVE: "border-amber-500/40 bg-amber-500/12 text-amber-800 dark:text-amber-200",
    CLOSED: "border-bull/25 bg-bull/10 text-bull",
    REVIEWED: "border-primary/30 bg-primary/10 text-foreground",
    CANCELLED: "border-border text-muted-foreground",
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
        styles[status]
      )}
    >
      {STATUS_LABELS[status]}
    </Badge>
  )
}

export function DirectionBadge({ direction }: { direction: TradeDirection }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
        direction === "LONG"
          ? "border-bull/30 bg-bull/10 text-bull"
          : "border-bear/30 bg-bear/10 text-bear"
      )}
    >
      {direction}
    </Badge>
  )
}

export function OutcomeBadge({ resultR }: { resultR: number | null }) {
  const { copy } = useLabels()
  if (resultR == null) {
    return <span className="text-muted-foreground">—</span>
  }
  const win = resultR > 0
  const loss = resultR < 0
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
        win
          ? "border-bull/30 bg-bull/10 text-bull"
          : loss
            ? "border-bear/30 bg-bear/10 text-bear"
            : "border-border text-muted-foreground"
      )}
    >
      {win ? copy.outcome.win : loss ? copy.outcome.loss : copy.outcome.be}
    </Badge>
  )
}

export function GradeBadge({ grade }: { grade: Grade }) {
  const strong = grade === "A+" || grade === "A"

  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
        strong
          ? "border-primary/35 bg-primary/10 text-primary"
          : "border-border text-muted-foreground"
      )}
    >
      {grade}
    </Badge>
  )
}
