"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"

import { Field, OptionPills } from "@/components/forms/field"
import { PageFrame, PageHeader } from "@/components/layout/page-header"
import { useWorkspace } from "@/components/layout/workspace-provider"
import { PlaybookFieldInput } from "@/components/playbooks/playbook-field-input"
import { MarketBadges } from "@/components/trades/market-badges"
import { useTrades } from "@/components/trades/trades-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { classifyMarket } from "@/lib/market-classification"
import { copy } from "@/lib/labels"
import { todayIsoDate } from "@/lib/locale"
import { applyTitanFieldValuesToLegacy } from "@/lib/playbook-legacy"
import {
  activePlaybooks,
  fieldValueMap,
  sortedFields,
  TITAN_SWING_PLAYBOOK_ID,
  upsertFieldValue,
} from "@/lib/playbooks"
import {
  calculatePlannedRRR,
  formatRRR,
  parseOptionalNumber,
} from "@/lib/trade-calculations"
import type { TradeFieldValue } from "@/types/playbook"
import {
  DEFAULT_STRATEGY,
  TRADE_DIRECTIONS,
  type NewTradeInput,
  type TradeDirection,
} from "@/types/trade"

function readScreenshot(file: File): Promise<string | null> {
  if (file.size > 450_000) return Promise.resolve(null)
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () =>
      resolve(typeof reader.result === "string" ? reader.result : null)
    reader.onerror = () => resolve(null)
    reader.readAsDataURL(file)
  })
}

