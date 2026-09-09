import { useMemo, useState } from "react";
import { scoreHeatClass, scoreRowAccentClass, verdictAccentClass } from "../../lib/titanCotScore";
import { type MarketRegimeId } from "../../lib/titanCommercialIndex";
import { CONVICTION_MAX } from "../../lib/titanConviction";
import {
  nextScannerSort,
  sortScannerRows,
  type ScannerSortKey,
  type ScannerSortState,
} from "../../lib/cotScannerSort";
import { buildScannerRows, type ScannerRowModel } from "../../lib/cotScannerRows";
import { regimePillClass } from "../../lib/titanRegimeTone";
import type { InstitutionalMarket } from "../../config/institutionalMarkets";
import { useTitanI18n } from "../../i18n";
import { TitanMarketIcon } from "./TitanMarketIcon";
import { TitanFilterSelect } from "./ui/TitanFilterSelect";
import { TitanPanel, TitanPanelHeader, TitanScoreBar } from "./ui/TitanPrimitives";

export type { ScannerRowModel };
export { buildScannerRows };

type GlobalCotScannerProps = {
  rows: ScannerRowModel[];
  selectedMarket: InstitutionalMarket;
  onSelectMarket: (market: InstitutionalMarket) => void;
};

export type ScannerRegimeFilter = MarketRegimeId | "all";

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

function SortHeader({
  column,
  label,
  sort,
  onSort,
  align = "left",
  hidden,
  padded,
}: {
  column: ScannerSortKey;
  label: string;
  sort: ScannerSortState | null;
  onSort: (column: ScannerSortKey) => void;
  align?: "left" | "right";
  hidden?: boolean;
  padded?: "start" | "end";
}) {
  const active = sort?.key === column;
  const ariaSort = active ? (sort.dir === "asc" ? "ascending" : "descending") : "none";
  const arrow = !active ? "" : sort.dir === "asc" ? "↑" : "↓";
  return (
    <th
      aria-sort={ariaSort}
      className={`${hidden ? "hidden md:table-cell" : ""} ${padded === "start" ? "px-6" : ""} ${padded === "end" ? "px-6" : ""} ${align === "right" ? "text-right" : "text-left"}`}
    >
      <button
        type="button"
        className={`titan-scanner-sort ${align === "right" ? "titan-scanner-sort--end" : ""}`}
        onClick={() => onSort(column)}
      >
        <span>{label}</span>
        {arrow ? <span aria-hidden="true">{arrow}</span> : null}
      </button>
    </th>
  );
}

