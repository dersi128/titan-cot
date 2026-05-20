import { useMemo, useState } from "react";
import type { CotDashboardData } from "../../types";
import {
  computeTitanDashboardScore,
  resolveTitanVerdict,
  scoreHeatClass,
  scoreRowAccentClass,
  verdictAccentClass,
  type TitanBiasVerdict,
} from "../../lib/titanCotScore";
import {
  commercialIndexZone,
  evaluateTitanPositioning,
  resolveMarketRegime,
  type MarketRegimeId,
} from "../../lib/titanCommercialIndex";
import { computeInstitutionalConviction, convictionRankScore, CONVICTION_MAX } from "../../lib/titanConviction";
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
  regime: MarketRegimeId;
  conviction: number;
  persistenceWeeks: number;
  isExtreme: boolean;
  status: "live" | "loading" | "error";
  errorMessage?: string;
};

type GlobalCotScannerProps = {
  rows: ScannerRowModel[];
  selectedMarket: InstitutionalMarket;
  onSelectMarket: (market: InstitutionalMarket) => void;
};

export type ScannerRegimeFilter = MarketRegimeId | "all";

function regimePillClass(regime: MarketRegimeId): string {
  if (regime === "accumulation" || regime === "trending") return "titan-regime-pill--bull";
  if (regime === "distribution") return "titan-regime-pill--bear";
  if (regime === "exhaustion" || regime === "transition") return "titan-regime-pill--warn";
  return "titan-regime-pill--neutral";
}

function isExtremeCommercial(index26w: number): boolean {
  const z = commercialIndexZone(index26w);
  return z === "extreme_short" || z === "extreme_long" || index26w <= 20 || index26w >= 80;
}

