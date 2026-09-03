"use client"

import Link from "next/link"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { CloseTradePanel } from "@/components/trades/close-trade-panel"
import { ResultR } from "@/components/trades/result-r"
import { TradeCotSummary } from "@/components/trades/trade-cot"
import {
  DirectionBadge,
  OutcomeBadge,
  StatusBadge,
} from "@/components/trades/trade-badges"
import { useTrades } from "@/components/trades/trades-provider"
import { useWorkspace } from "@/components/layout/workspace-provider"
import {
  formatDate,
  formatSignedUsd,
  signedClassName,
} from "@/lib/format"
import { formatRRR } from "@/lib/trade-calculations"
import { useLabels } from "@/lib/use-labels"
import { cn } from "@/lib/utils"
import type { Trade } from "@/types/trade"

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-2 border-b border-border/60 py-1.5 last:border-0">
      <span className="shrink-0 text-[11px] text-muted-foreground">{label}</span>
      <span className="text-right text-[12px] font-medium">{children}</span>
    </div>
  )
}

export function TradePanel({
  trade,
  playbookNames,
}: {
  trade: Trade
  playbookNames: Record<string, string>
}) {
  const { copy } = useLabels()
  const { deleteTrade } = useTrades()
  const { getPlaybook } = useWorkspace()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const playbook = getPlaybook(trade.playbookId)

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[18px] font-semibold">{trade.symbol}</p>
          <div className="mt-1 flex items-center gap-2">
            <DirectionBadge direction={trade.direction} />
            <StatusBadge status={trade.status} />
          </div>
        </div>
        {trade.resultR != null ? (
          <div className="text-right">
            <p className={cn("font-mono text-[22px] font-semibold tabular-nums", signedClassName(trade.resultR))}>
              <ResultR value={trade.resultR} />
            </p>
            {trade.pnl != null ? (
              <p className={cn("font-mono text-[12px]", signedClassName(trade.pnl))}>
                {formatSignedUsd(trade.pnl)}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>

      {trade.screenshot ? (
        <div className="overflow-hidden rounded-[6px] border border-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={trade.screenshot}
            alt=""
            className="max-h-40 w-full object-cover"
          />
        </div>
      ) : null}

      <div>
        <Row label={copy.journal.date}>{formatDate(trade.date)}</Row>
        <Row label={copy.detail.entry}>{trade.entry}</Row>
        <Row label={copy.detail.stopLoss}>{trade.stopLoss}</Row>
        <Row label={copy.detail.takeProfit}>{trade.takeProfit}</Row>
        <Row label={copy.detail.plannedRrr}>{formatRRR(trade.plannedRRR)}</Row>
        <Row label={copy.detail.riskPercent}>{trade.riskPercent} %</Row>
        <Row label={copy.journal.playbook}>
          {playbookNames[trade.playbookId] ?? trade.strategy}
        </Row>
        {playbook?.fields && trade.fieldValues?.length ? (
          <Row label={copy.detail.setup}>
            {trade.fieldValues
              .map((fv) => {
                const field = playbook.fields.find((f) => f.id === fv.fieldId)
                return field ? `${field.name}: ${fv.value}` : null
              })
              .filter(Boolean)
              .slice(0, 2)
              .join(" · ")}
          </Row>
        ) : null}
        <TradeCotSummary trade={trade} compact />
        {trade.notes.trim() ? (
          <div className="mt-2">
            <p className="text-[11px] text-muted-foreground">{copy.detail.notes}</p>
            <p className="mt-1 whitespace-pre-wrap text-[12px] text-foreground/80">
              {trade.notes.trim()}
            </p>
          </div>
        ) : null}
        {trade.review?.tags?.length ? (
          <div className="mt-2 flex flex-wrap gap-1">
            {trade.review.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border bg-muted/60 px-2 py-0.5 text-[10px] text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <CloseTradePanel key={trade.id} trade={trade} compact />

      <div className="flex flex-wrap items-center gap-2 pt-1">
        <Button size="sm" variant="outline" asChild className="h-7 text-[12px]">
          <Link href={`/journal/${trade.id}`}>{copy.detail.edit}</Link>
        </Button>
        {confirmDelete ? (
          <>
            <Button
              size="sm"
              variant="destructive"
              type="button"
              className="h-7 text-[12px]"
              onClick={() => deleteTrade(trade.id)}
            >
              {copy.detail.delete}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              type="button"
              className="h-7 text-[12px]"
              onClick={() => setConfirmDelete(false)}
            >
              {copy.detail.cancel}
            </Button>
          </>
        ) : (
          <Button
            size="sm"
            variant="ghost"
            type="button"
            className="h-7 text-[12px]"
            onClick={() => setConfirmDelete(true)}
          >
            {copy.detail.delete}
          </Button>
        )}
      </div>
    </div>
  )
}