export function GlobalCotScanner({ rows, selectedMarket, onSelectMarket }: GlobalCotScannerProps) {
  const { t, messages } = useTitanI18n();
  const [onlyExtremes, setOnlyExtremes] = useState(false);
  const [regimeFilter, setRegimeFilter] = useState<ScannerRegimeFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<InstitutionalMarket["category"] | "all">("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<ScannerSortState | null>(null);

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

  const sorted = useMemo(
    () =>
      sortScannerRows(filtered, sort, (regime) => t(`positioning.regime.${regime}`)),
    [filtered, sort, t],
  );

  const categories = useMemo(() => {
    const set = new Set<InstitutionalMarket["category"]>();
    rows.forEach((r) => set.add(r.market.category));
    return Array.from(set);
  }, [rows]);

  const regimeOptions = useMemo(
    () => [
      { value: "all", label: t("home.filterAllRegimes") },
      ...(
        [
          "distribution",
          "accumulation",
          "trending",
          "transition",
          "neutral",
          "rotation",
          "exhaustion",
        ] as const
      ).map((r) => ({ value: r, label: t(`positioning.regime.${r}`) })),
    ],
    [t],
  );

  const categoryOptions = useMemo(
    () => [
      { value: "all", label: t("home.filterAllAssets") },
      ...categories.map((c) => ({ value: c, label: messages.category[c] })),
    ],
    [categories, messages.category, t],
  );

  function handleSort(column: ScannerSortKey) {
    setSort((current) => nextScannerSort(current, column));
  }

  return (
    <TitanPanel className="titan-scanner-primary titan-home-scanner animate-fade-up overflow-visible p-0">
      <div className="titan-scanner-head border-b border-white/10 px-4 py-3 md:px-5">
        <TitanPanelHeader
          eyebrow={t("scanner.eyebrow")}
          description={
            <span className="text-[13px] text-stone-300">
              {t("scanner.marketsSorted", { count: sorted.filter((r) => r.status === "live").length })}{" "}
              <span className="text-stone-400">{t("scanner.legacyOnly")}</span>
            </span>
          }
        />
        <div className="titan-scanner-filters mt-3 flex flex-wrap items-center gap-2.5">
          <label className="titan-filter-chip">
            <input
              type="checkbox"
              className="h-3.5 w-3.5 accent-[#2ea8ff]"
              checked={onlyExtremes}
              onChange={(e) => setOnlyExtremes(e.target.checked)}
            />
            <span>{t("home.filterOnlyExtremes")}</span>
          </label>
          <TitanFilterSelect
            value={regimeFilter}
            onChange={(v) => setRegimeFilter(v as ScannerRegimeFilter)}
            options={regimeOptions}
            aria-label={t("home.filterAllRegimes")}
          />
          <TitanFilterSelect
            value={categoryFilter}
            onChange={(v) => setCategoryFilter(v as InstitutionalMarket["category"] | "all")}
            options={categoryOptions}
            aria-label={t("home.filterAllAssets")}
          />
          <input
            type="search"
            placeholder={t("home.filterSearch")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="titan-filter-search min-w-[160px] flex-1 md:max-w-[240px]"
          />
        </div>
      </div>
      <div className="titan-scanner-table-wrap overflow-x-auto rounded-b-2xl">
        <table className="titan-scanner-table w-full min-w-[1020px] text-left text-sm">
          <thead>
            <tr>
              <SortHeader column="market" label={t("scanner.colMarket")} sort={sort} onSort={handleSort} padded="start" />
              <SortHeader column="score" label={t("scanner.colScore")} sort={sort} onSort={handleSort} align="right" />
              <SortHeader
                column="bias"
                label={t("scanner.colBiasBar")}
                sort={sort}
                onSort={handleSort}
                hidden
              />
              <SortHeader column="verdict" label={t("scanner.colVerdict")} sort={sort} onSort={handleSort} />
              <SortHeader column="comm26" label={t("scanner.colComm26")} sort={sort} onSort={handleSort} align="right" />
              <SortHeader
                column="retail26"
                label={t("scanner.colRetail26")}
                sort={sort}
                onSort={handleSort}
                align="right"
              />
              <SortHeader column="regime" label={t("scanner.colRegime")} sort={sort} onSort={handleSort} />
              <SortHeader
                column="conviction"
                label={t("scanner.colConviction")}
                sort={sort}
                onSort={handleSort}
                align="right"
                padded="end"
              />
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => {
              const active = row.market.symbol === selectedMarket.symbol;
              const invalid = row.status !== "live";
              const rowClass = row.status === "live" ? scoreRowAccentClass(row.score) : "";

              return (
                <tr
                  key={row.market.id}
                  role="button"
                  tabIndex={invalid ? -1 : 0}
                  aria-selected={active}
                  onKeyDown={(e) => {
                    if (invalid) return;
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelectMarket(row.market);
                    }
                  }}
                  className={`titan-scanner-row ${rowClass} ${
                    invalid ? "titan-scanner-row--disabled opacity-40" : "cursor-pointer"
                  } ${row.status === "error" ? "titan-scanner-row--error" : ""} ${active ? "titan-scanner-row-active" : ""}`}
                  onClick={() => !invalid && onSelectMarket(row.market)}
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
                        <p className="mt-0.5 text-[12px] text-stone-300">
                          {messages.category[row.market.category]} · {row.market.subtitle}
                        </p>
                        {row.status === "error" ? (
                          <p className="mt-1 text-[10px] uppercase tracking-wide text-titan-bear/90">
                            {t("scanner.calcError")}
                            {row.errorMessage ? ` · ${row.errorMessage}` : ""}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </td>
                  <td
                    className={`px-4 py-3.5 text-right font-mono text-[1.65rem] font-bold leading-none tabular-nums ${row.status === "live" ? scoreHeatClass(row.score) : "text-titan-muted"}`}
                  >
                    {row.status === "live" ? row.score : "—"}
                  </td>
                  <td className="hidden w-44 px-4 py-3.5 md:table-cell">
                    {row.status === "live" ? <TitanScoreBar score={row.score} /> : "—"}
                  </td>
                  <td
                    className={`max-w-[200px] px-4 py-3.5 text-[10px] font-semibold uppercase leading-snug tracking-wide ${row.status === "live" ? verdictAccentClass(row.verdict) : "text-titan-muted"}`}
                  >
                    {row.status === "live" ? row.verdict : "—"}
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono text-sm font-medium tabular-nums text-stone-200">
                    {row.comm26 !== null ? row.comm26.toFixed(0) : "—"}
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono text-sm font-medium tabular-nums text-stone-200">
                    {row.retail26 !== null ? row.retail26.toFixed(0) : "—"}
                  </td>
                  <td className="px-4 py-3.5 align-middle">
                    {row.status === "live" ? (
                      <span
                        className={`titan-regime-pill inline-flex min-h-[1.625rem] min-w-[6.75rem] items-center justify-center px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] ${regimePillClass(row.regime, row.score)}`}
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
                        <span className="font-mono text-[11px] font-medium tabular-nums text-stone-400">
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
