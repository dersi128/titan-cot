export type MarketIconSentiment = "bull" | "bear" | "neutral";

export function marketIconSentiment(score?: number | null): MarketIconSentiment {
  if (score === undefined || score === null || !Number.isFinite(score)) return "neutral";
  if (score >= 40) return "bull";
  if (score <= -40) return "bear";
  return "neutral";
}
