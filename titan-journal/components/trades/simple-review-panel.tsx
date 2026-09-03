"use client"

import { useState } from "react"

import { Field, OptionPills } from "@/components/forms/field"
import { SaveButton } from "@/components/forms/save-button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useTrades } from "@/components/trades/trades-provider"
import { isDirty } from "@/lib/dirty"
import { useLabels } from "@/lib/use-labels"
import { isReviewAvailable } from "@/lib/review-calculations"
import type { Trade } from "@/types/trade"

export function SimpleReviewPanel({ trade }: { trade: Trade }) {
  const { copy } = useLabels()
  const { updateTrade } = useTrades()
  const existing = trade.review
  const [followed, setFollowed] = useState<"Yes" | "No" | null>(
    existing?.planFollowed === "Yes" || existing?.planFollowed === "No"
      ? existing.planFollowed
      : null
  )
  const [again, setAgain] = useState<boolean | null>(
    existing?.wouldTakeAgain ?? null
  )
  const [note, setNote] = useState(existing?.learningNote ?? "")
  const [saved, setSaved] = useState(existing?.completed === true)
  const [baseline, setBaseline] = useState({
    followed,
    again,
    note: existing?.learningNote ?? "",
  })

  if (!isReviewAvailable(trade) && trade.status !== "CLOSED") return null
  if (trade.status !== "CLOSED" && trade.status !== "REVIEWED") return null

  const draft = { followed, again, note }
  const dirty = isDirty(draft, baseline)

  function handleSave() {
    if (followed == null || again == null) return
    updateTrade({
      ...trade,
      status: "REVIEWED",
      review: {
        completed: true,
        planFollowed: followed,
        setupValid: existing?.setupValid ?? null,
        wouldTakeAgain: again,
        executionQuality: existing?.executionQuality ?? null,
        emotionalState: existing?.emotionalState ?? null,
        tags: existing?.tags ?? [],
        learningNote: note.trim() || undefined,
        nextTimeNote: existing?.nextTimeNote,
        executionScore: existing?.executionScore ?? null,
        tradeQuality: existing?.tradeQuality ?? null,
        reviewedAt: new Date().toISOString(),
      },
    })
    setBaseline({ followed, again, note })
    setSaved(true)
  }

  return (
    <Card>
      <CardHeader className="border-b border-border">
        <CardTitle>{copy.detail.simpleReview}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-4">
        {saved ? (
          <p className="text-[12px] text-muted-foreground">{copy.detail.reviewSaved}</p>
        ) : null}
        <Field label={copy.detail.planFollowed}>
          <OptionPills
            value={followed}
            options={["Yes", "No"] as const}
            labels={{ Yes: copy.detail.yes, No: copy.detail.no }}
            onChange={setFollowed}
          />
        </Field>
        <Field label={copy.detail.wouldTakeAgain}>
          <OptionPills
            value={again == null ? null : again ? "Yes" : "No"}
            options={["Yes", "No"] as const}
            labels={{ Yes: copy.detail.yes, No: copy.detail.no }}
            onChange={(value) => setAgain(value === "Yes")}
          />
        </Field>
        <Field label={copy.detail.postTradeNote}>
          <Textarea
            rows={2}
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
        </Field>
        <SaveButton
          type="button"
          dirty={dirty}
          onClick={handleSave}
          disabled={followed == null || again == null}
        >
          {copy.detail.saveReview}
        </SaveButton>
      </CardContent>
    </Card>
  )
}
