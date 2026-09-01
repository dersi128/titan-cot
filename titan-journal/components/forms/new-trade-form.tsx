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

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10)
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
      setError("Enter a symbol.")
      return
    }

    const entry = parseOptionalNumber(draft.entry)
    const stopLoss = parseOptionalNumber(draft.stopLoss)
    const takeProfit = parseOptionalNumber(draft.takeProfit)
    if (entry == null || stopLoss == null || takeProfit == null) {
      setError("Entry, stop loss and take profit are required.")
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
        title="New Trade"
        description="Capture why the trade exists — context first, numbers second."
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
              Basic Trade
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Symbol"
                  hint={
                    draft.symbol
                      ? formatMarketLabel(classification)
                      : "AUDUSD → Forex · Major"
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
                <Field label="Direction">
                  <OptionPills
                    value={draft.direction}
                    options={TRADE_DIRECTIONS}
                    onChange={(direction) => patch({ direction })}
                  />
                </Field>
                <SelectField
                  label="Strategy"
                  value={draft.strategy}
                  options={STRATEGIES}
                  onChange={(strategy) => patch({ strategy })}
                />
                <SelectField
                  label="Account"
                  value={draft.account}
                  options={ACCOUNTS}
                  onChange={(account) => patch({ account })}
                />
                <Field label="Status">
                  <OptionPills
                    value={draft.status}
                    options={NEW_TRADE_STATUSES}
                    onChange={(status) => patch({ status })}
                  />
                </Field>
                <Field label="Date">
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
              Market Context
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <SelectField
                  label="HTF Trend"
                  value={draft.htfTrend}
                  options={TRENDS}
                  onChange={(htfTrend) => patch({ htfTrend })}
                />
                <SelectField
                  label="Trading TF Trend"
                  value={draft.tradeTrend}
                  options={TRENDS}
                  onChange={(tradeTrend) => patch({ tradeTrend })}
                />
                <SelectField
                  label="Location"
                  value={draft.location}
                  options={LOCATIONS}
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
              Supply / Demand
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Zone Type">
                  <OptionPills
                    value={draft.zoneType}
                    options={ZONE_TYPES}
                    onChange={(zoneType) => patch({ zoneType })}
                  />
                </Field>
                <SelectField
                  label="Zone Timeframe"
                  value={draft.zoneTimeframe}
                  options={ZONE_TIMEFRAMES}
                  onChange={(zoneTimeframe) => patch({ zoneTimeframe })}
                />
                <Field label="Original">
                  <YesNo
                    value={draft.original}
                    onChange={(original) => patch({ original })}
                  />
                </Field>
                <Field label="Fresh">
                  <YesNo
                    value={draft.fresh}
                    onChange={(fresh) => patch({ fresh })}
                  />
                </Field>
                <Field label="Touch Count">
                  <OptionPills
                    value={draft.touchCount}
                    options={TOUCH_COUNTS}
                    onChange={(touchCount) => patch({ touchCount })}
                  />
                </Field>
                <Field label="HQ">
                  <YesNo value={draft.hq} onChange={(hq) => patch({ hq })} />
                </Field>
                <SelectField
                  label="Impulse"
                  value={draft.impulse}
                  options={IMPULSES}
                  onChange={(impulse) => patch({ impulse })}
                />
                <Field
                  label={`Mitigation  ${draft.mitigation}%`}
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
                <Alert className="mt-4 border-amber-500/30 bg-amber-500/10">
                  <AlertTriangle />
                  <AlertTitle>Zone Invalid</AlertTitle>
                  <AlertDescription>
                    Mitigation is above 25%. This is a warning only — the trade
                    can still be saved.
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
                COT
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="COT Bias">
                    <OptionPills
                      value={draft.cotBias}
                      options={BIASES}
                      onChange={(cotBias) => patch({ cotBias })}
                    />
                  </Field>
                  <Field
                    label="COT Score"
                    hint="Manual for now. Later this will come from the TITAN COT API."
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
              Seasonality
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Bias">
                  <OptionPills
                    value={draft.seasonalityBias}
                    options={BIASES}
                    onChange={(seasonalityBias) => patch({ seasonalityBias })}
                  />
                </Field>
                <Field label="Inside Seasonal Window">
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
              Trade Plan
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Entry">
                  <Input
                    type="number"
                    step="any"
                    value={draft.entry}
                    onChange={(event) => patch({ entry: event.target.value })}
                  />
                </Field>
                <Field label="Stop Loss">
                  <Input
                    type="number"
                    step="any"
                    value={draft.stopLoss}
                    onChange={(event) =>
                      patch({ stopLoss: event.target.value })
                    }
                  />
                </Field>
                <Field label="Take Profit">
                  <Input
                    type="number"
                    step="any"
                    value={draft.takeProfit}
                    onChange={(event) =>
                      patch({ takeProfit: event.target.value })
                    }
                  />
                </Field>
                <Field label="Risk %">
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
                  <p className="text-xs text-muted-foreground">Risk</p>
                  <p className="mt-1 font-mono">{riskPercent}%</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Planned RRR</p>
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
              Grade
            </AccordionTrigger>
            <AccordionContent>
              <OptionPills
                value={draft.grade}
                options={GRADES}
                onChange={(grade) => patch({ grade })}
              />
              <p className="mt-3 text-xs text-muted-foreground">
                Automatic grading will be added later.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem
            value="notes"
            className="rounded-xl border border-border bg-card px-4 not-last:border-b-0"
          >
            <AccordionTrigger className="hover:no-underline">
              Notes
            </AccordionTrigger>
            <AccordionContent>
              <Field label="Why am I taking this trade?">
                <Textarea
                  value={draft.notes}
                  onChange={(event) => patch({ notes: event.target.value })}
                  placeholder="Why am I taking this trade?"
                  rows={5}
                />
              </Field>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {error ? (
          <Alert variant="destructive">
            <AlertTitle>Cannot save yet</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <div className="sticky bottom-0 -mx-4 border-t border-border bg-background/90 px-4 py-3 backdrop-blur lg:-mx-8 lg:px-8">
          <Button type="submit" className="w-full sm:w-auto">
            Save Trade
          </Button>
        </div>
      </form>
    </PageFrame>
  )
}
