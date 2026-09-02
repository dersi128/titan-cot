"use client"

import { useEffect, useMemo, useState } from "react"

import { Field } from "@/components/forms/field"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useTrades } from "@/components/trades/trades-provider"
import { ResultR } from "@/components/trades/result-r"
import { copy } from "@/lib/labels"
import {
  buildTradeReview,
  executionScoreLabel,
  hasCompletedReview,
  isReviewAvailable,
  isReviewComplete,
  type ReviewDraft,
} from "@/lib/review-calculations"
import { cn } from "@/lib/utils"
import {
  EMOTIONAL_STATES,
  EXECUTION_QUALITY_OPTIONS,
  NEGATIVE_EXECUTION_TAGS,
  PLAN_FOLLOWED_OPTIONS,
  POSITIVE_EXECUTION_TAGS,
  type EmotionalState,
  type ExecutionQuality,
  type ExecutionScoreLabel,
  type PlanFollowed,
  type Trade,
  type TradeQuality,
} from "@/types/trade"

const YES_NO = ["Yes", "No"] as const

function draftFromReview(trade: Trade): ReviewDraft {
  const review = trade.review
  return {
    planFollowed: review?.planFollowed ?? null,
    setupValid: review?.setupValid ?? null,
    wouldTakeAgain: review?.wouldTakeAgain ?? null,
    executionQuality: review?.executionQuality ?? null,
    emotionalState: review?.emotionalState ?? null,
    tags: review?.tags ?? [],
    learningNote: review?.learningNote ?? "",
    nextTimeNote: review?.nextTimeNote ?? "",
  }
}

function formatYesNo(value: boolean | null | undefined): string {
  if (value == null) return "—"
  return value ? copy.detail.yes : copy.detail.no
}

function scoreTone(label: ExecutionScoreLabel): string {
  if (label === "Excellent") return "text-stone-200"
  if (label === "Good") return "text-stone-300"
  if (label === "Average") return "text-muted-foreground"
  return "text-stone-500"
}

function qualityTone(quality: TradeQuality | null | undefined): string {
  return quality === "Good Trade" ? "text-stone-200" : "text-muted-foreground"
}

function ChoicePills<T extends string>({
  value,
  options,
  onChange,
  allowClear = false,
}: {
  value: T | null
  options: readonly T[]
  onChange: (value: T | null) => void
  allowClear?: boolean
}) {
  return (
    <div className="flex flex-wrap gap-1">
      {options.map((option) => {
        const selected = option === value
        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(selected && allowClear ? null : option)}
            className={cn(
              "h-6 rounded-md border px-2 text-[11px] font-medium transition-colors",
              selected
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-white/10 text-muted-foreground hover:border-white/20 hover:text-foreground"
            )}
          >
            {option}
          </button>
        )
      })}
    </div>
  )
}

function TagChip({
  label,
  selected,
  onToggle,
}: {
  label: string
  selected: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "h-6 rounded-md border px-1.5 text-[10px] font-medium tracking-wide transition-colors",
        selected
          ? "border-white/20 bg-white/[0.07] text-stone-200"
          : "border-white/[0.08] text-muted-foreground hover:border-white/16 hover:text-stone-300"
      )}
    >
      {label}
    </button>
  )
}

function SummaryRow({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1.5">
      <dt className="text-[11px] text-muted-foreground">{label}</dt>
      <dd className="text-right text-sm text-stone-200">{children}</dd>
    </div>
  )
}

function ReviewSummary({
  trade,
  onEdit,
}: {
  trade: Trade
  onEdit: () => void
}) {
  const review = trade.review
  if (!review?.completed) return null

  const score = review.executionScore
  const label = score == null ? null : executionScoreLabel(score)
  const quality = review.tradeQuality
  const lost = (trade.resultR ?? 0) < 0
  const won = (trade.resultR ?? 0) > 0

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[11px] font-medium tracking-wide text-muted-foreground">
          {copy.detail.reviewCompleted}
        </p>
        <Button type="button" variant="ghost" size="sm" onClick={onEdit}>
          {copy.detail.editReview}
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-3">
          <p className="text-[11px] text-muted-foreground">
            {copy.detail.executionScore}
          </p>
          <p className="mt-1 font-mono text-[22px] tabular-nums text-stone-200">
            {score == null ? "—" : `${score} / 100`}
          </p>
          {label ? (
            <p className={cn("mt-0.5 text-[12px]", scoreTone(label))}>{label}</p>
          ) : null}
        </div>
        <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-3">
          <p className="text-[11px] text-muted-foreground">
            {copy.detail.tradeQuality}
          </p>
          <p className={cn("mt-1 text-[22px] font-medium", qualityTone(quality))}>
            {quality ?? "—"}
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {copy.detail.resultNotQuality}
          </p>
        </div>
      </div>

      {quality === "Good Trade" && lost ? (
        <p className="text-[12px] text-muted-foreground">
          {copy.detail.lostButCorrect}
        </p>
      ) : quality === "Needs Review" && won ? (
        <p className="text-[12px] text-muted-foreground">
          {copy.detail.wonButNeedsReview}
        </p>
      ) : null}

      <dl className="divide-y divide-white/[0.05]">
        <SummaryRow label={copy.detail.planFollowedShort}>
          {review.planFollowed ?? "—"}
        </SummaryRow>
        <SummaryRow label={copy.detail.setupValidShort}>
          {formatYesNo(review.setupValid)}
        </SummaryRow>
        <SummaryRow label={copy.detail.wouldTakeAgainShort}>
          {formatYesNo(review.wouldTakeAgain)}
        </SummaryRow>
        <SummaryRow label={copy.detail.executionQuality}>
          {review.executionQuality ?? "—"}
        </SummaryRow>
        <SummaryRow label={copy.detail.tags}>
          {review.tags.length > 0 ? (
            <span className="text-[12px] text-stone-300">
              {review.tags.join(" · ")}
            </span>
          ) : (
            "—"
          )}
        </SummaryRow>
        <SummaryRow label={copy.detail.result}>
          <ResultR value={trade.resultR} />
        </SummaryRow>
      </dl>
    </div>
  )
}

