import type { CotDashboardData } from "../../types";
import {
  commercialTrend,
  computeTitanDashboardScore,
  resolveTitanVerdict,
  scoreHeatClass,
  verdictAccentClass,
  type PositioningTrend,
  type TitanBiasVerdict,
} from "../../lib/titanCotScore";
import type { InstitutionalMarket } from "../../config/institutionalMarkets";
import { useTitanI18n } from "../../i18n";
import { TitanPanel, TitanPanelHeader, TitanScoreBar } from "./ui/TitanPrimitives";

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

function trendLabel(trend: PositioningTrend, tr: (key: string) => string): string {
  if (trend === "accumulation") return tr("scanner.trendAccumulation");
  if (trend === "distribution") return tr("scanner.trendDistribution");
  return tr("scanner.trendFlat");
}

function trendPillClass(t: PositioningTrend): string {
  if (t === "accumulation") return "bg-emerald-500/12 text-emerald-300 border-emerald-500/25";
  if (t === "distribution") return "bg-rose-500/12 text-rose-300 border-rose-500/25";
  return "bg-stone-500/8 text-stone-500 border-stone-600/35";
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
        verdict: resolveTitanVerdict(data),
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
  const { t, messages } = useTitanI18n();
  const sorted = [...rows].sort((a, b) => Math.abs(b.score) - Math.abs(a.score));

  return (
    <TitanPanel>
      <TitanPanelHeader
        eyebrow={t("scanner.eyebrow")}
        description={
          <>
            {t("scanner.marketsSorted", { count: rows.length })}{" "}
            <span className="text-stone-600">{t("scanner.legacyOnly")}</span>
          </>
        }
      />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[780px] text-left text-sm">
          <thead className="sticky top-0 z-[1] bg-titan-panel/95 backdrop-blur-sm">
            <tr className="border-b border-titan-line text-[10px] font-semibold uppercase tracking-wider text-stone-500">
              <th className="px-5 py-3.5">{t("scanner.colMarket")}</th>
              <th className="px-3 py-3.5 text-right">{t("scanner.colScore")}</th>
              <th className="hidden px-3 py-3.5 md:table-cell">{t("scanner.colBiasBar")}</th>
              <th className="px-3 py-3.5">{t("scanner.colVerdict")}</th>
              <th className="px-3 py-3.5 text-right">{t("scanner.colComm26")}</th>
              <th className="px-3 py-3.5 text-right">{t("scanner.colRetail26")}</th>
              <th className="px-5 py-3.5">{t("scanner.colFlow")}</th>
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
                  className={`border-b border-titan-line/50 transition-colors duration-200 last:border-0 ${
                    disabled ? "opacity-45" : "cursor-pointer hover:bg-titan-elevated/40"
                  } ${active ? "titan-scanner-row-active" : ""}`}
                  onClick={() => !disabled && onSelectMarket(row.market)}
                >
                  <td className="px-5 py-3.5">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-semibold text-stone-100">{row.market.shortLabel}</span>
                      <span className="text-[11px] text-stone-500">
                        {messages.category[row.market.category]} · {row.market.subtitle}
                      </span>
                      {row.status === "error" ? (
                        <span className="text-[10px] text-rose-400/90">{row.errorMessage}</span>
                      ) : null}
                    </div>
                  </td>
                  <td
                    className={`px-3 py-3.5 text-right font-mono text-base font-semibold tabular-nums ${scoreHeatClass(row.score)}`}
                  >
                    {row.status === "live" ? row.score : "—"}
                  </td>
                  <td className="hidden w-36 px-3 py-3.5 md:table-cell">
                    {row.status === "live" ? <TitanScoreBar score={row.score} /> : "—"}
                  </td>
                  <td className={`px-3 py-3.5 text-xs font-medium leading-snug ${verdictAccentClass(row.verdict)}`}>
                    {row.status === "live" ? row.verdict : "—"}
                  </td>
                  <td className="px-3 py-3.5 text-right font-mono tabular-nums text-stone-300">
                    {row.comm26 !== null ? row.comm26.toFixed(0) : "—"}
                  </td>
                  <td className="px-3 py-3.5 text-right font-mono tabular-nums text-stone-300">
                    {row.retail26 !== null ? row.retail26.toFixed(0) : "—"}
                  </td>
                  <td className="px-5 py-3.5">
                    {row.status === "live" ? (
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${trendPillClass(row.trend)}`}
                      >
                        {trendLabel(row.trend, t)}
                      </span>
                    ) : (
                      <span className="text-stone-600">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </TitanPanel>
  );
}
