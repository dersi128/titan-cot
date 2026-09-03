"use client"

import { useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"

import { Field, OptionPills } from "@/components/forms/field"
import { PageFrame, PageHeader } from "@/components/layout/page-header"
import { useWorkspaceChrome } from "@/components/layout/workspace-chrome"
import { useWorkspace } from "@/components/layout/workspace-provider"
import { PlaybookFieldInput } from "@/components/playbooks/playbook-field-input"
import { MarketBadges } from "@/components/trades/market-badges"
import { useTrades } from "@/components/trades/trades-provider"
import { SaveButton } from "@/components/forms/save-button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { classifyMarket } from "@/lib/market-classification"
import { dollarsPerR } from "@/lib/account-scope"
import { formatUsd } from "@/lib/format"
import { isDirty } from "@/lib/dirty"
import { ACCOUNT_LABELS, copy } from "@/lib/labels"
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
  ACCOUNTS,
  DEFAULT_STRATEGY,
  TRADE_DIRECTIONS,
  type Account,
  type Trade,
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
  return <TradeForm />
}

export function TradeForm({ trade }: { trade?: Trade }) {
  const router = useRouter()
  const { saveTrade, updateTrade } = useTrades()
  const { preferences, playbooks, profile } = useWorkspace()
  const { account: chromeAccount } = useWorkspaceChrome()
  const editing = trade != null
  const available = activePlaybooks(playbooks)
  const currentPlaybook = trade
    ? playbooks.find((item) => item.id === trade.playbookId)
    : undefined
  const playbookOptions =
    currentPlaybook && currentPlaybook.status === "archived"
      ? [currentPlaybook, ...available]
      : available
  const defaultPlaybook =
    playbookOptions.find((item) => item.id === (trade?.playbookId ?? preferences.defaultPlaybookId)) ??
    playbookOptions[0]

  const [date, setDate] = useState(trade?.date ?? todayIsoDate())
  const [symbol, setSymbol] = useState(trade?.symbol ?? "")
  const [direction, setDirection] = useState<TradeDirection>(trade?.direction ?? "LONG")
  const [entry, setEntry] = useState(trade ? String(trade.entry) : "")
  const [stopLoss, setStopLoss] = useState(trade ? String(trade.stopLoss) : "")
  const [takeProfit, setTakeProfit] = useState(trade ? String(trade.takeProfit) : "")
  const [riskPercent, setRiskPercent] = useState(
    String(trade?.riskPercent ?? profile.riskPercent ?? preferences.defaultRisk)
  )
  const [account, setAccount] = useState<Account>(
    trade?.account ?? chromeAccount
  )
  const [playbookId, setPlaybookId] = useState(
    defaultPlaybook?.id ?? TITAN_SWING_PLAYBOOK_ID
  )
  const [notes, setNotes] = useState(trade?.notes ?? "")
  const [screenshot, setScreenshot] = useState<string | null>(trade?.screenshot ?? null)
  const [fieldValues, setFieldValues] = useState<TradeFieldValue[]>(
    trade?.fieldValues ?? []
  )
  const [resultR, setResultR] = useState(
    trade?.resultR == null ? "" : String(trade.resultR)
  )
  const [pnl, setPnl] = useState(trade?.pnl == null ? "" : String(trade.pnl))
  const [error, setError] = useState<string | null>(null)

  const draft = {
    date,
    symbol,
    direction,
    entry,
    stopLoss,
    takeProfit,
    riskPercent,
    account,
    playbookId,
    notes,
    screenshot,
    fieldValues,
    resultR,
    pnl,
  }
  const baseline = useRef(draft)
  const dirty = isDirty(draft, baseline.current)

  const classification = useMemo(() => classifyMarket(symbol), [symbol])
  const playbook =
    playbookOptions.find((item) => item.id === playbookId) ?? defaultPlaybook
  const plannedRRR = calculatePlannedRRR({
    direction,
    entry: Number(entry),
    stopLoss: Number(stopLoss),
    takeProfit: Number(takeProfit),
  })
  const advanced = preferences.journalMode === "advanced"
  const values = fieldValueMap(fieldValues)
  const showResult =
    editing && (trade.status === "CLOSED" || trade.status === "REVIEWED")
  const riskUsd = dollarsPerR(
    profile.capital[account],
    parseOptionalNumber(riskPercent) ?? profile.riskPercent
  )

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

    const nextFieldValues = advanced
      ? fieldValues
      : (trade?.fieldValues ?? [])
    const legacy = applyTitanFieldValuesToLegacy(nextFieldValues)
    const patch = {
      date: date || todayIsoDate(),
      symbol: nextSymbol,
      assetClass: classification.assetClass,
      marketType: classification.marketType,
      cotEnabled: classification.cotEnabled,
      direction,
      strategy: playbook?.name ?? DEFAULT_STRATEGY,
      playbookId: playbook?.id ?? TITAN_SWING_PLAYBOOK_ID,
      account,
      htfTrend: legacy.htfTrend ?? trade?.htfTrend ?? "Uptrend",
      tradeTrend: legacy.tradeTrend ?? trade?.tradeTrend ?? "Uptrend",
      location: legacy.location ?? trade?.location ?? "Discount",
      zoneType: legacy.zoneType ?? trade?.zoneType ?? "Demand",
      cotBias: classification.cotEnabled
        ? (legacy.cotBias ?? trade?.cotBias ?? "Neutral")
        : null,
      commercialsBias: classification.cotEnabled
        ? (legacy.commercialsBias ?? trade?.commercialsBias ?? "Neutral")
        : null,
      grade: legacy.grade ?? trade?.grade ?? "B",
      entry: entryN,
      stopLoss: sl,
      takeProfit: tp,
      riskPercent: parseOptionalNumber(riskPercent) ?? profile.riskPercent,
      plannedRRR,
      notes: notes.trim(),
      screenshot,
      fieldValues: nextFieldValues,
    }

    if (trade) {
      const nextR = showResult ? parseOptionalNumber(resultR) : trade.resultR
      const nextPnl = showResult ? parseOptionalNumber(pnl) : trade.pnl
      updateTrade({
        ...trade,
        ...patch,
        cotScore: classification.cotEnabled ? (trade.cotScore ?? 0) : null,
        resultR: nextR,
        pnl: nextPnl,
      })
      router.push(`/journal/${trade.id}`)
      return
    }

    const created = saveTrade({
      ...patch,
      status: "PLANNED",
      zoneTimeframe: "Daily",
      original: true,
      fresh: true,
      touchCount: "0",
      hq: false,
      impulse: "Normal",
      mitigation: 0,
      cotScore: classification.cotEnabled ? 0 : null,
      seasonalityBias: "Neutral",
      seasonalWindow: false,
      resultR: null,
      pnl: null,
      review: null,
    })
    router.push(`/journal/${created.id}`)
  }

  return (
    <PageFrame width="narrow">
      <PageHeader
        title={editing ? copy.form.editTitle : copy.form.title}
        description={
          editing ? copy.form.editDescription : copy.form.description
        }
      />
      <form onSubmit={handleSubmit} className="space-y-4 pb-16">
        <div className="titan-glass space-y-3 rounded-[10px] p-4">
          {editing ? (
            <Field label={copy.form.date}>
              <Input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
              />
            </Field>
          ) : null}
          <Field label={copy.form.account}>
            <OptionPills
              value={account}
              options={ACCOUNTS}
              labels={ACCOUNT_LABELS}
              onChange={setAccount}
            />
          </Field>
          <Field label={copy.form.symbol}>
            <Input
              autoFocus={!editing}
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
            <Field
              label={copy.form.risk}
              hint={
                riskUsd > 0
                  ? `${formatUsd(riskUsd)} ${copy.form.riskHint}`
                  : undefined
              }
            >
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
              options={playbookOptions.map((item) => item.id)}
              labels={Object.fromEntries(
                playbookOptions.map((item) => [item.id, item.name])
              )}
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
          {showResult ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label={copy.detail.resultR}>
                <Input
                  value={resultR}
                  onChange={(event) => setResultR(event.target.value)}
                />
              </Field>
              <Field label={copy.detail.pnl}>
                <Input
                  value={pnl}
                  onChange={(event) => setPnl(event.target.value)}
                />
              </Field>
            </div>
          ) : null}
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
        <SaveButton type="submit" dirty={dirty}>
          {editing ? copy.form.saveChanges : copy.form.save}
        </SaveButton>
      </form>
    </PageFrame>
  )
}
