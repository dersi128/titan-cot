import type { CotDashboardData } from "../../types";
import { computeTitanDashboardScore } from "../../lib/titanCotScore";
import type { InstitutionalMarket } from "../../config/institutionalMarkets";

type CotHeatmapProps = {
  markets: readonly InstitutionalMarket[];
  bundle: Record<string, CotDashboardData>;
  selectedMarket: InstitutionalMarket;
  onSelectMarket: (market: InstitutionalMarket) => void;
};

function cellVisuals(data: CotDashboardData | undefined): {
  bg: string;
  ring: string;
  score: number | null;
} {
  if (!data) {
    return { bg: "bg-titan-elevated/50", ring: "", score: null };
  }
  const c = data.commercials;
  const r = data.retail;
  const score = computeTitanDashboardScore(data);

  let bg = "bg-titan-elevated/80";
  if (c.index26w > 80 && c.index52w > 80) {
    bg = "bg-emerald-950/70 border-emerald-600/35";
  } else if (c.index26w < 20 && c.index52w < 20) {
    bg = "bg-rose-950/70 border-rose-600/35";
  } else if (c.index26w > 80 || c.index52w > 80) {
    bg = "bg-emerald-950/40 border-emerald-700/20";
  } else if (c.index26w < 20 || c.index52w < 20) {
    bg = "bg-rose-950/40 border-rose-700/20";
  }

  let ring = "";
  if (r.index26w > 80 || r.index26w < 20) {
    ring = "ring-2 ring-amber-500/50 ring-offset-2 ring-offset-titan-panel";
  }

  return { bg, ring, score };
}

export function CotHeatmap({ markets, bundle, selectedMarket, onSelectMarket }: CotHeatmapProps) {
  return (
    <section className="animate-fade-up rounded-xl border border-titan-line bg-titan-panel/80 shadow-card backdrop-blur-sm transition-all duration-300 hover:border-titan-gold/15">
      <header className="border-b border-titan-line px-5 py-4">
        <h2 className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-titan-gold">
          COT Heatmap
        </h2>
        <p className="mt-1 text-sm text-stone-500">
          <span className="text-emerald-400/90">Green</span> commercial skew ·{" "}
          <span className="text-rose-400/90">Red</span> commercial skew ·{" "}
          <span className="text-amber-400/90">Amber ring</span> retail 26W extreme
        </p>
      </header>
      <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {markets.map((m) => {
          const data = bundle[m.symbol];
          const { bg, ring, score } = cellVisuals(data);
          const active = m.symbol === selectedMarket.symbol;
          return (
            <button
              key={m.id}
              type="button"
              aria-pressed={active}
              disabled={!data}
              onClick={() => data && onSelectMarket(m)}
              className={`group relative flex flex-col rounded-lg border px-3 py-4 text-left transition-all duration-300 ease-out ${bg} ${ring} ${
                active
                  ? "z-10 scale-[1.02] border-titan-gold/55 shadow-[0_0_0_2px_rgba(201,162,39,0.35),0_12px_40px_-12px_rgba(201,162,39,0.25)]"
                  : "border-titan-line/80"
              } ${data ? "hover:border-titan-gold/40 hover:shadow-card active:scale-[0.99]" : "cursor-not-allowed opacity-40"}`}
            >
              <span className="font-display text-sm font-semibold text-stone-100">{m.shortLabel}</span>
              <span className="mt-0.5 text-[10px] uppercase tracking-wider text-stone-500">{m.symbol}</span>
              {score !== null ? (
                <span className="mt-3 font-mono text-lg font-medium text-stone-200">{score}</span>
              ) : (
                <span className="mt-3 font-mono text-sm text-stone-600">…</span>
              )}
              <span className="mt-1 text-[9px] text-stone-500 transition-colors group-hover:text-titan-goldDim">
                Score
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
