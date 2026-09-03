"use client"

import { useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"

import { Field, OptionPills } from "@/components/forms/field"
import { PageFrame, PageHeader } from "@/components/layout/page-header"
import { useWorkspaceChrome } from "@/components/layout/workspace-chrome"
import { useWorkspace } from "@/components/layout/workspace-provider"
import { PlaybookFieldInput } from "@/components/playbooks/playbook-field-input"
import { MarketBadges } from "@/components/trades/market-badges"
import { DirectionBadge } from "@/components/trades/trade-badges"
import { useTrades } from "@/components/trades/trades-provider"
import { SaveButton } from "@/components/forms/save-button"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { classifyMarket } from "@/lib/market-classification"
import { dollarsPerR } from "@/lib/account-scope"
import { formatMoney } from "@/lib/format"
import { isDirty } from "@/lib/dirty"
import { useLabels } from "@/lib/use-labels"
import { todayIsoDate } from "@/lib/locale"
import { ingestScreenshot, isHttpUrl } from "@/lib/screenshot"
import { applyTitanFieldValuesToLegacy } from "@/lib/playbook-legacy"
import {
  activePlaybooks,
  fieldValueMap,
  sortedFields,
  TITAN_SWING_PLAYBOOK_ID,
  upsertFieldValue,
} from "@/lib/playbooks"
import {
  recentTradeTemplates,
  type TradeTemplate,
} from "@/lib/recent-trade-templates"
import {
  calculatePlannedRRR,
  formatRRR,
  parseOptionalNumber,
} from "@/lib/trade-calculations"
import { cn } from "@/lib/utils"
import type { TradeFieldValue } from "@/types/playbook"
import {
  ACCOUNTS,
  DEFAULT_STRATEGY,
  TRADE_DIRECTIONS,
  type Account,
  type Trade,
  type TradeDirection,
} from "@/types/trade"

const NOTES_MAX = 1000

function PreviewRow({
  label,
  value,
  className,
}: {
  label: string
  value: string
  className?: string
}) {
  return (
    <p className="flex items-baseline justify-between gap-3 text-[12px]">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("font-mono tabular-nums text-foreground", className)}>
        {value}
      </span>
    </p>
  )
}

export function NewTradeForm() {
  return <TradeForm />
}