export function NewTradeForm() {
  const router = useRouter()
  const { saveTrade } = useTrades()
  const { preferences, playbooks } = useWorkspace()
  const available = activePlaybooks(playbooks)
  const defaultPlaybook =
    available.find((item) => item.id === preferences.defaultPlaybookId) ??
    available[0]

  const [symbol, setSymbol] = useState("")
  const [direction, setDirection] = useState<TradeDirection>("LONG")
  const [entry, setEntry] = useState("")
  const [stopLoss, setStopLoss] = useState("")
  const [takeProfit, setTakeProfit] = useState("")
  const [riskPercent, setRiskPercent] = useState(String(preferences.defaultRisk))
  const [playbookId, setPlaybookId] = useState(defaultPlaybook?.id ?? TITAN_SWING_PLAYBOOK_ID)
  const [notes, setNotes] = useState("")
  const [screenshot, setScreenshot] = useState<string | null>(null)
  const [fieldValues, setFieldValues] = useState<TradeFieldValue[]>([])
  const [error, setError] = useState<string | null>(null)

  const classification = useMemo(() => classifyMarket(symbol), [symbol])
  const playbook = available.find((item) => item.id === playbookId) ?? defaultPlaybook
  const plannedRRR = calculatePlannedRRR({
    direction,
    entry: Number(entry),
    stopLoss: Number(stopLoss),
    takeProfit: Number(takeProfit),
  })
  const advanced = preferences.journalMode === "advanced"
  const values = fieldValueMap(fieldValues)

  async function handleScreenshot(file: File | undefined) {
    if (!file) return
    const data = await readScreenshot(file)
    setScreenshot(data)
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const nextSymbol = classification.symbol || symbol.trim().toUpperCase()
    if (!nextSymbol) {
      setError(copy.form.symbolRequired)
      return
    }
    const entryN = parseOptionalNumber(entry)
    const sl = parseOptionalNumber(stopLoss)
    const tp = parseOptionalNumber(takeProfit)
    if (entryN == null || sl == null || tp == null) {
      setError(copy.form.planRequired)
      return
    }

    const legacy = applyTitanFieldValuesToLegacy(fieldValues)
    const input: NewTradeInput = {
      date: todayIsoDate(),
      symbol: nextSymbol,
      assetClass: classification.assetClass,
      marketType: classification.marketType,
      cotEnabled: classification.cotEnabled,
      direction,
      strategy: playbook?.name ?? DEFAULT_STRATEGY,
      playbookId: playbook?.id ?? TITAN_SWING_PLAYBOOK_ID,
      account: preferences.defaultAccount,
      status: "PLANNED",
      htfTrend: legacy.htfTrend ?? "Uptrend",
      tradeTrend: legacy.tradeTrend ?? "Uptrend",
      location: legacy.location ?? "Discount",
      zoneType: legacy.zoneType ?? "Demand",
      zoneTimeframe: "Daily",
      original: true,
      fresh: true,
      touchCount: "0",
      hq: false,
      impulse: "Normal",
      mitigation: 0,
      cotBias: classification.cotEnabled ? (legacy.cotBias ?? "Neutral") : null,
      cotScore: classification.cotEnabled ? 0 : null,
      commercialsBias: classification.cotEnabled
        ? (legacy.commercialsBias ?? "Neutral")
        : null,
      seasonalityBias: "Neutral",
      seasonalWindow: false,
      grade: legacy.grade ?? "B",
      entry: entryN,
      stopLoss: sl,
      takeProfit: tp,
      riskPercent: parseOptionalNumber(riskPercent) ?? preferences.defaultRisk,
      plannedRRR,
      resultR: null,
      pnl: null,
      notes: notes.trim(),
      screenshot,
      fieldValues: advanced ? fieldValues : [],
      review: null,
    }

    const trade = saveTrade(input)
    router.push(`/journal/${trade.id}`)
  }

  return (
    <PageFrame width="narrow">
      <PageHeader
        title={copy.form.title}
        description={copy.form.description}
      />
      <form onSubmit={handleSubmit} className="space-y-4 pb-16">
        <div className="titan-glass space-y-3 rounded-[10px] p-4">
          <Field label={copy.form.symbol}>
            <Input
              autoFocus
              value={symbol}
              onChange={(event) => setSymbol(event.target.value)}
              placeholder="AUDUSD"
            />
            <MarketBadges classification={classification} />
          </Field>
          <Field label={copy.form.direction}>
            <OptionPills
              value={direction}
              options={TRADE_DIRECTIONS}
              onChange={setDirection}
            />
          </Field>
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label={copy.form.entry}>
              <Input value={entry} onChange={(event) => setEntry(event.target.value)} />
            </Field>
            <Field label={copy.form.stopLoss}>
              <Input
                value={stopLoss}
                onChange={(event) => setStopLoss(event.target.value)}
              />
            </Field>
            <Field label={copy.form.takeProfit}>
              <Input
                value={takeProfit}
                onChange={(event) => setTakeProfit(event.target.value)}
              />
            </Field>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label={copy.form.risk}>
              <Input
                value={riskPercent}
                onChange={(event) => setRiskPercent(event.target.value)}
              />
            </Field>
            <Field label={copy.form.plannedRrr}>
              <p className="flex h-8 items-center font-mono text-sm">
                {formatRRR(plannedRRR)}
              </p>
            </Field>
          </div>
          <Field label={copy.form.playbook}>
            <OptionPills
              value={playbookId}
              options={available.map((item) => item.id)}
              labels={Object.fromEntries(available.map((item) => [item.id, item.name]))}
              onChange={setPlaybookId}
            />
          </Field>
          <Field label={copy.form.screenshot}>
            <Input
              type="file"
              accept="image/*"
              onChange={(event) => handleScreenshot(event.target.files?.[0])}
            />
            {screenshot ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={screenshot}
                alt=""
                className="mt-2 max-h-40 rounded-md border border-border object-contain"
              />
            ) : null}
          </Field>
          <Field label={copy.form.note}>
            <Textarea
              rows={3}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
          </Field>
        </div>

        {advanced && playbook && sortedFields(playbook).length > 0 ? (
          <div className="titan-glass space-y-3 rounded-[10px] p-4">
            <p className="text-sm font-medium">{copy.form.advancedFields}</p>
            {sortedFields(playbook).map((field) => (
              <PlaybookFieldInput
                key={field.id}
                field={field}
                value={values[field.id] ?? null}
                onChange={(value) =>
                  setFieldValues((current) =>
                    upsertFieldValue(current, field.id, value)
                  )
                }
              />
            ))}
          </div>
        ) : null}

        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <Button type="submit">{copy.form.save}</Button>
      </form>
    </PageFrame>
  )
}