export function TradeReviewPanel({ trade }: { trade: Trade }) {
  const { updateTrade } = useTrades()
  const [draft, setDraft] = useState<ReviewDraft>(() => draftFromReview(trade))
  const [editing, setEditing] = useState(() => !hasCompletedReview(trade))

  useEffect(() => {
    setDraft(draftFromReview(trade))
    setEditing(!hasCompletedReview(trade))
  }, [trade.id, trade.status, trade.review])

  const canSave = isReviewComplete(draft)
  const liveScore = useMemo(
    () => (canSave ? buildTradeReview(draft)?.executionScore ?? null : null),
    [canSave, draft]
  )

  if (!isReviewAvailable(trade)) return null

  function toggleTag(tag: string) {
    setDraft((current) => ({
      ...current,
      tags: current.tags.includes(tag)
        ? current.tags.filter((item) => item !== tag)
        : [...current.tags, tag],
    }))
  }

  function handleSave() {
    const review = buildTradeReview(draft)
    if (!review) return
    updateTrade({
      ...trade,
      status: "REVIEWED",
      review,
    })
    setEditing(false)
  }

  return (
    <Card>
      <CardHeader className="border-b border-white/[0.06]">
        <CardTitle>{copy.detail.tradeReview}</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        {!editing && hasCompletedReview(trade) ? (
          <ReviewSummary trade={trade} onEdit={() => setEditing(true)} />
        ) : (
          <div className="space-y-4">
            <Field label={copy.detail.planFollowed}>
              <ChoicePills
                value={draft.planFollowed}
                options={PLAN_FOLLOWED_OPTIONS}
                onChange={(planFollowed) =>
                  setDraft((current) => ({
                    ...current,
                    planFollowed: planFollowed as PlanFollowed | null,
                  }))
                }
              />
            </Field>

            <Field label={copy.detail.setupValid}>
              <ChoicePills
                value={
                  draft.setupValid == null
                    ? null
                    : draft.setupValid
                      ? "Yes"
                      : "No"
                }
                options={YES_NO}
                onChange={(value) =>
                  setDraft((current) => ({
                    ...current,
                    setupValid: value == null ? null : value === "Yes",
                  }))
                }
              />
            </Field>

            <Field label={copy.detail.wouldTakeAgain}>
              <ChoicePills
                value={
                  draft.wouldTakeAgain == null
                    ? null
                    : draft.wouldTakeAgain
                      ? "Yes"
                      : "No"
                }
                options={YES_NO}
                onChange={(value) =>
                  setDraft((current) => ({
                    ...current,
                    wouldTakeAgain: value == null ? null : value === "Yes",
                  }))
                }
              />
            </Field>

            <Field label={copy.detail.executionQuality}>
              <ChoicePills
                value={draft.executionQuality}
                options={EXECUTION_QUALITY_OPTIONS}
                onChange={(executionQuality) =>
                  setDraft((current) => ({
                    ...current,
                    executionQuality: executionQuality as ExecutionQuality | null,
                  }))
                }
              />
            </Field>

            <Field
              label={copy.detail.executionTags}
              hint={`${copy.detail.positiveTags} / ${copy.detail.negativeTags}`}
            >
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1">
                  {POSITIVE_EXECUTION_TAGS.map((tag) => (
                    <TagChip
                      key={tag}
                      label={tag}
                      selected={draft.tags.includes(tag)}
                      onToggle={() => toggleTag(tag)}
                    />
                  ))}
                </div>
                <div className="flex flex-wrap gap-1">
                  {NEGATIVE_EXECUTION_TAGS.map((tag) => (
                    <TagChip
                      key={tag}
                      label={tag}
                      selected={draft.tags.includes(tag)}
                      onToggle={() => toggleTag(tag)}
                    />
                  ))}
                </div>
              </div>
            </Field>

            <Field
              label={copy.detail.emotionalState}
              hint={copy.detail.emotionalOptional}
            >
              <ChoicePills
                value={draft.emotionalState ?? null}
                options={EMOTIONAL_STATES}
                allowClear
                onChange={(emotionalState) =>
                  setDraft((current) => ({
                    ...current,
                    emotionalState: emotionalState as EmotionalState | null,
                  }))
                }
              />
            </Field>

            <Field label={copy.detail.learningNote}>
              <Textarea
                rows={2}
                value={draft.learningNote ?? ""}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    learningNote: event.target.value,
                  }))
                }
              />
            </Field>

            <Field label={copy.detail.nextTimeNote}>
              <Textarea
                rows={2}
                value={draft.nextTimeNote ?? ""}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    nextTimeNote: event.target.value,
                  }))
                }
              />
            </Field>

            {liveScore != null ? (
              <p className="text-[12px] text-muted-foreground">
                {copy.detail.executionScore}: {liveScore} / 100 ·{" "}
                {executionScoreLabel(liveScore)}
              </p>
            ) : (
              <p className="text-[12px] text-muted-foreground">
                {copy.detail.reviewIncomplete}
              </p>
            )}

            <Button type="button" onClick={handleSave} disabled={!canSave}>
              {hasCompletedReview(trade)
                ? copy.detail.saveReview
                : copy.detail.reviewTrade}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
