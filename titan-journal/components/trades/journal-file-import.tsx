"use client"

import { useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { useWorkspace } from "@/components/layout/workspace-provider"
import { useTrades } from "@/components/trades/trades-provider"
import {
  IMPORT_FILE_ACCEPT,
  materializeImportedTrades,
  parseImportFile,
  type ImportContext,
} from "@/lib/trade-import"
import { useLabels } from "@/lib/use-labels"

type ImportStatus = "idle" | "ok" | "added" | "bad" | "xlsx"

export function useJournalImport() {
  const { copy, ACCOUNT_LABELS } = useLabels()
  const { trades, replaceAll } = useTrades()
  const { profile, preferences, playbooks, replaceWorkspace } = useWorkspace()
  const inputRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<ImportStatus>("idle")
  const [addedCount, setAddedCount] = useState(0)

  const importContext: ImportContext = {
    account: preferences.defaultAccount,
    riskPercent: profile.riskPercent,
    capital: profile.capital[preferences.defaultAccount] ?? 0,
    playbookId: preferences.defaultPlaybookId,
    playbookName:
      playbooks.find((item) => item.id === preferences.defaultPlaybookId)?.name ??
      "Swing",
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
      if (parsed.kind === "xlsx") {
        setStatus("xlsx")
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
        const accountLabel = ACCOUNT_LABELS[importContext.account]
        if (trades.length > 0) {
          const ok = window.confirm(
            copy.settings.importBrokerConfirm
              .replace("{n}", String(parsed.trades.length))
              .replace("{account}", accountLabel)
          )
          if (!ok) return
        }
        replaceAll([...materializeImportedTrades(parsed.trades), ...trades])
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
    status === "ok" ? (
      <p className="text-[12px] text-bull">{copy.settings.importOk}</p>
    ) : status === "added" ? (
      <p className="text-[12px] text-bull">
        {copy.settings.importAdded.replace("{n}", String(addedCount))}
      </p>
    ) : status === "xlsx" ? (
      <p className="text-[12px] text-bear">{copy.settings.importNeedCsv}</p>
    ) : status === "bad" ? (
      <p className="text-[12px] text-bear">{copy.settings.importBad}</p>
    ) : null

  return { pick, fileInput, message }
}

export function JournalImportCard() {
  const { copy } = useLabels()
  const { pick, fileInput, message } = useJournalImport()

  return (
    <section className="titan-glass rounded-[10px] p-5">
      <h2 className="text-sm font-semibold">{copy.journal.importReport}</h2>
      <p className="mt-1 text-[12px] text-muted-foreground">{copy.journal.importHint}</p>
      <div className="mt-3">
        <Button type="button" variant="outline" size="sm" onClick={pick}>
          {copy.journal.importReport}
        </Button>
        {fileInput}
      </div>
      {message ? <div className="mt-2">{message}</div> : null}
    </section>
  )
}
