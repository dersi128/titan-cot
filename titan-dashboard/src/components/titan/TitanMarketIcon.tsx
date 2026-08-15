import type { CSSProperties, ComponentType } from "react";
import type { InstitutionalMarket } from "../../config/institutionalMarkets";
import { resolveMarketGlyph } from "./marketIcons/resolveMarketGlyph";
import { marketIconSentiment, type MarketIconSentiment } from "./marketIcons/marketIconSentiment";
import { getMarketIconTheme } from "./marketIcons/marketIconTheme";
import { getMarketIconUrl } from "../../lib/marketIconAssets";
import type { FlagProps } from "./marketIcons/forexFlags";
import {
  FlagAu,
  FlagCa,
  FlagCh,
  FlagEu,
  FlagGb,
  FlagJp,
  FlagUs,
} from "./marketIcons/forexFlags";

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
  md: "h-[1.5rem] w-[1.5rem]",
  lg: "h-[1.7rem] w-[1.7rem]",
} as const;

const FOREX_FLAGS: Record<string, ComponentType<FlagProps>> = {
  DXY: FlagUs,
  EUR: FlagEu,
  JPY: FlagJp,
  GBP: FlagGb,
  AUD: FlagAu,
  CAD: FlagCa,
  CHF: FlagCh,
};

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
  const Flag = FOREX_FLAGS[market.id];
  const useFlag = Boolean(Flag) && !pngUrl;
  const usePhoto = Boolean(pngUrl);

  const frameClass = usePhoto
    ? "titan-market-icon--photo"
    : useFlag
      ? "titan-market-icon--flag"
      : "titan-market-icon--vector";

  const metalTint =
    market.id === "GOLD"
      ? { accent: "245, 178, 42", glyph: "text-amber-300" }
      : market.id === "SILVER"
        ? { accent: "186, 198, 212", glyph: "text-slate-200" }
        : market.id === "PLATINUM"
          ? { accent: "196, 210, 230", glyph: "text-sky-100" }
          : market.id === "PALLADIUM"
            ? { accent: "168, 178, 196", glyph: "text-stone-200" }
            : market.id === "COPPER"
              ? { accent: "194, 105, 55", glyph: "text-orange-300" }
              : null;

  const accent = metalTint?.accent ?? theme.accent;
  const glyphClass = metalTint?.glyph ?? theme.glyph;

  const style = {
    "--icon-accent": accent,
    "--icon-glow": theme.glow,
    "--icon-ring": theme.ring,
  } as CSSProperties;

  return (
    <span
      className={`titan-market-icon ${SIZE_CLASS[size]} ${frameClass} ${SENTIMENT_CLASS[sentiment]} cat-${market.category}`}
      style={style}
      title={market.subtitle}
    >
      {!usePhoto && !useFlag ? <span className="titan-market-icon__ring-outer" aria-hidden /> : null}
      {!usePhoto && !useFlag ? <span className="titan-market-icon__ring-inner" aria-hidden /> : null}
      {!usePhoto && !useFlag ? <span className="titan-market-icon__glass" aria-hidden /> : null}
      {!usePhoto && !useFlag ? <span className="titan-market-icon__glow" aria-hidden /> : null}
      {usePhoto ? <span className="titan-market-icon__photo-veil" aria-hidden /> : null}
      <span className={`titan-market-icon__content ${useFlag ? "" : glyphClass}`}>
        {pngUrl ? (
          <img src={pngUrl} alt="" className="titan-market-icon__photo" decoding="async" draggable={false} />
        ) : Flag ? (
          <Flag className="titan-market-icon__flag" />
        ) : (
          <Glyph className={GLYPH_SIZE[size]} />
        )}
      </span>
    </span>
  );
}
