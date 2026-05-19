import type { CotDashboardData } from "../../types";
import { computeTitanDashboardScore, scoreHeatClass } from "../../lib/titanCotScore";
import type { InstitutionalMarket } from "../../config/institutionalMarkets";
import { useTitanI18n } from "../../i18n";
import { TitanMarketIcon } from "./TitanMarketIcon";
import { TitanPanel, TitanPanelHeader } from "./ui/TitanPrimitives";

type CotHeatmapProps = {
  markets: readonly InstitutionalMarket[];
  bundle: Record<string, CotDashboardData>;
  selectedMarket: InstitutionalMarket;
  onSelectMarket: (market: InstitutionalMarket) => void;
};

function cellVisuals(data: CotDashboardData | undefined): {
  bg: string;
  border: string;
  ring: string;
  score: number | null;
} {
  if (!data) {
    return { bg: "bg-titan-elevated/40", border: "border-titan-line/60", ring: "", score: null };
  }
  const c = data.commercials;
  const r = data.retail;
  const score = computeTitanDashboardScore(data);

  let bg = "bg-titan-elevated/70";
  let border = "border-titan-line/70";
  if (c.index26w > 80) {
    bg = "bg-emerald-950/80";
    border = "border-emerald-600/30";
  } else if (c.index26w < 20) {
    bg = "bg-rose-950/80";
    border = "border-rose-600/30";
  } else if (c.index26w > 60) {
    bg = "bg-emerald-950/45";
    border = "border-emerald-800/25";
  } else if (c.index26w < 40) {
    bg = "bg-rose-950/45";
    border = "border-rose-800/25";
  }

  let ring = "";
  if (r.index26w > 80 || r.index26w < 20) {
    ring = "ring-1 ring-amber-400/45 ring-offset-1 ring-offset-titan-panel";
  }

  return { bg, border, ring, score };
}

export function CotHeatmap({ markets, bundle, selectedMarket, onSelectMarket }: CotHeatmapProps) {
  const { t } = useTitanI18n();

  return (
    <TitanPanel delayMs={80}>
      <TitanPanelHeader
        eyebrow={t("heatmap.eyebrow")}
        description={
          <>
            <span className="text-emerald-400/90">{t("heatmap.descGreen")}</span> {t("heatmap.descGreenRest")}{" "}
            <span className="text-rose-400/90">{t("heatmap.descRed")}</span> {t("heatmap.descRedRest")}{" "}
            <span className="text-amber-400/85">{t("heatmap.descAmber")}</span> {t("heatmap.descAmberRest")}
          </>
        }
      />
      <div className="grid grid-cols-2 gap-2.5 p-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {markets.map((m) => {
          const data = bundle[m.symbol];
          const { bg, border, ring, score } = cellVisuals(data);
          const active = m.symbol === selectedMarket.symbol;
          return (
            <button
              key={m.id}
              type="button"
              aria-pressed={active}
              disabled={!data}
              onClick={() => data && onSelectMarket(m)}
              className={`group relative flex flex-col rounded-xl border px-3 py-3.5 text-left transition-all duration-300 ${bg} ${border} ${ring} ${
                active
                  ? "z-10 scale-[1.02] border-titan-gold/50 shadow-[0_0_0_1px_rgba(212,175,55,0.4),0_16px_40px_-16px_rgba(212,175,55,0.25)]"
                  : ""
              } ${data ? "hover:border-titan-gold/35 hover:shadow-card active:scale-[0.99]" : "cursor-not-allowed opacity-35"}`}
            >
              <div className="flex items-center gap-2.5">
                <TitanMarketIcon market={m} size="sm" />
                <span className="font-display text-sm font-semibold text-stone-100">{m.shortLabel}</span>
              </div>
              <span className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-stone-500">
                {m.symbol}
              </span>
              {score !== null ? (
                <span className={`mt-3 font-mono text-xl font-semibold tabular-nums ${scoreHeatClass(score)}`}>
                  {score}
                </span>
              ) : (
                <span className="mt-3 font-mono text-sm text-stone-600 animate-pulse-soft">…</span>
              )}
              <span className="mt-0.5 text-[9px] uppercase tracking-widest text-stone-600 group-hover:text-titan-goldDim">
                TITAN
              </span>
            </button>
          );
        })}
      </div>
    </TitanPanel>
  );
}
