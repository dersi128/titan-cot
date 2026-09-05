"use client"

import { useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { useWorkspace } from "@/components/layout/workspace-provider"
import { useTrades } from "@/components/trades/trades-provider"
import {
  hasCotLink,
  type CotLiveSnapshot,
} from "@/lib/cot-link"
import {
  IMPORT_FILE_ACCEPT,
  materializeImportedTrades,
  parseImportFile,
  type ImportContext,
} from "@/lib/trade-import"
import { withoutSampleTrades } from "@/lib/mock-data"
import { riskForAccount } from "@/lib/account-scope"
import { DEMO_PLAYBOOK_NAME } from "@/lib/playbooks"
import { useLabels } from "@/lib/use-labels"
import type { NewTradeInput } from "@/types/trade"

type ImportStatus = "idle" | "working" | "ok" | "added" | "bad" | "xls"

async function fillImportedCot(inputs: NewTradeInput[]): Promise<NewTradeInput[]> {
  const needed: Array<{ symbol: string; date: string }> = []
  const seen = new Set<string>()
  for (const input of inputs) {
    if (!input.cotEnabled || !input.date || !hasCotLink(input.symbol)) continue
    const key = `${input.symbol}|${input.date}`
    if (seen.has(key)) continue
    seen.add(key)
    needed.push({ symbol: input.symbol, date: input.date })
  }
  if (needed.length === 0) return inputs

  const snapshots = new Map<string, CotLiveSnapshot>()
  const bySymbol = new Map<string, string[]>()
  for (const item of needed) {
    const dates = bySymbol.get(item.symbol) ?? []
    dates.push(item.date)
    bySymbol.set(item.symbol, dates)
  }

  for (const [symbol, dates] of bySymbol) {
    await fetch(`/api/cot?symbol=${encodeURIComponent(symbol)}`).catch(() => null)
    await Promise.all(
      dates.map(async (date) => {
        try {
          const response = await fetch(
            `/api/cot?symbol=${encodeURIComponent(symbol)}&date=${encodeURIComponent(date)}`
          )
          const json: unknown = await response.json()
          if (
            json &&
            typeof json === "object" &&
            "ok" in json &&
            (json as { ok?: boolean }).ok === true
          ) {
            snapshots.set(`${symbol}|${date}`, json as CotLiveSnapshot)
          }
        } catch {
          return
        }
      })
    )
  }

  return inputs.map((input) => {
    const snapshot = snapshots.get(`${input.symbol}|${input.date}`)
    if (!snapshot) return input
    return {
      ...input,
      cotBias: snapshot.pairBias,
      commercialsBias: snapshot.commercialsBias,
      cotScore: snapshot.cotScore,
      cotReportDate: snapshot.reportDate || input.date,
    }
  })
}

export function useJournalImport() {
  const { copy, ACCOUNT_LABELS } = useLabels()
  const { trades, replaceAll } = useTrades()
  const { profile, preferences, playbooks, replaceWorkspace } = useWorkspace()
  const inputRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<ImportStatus>("idle")
  const [addedCount, setAddedCount] = useState(0)

  const importContext: ImportContext = {
    account: preferences.defaultAccount,
    riskPercent: riskForAccount(profile, preferences.defaultAccount),
    capital: profile.capital[preferences.defaultAccount] ?? 0,
    playbookId: preferences.defaultPlaybookId,
    playbookName:
      playbooks.find((item) => item.id === preferences.defaultPlaybookId)?.name ??
      DEMO_PLAYBOOK_NAME,
  }

  function pick() {
    inputRef.current?.click()
  }

  async function importJournal(file: File | undefined) {
    if (!file) return
    try {
      const parsed = parseImportFile(
        new Uint8Array(await file.arrayBuffer()),
        importContext,
        file.name
      )
      if (parsed.kind === "xls") {
        setStatus("xls")
        return
      }
      if (parsed.kind === "backup") {
        if (trades.length > 0 && !window.confirm(copy.settings.importReplace)) return
        replaceAll(parsed.backup.trades)
        replaceWorkspace({
          profile: parsed.backup.profile,
          preferences: parsed.backup.preferences,
          playbooks: parsed.backup.playbooks,
        })
        setStatus("ok")
        return
      }
      if (parsed.kind === "broker" && parsed.trades.length > 0) {
        const kept = withoutSampleTrades(trades)
        const accountLabel = ACCOUNT_LABELS[importContext.account]
        if (kept.length > 0) {
          const ok = window.confirm(
            copy.settings.importBrokerConfirm
              .replace("{n}", String(parsed.trades.length))
              .replace("{account}", accountLabel)
          )
          if (!ok) return
        }
        setStatus("working")
        const withCot = await fillImportedCot(parsed.trades)
        replaceAll([...materializeImportedTrades(withCot), ...kept])
        setAddedCount(parsed.trades.length)
        setStatus("added")
        return
      }
      setStatus("bad")
    } catch {
      setStatus("bad")
    }
  }

  const fileInput = (
    <input
      ref={inputRef}
      type="file"
      accept={IMPORT_FILE_ACCEPT}
      className="hidden"
      onChange={(event) => {
        const file = event.target.files?.[0]
        event.target.value = ""
        void importJournal(file)
      }}
    />
  )

  const message =
    status === "working" ? (
      <p className="text-[12px] text-muted-foreground">{copy.settings.importCot}</p>
    ) : status === "ok" ? (
      <p className="text-[12px] text-bull">{copy.settings.importOk}</p>
    ) : status === "added" ? (
      <p className="text-[12px] text-bull">
        {copy.settings.importAdded.replace("{n}", String(addedCount))}
      </p>
    ) : status === "xls" ? (
      <p className="text-[12px] text-bear">{copy.settings.importNeedCsv}</p>
    ) : status === "bad" ? (
      <p className="text-[12px] text-bear">{copy.settings.importBad}</p>
    ) : null

  return { pick, fileInput, message }
}

export function JournalImportButton() {
  const { copy } = useLabels()
  const { pick, fileInput, message } = useJournalImport()

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-8 text-[12px]"
        onClick={pick}
      >
        {copy.journal.importReport}
      </Button>
      {fileInput}
      {message}
    </div>
  )
}
