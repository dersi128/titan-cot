"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useTrades } from "@/components/trades/trades-provider"
import { confirmsJournalWipe, JOURNAL_WIPE_CONFIRM } from "@/lib/journal-wipe"
import { useLabels } from "@/lib/use-labels"

export function ClearJournal() {
  const { copy } = useLabels()
  const { trades, replaceAll } = useTrades()
  const [open, setOpen] = useState(false)
  const [typed, setTyped] = useState("")
  const ready = confirmsJournalWipe(typed)

  if (trades.length === 0) return null

  function reset() {
    setOpen(false)
    setTyped("")
  }

  function wipe() {
    if (!confirmsJournalWipe(typed)) return
    replaceAll([])
    reset()
  }

  return (
    <section className="titan-danger">
      <p className="titan-danger-kicker">{copy.journal.dangerZone}</p>
      <h2 className="titan-danger-title">{copy.journal.clearAll}</h2>
      <p className="titan-danger-hint">{copy.journal.clearAllHint}</p>
      {!open ? (
        <button type="button" className="titan-danger-btn" onClick={() => setOpen(true)}>
          {copy.journal.clearAll}
        </button>
      ) : (
        <div className="titan-danger-confirm">
          <Input
            value={typed}
            onChange={(event) => setTyped(event.target.value)}
            placeholder={JOURNAL_WIPE_CONFIRM}
            autoFocus
            className="titan-danger-input h-8 text-[12px]"
            onKeyDown={(event) => {
              if (event.key === "Enter") wipe()
              if (event.key === "Escape") reset()
            }}
          />
          <div className="titan-danger-row">
            <button
              type="button"
              className="titan-danger-btn"
              disabled={!ready}
              onClick={wipe}
            >
              {copy.journal.clearAllConfirm}
            </button>
            <Button type="button" variant="secondary" size="sm" onClick={reset}>
              {copy.detail.cancel}
            </Button>
          </div>
        </div>
      )}
    </section>
  )
}
