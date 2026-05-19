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
  sm: "h-[1.05rem] w-[1.05rem]",
  md: "h-[1.25rem] w-[1.25rem]",
  lg: "h-[1.45rem] w-[1.45rem]",
} as const;

type TitanMarketIconProps = {
  market: InstitutionalMarket;
  size?: "sm" | "md" | "lg";
  score?: number | null;
};

function ShieldFrame({ ring }: { ring: string }) {
  return (
    <svg className="titan-market-icon__shield-svg" viewBox="0 0 48 56" fill="none" aria-hidden>
      <path
        d="M24 3 L42 11.5 V27.5 C42 36 34 44 24 52 C14 44 6 36 6 27.5 V11.5 Z"
        stroke={ring}
        strokeWidth="1.5"
        fill="rgba(8,10,14,0.65)"
      />
      <path
        d="M24 6 L39 13 V27 C39 34 33 40 24 47 C15 40 9 34 9 27 V13 Z"
        stroke="rgba(255,255,255,0.12)"
        strokeWidth="0.75"
        fill="none"
      />
    </svg>
  );
}

export function TitanMarketIcon({ market, size = "md", score }: TitanMarketIconProps) {
  const sentiment = marketIconSentiment(score);
  const theme = getMarketIconTheme(market.category);
  const Glyph = resolveMarketGlyph(market);
  const pngUrl = getMarketIconUrl(market.id);
  const usePhoto = Boolean(pngUrl);

  const frameClass = usePhoto
    ? "titan-market-icon--circle titan-market-icon--photo"
    : theme.frame === "shield"
      ? "titan-market-icon--shield"
      : "titan-market-icon--circle";

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
      {!usePhoto && theme.frame === "shield" ? <ShieldFrame ring={theme.ring} /> : null}
      {!usePhoto ? <span className="titan-market-icon__ring-outer" aria-hidden /> : null}
      {!usePhoto ? <span className="titan-market-icon__ring-inner" aria-hidden /> : null}
      {!usePhoto ? <span className="titan-market-icon__shimmer" aria-hidden /> : null}
      {!usePhoto ? <span className="titan-market-icon__glass" aria-hidden /> : null}
      {!usePhoto ? <span className="titan-market-icon__glow" aria-hidden /> : null}
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
