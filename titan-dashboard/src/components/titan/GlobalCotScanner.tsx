import type { CotDashboardData } from "../../types";
import {
  commercialTrend,
  computeTitanDashboardScore,
  resolveTitanVerdict,
  scoreHeatClass,
  scoreRowAccentClass,
  verdictAccentClass,
  type PositioningTrend,
  type TitanBiasVerdict,
} from "../../lib/titanCotScore";
import type { InstitutionalMarket } from "../../config/institutionalMarkets";
import { useTitanI18n } from "../../i18n";
import { TitanMarketIcon } from "./TitanMarketIcon";
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
  if (t === "accumulation") return "titan-flow-pill--accumulation";
  if (t === "distribution") return "titan-flow-pill--distribution";
  return "titan-flow-pill--flat";
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
    <TitanPanel className="animate-fade-up overflow-hidden p-0">
      <div className="border-b border-white/[0.06] px-6 py-5">
        <TitanPanelHeader
          eyebrow={t("scanner.eyebrow")}
          description={
            <>
              {t("scanner.marketsSorted", { count: rows.length })}{" "}
              <span className="text-titan-muted">{t("scanner.legacyOnly")}</span>
            </>
          }
        />
      </div>
      <div className="titan-scanner-table-wrap">
        <table className="titan-scanner-table w-full min-w-[900px] text-left text-sm">
          <thead>
            <tr>
              <th className="px-6">{t("scanner.colMarket")}</th>
              <th className="text-right">{t("scanner.colScore")}</th>
              <th className="hidden md:table-cell">{t("scanner.colBiasBar")}</th>
              <th>{t("scanner.colVerdict")}</th>
              <th className="text-right">{t("scanner.colComm26")}</th>
              <th className="text-right">{t("scanner.colRetail26")}</th>
              <th className="px-6">{t("scanner.colFlow")}</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => {
              const active = row.market.symbol === selectedMarket.symbol;
              const disabled = row.status !== "live";
              const rowClass = row.status === "live" ? scoreRowAccentClass(row.score) : "";

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
                  className={`titan-scanner-row ${rowClass} ${
                    disabled ? "titan-scanner-row--disabled opacity-40" : "cursor-pointer"
                  } ${active ? "titan-scanner-row-active" : ""}`}
                  onClick={() => !disabled && onSelectMarket(row.market)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="titan-scanner-icon-slot flex h-12 w-12 shrink-0 items-center justify-center">
                        <TitanMarketIcon
                          market={row.market}
                          score={row.status === "live" ? row.score : undefined}
                        />
                      </div>
                      <div className="min-w-0">
                        <span className="font-display text-base font-semibold tracking-wide text-white">
                          {row.market.shortLabel}
                        </span>
                        <p className="mt-0.5 text-[11px] text-titan-muted">
                          {messages.category[row.market.category]} · {row.market.subtitle}
                        </p>
                        {row.status === "error" ? (
                          <p className="mt-1 text-[10px] text-titan-bear/90">{row.errorMessage}</p>
                        ) : null}
                      </div>
                    </div>
                  </td>
                  <td className={`px-4 py-4 text-right font-mono text-2xl font-bold tabular-nums ${scoreHeatClass(row.score)}`}>
                    {row.status === "live" ? row.score : "—"}
                  </td>
                  <td className="hidden w-40 px-4 py-4 md:table-cell">
                    {row.status === "live" ? <TitanScoreBar score={row.score} /> : "—"}
                  </td>
                  <td className={`max-w-[200px] px-4 py-4 text-[11px] font-semibold uppercase leading-snug tracking-wide ${verdictAccentClass(row.verdict)}`}>
                    {row.status === "live" ? row.verdict : "—"}
                  </td>
                  <td className="px-4 py-4 text-right font-mono text-base tabular-nums text-titan-text">
                    {row.comm26 !== null ? row.comm26.toFixed(0) : "—"}
                  </td>
                  <td className="px-4 py-4 text-right font-mono text-base tabular-nums text-titan-text">
                    {row.retail26 !== null ? row.retail26.toFixed(0) : "—"}
                  </td>
                  <td className="px-6 py-4">
                    {row.status === "live" ? (
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${trendPillClass(row.trend)}`}
                      >
                        {trendLabel(row.trend, t)}
                      </span>
                    ) : (
                      <span className="text-titan-muted">—</span>
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