export function buildScannerRows(
  markets: readonly InstitutionalMarket[],
  bundle: Record<string, CotDashboardData>,
  errors: Record<string, string>,
): ScannerRowModel[] {
  return markets.map((market) => {
    const data = bundle[market.symbol];
    if (data) {
      try {
        const score = computeTitanDashboardScore(data);
        const conviction = computeInstitutionalConviction(data, score).level;
        const read = evaluateTitanPositioning(data);
        const comm26 = data.commercials?.index26w;
        const retail26 = data.retail?.index26w;
        return {
          market,
          score,
          verdict: resolveTitanVerdict(data),
          comm26: Number.isFinite(comm26) ? comm26 : null,
          retail26: Number.isFinite(retail26) ? retail26 : null,
          regime: resolveMarketRegime(data),
          conviction,
          persistenceWeeks: read?.commercialPersistenceWeeks ?? 0,
          isExtreme: Number.isFinite(comm26) ? isExtremeCommercial(comm26) : false,
          status: "live",
        };
      } catch (err) {
        console.error("[TITAN] buildScannerRows failed", market.symbol, err);
        return {
          market,
          score: data.cotScore ?? 0,
          verdict: data.cotVerdict ?? "NEUTRAL",
          comm26: data.commercials?.index26w ?? null,
          retail26: data.retail?.index26w ?? null,
          regime: "neutral",
          conviction: 0,
          persistenceWeeks: 0,
          isExtreme: false,
          status: "live",
        };
      }
    }
    if (errors[market.symbol]) {
      return {
        market,
        score: 0,
        verdict: "NEUTRAL",
        comm26: null,
        retail26: null,
        regime: "neutral",
        conviction: 0,
        persistenceWeeks: 0,
        isExtreme: false,
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
      regime: "neutral",
      conviction: 0,
      isExtreme: false,
      status: "loading",
    };
  });
}

function ConvictionStars({ level }: { level: number }) {
  return (
    <span
      className="titan-conviction-stars inline-flex gap-px text-[11px] tracking-[0.05em]"
      aria-label={`${level} of ${CONVICTION_MAX}`}
    >
      {Array.from({ length: CONVICTION_MAX }).map((_, i) => (
        <span key={i} className={i < level ? "text-titan-gold/90" : "text-stone-700/90"}>
          {i < level ? "★" : "☆"}
        </span>
      ))}
    </span>
  );
}

export function GlobalCotScanner({ rows, selectedMarket, onSelectMarket }: GlobalCotScannerProps) {
  const { t, messages } = useTitanI18n();
  const [onlyExtremes, setOnlyExtremes] = useState(false);
  const [regimeFilter, setRegimeFilter] = useState<ScannerRegimeFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<InstitutionalMarket["category"] | "all">("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((row) => {
      if (row.status !== "live") return true;
      if (onlyExtremes && !row.isExtreme) return false;
      if (regimeFilter !== "all" && row.regime !== regimeFilter) return false;
      if (categoryFilter !== "all" && row.market.category !== categoryFilter) return false;
      if (q) {
        const hay = `${row.market.shortLabel} ${row.market.subtitle} ${row.market.symbol}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [rows, onlyExtremes, regimeFilter, categoryFilter, search]);

  const sorted = useMemo(() => {
    const live = filtered.filter((r) => r.status === "live");
    const rest = filtered.filter((r) => r.status !== "live");
    live.sort((a, b) => {
      const rankA = convictionRankScore(a.score, a.conviction, a.persistenceWeeks);
      const rankB = convictionRankScore(b.score, b.conviction, b.persistenceWeeks);
      if (rankB !== rankA) return rankB - rankA;
      return Math.abs(b.score) - Math.abs(a.score);
    });
    return [...live, ...rest];
  }, [filtered]);

  const categories = useMemo(() => {
    const set = new Set<InstitutionalMarket["category"]>();
    rows.forEach((r) => set.add(r.market.category));
    return Array.from(set);
  }, [rows]);

  return (
    <TitanPanel className="titan-scanner-primary animate-fade-up overflow-hidden p-0">
      <div className="border-b border-white/[0.06] px-4 py-3 md:px-5">
        <TitanPanelHeader
          eyebrow={t("scanner.eyebrow")}
          description={
            <>
              {t("scanner.marketsSorted", { count: sorted.filter((r) => r.status === "live").length })}{" "}
              <span className="text-titan-muted">{t("scanner.legacyOnly")}</span>
            </>
          }
        />
        <div className="titan-scanner-filters mt-2.5 flex flex-wrap items-center gap-1.5">
          <label className="titan-filter-chip flex cursor-pointer items-center gap-1.5 border border-white/[0.07] bg-black/30 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wider text-stone-500">
            <input
              type="checkbox"
              className="accent-titan-gold"
              checked={onlyExtremes}
              onChange={(e) => setOnlyExtremes(e.target.checked)}
            />
            {t("home.filterOnlyExtremes")}
          </label>
          <select
            className="titan-filter-chip border border-white/[0.07] bg-black/30 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wider text-stone-400"
            value={regimeFilter}
            onChange={(e) => setRegimeFilter(e.target.value as ScannerRegimeFilter)}
          >
            <option value="all">{t("home.filterAllRegimes")}</option>
            {(
              [
                "distribution",
                "accumulation",
                "trending",
                "transition",
                "neutral",
                "rotation",
                "exhaustion",
              ] as const
            ).map((r) => (
              <option key={r} value={r}>
                {t(`positioning.regime.${r}`)}
              </option>
            ))}
          </select>
          <select
            className="titan-filter-chip border border-white/[0.07] bg-black/30 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wider text-stone-400"
            value={categoryFilter}
            onChange={(e) =>
              setCategoryFilter(e.target.value as InstitutionalMarket["category"] | "all")
            }
          >
            <option value="all">{t("home.filterAllAssets")}</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {messages.category[c]}
              </option>
            ))}
          </select>
          <input
            type="search"
            placeholder={t("home.filterSearch")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="titan-filter-search min-w-[120px] flex-1 border border-white/[0.07] bg-black/30 px-2.5 py-1 text-[11px] text-stone-300 placeholder:text-stone-600 md:max-w-[200px]"
          />
        </div>
      </div>
      <div className="titan-scanner-table-wrap">
        <table className="titan-scanner-table w-full min-w-[1020px] text-left text-sm">
          <thead>
            <tr>
              <th className="px-6">{t("scanner.colMarket")}</th>
              <th className="text-right">{t("scanner.colScore")}</th>
              <th className="hidden md:table-cell">{t("scanner.colBiasBar")}</th>
              <th>{t("scanner.colVerdict")}</th>
              <th className="text-right">{t("scanner.colComm26")}</th>
              <th className="text-right">{t("scanner.colRetail26")}</th>
              <th>{t("scanner.colRegime")}</th>
              <th className="px-6 text-right">{t("scanner.colConviction")}</th>
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
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="titan-scanner-icon-slot flex h-11 w-11 shrink-0 items-center justify-center">
                        <TitanMarketIcon
                          market={row.market}
                          score={row.status === "live" ? row.score : undefined}
                        />
                      </div>
                      <div className="min-w-0">
                        <span className="font-display text-[15px] font-semibold tracking-wide text-white">
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
                  <td
                    className={`px-4 py-3.5 text-right font-mono text-[1.65rem] font-bold leading-none tabular-nums ${scoreHeatClass(row.score)}`}
                  >
                    {row.status === "live" ? row.score : "—"}
                  </td>
                  <td className="hidden w-44 px-4 py-3.5 md:table-cell">
                    {row.status === "live" ? <TitanScoreBar score={row.score} /> : "—"}
                  </td>
                  <td
                    className={`max-w-[200px] px-4 py-3.5 text-[10px] font-semibold uppercase leading-snug tracking-wide ${verdictAccentClass(row.verdict)}`}
                  >
                    {row.status === "live" ? row.verdict : "—"}
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono text-sm tabular-nums text-titan-text">
                    {row.comm26 !== null ? row.comm26.toFixed(0) : "—"}
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono text-sm tabular-nums text-titan-text">
                    {row.retail26 !== null ? row.retail26.toFixed(0) : "—"}
                  </td>
                  <td className="px-4 py-3.5 align-middle">
                    {row.status === "live" ? (
                      <span
                        className={`titan-regime-pill inline-flex min-h-[1.625rem] min-w-[6.75rem] items-center justify-center px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] ${regimePillClass(row.regime)}`}
                      >
                        {t(`positioning.regime.${row.regime}`)}
                      </span>
                    ) : (
                      <span className="text-titan-muted">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-right align-middle">
                    {row.status === "live" ? (
                      <div className="inline-flex flex-col items-end gap-0.5">
                        <span className="font-mono text-[11px] font-medium tabular-nums text-stone-500">
                          {row.conviction}/{CONVICTION_MAX}
                        </span>
                        <ConvictionStars level={row.conviction} />
                      </div>
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
