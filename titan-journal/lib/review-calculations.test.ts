import { describe, expect, it } from "vitest"

import {
  buildTradeReview,
  calculateExecutionScore,
  deriveTradeQuality,
  executionScoreLabel,
  isReviewComplete,
  journalReviewCaption,
} from "@/lib/review-calculations"
import type { Trade } from "@/types/trade"

describe("calculateExecutionScore", () => {
  it("CASE 1: Yes / Yes / Yes / Perfect → 100 and Good Trade", () => {
    const input = {
      planFollowed: "Yes" as const,
      setupValid: true,
      wouldTakeAgain: true,
      executionQuality: "Perfect" as const,
    }

    expect(calculateExecutionScore(input)).toBe(100)
    expect(deriveTradeQuality({ ...input, executionScore: 100 })).toBe(
      "Good Trade"
    )
    expect(executionScoreLabel(100)).toBe("Excellent")
  })

  it("CASE 2: No / No / No / Poor → 0 and Needs Review", () => {
    const input = {
      planFollowed: "No" as const,
      setupValid: false,
      wouldTakeAgain: false,
      executionQuality: "Poor" as const,
    }

    expect(calculateExecutionScore(input)).toBe(0)
    expect(deriveTradeQuality({ ...input, executionScore: 0 })).toBe(
      "Needs Review"
    )
    expect(executionScoreLabel(0)).toBe("Poor")
  })

  it("CASE 3: Partially / Yes / Yes / Good → 74 and Needs Review", () => {
    const input = {
      planFollowed: "Partially" as const,
      setupValid: true,
      wouldTakeAgain: true,
      executionQuality: "Good" as const,
    }

    expect(calculateExecutionScore(input)).toBe(74)
    expect(deriveTradeQuality({ ...input, executionScore: 74 })).toBe(
      "Needs Review"
    )
    expect(executionScoreLabel(74)).toBe("Average")
  })

  it("does not treat profit as quality", () => {
    const losingButCorrect = deriveTradeQuality({
      setupValid: true,
      planFollowed: "Yes",
      executionScore: 94,
    })
    const winningButBroken = deriveTradeQuality({
      setupValid: false,
      planFollowed: "No",
      executionScore: 0,
    })

    expect(losingButCorrect).toBe("Good Trade")
    expect(winningButBroken).toBe("Needs Review")
  })
})

describe("executionScoreLabel", () => {
  it("maps score bands", () => {
    expect(executionScoreLabel(90)).toBe("Excellent")
    expect(executionScoreLabel(89)).toBe("Good")
    expect(executionScoreLabel(75)).toBe("Good")
    expect(executionScoreLabel(50)).toBe("Average")
    expect(executionScoreLabel(49)).toBe("Poor")
  })
})

describe("buildTradeReview", () => {
  it("requires the four core fields", () => {
    expect(
      isReviewComplete({
        planFollowed: "Yes",
        setupValid: true,
        wouldTakeAgain: true,
        executionQuality: null,
      })
    ).toBe(false)

    expect(
      buildTradeReview({
        planFollowed: "Yes",
        setupValid: true,
        wouldTakeAgain: true,
        executionQuality: null,
        tags: [],
      })
    ).toBeNull()
  })

  it("builds a completed review with computed score", () => {
    const review = buildTradeReview({
      planFollowed: "Yes",
      setupValid: true,
      wouldTakeAgain: true,
      executionQuality: "Good",
      tags: ["Perfect Execution", "Good Patience"],
      learningNote: "  Hold the plan.  ",
      nextTimeNote: "",
    })

    expect(review).toMatchObject({
      completed: true,
      executionScore: 94,
      tradeQuality: "Good Trade",
      learningNote: "Hold the plan.",
      nextTimeNote: undefined,
      tags: ["Perfect Execution", "Good Patience"],
    })
  })
})

describe("journalReviewCaption", () => {
  it("shows Needs Review on CLOSED trades without a review", () => {
    expect(
      journalReviewCaption({
        status: "CLOSED",
        review: null,
      } as Trade)
    ).toBe("Needs Review")
  })

  it("shows execution score on REVIEWED trades", () => {
    expect(
      journalReviewCaption({
        status: "REVIEWED",
        review: { completed: true, executionScore: 94 },
      } as Trade)
    ).toBe("94 Execution")
  })
})
