"use client"

import { Badge } from "@/components/ui/badge"
import { formatMarketLabel } from "@/lib/market-classification"
import { useLabels } from "@/lib/use-labels"
import { cn } from "@/lib/utils"
import type { MarketClassification } from "@/types/trade"

export function MarketBadges({
  classification,
}: {
  classification: MarketClassification
}) {
  const { ASSET_CLASS_LABELS, MARKET_TYPE_LABELS } = useLabels()
  if (!classification.symbol) return null

  const major = classification.marketType === "Major"
  const showType = classification.marketType !== "Unknown"

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Badge
        variant="outline"
        className="h-5 rounded-md border-border bg-muted/50 px-1.5 text-[10px] font-medium tracking-wide text-muted-foreground"
      >
        {ASSET_CLASS_LABELS[classification.assetClass]}
      </Badge>
      {showType ? (
        <Badge
          variant="outline"
          className={cn(
            "h-5 rounded-md px-1.5 text-[10px] font-medium tracking-wide",
            major
              ? "border-primary/40 bg-primary/12 text-primary"
              : "border-border bg-muted/50 text-muted-foreground"
          )}
        >
          {MARKET_TYPE_LABELS[classification.marketType]}
        </Badge>
      ) : null}
    </div>
  )
}

export function MarketCaption({
  classification,
}: {
  classification: Pick<MarketClassification, "assetClass" | "marketType" | "symbol">
}) {
  const { ASSET_CLASS_LABELS, MARKET_TYPE_LABELS } = useLabels()
  const label = formatMarketLabel(classification, {
    assetClass: ASSET_CLASS_LABELS,
    marketType: MARKET_TYPE_LABELS,
  })
  if (!label) return null
  return <p className="text-[11px] text-muted-foreground">{label}</p>
}
