import type {
  EmotionalState,
  ExecutionQuality,
  ExecutionScoreLabel,
  PlanFollowed,
  Trade,
  TradeQuality,
  TradeReview,
} from "@/types/trade"

export const PLAN_FOLLOWED_POINTS: Record<PlanFollowed, number> = {
  Yes: 40,
  Partially: 20,
  No: 0,
}

export const SETUP_VALID_POINTS = {
  yes: 20,
  no: 0,
} as const

export const WOULD_TAKE_AGAIN_POINTS = {
  yes: 10,
  no: 0,
} as const

export const EXECUTION_QUALITY_POINTS: Record<ExecutionQuality, number> = {
  Perfect: 30,
  Good: 24,
  Average: 15,
  Poor: 0,
}

export type ExecutionScoreInput = {
  planFollowed: PlanFollowed
  setupValid: boolean
  wouldTakeAgain: boolean
  executionQuality: ExecutionQuality
}

export function calculateExecutionScore(input: ExecutionScoreInput): number {
  return (
    PLAN_FOLLOWED_POINTS[input.planFollowed] +
    (input.setupValid ? SETUP_VALID_POINTS.yes : SETUP_VALID_POINTS.no) +
    (input.wouldTakeAgain
      ? WOULD_TAKE_AGAIN_POINTS.yes
      : WOULD_TAKE_AGAIN_POINTS.no) +
    EXECUTION_QUALITY_POINTS[input.executionQuality]
  )
}

export function executionScoreLabel(score: number): ExecutionScoreLabel {
  if (score >= 90) return "Excellent"
  if (score >= 75) return "Good"
  if (score >= 50) return "Average"
  return "Poor"
}

export function deriveTradeQuality(input: {
  setupValid: boolean
  planFollowed: PlanFollowed
  executionScore: number
}): TradeQuality {
  if (
    input.setupValid &&
    input.planFollowed === "Yes" &&
    input.executionScore >= 75
  ) {
    return "Good Trade"
  }

  return "Needs Review"
}

export function isReviewComplete(input: {
  planFollowed: PlanFollowed | null
  setupValid: boolean | null
  wouldTakeAgain: boolean | null
  executionQuality: ExecutionQuality | null
}): input is ExecutionScoreInput {
  return (
    input.planFollowed != null &&
    input.setupValid != null &&
    input.wouldTakeAgain != null &&
    input.executionQuality != null
  )
}

export type ReviewDraft = {
  planFollowed: PlanFollowed | null
  setupValid: boolean | null
  wouldTakeAgain: boolean | null
  executionQuality: ExecutionQuality | null
  emotionalState?: EmotionalState | null
  tags: string[]
  learningNote?: string
  nextTimeNote?: string
}

export function buildTradeReview(
  draft: ReviewDraft,
  reviewedAt = new Date().toISOString()
): TradeReview | null {
  if (!isReviewComplete(draft)) return null

  const executionScore = calculateExecutionScore(draft)
  const tradeQuality = deriveTradeQuality({
    setupValid: draft.setupValid,
    planFollowed: draft.planFollowed,
    executionScore,
  })

  return {
    completed: true,
    planFollowed: draft.planFollowed,
    setupValid: draft.setupValid,
    wouldTakeAgain: draft.wouldTakeAgain,
    executionQuality: draft.executionQuality,
    emotionalState: draft.emotionalState ?? null,
    tags: draft.tags,
    learningNote: draft.learningNote?.trim() || undefined,
    nextTimeNote: draft.nextTimeNote?.trim() || undefined,
    executionScore,
    tradeQuality,
    reviewedAt,
  }
}

export function isReviewAvailable(trade: Trade): boolean {
  return trade.status === "CLOSED" || trade.status === "REVIEWED"
}

export function hasCompletedReview(trade: Trade): boolean {
  return trade.review?.completed === true
}

export function journalReviewCaption(trade: Trade): string | null {
  if (trade.status === "REVIEWED") {
    const score = trade.review?.executionScore
    if (score != null) return `${score} Execution`
    return "Reviewed"
  }

  if (trade.status === "CLOSED") {
    return hasCompletedReview(trade) ? "Reviewed" : "Needs Review"
  }

  return null
}
