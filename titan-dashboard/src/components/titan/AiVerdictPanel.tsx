import type { CotDashboardData } from "../../types";
import {
  buildInstitutionalNarrative,
  commercialTrend,
  computeTitanDashboardScore,
  scoreToTitanBiasVerdict,
  verdictAccentClass,
} from "../../lib/titanCotScore";
import type { InstitutionalMarket } from "../../config/institutionalMarkets";

type AiVerdictPanelProps = {
  market: InstitutionalMarket;
  data: CotDashboardData | null;
  loading: boolean;
  /** `embedded` = inside Market Detail card (no duplicate market title). */
  variant?: "standalone" | "embedded";
};

export function AiVerdictPanel({ market, data, loading, variant = "standalone" }: AiVerdictPanelProps) {
  const score = data ? computeTitanDashboardScore(data) : null;
  const verdict = score !== null ? scoreToTitanBiasVerdict(score) : null;
  const narrative =
    data && score !== null && verdict !== null ? buildInstitutionalNarrative(data, score, verdict) : null;
  const trend = data ? commercialTrend(data) : null;

  const isEmbedded = variant === "embedded";

  const body = (
    <div className="space-y-4 px-5 py-5">
      {loading ? (
        <p className="animate-pulse-soft text-sm text-stone-500">Synthesizing CFTC positioning…</p>
      ) : !data ? (
        <p className="text-sm text-stone-500">COT data unavailable for {market.shortLabel}.</p>
      ) : (
        <>
          {!isEmbedded ? (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">Active</p>
              <p className="mt-1 font-display text-lg text-stone-100">
                {market.shortLabel}{" "}
                <span className="text-titan-goldDim">{market.symbol}</span>
              </p>
            </div>
          ) : null}
          <div className="flex flex-wrap items-baseline gap-6">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">TITAN score</p>
              <p className="font-mono text-3xl font-semibold text-stone-100">{score}</p>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">Verdict</p>
              <p
                className={`text-sm font-semibold leading-snug sm:text-base ${
                  verdict ? verdictAccentClass(verdict) : ""
                }`}
              >
                {verdict}
              </p>
            </div>
            {isEmbedded && trend ? (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">Comm. flow</p>
                <p className="text-sm capitalize text-stone-300">{trend}</p>
              </div>
            ) : null}
          </div>
          <div className="rounded-lg border border-titan-line/80 bg-titan-black/40 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-titan-goldDim">Narrative</p>
            <p className="mt-2 text-balance text-sm leading-relaxed text-stone-400">{narrative}</p>
          </div>
        </>
      )}
    </div>
  );

  if (isEmbedded) {
    return (
      <div className="overflow-hidden rounded-xl border border-titan-gold/25 bg-gradient-to-br from-titan-void/95 via-titan-panel/60 to-titan-black/40 shadow-[inset_0_1px_0_0_rgba(201,162,39,0.12)] transition-all duration-300">
        <header className="border-b border-titan-line/80 px-5 py-3">
          <h3 className="font-display text-[10px] font-semibold uppercase tracking-[0.22em] text-titan-gold">
            AI Verdict
          </h3>
          <p className="mt-0.5 text-xs text-stone-500">Institutional read · bias only, not execution</p>
        </header>
        {body}
      </div>
    );
  }

  return (
    <aside className="rounded-xl border border-titan-line bg-gradient-to-b from-titan-panel to-titan-void shadow-card backdrop-blur-sm transition-all duration-300 hover:border-titan-gold/25">
      <header className="border-b border-titan-line px-5 py-4">
        <h2 className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-titan-gold">
          AI Verdict Panel
        </h2>
        <p className="mt-1 text-sm text-stone-500">Institutional narrative · positioning context only</p>
      </header>
      {body}
    </aside>
  );
}
