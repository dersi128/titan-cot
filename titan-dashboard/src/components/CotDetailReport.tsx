import { useMemo, useState } from "react";
import type { CotDashboardData } from "../types";
import { buildCotHistoryInsights, sliceHistoryByWeeks, type CotHistoryRangeWeeks } from "../lib/cotHistoryInsights";
import { scoreHeatBand, verdictTone } from "../lib/cotScore";
import { CotNetPositionChart } from "./CotNetPositionChart";

type CotDetailReportProps = {
  marketLabel: string;
  futuresSymbol: string;
  displayName?: string;
  cotData: CotDashboardData | null;
  loading: boolean;
  error: string | null;
  statusMessage?: string;
};

const RANGE_OPTIONS: { id: CotHistoryRangeWeeks; label: string }[] = [
  { id: 26, label: "26W" },
  { id: 52, label: "52W" },
  { id: 156, label: "3Y" },
  { id: 260, label: "5Y" },
];

export function CotDetailReport({
  marketLabel,
  futuresSymbol,
  displayName,
  cotData,
  loading,
  error,
  statusMessage,
}: CotDetailReportProps) {
  const [rangeWeeks, setRangeWeeks] = useState<CotHistoryRangeWeeks>(52);

  const score = cotData?.cotScore ?? null;
  const verdict = cotData?.cotVerdict ?? null;
  const ready = Boolean(cotData);

  const chartHistory = useMemo(() => {
    if (!cotData?.history?.length) return [];
    return sliceHistoryByWeeks(cotData.history, rangeWeeks);
  }, [cotData, rangeWeeks]);

  const insights = useMemo(() => (cotData ? buildCotHistoryInsights(cotData) : null), [cotData]);

  return (
    <div className="cot-detail-report">
      <header className="cot-detail-header">
        <div>
          <p className="cot-detail-eyebrow">CFTC · Legacy Futures Only</p>
          <h1 className="cot-detail-title">
            {marketLabel} <span className="cot-detail-symbol">{futuresSymbol}</span>
          </h1>
          {displayName ? <p className="cot-detail-sub">{displayName}</p> : null}
        </div>
        {ready && verdict !== null && score !== null ? (
          <div className="cot-detail-verdict-block">
            <span className={`cot-detail-score heat-${scoreHeatBand(score)}`}>{score}</span>
            <span className={`cot-detail-verdict-pill ${verdictTone(verdict)}`}>{verdict}</span>
          </div>
        ) : null}
      </header>

      {loading ? <div className="cot-detail-state">Loading CFTC data…</div> : null}
      {error ? <div className="cot-detail-state cot-detail-error">{error}</div> : null}
      {!loading && !error && !ready ? (
        <div className="cot-detail-state">{statusMessage ?? "COT data unavailable for this contract."}</div>
      ) : null}

      {ready && cotData ? (
        <>
          <p className="cot-detail-disclaimer">
            Positioning only — directional bias, not buy/sell timing. Not investment advice.
          </p>
          {cotData.plainEnglishExplanation ? (
            <p className="cot-detail-explanation">{cotData.plainEnglishExplanation}</p>
          ) : null}
          <div className="cot-detail-meta">
            <span>Report date · {cotData.reportDate}</span>
            {cotData.cftcMarketName ? <span>CFTC · {cotData.cftcMarketName}</span> : null}
            {cotData.market ? <span>Market · {cotData.market}</span> : null}
          </div>

          {insights ? (
            <section className="cot-detail-section cot-insights-section">
              <h2>Read</h2>
              <div className="cot-insights-grid">
                <div className="cot-insight-cell">
                  <span className="cot-insight-label">Commercials</span>
                  <span className="cot-insight-value">{insights.commercialPctileNote}</span>
                </div>
                <div className="cot-insight-cell">
                  <span className="cot-insight-label">Retail vs commercial</span>
                  <span className="cot-insight-value">{insights.retailVsCommercialNote}</span>
                </div>
                <div className="cot-insight-cell emphasize">
                  <span className="cot-insight-label">Non-commercials</span>
                  <span className="cot-insight-value">{insights.nonCommDivergenceLabel}</span>
                </div>
              </div>
            </section>
          ) : null}

          {cotData.history && cotData.history.length >= 2 ? (
            <section className="cot-detail-section cot-charts-section">
              <div className="cot-charts-toolbar">
                <h2>Net positioning history</h2>
                <div className="cot-range-toggle" role="group" aria-label="History window">
                  {RANGE_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      className={rangeWeeks === opt.id ? "active" : ""}
                      onClick={() => setRangeWeeks(opt.id)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="cot-charts-grid">
                <CotNetPositionChart
                  title="Commercials (net)"
                  history={chartHistory}
                  valueKey="commercialNet"
                  stroke="#fcee0a"
                  zoneFillUpper="rgba(252, 238, 10, 0.42)"
                  zoneFillLower="rgba(255, 0, 110, 0.32)"
                />
                <CotNetPositionChart
                  title="Non-commercials (net)"
                  history={chartHistory}
                  valueKey="nonCommercialNet"
                  stroke="#00e5ff"
                  zoneFillUpper="rgba(0, 229, 255, 0.38)"
                  zoneFillLower="rgba(252, 238, 10, 0.22)"
                />
                <CotNetPositionChart
                  title="Retail / non-reportable (net)"
                  history={chartHistory}
                  valueKey="retailNet"
                  stroke="#ff006e"
                  zoneFillUpper="rgba(255, 0, 110, 0.35)"
                  zoneFillLower="rgba(0, 229, 255, 0.22)"
                />
              </div>
            </section>
          ) : null}

          <section className="cot-detail-section">
            <h2>Snapshot</h2>
            <div className="cot-detail-grid">
              <Metric label="26-week index" value={fmt(cotData.commercials.index26w)} heat={cotData.commercials.index26w} />
              <Metric label="52-week index" value={fmt(cotData.commercials.index52w)} heat={cotData.commercials.index52w} />
              <Metric
                label="Net (contracts)"
                value={cotData.commercials.net !== undefined ? String(cotData.commercials.net) : "—"}
              />
              <Metric label="Weekly Δ net" value={fmtDelta(cotData.commercials.weeklyChange)} />
              <Metric label="4-week Δ net" value={fmtDelta(cotData.commercials.delta4w)} />
              <Metric label="13-week Δ net" value={fmtDelta(cotData.commercials.delta13w)} />
              <Metric label="Bias" value={cotData.commercials.bias} />
            </div>
          </section>

          <section className="cot-detail-section">
            <h2>Non-commercials</h2>
            <div className="cot-detail-grid">
              <Metric label="Divergence vs commercials" value={cotData.nonCommercials.divergence} emphasize />
              <Metric label="26-week index" value={fmt(cotData.nonCommercials.index26w)} heat={cotData.nonCommercials.index26w} />
              <Metric label="52-week index" value={fmt(cotData.nonCommercials.index52w)} heat={cotData.nonCommercials.index52w} />
              {cotData.nonCommercials.net !== undefined ? (
                <Metric label="Net" value={String(cotData.nonCommercials.net)} />
              ) : null}
              {cotData.nonCommercials.weeklyChange !== undefined ? (
                <Metric label="Weekly Δ net" value={fmtDelta(cotData.nonCommercials.weeklyChange)} />
              ) : null}
              <Metric label="4-week Δ net" value={fmtDelta(cotData.nonCommercials.delta4w)} />
              <Metric label="13-week Δ net" value={fmtDelta(cotData.nonCommercials.delta13w)} />
            </div>
          </section>

          <section className="cot-detail-section">
            <h2>Retail (non-reportable)</h2>
            <div className="cot-detail-grid">
              <Metric label="Retail 26W index" value={fmt(cotData.retail.index26w)} heat={cotData.retail.index26w} />
              <Metric label="Retail 52W index" value={fmt(cotData.retail.index52w)} heat={cotData.retail.index52w} />
              <Metric label="Contrarian signal" value={cotData.retail.contrarianSignal} />
              {cotData.retail.net !== undefined ? <Metric label="Net" value={String(cotData.retail.net)} /> : null}
              <Metric label="Weekly Δ net" value={fmtDelta(cotData.retail.weeklyChange)} />
              <Metric label="4-week Δ net" value={fmtDelta(cotData.retail.delta4w)} />
              <Metric label="13-week Δ net" value={fmtDelta(cotData.retail.delta13w)} />
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}

function Metric({
  label,
  value,
  heat,
  emphasize,
}: {
  label: string;
  value: string;
  heat?: number;
  emphasize?: boolean;
}) {
  const cls =
    heat !== undefined ? (heat >= 80 ? "bull" : heat <= 20 ? "bear" : "neutral") : "neutral";

  return (
    <div className={`cot-detail-metric ${emphasize ? "emphasize" : ""}`}>
      <span className="cot-detail-metric-label">{label}</span>
      <strong className={`cot-detail-metric-value ${cls}`}>{value}</strong>
    </div>
  );
}

function fmt(n: number): string {
  return n.toFixed(1);
}

function fmtDelta(n: number): string {
  if (n > 0) return `+${n.toLocaleString()}`;
  return n.toLocaleString();
}
