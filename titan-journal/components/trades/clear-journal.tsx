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
    <div className="flex flex-col items-end gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-8 border-destructive/40 text-[12px] text-destructive hover:bg-destructive/10"
        onClick={() => setOpen((current) => !current)}
      >
        {copy.journal.clearAll}
      </Button>
      {open ? (
        <div className="titan-glass w-[min(100vw-2rem,22rem)] space-y-3 rounded-[10px] p-4">
          <p className="text-[12px] text-muted-foreground">{copy.journal.clearAllHint}</p>
          <Input
            value={typed}
            onChange={(event) => setTyped(event.target.value)}
            placeholder={JOURNAL_WIPE_CONFIRM}
            autoFocus
            className="h-8 text-[12px]"
            onKeyDown={(event) => {
              if (event.key === "Enter") wipe()
              if (event.key === "Escape") reset()
            }}
          />
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="h-7 text-[12px]"
              disabled={!ready}
              onClick={wipe}
            >
              {copy.journal.clearAllConfirm}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 text-[12px]"
              onClick={reset}
            >
              {copy.detail.cancel}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
