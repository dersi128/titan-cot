import { Badge } from "@/components/ui/badge"
import { STATUS_LABELS } from "@/lib/labels"
import { cn } from "@/lib/utils"
import type { Grade, TradeDirection, TradeStatus } from "@/types/trade"

export function StatusBadge({ status }: { status: TradeStatus }) {
  const styles: Record<TradeStatus, string> = {
    IDEA: "border-white/10 bg-white/[0.03] text-stone-400",
    PLANNED: "border-[rgba(46,168,255,0.35)] bg-[rgba(46,168,255,0.1)] text-[#7dd3fc]",
    ACTIVE: "border-amber-500/35 bg-amber-500/10 text-amber-200",
    CLOSED: "border-white/10 bg-titan-elevated/70 text-stone-200",
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
          ? "border-bull/35 bg-bull/10 text-bull shadow-[0_0_12px_-6px_rgba(0,208,132,0.55)]"
          : "border-bear/35 bg-bear/10 text-bear shadow-[0_0_12px_-6px_rgba(255,77,109,0.55)]"
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
          ? "border-[rgba(46,168,255,0.4)] bg-[rgba(46,168,255,0.12)] text-[#7dd3fc]"
          : "border-white/10 text-stone-400"
      )}
    >
      {grade}
    </Badge>
  )
}
