import type { CotPlatformRow } from "../lib/cotScanner";
import { verdictTone } from "../lib/cotScore";

type CotScannerPreviewProps = {
  rows: CotPlatformRow[];
  activeSymbol: string;
  onSelectMarket: (symbol: string) => void;
  onOpenFullScanner: () => void;
};

export function CotScannerPreview({ rows, activeSymbol, onSelectMarket, onOpenFullScanner }: CotScannerPreviewProps) {
  const ranked = rows
    .filter((r) => r.status === "live" && r.cotScore !== null)
    .sort((a, b) => Math.abs(b.cotScore!) - Math.abs(a.cotScore!))
    .slice(0, 8);

  return (
    <div className="cot-preview-card">
      <div className="cot-preview-head">
        <div>
          <p className="cot-preview-eyebrow">Live</p>
          <h2>COT Scanner</h2>
        </div>
        <button type="button" className="cot-preview-expand" onClick={onOpenFullScanner}>
          Expand
        </button>
      </div>
      <p className="cot-preview-hint">By |score|. Click row to open detail.</p>
      <div className="cot-preview-table">
        <div className="cot-preview-row cot-preview-head-row">
          <span>Mkt</span>
          <span>Sym</span>
          <span>R26</span>
          <span>R52</span>
          <span>Scr</span>
          <span>V</span>
        </div>
        {ranked.map((row) => (
          <button
            key={row.futuresSymbol}
            type="button"
            className={`cot-preview-row ${row.futuresSymbol === activeSymbol ? "active" : ""}`}
            onClick={() => onSelectMarket(row.futuresSymbol)}
          >
            <span className="cot-preview-mkt">{row.market}</span>
            <span className="cot-preview-sym">{row.futuresSymbol}</span>
            <span className={previewIdxCell(row.retail26w)}>{fmtRetailIdx(row.retail26w)}</span>
            <span className={previewIdxCell(row.retail52w)}>{fmtRetailIdx(row.retail52w)}</span>
            <span className={`cot-preview-num heat-${heatClass(row.cotScore!)}`}>{row.cotScore}</span>
            <span className={`cot-preview-verdict ${verdictTone(row.verdict)}`}>
              {row.verdict === "—" ? "—" : row.verdict[0]}
            </span>
          </button>
        ))}
        {ranked.length === 0 ? <div className="cot-preview-empty">Awaiting CFTC data…</div> : null}
      </div>
    </div>
  );
}

function heatClass(score: number): "bull" | "bear" | "neutral" {
  if (score >= 60) return "bull";
  if (score <= -60) return "bear";
  return "neutral";
}

function fmtRetailIdx(n: number | null): string {
  return n === null ? "—" : n.toFixed(0);
}

function previewIdxCell(v: number | null): string {
  if (v === null) return "cot-preview-idx cot-preview-idx--na";
  if (v > 80) return "cot-preview-idx cot-preview-idx--hi";
  if (v < 20) return "cot-preview-idx cot-preview-idx--lo";
  return "cot-preview-idx";
}
