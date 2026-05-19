import type { InstitutionalMarket } from "../../config/institutionalMarkets";
import { resolveMarketGlyph } from "./marketIcons/resolveMarketGlyph";
import { marketIconSentiment, type MarketIconSentiment } from "./marketIcons/marketIconSentiment";

const SENTIMENT_CLASS: Record<MarketIconSentiment, string> = {
  bull: "titan-market-icon--bull",
  bear: "titan-market-icon--bear",
  neutral: "titan-market-icon--neutral",
};

const SIZE_CLASS = {
  sm: "titan-market-icon--sm",
  md: "titan-market-icon--md",
  lg: "titan-market-icon--lg",
} as const;

const GLYPH_SIZE = {
  sm: "h-[1rem] w-[1rem]",
  md: "h-[1.2rem] w-[1.2rem]",
  lg: "h-[1.35rem] w-[1.35rem]",
} as const;

type TitanMarketIconProps = {
  market: InstitutionalMarket;
  size?: "sm" | "md" | "lg";
  /** COT score — emerald / crimson institutional glow */
  score?: number | null;
};

export function TitanMarketIcon({ market, size = "md", score }: TitanMarketIconProps) {
  const sentiment = marketIconSentiment(score);
  const Glyph = resolveMarketGlyph(market);

  return (
    <span
      className={`titan-market-icon ${SIZE_CLASS[size]} ${SENTIMENT_CLASS[sentiment]}`}
      title={market.subtitle}
    >
      <span className="titan-market-icon__orbit" aria-hidden />
      <span className="titan-market-icon__shimmer" aria-hidden />
      <span className="titan-market-icon__glass" aria-hidden />
      <span className="titan-market-icon__glow" aria-hidden />
      <span className="titan-market-icon__glyph">
        <Glyph className={GLYPH_SIZE[size]} />
      </span>
    </span>
  );
}
