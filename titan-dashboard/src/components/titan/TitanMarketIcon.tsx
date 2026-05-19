import type { CSSProperties } from "react";
import type { InstitutionalMarket } from "../../config/institutionalMarkets";
import { resolveMarketGlyph } from "./marketIcons/resolveMarketGlyph";
import { marketIconSentiment, type MarketIconSentiment } from "./marketIcons/marketIconSentiment";
import { getMarketIconTheme } from "./marketIcons/marketIconTheme";
import { getMarketIconUrl } from "../../lib/marketIconAssets";

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
  sm: "h-[1.35rem] w-[1.35rem]",
  md: "h-[1.55rem] w-[1.55rem]",
  lg: "h-[1.75rem] w-[1.75rem]",
} as const;

type TitanMarketIconProps = {
  market: InstitutionalMarket;
  size?: "sm" | "md" | "lg";
  score?: number | null;
};

export function TitanMarketIcon({ market, size = "md", score }: TitanMarketIconProps) {
  const sentiment = marketIconSentiment(score);
  const theme = getMarketIconTheme(market.category);
  const Glyph = resolveMarketGlyph(market);
  const pngUrl = getMarketIconUrl(market.id);
  const usePhoto = Boolean(pngUrl);

  const frameClass = usePhoto ? "titan-market-icon--photo" : "titan-market-icon--vector";

  const style = {
    "--icon-accent": theme.accent,
    "--icon-glow": theme.glow,
    "--icon-ring": theme.ring,
  } as CSSProperties;

  return (
    <span
      className={`titan-market-icon ${SIZE_CLASS[size]} ${frameClass} ${SENTIMENT_CLASS[sentiment]} cat-${market.category}`}
      style={style}
      title={market.subtitle}
    >
      {!usePhoto ? <span className="titan-market-icon__ring-outer" aria-hidden /> : null}
      {!usePhoto ? <span className="titan-market-icon__ring-inner" aria-hidden /> : null}
      {!usePhoto ? <span className="titan-market-icon__glass" aria-hidden /> : null}
      {!usePhoto ? <span className="titan-market-icon__glow" aria-hidden /> : null}
      {usePhoto ? <span className="titan-market-icon__photo-veil" aria-hidden /> : null}
      <span className={`titan-market-icon__content ${theme.glyph}`}>
        {pngUrl ? (
          <img src={pngUrl} alt="" className="titan-market-icon__photo" decoding="async" draggable={false} />
        ) : (
          <Glyph className={GLYPH_SIZE[size]} />
        )}
      </span>
    </span>
  );
}
