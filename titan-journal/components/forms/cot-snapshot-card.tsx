"use client"

import { useEffect, useRef, useState } from "react"

import {
  cotAlignment,
  formatCotScore,
  hasCotLink,
  type CotLiveSnapshot,
} from "@/lib/cot-link"
import { formatDate } from "@/lib/format"
import { useLabels } from "@/lib/use-labels"
import { cn } from "@/lib/utils"
import type { Bias, TradeDirection } from "@/types/trade"

function biasClass(bias: Bias): string {
  if (bias === "Bullish") return "text-bull"
  if (bias === "Bearish") return "text-bear"
  return "text-muted-foreground"
}

export function CotSnapshotCard({
  symbol,
  direction,
  onSnapshot,
}: {
  symbol: string
  direction: TradeDirection
  onSnapshot: (snapshot: CotLiveSnapshot | null) => void
}) {
  const { copy, BIAS_LABELS } = useLabels()
  const onSnapshotRef = useRef(onSnapshot)
  onSnapshotRef.current = onSnapshot
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "unavailable">(
    "idle"
  )
  const [data, setData] = useState<CotLiveSnapshot | null>(null)

  useEffect(() => {
    onSnapshotRef.current(null)
    setData(null)

    if (!hasCotLink(symbol)) {
      setStatus("idle")
      return
    }

    const controller = new AbortController()
    setStatus("loading")
    const timer = window.setTimeout(() => {
      void (async () => {
        try {
          const response = await fetch(
            `/api/cot?symbol=${encodeURIComponent(symbol)}`,
            { signal: controller.signal }
          )
          const json: unknown = await response.json()
          if (
            !json ||
            typeof json !== "object" ||
            !("ok" in json) ||
            (json as { ok?: boolean }).ok !== true
          ) {
            setStatus("unavailable")
            return
          }
          const snapshot = json as CotLiveSnapshot
          setData(snapshot)
          setStatus("ready")
          onSnapshotRef.current(snapshot)
        } catch {
          if (controller.signal.aborted) return
          setStatus("unavailable")
        }
      })()
    }, 280)

    return () => {
      controller.abort()
      window.clearTimeout(timer)
    }
  }, [symbol])

  if (!hasCotLink(symbol)) return null

  const alignment = data ? cotAlignment(direction, data.pairBias) : "neutral"
  const alignLabel =
    alignment === "aligned"
      ? copy.form.cotAligned
      : alignment === "against"
        ? copy.form.cotAgainst
        : copy.form.cotNeutral

  return (
    <div className="titan-glass space-y-2 rounded-[10px] p-4">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm font-medium">{copy.form.cotTitle}</p>
        {data?.reportDate ? (
          <p className="text-[11px] text-muted-foreground">
            {copy.form.cotReport} {formatDate(data.reportDate)}
          </p>
        ) : null}
      </div>

      {status === "loading" ? (
        <p className="text-[12px] text-muted-foreground">{copy.form.cotLoading}</p>
      ) : null}

      {status === "unavailable" ? (
        <p className="text-[12px] text-muted-foreground">
          {copy.form.cotUnavailable}
        </p>
      ) : null}

      {status === "ready" && data ? (
        <>
          <p className="text-[12px] text-muted-foreground">{data.market}</p>
          <div className="space-y-1.5">
            <p className="flex items-baseline justify-between gap-3 text-[12px]">
              <span className="text-muted-foreground">{copy.form.cotCommercials}</span>
              <span className={cn("font-medium", biasClass(data.commercialsBias))}>
                {BIAS_LABELS[data.commercialsBias]}
              </span>
            </p>
            <p className="flex items-baseline justify-between gap-3 text-[12px]">
              <span className="text-muted-foreground">{copy.form.cotPairLean}</span>
              <span className={cn("font-medium", biasClass(data.pairBias))}>
                {BIAS_LABELS[data.pairBias]}
              </span>
            </p>
            <p className="flex items-baseline justify-between gap-3 text-[12px]">
              <span className="text-muted-foreground">{copy.form.cotScore}</span>
              <span
                className={cn(
                  "font-mono tabular-nums",
                  data.cotScore > 0
                    ? "text-bull"
                    : data.cotScore < 0
                      ? "text-bear"
                      : "text-muted-foreground"
                )}
              >
                {formatCotScore(data.cotScore)}
              </span>
            </p>
          </div>
          <p
            className={cn(
              "text-[11px] font-medium",
              alignment === "aligned"
                ? "text-bull"
                : alignment === "against"
                  ? "text-bear"
                  : "text-muted-foreground"
            )}
          >
            {alignLabel}
          </p>
          {data.invert ? (
            <p className="text-[11px] text-muted-foreground">
              {copy.form.cotInverse
                .replace("{pair}", data.symbol)
                .replace("{market}", data.market)}
            </p>
          ) : null}
        </>
      ) : null}
    </div>
  )
}
