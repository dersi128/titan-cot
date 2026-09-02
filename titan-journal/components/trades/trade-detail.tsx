"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field } from "@/components/forms/field"
import {
  DirectionBadge,
  StatusBadge,
} from "@/components/trades/trade-badges"
import { ResultR } from "@/components/trades/result-r"
import { SimpleReviewPanel } from "@/components/trades/simple-review-panel"
import { useTrades } from "@/components/trades/trades-provider"
import { useWorkspace } from "@/components/layout/workspace-provider"
import { formatMarketLabel, classifyMarket } from "@/lib/market-classification"
import { formatRRR } from "@/lib/trade-calculations"
import { formatSignedUsd } from "@/lib/format"
import { copy } from "@/lib/labels"
import {
  fieldValueMap,
  formatFieldValue,
  playbookHasValues,
  sortedFields,
} from "@/lib/playbooks"
import { parseOptionalNumber } from "@/lib/trade-calculations"
import type { Trade } from "@/types/trade"

function FieldRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm">{value}</dd>
    </div>
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <Card>
      <CardHeader className="border-b border-border">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <dl className="grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3">
          {children}
        </dl>
      </CardContent>
    </Card>
  )
}

function CloseTradePanel({ trade }: { trade: Trade }) {
  const { updateTrade } = useTrades()
  const [resultR, setResultR] = useState(
    trade.resultR == null ? "" : String(trade.resultR)
  )
  const [pnl, setPnl] = useState(trade.pnl == null ? "" : String(trade.pnl))

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
      pnl: money ?? Math.round(r * 130),
    })
  }

  return (
    <Card>
      <CardHeader className="border-b border-border">
        <CardTitle>{copy.detail.result}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-4">
        <div className="grid gap-3 sm:grid-cols-2">
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
              placeholder="optional"
            />
          </Field>
        </div>
        <Button type="button" onClick={handleClose} disabled={parseOptionalNumber(resultR) == null}>
          Close trade
        </Button>
      </CardContent>
    </Card>
  )
}

export function TradeDetail({ trade }: { trade: Trade }) {
  const router = useRouter()
  const { deleteTrade } = useTrades()
  const classification = classifyMarket(trade.symbol)
  const { getPlaybook } = useWorkspace()
  const playbook = getPlaybook(trade.playbookId)
  const values = fieldValueMap(trade.fieldValues)
  const showStrategy = playbookHasValues(playbook, trade.fieldValues)
  const notes = trade.notes.trim()
  const [confirmDelete, setConfirmDelete] = useState(false)

  function handleDelete() {
    deleteTrade(trade.id)
    router.push("/journal")
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs text-muted-foreground">
            {formatMarketLabel(classification)}
          </p>
          <h1 className="mt-1 font-semibold tracking-tight">{trade.symbol}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <DirectionBadge direction={trade.direction} />
            <span className="text-sm text-muted-foreground">{trade.strategy}</span>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <StatusBadge status={trade.status} />
          <Button variant="outline" size="sm" asChild>
            <Link href={`/journal/${trade.id}/edit`}>{copy.detail.edit}</Link>
          </Button>
          {confirmDelete ? (
            <>
              <Button
                variant="destructive"
                size="sm"
                type="button"
                onClick={handleDelete}
              >
                {copy.detail.delete}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={() => setConfirmDelete(false)}
              >
                {copy.detail.cancel}
              </Button>
            </>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={() => setConfirmDelete(true)}
            >
              {copy.detail.delete}
            </Button>
          )}
          {confirmDelete ? (
            <p className="basis-full text-right text-[12px] text-destructive">
              {copy.detail.deleteConfirm}
            </p>
          ) : null}
        </div>
      </div>

      <Section title={copy.detail.trade}>
        <FieldRow label={copy.journal.date} value={trade.date} />
        <FieldRow label={copy.journal.playbook} value={trade.strategy} />
        <FieldRow label={copy.detail.market} value={classification.assetClass} />
      </Section>

      <Section title={copy.detail.plan}>
        <FieldRow label={copy.detail.entry} value={trade.entry} />
        <FieldRow label={copy.detail.stopLoss} value={trade.stopLoss} />
        <FieldRow label={copy.detail.takeProfit} value={trade.takeProfit} />
        <FieldRow label={copy.detail.riskPercent} value={`${trade.riskPercent} %`} />
        <FieldRow label={copy.detail.plannedRrr} value={formatRRR(trade.plannedRRR)} />
      </Section>

      {trade.resultR != null || trade.pnl != null ? (
        <Section title={copy.detail.result}>
          <FieldRow
            label={copy.detail.resultR}
            value={<ResultR value={trade.resultR} />}
          />
          <FieldRow label={copy.detail.pnl} value={formatSignedUsd(trade.pnl)} />
        </Section>
      ) : (
        <CloseTradePanel trade={trade} />
      )}

      <SimpleReviewPanel trade={trade} />

      {showStrategy && playbook ? (
        <Section title={copy.detail.strategyContext}>
          {sortedFields(playbook).map((field) => {
            const label = formatFieldValue(field, values[field.id] ?? null)
            if (!label) return null
            return <FieldRow key={field.id} label={field.name} value={label} />
          })}
        </Section>
      ) : null}

      {trade.screenshot ? (
        <Card>
          <CardHeader className="border-b border-border">
            <CardTitle>{copy.detail.screenshot}</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={trade.screenshot}
              alt=""
              className="max-h-80 rounded-md border border-border object-contain"
            />
          </CardContent>
        </Card>
      ) : null}

      {notes ? (
        <Card>
          <CardHeader className="border-b border-border">
            <CardTitle>{copy.detail.notes}</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <p className="whitespace-pre-wrap text-sm text-muted-foreground">
              {notes}
            </p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
