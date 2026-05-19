import type { InstitutionalMarket } from "../../config/institutionalMarkets";
import { resolveMarketGlyph } from "./marketIcons/resolveMarketGlyph";

const CATEGORY_THEME: Record<
  InstitutionalMarket["category"],
  { shell: string; glyph: string; glow: string }
> = {
  forex: {
    shell: "from-sky-950/90 via-sky-900/40 to-titan-black/80",
    glyph: "text-sky-200",
    glow: "bg-sky-400/25",
  },
  metals: {
    shell: "from-amber-950/95 via-titan-gold/20 to-titan-black/80",
    glyph: "text-titan-goldBright",
    glow: "bg-titan-gold/30",
  },
  energy: {
    shell: "from-orange-950/90 via-orange-900/35 to-titan-black/80",
    glyph: "text-orange-200",
    glow: "bg-orange-400/25",
  },
  grains: {
    shell: "from-amber-950/85 via-amber-900/30 to-titan-black/80",
    glyph: "text-amber-100",
    glow: "bg-amber-400/22",
  },
  softs: {
    shell: "from-lime-950/80 via-lime-900/25 to-titan-black/80",
    glyph: "text-lime-200",
    glow: "bg-lime-400/20",
  },
  livestock: {
    shell: "from-rose-950/85 via-rose-900/30 to-titan-black/80",
    glyph: "text-rose-200",
    glow: "bg-rose-400/22",
  },
  indices: {
    shell: "from-violet-950/90 via-violet-900/35 to-titan-black/80",
    glyph: "text-violet-200",
    glow: "bg-violet-400/25",
  },
};

type TitanMarketIconProps = {
  market: InstitutionalMarket;
  size?: "sm" | "md" | "lg";
};

const SIZE_CLASS = {
  sm: "titan-market-icon--sm",
  md: "titan-market-icon--md",
  lg: "titan-market-icon--lg",
} as const;

export function TitanMarketIcon({ market, size = "md" }: TitanMarketIconProps) {
  const theme = CATEGORY_THEME[market.category];
  const Glyph = resolveMarketGlyph(market);

  return (
    <span
      className={`titan-market-icon ${SIZE_CLASS[size]} bg-gradient-to-br ${theme.shell}`}
      title={market.subtitle}
    >
      <span className={`titan-market-icon__glow ${theme.glow}`} aria-hidden />
      <span className={`titan-market-icon__glyph ${theme.glyph}`}>
        <Glyph className="h-[1.125rem] w-[1.125rem] md:h-5 md:w-5" />
      </span>
    </span>
  );
}