export function TradeForm({ trade }: { trade?: Trade }) {
  const { copy, ACCOUNT_LABELS } = useLabels()
  const router = useRouter()
  const { saveTrade, updateTrade, trades } = useTrades()
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
  const playbookNames = useMemo(
    () => Object.fromEntries(playbooks.map((item) => [item.id, item.name])),
    [playbooks]
  )
  const activePlaybookIds = useMemo(
    () => new Set(available.map((item) => item.id)),
    [available]
  )
  const templates = useMemo(
    () =>
      editing ? [] : recentTradeTemplates(trades, 6, activePlaybookIds),
    [editing, trades, activePlaybookIds]
  )

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
  const [screenshotUrl, setScreenshotUrl] = useState(
    trade?.screenshot && isHttpUrl(trade.screenshot) ? trade.screenshot : ""
  )
  const [screenshotError, setScreenshotError] = useState<string | null>(null)
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
  const potentialUsd =
    riskUsd > 0 && plannedRRR != null ? Math.round(riskUsd * plannedRRR * 100) / 100 : 0
  const previewSymbol = classification.symbol || symbol.trim().toUpperCase()
  const money = (value: number) => formatMoney(value, profile.currency)

  function resetForm() {
    setDate(todayIsoDate())
    setSymbol("")
    setDirection("LONG")
    setEntry("")
    setStopLoss("")
    setTakeProfit("")
    setRiskPercent(String(profile.riskPercent ?? preferences.defaultRisk))
    setAccount(chromeAccount)
    setPlaybookId(defaultPlaybook?.id ?? TITAN_SWING_PLAYBOOK_ID)
    setNotes("")
    setScreenshot(null)
    setScreenshotUrl("")
    setScreenshotError(null)
    setFieldValues([])
    setResultR("")
    setPnl("")
    setError(null)
  }

  function applyTemplate(template: TradeTemplate) {
    setSymbol(template.symbol)
    setDirection(template.direction)
    setPlaybookId(template.playbookId)
    setAccount(template.account)
    setRiskPercent(String(template.riskPercent))
    setError(null)
  }

  async function applyScreenshot(source: Blob | string | undefined) {
    if (!source) return
    const result = await ingestScreenshot(source)
    if (!result.ok) {
      setScreenshotError(copy.form.screenshotError)
      return
    }
    setScreenshot(result.value)
    setScreenshotUrl(isHttpUrl(result.value) ? result.value : "")
    setScreenshotError(null)
  }

  async function handlePaste(event: React.ClipboardEvent) {
    const data = event.clipboardData
    if (!data) return
    const image = [...data.items].find((item) => item.type.startsWith("image/"))
    if (image) {
      const file = image.getAsFile()
      if (!file) return
      event.preventDefault()
      await applyScreenshot(file)
      return
    }
    const target = event.target as HTMLElement | null
    const allowUrl =
      target?.closest("[data-screenshot-drop]") ||
      target?.closest("[data-screenshot-url]")
    if (!allowUrl) return
    const text = data.getData("text/plain").trim()
    if (!text) return
    if (isHttpUrl(text) || text.startsWith("data:image/")) {
      event.preventDefault()
      await applyScreenshot(text)
    }
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
      screenshot:
        screenshotUrl.trim() && isHttpUrl(screenshotUrl.trim())
          ? screenshotUrl.trim()
          : screenshot,
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
    <PageFrame>
      <PageHeader
        title={editing ? copy.form.editTitle : copy.form.title}
        description={
          editing ? copy.form.editDescription : copy.form.description
        }
        actions={
          editing ? undefined : (
            <Button type="button" variant="ghost" onClick={resetForm}>
              {copy.form.clear}
            </Button>
          )
        }
      />
      <form onSubmit={handleSubmit} className="space-y-4 pb-16">
        {templates.length > 0 ? (
          <div>
            <p className="mb-2 text-[11px] font-medium tracking-wide text-muted-foreground">
              {copy.form.templates}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {templates.map((template) => (
                <button
                  key={template.key}
                  type="button"
                  onClick={() => applyTemplate(template)}
                  className="titan-glass rounded-[8px] border border-transparent px-2.5 py-1.5 text-left transition-colors hover:border-primary/30"
                >
                  <span className="text-[12px] font-semibold">{template.symbol}</span>
                  <span
                    className={cn(
                      "ml-1.5 text-[10px] font-semibold uppercase",
                      template.direction === "LONG" ? "text-bull" : "text-bear"
                    )}
                  >
                    {template.direction}
                  </span>
                  {playbookNames[template.playbookId] ? (
                    <span className="ml-1.5 text-[11px] text-muted-foreground">
                      {playbookNames[template.playbookId]}
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(240px,300px)] lg:items-start">
          <div className="space-y-4">
            <div className="titan-glass space-y-3 rounded-[10px] p-4">
              <p className="text-sm font-medium">{copy.form.basics}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label={copy.form.date}>
                  <Input
                    type="date"
                    value={date}
                    onChange={(event) => setDate(event.target.value)}
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
              </div>
              <Field label={copy.form.account}>
                <OptionPills
                  value={account}
                  options={ACCOUNTS}
                  labels={ACCOUNT_LABELS}
                  onChange={setAccount}
                />
              </Field>
              <Field label={copy.form.direction}>
                <OptionPills
                  value={direction}
                  options={TRADE_DIRECTIONS}
                  accents={{ LONG: "bull", SHORT: "bear" }}
                  onChange={setDirection}
                />
              </Field>
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
            </div>

            <div className="titan-glass space-y-3 rounded-[10px] p-4">
              <p className="text-sm font-medium">{copy.form.plan}</p>
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
                      ? `${money(riskUsd)} ${copy.form.riskHint}`
                      : undefined
                  }
                >
                  <Input
                    value={riskPercent}
                    onChange={(event) => setRiskPercent(event.target.value)}
                  />
                </Field>
                <Field
                  label={copy.form.plannedRrr}
                  hint={
                    potentialUsd > 0
                      ? `${copy.form.potential}: ${money(potentialUsd)}`
                      : undefined
                  }
                >
                  <p className="flex h-8 items-center font-mono text-sm">
                    {formatRRR(plannedRRR)}
                  </p>
                </Field>
              </div>
            </div>

            {showResult ? (
              <div className="titan-glass space-y-3 rounded-[10px] p-4">
                <p className="text-sm font-medium">{copy.detail.result}</p>
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
              </div>
            ) : null}

            <div
              className="titan-glass space-y-3 rounded-[10px] p-4"
              onPaste={(event) => {
                void handlePaste(event)
              }}
            >
              <Field
                label={copy.form.note}
                hint={copy.form.noteLimit.replace("{n}", String(notes.length))}
              >
                <Textarea
                  rows={3}
                  value={notes}
                  maxLength={NOTES_MAX}
                  onChange={(event) => setNotes(event.target.value.slice(0, NOTES_MAX))}
                />
              </Field>
              <Field label={copy.form.screenshot}>
                <div
                  tabIndex={0}
                  data-screenshot-drop=""
                  className="flex cursor-pointer flex-col items-center justify-center rounded-[10px] border border-dashed border-border px-3 py-6 text-center text-[12px] text-muted-foreground outline-none focus-visible:border-primary/50"
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => {
                    event.preventDefault()
                    const file = event.dataTransfer.files?.[0]
                    if (file) {
                      void applyScreenshot(file)
                      return
                    }
                    const uri =
                      event.dataTransfer.getData("text/uri-list") ||
                      event.dataTransfer.getData("text/plain")
                    const first = uri.split("\n").map((line) => line.trim())[0]
                    if (first) void applyScreenshot(first)
                  }}
                >
                  <p>{copy.form.screenshotHint}</p>
                  <label className="mt-2 cursor-pointer text-[12px] font-medium text-primary">
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={(event) => {
                        void applyScreenshot(event.target.files?.[0])
                        event.target.value = ""
                      }}
                    />
                    {copy.form.screenshot}
                  </label>
                </div>
                <Input
                  type="text"
                  inputMode="url"
                  data-screenshot-url=""
                  value={screenshotUrl}
                  placeholder={copy.form.screenshotUrl}
                  onChange={(event) => setScreenshotUrl(event.target.value)}
                  onBlur={() => {
                    if (screenshotUrl.trim()) void applyScreenshot(screenshotUrl)
                  }}
                  onKeyDown={(event) => {
                    if (event.key !== "Enter") return
                    event.preventDefault()
                    if (screenshotUrl.trim()) void applyScreenshot(screenshotUrl)
                  }}
                />
                {screenshotError ? (
                  <p className="text-[12px] text-destructive">{screenshotError}</p>
                ) : null}
                {screenshot ? (
                  <div className="space-y-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={screenshot}
                      alt=""
                      className="max-h-40 rounded-md border border-border object-contain"
                      onError={() => setScreenshotError(copy.form.screenshotError)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 text-[12px]"
                      onClick={() => {
                        setScreenshot(null)
                        setScreenshotUrl("")
                        setScreenshotError(null)
                      }}
                    >
                      {copy.form.screenshotRemove}
                    </Button>
                  </div>
                ) : null}
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
          </div>

          <aside className="titan-glass space-y-3 rounded-[10px] p-4 lg:sticky lg:top-4">
            <p className="text-sm font-medium">{copy.form.preview}</p>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-base font-semibold tracking-tight">
                {previewSymbol || "—"}
              </p>
              <DirectionBadge direction={direction} />
            </div>
            <MarketBadges classification={classification} />
            <div className="space-y-1.5 border-t border-border pt-3">
              <PreviewRow
                label={copy.form.account}
                value={ACCOUNT_LABELS[account]}
                className="font-sans"
              />
              <PreviewRow
                label={copy.form.playbook}
                value={playbook?.name ?? "—"}
                className="font-sans"
              />
              <PreviewRow label={copy.form.entry} value={entry || "—"} />
              <PreviewRow label={copy.form.stopLoss} value={stopLoss || "—"} />
              <PreviewRow label={copy.form.takeProfit} value={takeProfit || "—"} />
              <PreviewRow
                label={copy.form.risk}
                value={riskUsd > 0 ? `${riskPercent}% · ${money(riskUsd)}` : `${riskPercent}%`}
              />
              <PreviewRow label={copy.form.plannedRrr} value={formatRRR(plannedRRR)} />
              {potentialUsd > 0 ? (
                <PreviewRow
                  label={copy.form.potential}
                  value={money(potentialUsd)}
                />
              ) : null}
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <SaveButton type="submit" dirty={dirty} className="w-full">
              {editing ? copy.form.saveChanges : copy.form.save}
            </SaveButton>
          </aside>
        </div>
      </form>
    </PageFrame>
  )
}
