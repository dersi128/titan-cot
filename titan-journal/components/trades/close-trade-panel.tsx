"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field } from "@/components/forms/field"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTrades } from "@/components/trades/trades-provider"
import { useWorkspace } from "@/components/layout/workspace-provider"
import { dollarsPerR, suggestedPnl } from "@/lib/account-scope"
import { parseOptionalNumber } from "@/lib/trade-calculations"
import { useLabels } from "@/lib/use-labels"
import type { Trade } from "@/types/trade"

export function CloseTradePanel({
  trade,
  compact = false,
}: {
  trade: Trade
  compact?: boolean
}) {
  const { copy } = useLabels()
  const { updateTrade } = useTrades()
  const { profile } = useWorkspace()
  const [resultR, setResultR] = useState(
    trade.resultR == null ? "" : String(trade.resultR)
  )
  const [pnl, setPnl] = useState(trade.pnl == null ? "" : String(trade.pnl))
  const riskUsd = dollarsPerR(
    profile.capital[trade.account],
    trade.riskPercent
  )

  if (trade.status === "CLOSED" || trade.status === "REVIEWED") return null
  if (trade.status === "CANCELLED") return null

  function handleClose() {
    const r = parseOptionalNumber(resultR)
    if (r == null) return
    const money = parseOptionalNumber(pnl)
    updateTrade({
      ...trade,
      status: "CLOSED",
      resultR: r,
      pnl:
        money ??
        suggestedPnl(r, profile.capital[trade.account], trade.riskPercent),
    })
  }

  const fields = (
    <>
      <div className={compact ? "grid gap-2" : "grid gap-3 sm:grid-cols-2"}>
        <Field label={copy.detail.resultR}>
          <Input
            value={resultR}
            onChange={(event) => setResultR(event.target.value)}
            placeholder="-1"
          />
        </Field>
        <Field label={copy.detail.pnl}>
          <Input
            value={pnl}
            onChange={(event) => setPnl(event.target.value)}
            placeholder={
              riskUsd > 0 ? String(Math.round(riskUsd)) : copy.detail.optional
            }
          />
        </Field>
      </div>
      <Button
        type="button"
        size={compact ? "sm" : "default"}
        className={compact ? "h-7 text-[12px]" : undefined}
        onClick={handleClose}
        disabled={parseOptionalNumber(resultR) == null}
      >
        {copy.detail.closeTrade}
      </Button>
    </>
  )

  if (compact) {
    return <div className="space-y-2">{fields}</div>
  }

  return (
    <Card>
      <CardHeader className="border-b border-border">
        <CardTitle>{copy.detail.result}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-4">{fields}</CardContent>
    </Card>
  )
}
