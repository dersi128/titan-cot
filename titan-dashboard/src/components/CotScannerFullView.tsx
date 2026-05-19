import { useMemo, useState } from "react";
import {
  assignRanks,
  filterCotRows,
  sortCotRows,
  type CotPlatformRow,
  type CotScannerFilter,
  type CotScannerSortMode,
} from "../lib/cotScanner";
import { verdictTone } from "../lib/cotScore";

type CotScannerFullViewProps = {
  baseRows: CotPlatformRow[];
  onBack: () => void;
  onSelectMarket: (symbol: string) => void;
};

const FILTERS: { id: CotScannerFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "bullish", label: "Bullish" },
  { id: "bearish", label: "Bearish" },
  { id: "neutral", label: "Neutral" },
  { id: "divergence", label: "Divergence" },
  { id: "retail_extreme", label: "Retail extreme" },
  { id: "commercial_extreme", label: "Commercial extreme" },
];

const SORTS: { id: CotScannerSortMode; label: string }[] = [
  { id: "score_desc", label: "Highest COT score" },
  { id: "score_asc", label: "Lowest COT score" },
  { id: "bullish_strength", label: "Strongest bullish" },
  { id: "bearish_strength", label: "Strongest bearish" },
  { id: "weekly_change_abs", label: "Biggest weekly change" },
];

export function CotScannerFullView({ baseRows, onBack, onSelectMarket }: CotScannerFullViewProps) {
  const [filter, setFilter] = useState<CotScannerFilter>("all");
  const [sortMode, setSortMode] = useState<CotScannerSortMode>("score_desc");

  const tableRows = useMemo(() => {
    const filtered = filterCotRows(baseRows, filter);
    const sorted = sortCotRows(filtered, sortMode);
    return assignRanks(sorted);
  }, [baseRows, filter, sortMode]);

  return (
    <div className="cot-scanner-fullscreen" role="dialog" aria-label="COT Scanner">
      <header className="cot-scanner-full-header">
        <button type="button" className="cot-scanner-back" onClick={onBack}>
          ← Back to Market Detail
        </button>
        <div className="cot-scanner-full-title">
          <h1 className="titan-cyber-title titan-cyber-title--scanner" translate="no">
            <span className="titan-cyber-title__glitch" data-text="TITAN">
              TITAN
            </span>
            <span className="titan-cyber-title__sep"> · </span>
            <span className="titan-cyber-title__sub">COT SCANNER</span>
          </h1>
          <p className="titan-cyber-tagline titan-cyber-tagline--muted">
            <span className="titan-cyber-tagline__slash">//</span> CFTC LEGACY FUTURES ONLY · {baseRows.length}{" "}
            MARKETS
          </p>
        </div>
      </header>

      <div className="cot-scanner-toolbar">
        <div className="cot-scanner-filters">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              className={`cot-filter-pill ${filter === f.id ? "active" : ""}`}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <label className="cot-scanner-sort-label">
          Sort
          <select
            className="cot-scanner-sort-select"
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value as CotScannerSortMode)}
          >
            {SORTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="cot-scanner-table-wrap">
        <table className="cot-scanner-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Market</th>
              <th>Symbol</th>
              <th>Score</th>
              <th>Verdict</th>
              <th>Comm 26W</th>
              <th>Ret 26W</th>
              <th>Ret 52W</th>
              <th>Div</th>
              <th>Δ wk</th>
            </tr>
          </thead>
          <tbody>
            {tableRows.map((row) => (
              <tr
                key={row.futuresSymbol}
                className={`cot-scanner-tr cot-scanner-tr--${row.status} ${rowClickable(row) ? "clickable" : ""}`}
                onClick={() => rowClickable(row) && onSelectMarket(row.futuresSymbol)}
              >
                <td className="td-muted">{row.rank}</td>
                <td className="td-strong">{row.market}</td>
                <td className="td-mono">{row.futuresSymbol}</td>
                <td className={scoreCell(row.cotScore)}>{row.cotScore === null ? "—" : row.cotScore}</td>
                <td>
                  <span className={`cot-verdict-tag ${verdictTone(row.verdict)}`}>
                    {row.verdict === "—" ? "—" : row.verdict}
                  </span>
                </td>
                <td className={heatCell(row.commercials26w)}>{fmtIdx(row.commercials26w)}</td>
                <td className={heatCell(row.retail26w)}>{fmtIdx(row.retail26w)}</td>
                <td className={heatCell(row.retail52w)}>{fmtIdx(row.retail52w)}</td>
                <td className={divCell(row.nonCommDivergence)}>{row.nonCommDivergence}</td>
                <td className={wkCell(row.weeklyChange)}>{fmtWk(row.weeklyChange)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {tableRows.length === 0 ? <p className="cot-scanner-empty">No rows match this filter.</p> : null}
      </div>
    </div>
  );
}

function rowClickable(row: CotPlatformRow): boolean {
  return row.status === "live";
}

function scoreCell(score: number | null): string {
  if (score === null) return "score-na";
  if (score >= 60) return "score-bull";
  if (score <= -60) return "score-bear";
  return "score-neutral";
}

function heatCell(v: number | null): string {
  if (v === null) return "heat-na";
  if (v >= 80) return "heat-bull";
  if (v <= 20) return "heat-bear";
  return "heat-neutral";
}

function divCell(d: string): string {
  if (d === "bullish") return "div-bull";
  if (d === "bearish") return "div-bear";
  return "div-none";
}

function wkCell(n: number | null): string {
  if (n === null) return "wk-na";
  if (n > 0) return "wk-up";
  if (n < 0) return "wk-down";
  return "wk-na";
}

function fmtIdx(n: number | null): string {
  return n === null ? "—" : n.toFixed(0);
}

function fmtWk(n: number | null): string {
  if (n === null) return "—";
  if (n > 0) return `+${n.toLocaleString()}`;
  return n.toLocaleString();
}
