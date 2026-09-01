"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { AlertTriangle } from "lucide-react"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { Field, OptionPills } from "@/components/forms/field"
import { SelectField } from "@/components/forms/select-field"
import { PageFrame, PageHeader } from "@/components/layout/page-header"
import { useTrades } from "@/components/trades/trades-provider"
import {
  classifyMarket,
  formatMarketLabel,
  shouldDisplayCot,
} from "@/lib/market-classification"
import {
  ACCOUNT_LABELS,
  BIAS_LABELS,
  copy,
  IMPULSE_LABELS,
  LOCATION_LABELS,
  STATUS_LABELS,
  TREND_LABELS,
  YES_NO_LABELS,
  ZONE_TIMEFRAME_LABELS,
  ZONE_TYPE_LABELS,
} from "@/lib/labels"
import { todayIsoDate } from "@/lib/locale"
import {
  calculatePlannedRRR,
  formatRRR,
  isZoneInvalid,
  parseOptionalNumber,
} from "@/lib/trade-calculations"
import {
  ACCOUNTS,
  BIASES,
  GRADES,
  IMPULSES,
  LOCATIONS,
  NEW_TRADE_STATUSES,
  STRATEGIES,
  TOUCH_COUNTS,
  TRADE_DIRECTIONS,
  TRENDS,
  ZONE_TIMEFRAMES,
  ZONE_TYPES,
  type Account,
  type Bias,
  type Grade,
  type Impulse,
  type Location,
  type NewTradeInput,
  type NewTradeStatus,
  type Strategy,
  type TouchCount,
  type TradeDirection,
  type Trend,
  type ZoneTimeframe,
  type ZoneType,
} from "@/types/trade"

const YES_NO = ["YES", "NO"] as const

type Draft = {
  symbol: string
  direction: TradeDirection
  strategy: Strategy
  account: Account
  status: NewTradeStatus
  date: string
  htfTrend: Trend
  tradeTrend: Trend
  location: Location
  zoneType: ZoneType
  zoneTimeframe: ZoneTimeframe
  original: boolean
  fresh: boolean
  touchCount: TouchCount
  hq: boolean
  impulse: Impulse
  mitigation: number
  cotBias: Bias
  cotScore: string
  seasonalityBias: Bias
  seasonalWindow: boolean
  grade: Grade
  entry: string
  stopLoss: string
  takeProfit: string
  riskPercent: string
  notes: string
}

function createDraft(): Draft {
  return {
    symbol: "",
    direction: "LONG",
    strategy: "TITAN Swing",
    account: "Personal",
    status: "PLANNED",
    date: todayIsoDate(),
    htfTrend: "Uptrend",
    tradeTrend: "Uptrend",
    location: "Discount",
    zoneType: "Demand",
    zoneTimeframe: "Daily",
    original: true,
    fresh: true,
    touchCount: "0",
    hq: true,
    impulse: "Strong",
    mitigation: 0,
    cotBias: "Neutral",
    cotScore: "0",
    seasonalityBias: "Neutral",
    seasonalWindow: false,
    grade: "A",
    entry: "",
    stopLoss: "",
    takeProfit: "",
    riskPercent: "1",
    notes: "",
  }
}

const OPEN_SECTIONS = [
  "basic",
  "context",
  "sd",
  "cot",
  "seasonality",
  "plan",
  "grade",
  "notes",
]

function YesNo({
  value,
  onChange,
}: {
  value: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <OptionPills
      value={value ? "YES" : "NO"}
      options={YES_NO}
      labels={YES_NO_LABELS}
      onChange={(next) => onChange(next === "YES")}
    />
  )
}

