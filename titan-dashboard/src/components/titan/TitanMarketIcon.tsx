import type { InstitutionalMarket } from "../../config/institutionalMarkets";

const CATEGORY_STYLES: Record<
  InstitutionalMarket["category"],
  { ring: string; bg: string; letter: string }
> = {
  forex: { ring: "ring-sky-400/40", bg: "bg-sky-500/15", letter: "text-sky-300" },
  metals: { ring: "ring-titan-gold/45", bg: "bg-titan-gold/12", letter: "text-titan-goldBright" },
  energy: { ring: "ring-orange-400/35", bg: "bg-orange-500/12", letter: "text-orange-300" },
  grains: { ring: "ring-amber-400/35", bg: "bg-amber-500/12", letter: "text-amber-200" },
  softs: { ring: "ring-lime-400/30", bg: "bg-lime-500/10", letter: "text-lime-200" },
  livestock: { ring: "ring-rose-400/30", bg: "bg-rose-500/10", letter: "text-rose-200" },
  indices: { ring: "ring-violet-400/35", bg: "bg-violet-500/12", letter: "text-violet-200" },
};

export function TitanMarketIcon({ market }: { market: InstitutionalMarket }) {
  const style = CATEGORY_STYLES[market.category];
  const letter = market.shortLabel.slice(0, 2).toUpperCase();

  return (
    <span
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/[0.06] text-[10px] font-bold tracking-tight ring-1 ${style.ring} ${style.bg} ${style.letter}`}
    >
      {letter}
    </span>
  );
}
