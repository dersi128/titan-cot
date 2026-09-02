import { Badge } from "@/components/ui/badge"
import { STATUS_LABELS } from "@/lib/labels"
import { cn } from "@/lib/utils"
import type { Grade, TradeDirection, TradeStatus } from "@/types/trade"

export function StatusBadge({ status }: { status: TradeStatus }) {
  const styles: Record<TradeStatus, string> = {
    IDEA: "border-white/10 bg-white/[0.03] text-stone-400",
    PLANNED: "border-primary/35 bg-primary/10 text-primary",
    ACTIVE: "border-amber-500/35 bg-amber-500/10 text-amber-200",
    CLOSED: "border-white/10 bg-titan-elevated/70 text-stone-200",
    REVIEWED: "border-primary/25 bg-primary/[0.08] text-stone-200",
    CANCELLED: "border-white/10 text-stone-500",
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

export function GradeBadge({ grade }: { grade: Grade }) {
  const strong = grade === "A+" || grade === "A"

  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
        strong
          ? "border-primary/35 bg-primary/10 text-primary"
          : "border-white/10 text-stone-400"
      )}
    >
      {grade}
    </Badge>
  )
}
