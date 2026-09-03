"use client"

import {
  cotAlignment,
  formatCotScore,
} from "@/lib/cot-link"
import { formatDate } from "@/lib/format"
import { useLabels } from "@/lib/use-labels"
import { cn } from "@/lib/utils"
import type { Bias, Trade } from "@/types/trade"

function biasClass(bias: Bias): string {
  if (bias === "Bullish") return "text-bull"
  if (bias === "Bearish") return "text-bear"
  return "text-muted-foreground"
}

export function TradeCotSummary({
  trade,
  compact = false,
}: {
  trade: Trade
  compact?: boolean
}) {
  const { copy, BIAS_LABELS } = useLabels()
  if (!trade.cotEnabled) return null

  const pairBias = trade.cotBias ?? "Neutral"
  const commercials = trade.commercialsBias ?? pairBias
  const score = trade.cotScore ?? 0
  const alignment = cotAlignment(trade.direction, pairBias)
  const alignLabel =
    alignment === "aligned"
      ? copy.form.cotAligned
      : alignment === "against"
        ? copy.form.cotAgainst
        : copy.form.cotNeutral

  return (
    <div className={cn(compact ? "space-y-1 py-1.5" : "space-y-1.5")}>
      <p className="flex items-baseline justify-between gap-2 text-[12px]">
        <span className="text-muted-foreground">{copy.detail.cot}</span>
        <span className={cn("font-medium", biasClass(pairBias))}>
          {BIAS_LABELS[pairBias]}
          <span
            className={cn(
              "ml-1.5 font-mono tabular-nums",
              score > 0 ? "text-bull" : score < 0 ? "text-bear" : "text-muted-foreground"
            )}
          >
            {formatCotScore(score)}
          </span>
        </span>
      </p>
      {commercials !== pairBias ? (
        <p className="flex items-baseline justify-between gap-2 text-[12px]">
          <span className="text-muted-foreground">{copy.detail.cotCommercials}</span>
          <span className={cn("font-medium", biasClass(commercials))}>
            {BIAS_LABELS[commercials]}
          </span>
        </p>
      ) : null}
      {trade.cotReportDate ? (
        <p className="flex items-baseline justify-between gap-2 text-[12px]">
          <span className="text-muted-foreground">{copy.form.cotReport}</span>
          <span className="font-medium">{formatDate(trade.cotReportDate)}</span>
        </p>
      ) : null}
      <p
        className={cn(
          "text-[11px]",
          alignment === "aligned"
            ? "text-bull"
            : alignment === "against"
              ? "text-bear"
              : "text-muted-foreground"
        )}
      >
        {alignLabel}
      </p>
    </div>
  )
}
