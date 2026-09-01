import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { Grade, TradeDirection, TradeStatus } from "@/types/trade"

export function StatusBadge({ status }: { status: TradeStatus }) {
  const styles: Record<TradeStatus, string> = {
    IDEA: "border-border text-muted-foreground",
    PLANNED: "border-sky-500/30 bg-sky-500/10 text-sky-300",
    ACTIVE: "border-amber-500/30 bg-amber-500/10 text-amber-300",
    CLOSED: "border-border bg-muted text-foreground",
    CANCELLED: "border-border text-muted-foreground",
  }

  return (
    <Badge variant="outline" className={cn("rounded-md font-medium", styles[status])}>
      {status}
    </Badge>
  )
}

export function DirectionBadge({ direction }: { direction: TradeDirection }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-md font-medium",
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
        "rounded-md font-medium",
        strong
          ? "border-primary/30 bg-primary/10 text-primary"
          : "border-border text-muted-foreground"
      )}
    >
      {grade}
    </Badge>
  )
}
