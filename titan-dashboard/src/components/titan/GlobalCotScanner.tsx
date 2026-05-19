import type { CotDashboardData } from "../../types";
import {
  commercialTrend,
  computeTitanDashboardScore,
  scoreHeatClass,
  scoreToTitanBiasVerdict,
  verdictAccentClass,
  type PositioningTrend,
  type TitanBiasVerdict,
} from "../../lib/titanCotScore";
import { MARKET_CATEGORY_LABELS, type InstitutionalMarket } from "../../config/institutionalMarkets";

export type ScannerRowModel = {
  market: InstitutionalMarket;
  score: number;
  verdict: TitanBiasVerdict;
  comm26: number | null;
  retail26: number | null;
  trend: PositioningTrend;
  status: "live" | "loading" | "error";
  errorMessage?: string;
};

type GlobalCotScannerProps = {
  rows: ScannerRowModel[];
  selectedMarket: InstitutionalMarket;
  onSelectMarket: (market: InstitutionalMarket) => void;
};

function trendLabel(t: PositioningTrend): string {
  if (t === "accumulation") return "Accumulation";
  if (t === "distribution") return "Distribution";
  return "Flat";
}

function trendPillClass(t: PositioningTrend): string {
  if (t === "accumulation") return "bg-emerald-500/15 text-emerald-300/90 border-emerald-500/25";
  if (t === "distribution") return "bg-rose-500/15 text-rose-300/90 border-rose-500/25";
  return "bg-stone-500/10 text-stone-500 border-stone-600/40";
}

export function buildScannerRows(
  markets: readonly InstitutionalMarket[],
  bundle: Record<string, CotDashboardData>,
  errors: Record<string, string>,
): ScannerRowModel[] {
  return markets.map((market) => {
    const data = bundle[market.symbol];
    if (data) {
      const score = computeTitanDashboardScore(data);
      return {
        market,
        score,
        verdict: scoreToTitanBiasVerdict(score),
        comm26: data.commercials.index26w,
        retail26: data.retail.index26w,
        trend: commercialTrend(data),
        status: "live",
      };
    }
    if (errors[market.symbol]) {
      return {
        market,
        score: 0,
        verdict: "NEUTRAL",
        comm26: null,
        retail26: null,
        trend: "flat",
        status: "error",
        errorMessage: errors[market.symbol],
      };
    }
    return {
      market,
      score: 0,
      verdict: "NEUTRAL",
      comm26: null,
      retail26: null,
      trend: "flat",
      status: "loading",
    };
  });
}

export function GlobalCotScanner({ rows, selectedMarket, onSelectMarket }: GlobalCotScannerProps) {
  const sorted = [...rows].sort((a, b) => Math.abs(b.score) - Math.abs(a.score));

  return (
    <section className="animate-fade-up rounded-xl border border-titan-line bg-titan-panel/80 shadow-card backdrop-blur-sm transition-all duration-300 hover:border-titan-gold/20">
      <header className="flex flex-col gap-1 border-b border-titan-line px-5 py-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-titan-gold">
            Global COT Scanner
          </h2>
          <p className="mt-1 text-sm text-stone-500">
            {rows.length} markets · sorted by strongest bias · Legacy futures only
          </p>
        </div>
      </header>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-titan-line text-[10px] font-semibold uppercase tracking-wider text-stone-500">
              <th className="px-5 py-3">Market / sector</th>
              <th className="px-3 py-3 text-right">COT Score</th>
              <th className="px-3 py-3">Verdict</th>
              <th className="px-3 py-3 text-right">Comm 26W</th>
              <th className="px-3 py-3 text-right">Retail 26W</th>
              <th className="px-5 py-3">Commercial flow</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => {
              const active = row.market.symbol === selectedMarket.symbol;
              const disabled = row.status !== "live";
              return (
                <tr
                  key={row.market.id}
                  role="button"
                  tabIndex={disabled ? -1 : 0}
                  aria-selected={active}
                  onKeyDown={(e) => {
                    if (disabled) return;
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelectMarket(row.market);
                    }
                  }}
                  className={`border-b border-titan-line/60 transition-all duration-300 ease-out last:border-0 ${
                    disabled ? "opacity-50" : "cursor-pointer hover:bg-titan-elevated/55"
                  } ${
                    active
                      ? "bg-titan-gold/[0.11] shadow-[inset_4px_0_0_0_rgba(201,162,39,0.95)] hover:bg-titan-gold/[0.14]"
                      : ""
                  }`}
                  onClick={() => !disabled && onSelectMarket(row.market)}
                >
                  <td className="px-5 py-3">
                    <div className="flex flex-col">
                      <span className="font-semibold tracking-wide text-stone-100">{row.market.shortLabel}</span>
                      <span className="text-[11px] text-stone-500">
                        {MARKET_CATEGORY_LABELS[row.market.category]} · {row.market.subtitle}
                      </span>
                      {row.status === "error" ? (
                        <span className="mt-1 text-[10px] text-rose-400/90">{row.errorMessage}</span>
                      ) : null}
                    </div>
                  </td>
                  <td className={`px-3 py-3 text-right font-mono text-sm font-medium ${scoreHeatClass(row.score)}`}>
                    {row.status === "live" ? row.score : "—"}
                  </td>
                  <td className={`px-3 py-3 font-medium ${verdictAccentClass(row.verdict)}`}>
                    {row.status === "live" ? row.verdict : "—"}
                  </td>
                  <td className="px-3 py-3 text-right font-mono text-stone-300">
                    {row.comm26 !== null ? row.comm26.toFixed(0) : "—"}
                  </td>
                  <td className="px-3 py-3 text-right font-mono text-stone-300">
                    {row.retail26 !== null ? row.retail26.toFixed(0) : "—"}
                  </td>
                  <td className="px-5 py-3">
                    {row.status === "live" ? (
                      <span
                        className={`inline-flex rounded border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${trendPillClass(row.trend)}`}
                      >
                        {trendLabel(row.trend)}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