export function NewTradeForm() {
  const router = useRouter()
  const { saveTrade } = useTrades()
  const [draft, setDraft] = useState<Draft>(createDraft)
  const [error, setError] = useState<string | null>(null)

  const classification = useMemo(
    () => classifyMarket(draft.symbol),
    [draft.symbol]
  )
  const showCot = shouldDisplayCot(classification)

  const plannedRRR = useMemo(() => {
    const entry = parseOptionalNumber(draft.entry)
    const stopLoss = parseOptionalNumber(draft.stopLoss)
    const takeProfit = parseOptionalNumber(draft.takeProfit)
    if (entry == null || stopLoss == null || takeProfit == null) return null
    return calculatePlannedRRR({
      direction: draft.direction,
      entry,
      stopLoss,
      takeProfit,
    })
  }, [draft.direction, draft.entry, draft.stopLoss, draft.takeProfit])

  const zoneInvalid = isZoneInvalid(draft.mitigation)
  const riskPercent = parseOptionalNumber(draft.riskPercent) ?? 1

  function patch(update: Partial<Draft>) {
    setDraft((current) => ({ ...current, ...update }))
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    const symbol = classification.symbol
    if (!symbol) {
      setError(copy.form.symbolRequired)
      return
    }

    const entry = parseOptionalNumber(draft.entry)
    const stopLoss = parseOptionalNumber(draft.stopLoss)
    const takeProfit = parseOptionalNumber(draft.takeProfit)
    if (entry == null || stopLoss == null || takeProfit == null) {
      setError(copy.form.planRequired)
      return
    }

    const cotScore = parseOptionalNumber(draft.cotScore) ?? 0

    const input: NewTradeInput = {
      date: draft.date,
      symbol,
      marketType: classification.marketType,
      pairClass: classification.pairClass,
      direction: draft.direction,
      strategy: draft.strategy,
      account: draft.account,
      status: draft.status,
      htfTrend: draft.htfTrend,
      tradeTrend: draft.tradeTrend,
      location: draft.location,
      zoneType: draft.zoneType,
      zoneTimeframe: draft.zoneTimeframe,
      original: draft.original,
      fresh: draft.fresh,
      touchCount: draft.touchCount,
      hq: draft.hq,
      impulse: draft.impulse,
      mitigation: draft.mitigation,
      cotBias: draft.cotBias,
      cotScore: Math.min(100, Math.max(-100, cotScore)),
      seasonalityBias: draft.seasonalityBias,
      seasonalWindow: draft.seasonalWindow,
      grade: draft.grade,
      entry,
      stopLoss,
      takeProfit,
      riskPercent,
      plannedRRR,
      resultR: null,
      pnl: null,
      notes: draft.notes.trim(),
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

      <form onSubmit={handleSubmit} className="space-y-3 pb-20">
        <Accordion
          type="multiple"
          defaultValue={OPEN_SECTIONS}
          className="gap-3"
        >
          <AccordionItem
            value="basic"
            className="rounded-xl border border-border bg-card px-4 not-last:border-b-0"
          >
            <AccordionTrigger className="hover:no-underline">
              {copy.form.basic}
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label={copy.form.symbol}
                  hint={
                    !draft.symbol
                      ? copy.form.symbolHint
                      : classification.symbol.length < 6
                        ? copy.form.symbolIncomplete
                        : formatMarketLabel(classification)
                  }
                  className="sm:col-span-2"
                >
                  <Input
                    value={draft.symbol}
                    onChange={(event) =>
                      patch({ symbol: event.target.value.toUpperCase() })
                    }
                    placeholder="EURUSD"
                    autoComplete="off"
                  />
                </Field>
                <Field label={copy.form.direction}>
                  <OptionPills
                    value={draft.direction}
                    options={TRADE_DIRECTIONS}
                    onChange={(direction) => patch({ direction })}
                  />
                </Field>
                <SelectField
                  label={copy.form.strategy}
                  value={draft.strategy}
                  options={STRATEGIES}
                  onChange={(strategy) => patch({ strategy })}
                />
                <SelectField
                  label={copy.form.account}
                  value={draft.account}
                  options={ACCOUNTS}
                  labels={ACCOUNT_LABELS}
                  onChange={(account) => patch({ account })}
                />
                <Field label={copy.form.status}>
                  <OptionPills
                    value={draft.status}
                    options={NEW_TRADE_STATUSES}
                    labels={STATUS_LABELS}
                    onChange={(status) => patch({ status })}
                  />
                </Field>
                <Field label={copy.form.date}>
                  <Input
                    type="date"
                    value={draft.date}
                    onChange={(event) => patch({ date: event.target.value })}
                  />
                </Field>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem
            value="context"
            className="rounded-xl border border-border bg-card px-4 not-last:border-b-0"
          >
            <AccordionTrigger className="hover:no-underline">
              {copy.form.context}
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <SelectField
                  label={copy.form.htfTrend}
                  value={draft.htfTrend}
                  options={TRENDS}
                  labels={TREND_LABELS}
                  onChange={(htfTrend) => patch({ htfTrend })}
                />
                <SelectField
                  label={copy.form.tradeTrend}
                  value={draft.tradeTrend}
                  options={TRENDS}
                  labels={TREND_LABELS}
                  onChange={(tradeTrend) => patch({ tradeTrend })}
                />
                <SelectField
                  label={copy.form.location}
                  value={draft.location}
                  options={LOCATIONS}
                  labels={LOCATION_LABELS}
                  onChange={(location) => patch({ location })}
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem
            value="sd"
            className="rounded-xl border border-border bg-card px-4 not-last:border-b-0"
          >
            <AccordionTrigger className="hover:no-underline">
              {copy.form.supplyDemand}
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={copy.form.zoneType}>
                  <OptionPills
                    value={draft.zoneType}
                    options={ZONE_TYPES}
                    labels={ZONE_TYPE_LABELS}
                    onChange={(zoneType) => patch({ zoneType })}
                  />
                </Field>
                <SelectField
                  label={copy.form.zoneTimeframe}
                  value={draft.zoneTimeframe}
                  options={ZONE_TIMEFRAMES}
                  labels={ZONE_TIMEFRAME_LABELS}
                  onChange={(zoneTimeframe) => patch({ zoneTimeframe })}
                />
                <Field label={copy.form.original}>
                  <YesNo
                    value={draft.original}
                    onChange={(original) => patch({ original })}
                  />
                </Field>
                <Field label={copy.form.fresh}>
                  <YesNo
                    value={draft.fresh}
                    onChange={(fresh) => patch({ fresh })}
                  />
                </Field>
                <Field label={copy.form.touchCount}>
                  <OptionPills
                    value={draft.touchCount}
                    options={TOUCH_COUNTS}
                    onChange={(touchCount) => patch({ touchCount })}
                  />
                </Field>
                <Field label={copy.form.hq}>
                  <YesNo value={draft.hq} onChange={(hq) => patch({ hq })} />
                </Field>
                <SelectField
                  label={copy.form.impulse}
                  value={draft.impulse}
                  options={IMPULSES}
                  labels={IMPULSE_LABELS}
                  onChange={(impulse) => patch({ impulse })}
                />
                <Field
                  label={`${copy.form.mitigation}  ${draft.mitigation} %`}
                  hint={
                    zoneInvalid ? (
                      <span className="text-amber-400">
                        {copy.form.zoneInvalidHint}
                      </span>
                    ) : undefined
                  }
                  className="sm:col-span-2"
                >
                  <Slider
                    min={0}
                    max={100}
                    step={1}
                    value={[draft.mitigation]}
                    onValueChange={([mitigation]) =>
                      patch({ mitigation: mitigation ?? 0 })
                    }
                  />
                </Field>
              </div>
              {zoneInvalid ? (
                <Alert className="mt-4 border-amber-500/40 bg-amber-500/15 text-amber-200">
                  <AlertTriangle />
                  <AlertTitle>{copy.form.zoneInvalidTitle}</AlertTitle>
                  <AlertDescription className="text-amber-200/80">
                    {copy.form.zoneInvalidBody}
                  </AlertDescription>
                </Alert>
              ) : null}
            </AccordionContent>
          </AccordionItem>

          {showCot ? (
            <AccordionItem
              value="cot"
              className="rounded-xl border border-border bg-card px-4 not-last:border-b-0"
            >
              <AccordionTrigger className="hover:no-underline">
                {copy.form.cot}
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label={copy.form.cotBias}>
                    <OptionPills
                      value={draft.cotBias}
                      options={BIASES}
                      labels={BIAS_LABELS}
                      onChange={(cotBias) => patch({ cotBias })}
                    />
                  </Field>
                  <Field
                    label={copy.form.cotScore}
                    hint={copy.form.cotHint}
                  >
                    <Input
                      type="number"
                      min={-100}
                      max={100}
                      value={draft.cotScore}
                      onChange={(event) =>
                        patch({ cotScore: event.target.value })
                      }
                    />
                  </Field>
                </div>
              </AccordionContent>
            </AccordionItem>
          ) : null}

          <AccordionItem
            value="seasonality"
            className="rounded-xl border border-border bg-card px-4 not-last:border-b-0"
          >
            <AccordionTrigger className="hover:no-underline">
              {copy.form.seasonality}
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={copy.form.seasonalityBias}>
                  <OptionPills
                    value={draft.seasonalityBias}
                    options={BIASES}
                    labels={BIAS_LABELS}
                    onChange={(seasonalityBias) => patch({ seasonalityBias })}
                  />
                </Field>
                <Field label={copy.form.seasonalWindow}>
                  <YesNo
                    value={draft.seasonalWindow}
                    onChange={(seasonalWindow) => patch({ seasonalWindow })}
                  />
                </Field>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem
            value="plan"
            className="rounded-xl border border-border bg-card px-4 not-last:border-b-0"
          >
            <AccordionTrigger className="hover:no-underline">
              {copy.form.plan}
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={copy.form.entry}>
                  <Input
                    type="number"
                    step="any"
                    value={draft.entry}
                    onChange={(event) => patch({ entry: event.target.value })}
                  />
                </Field>
                <Field label={copy.form.stopLoss}>
                  <Input
                    type="number"
                    step="any"
                    value={draft.stopLoss}
                    onChange={(event) =>
                      patch({ stopLoss: event.target.value })
                    }
                  />
                </Field>
                <Field label={copy.form.takeProfit}>
                  <Input
                    type="number"
                    step="any"
                    value={draft.takeProfit}
                    onChange={(event) =>
                      patch({ takeProfit: event.target.value })
                    }
                  />
                </Field>
                <Field label={copy.form.riskPercent}>
                  <Input
                    type="number"
                    step="any"
                    min={0}
                    value={draft.riskPercent}
                    onChange={(event) =>
                      patch({ riskPercent: event.target.value })
                    }
                  />
                </Field>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 rounded-lg border border-border px-3 py-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">{copy.form.risk}</p>
                  <p className="mt-1 font-mono">{riskPercent} %</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    {copy.form.plannedRrr}
                  </p>
                  <p className="mt-1 font-mono">{formatRRR(plannedRRR)}</p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem
            value="grade"
            className="rounded-xl border border-border bg-card px-4 not-last:border-b-0"
          >
            <AccordionTrigger className="hover:no-underline">
              {copy.form.grade}
            </AccordionTrigger>
            <AccordionContent>
              <OptionPills
                value={draft.grade}
                options={GRADES}
                onChange={(grade) => patch({ grade })}
              />
              <p className="mt-3 text-xs text-muted-foreground">
                {copy.form.gradeHint}
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem
            value="notes"
            className="rounded-xl border border-border bg-card px-4 not-last:border-b-0"
          >
            <AccordionTrigger className="hover:no-underline">
              {copy.form.notes}
            </AccordionTrigger>
            <AccordionContent>
              <Field label={copy.form.why}>
                <Textarea
                  value={draft.notes}
                  onChange={(event) => patch({ notes: event.target.value })}
                  placeholder={copy.form.why}
                  rows={5}
                />
              </Field>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {error ? (
          <Alert variant="destructive">
            <AlertTitle>{copy.form.cannotSave}</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <div className="sticky bottom-0 -mx-4 border-t border-border bg-background/90 px-4 py-3 backdrop-blur lg:-mx-8 lg:px-8">
          <Button type="submit" className="w-full sm:w-auto">
            {copy.form.save}
          </Button>
        </div>
      </form>
    </PageFrame>
  )
}
