import { Badge } from "@/components/ui/badge"
import { formatMarketLabel } from "@/lib/market-classification"
import { cn } from "@/lib/utils"
import type { MarketClassification } from "@/types/trade"

export function MarketBadges({
  classification,
}: {
  classification: MarketClassification
}) {
  if (!classification.symbol) return null

  const major = classification.marketType === "Major"

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Badge
        variant="outline"
        className="h-5 rounded-md border-white/10 px-1.5 text-[10px] font-medium text-muted-foreground"
      >
        {classification.assetClass}
      </Badge>
      <Badge
        variant="outline"
        className={cn(
          "h-5 rounded-md px-1.5 text-[10px] font-medium",
          major
            ? "border-primary/30 bg-primary/10 text-primary"
            : "border-white/10 text-muted-foreground"
        )}
      >
        {classification.marketType}
      </Badge>
    </div>
  )
}

export function MarketCaption({
  classification,
}: {
  classification: Pick<MarketClassification, "assetClass" | "marketType" | "symbol">
}) {
  const label = formatMarketLabel(classification)
  if (!label) return null
  return <p className="text-[11px] text-muted-foreground">{label}</p>
}
