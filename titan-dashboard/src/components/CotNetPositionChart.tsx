import { useId, useMemo } from "react";

export type NetSeriesKey = "commercialNet" | "nonCommercialNet" | "retailNet";

export type CotNetPositionChartProps = {
  title: string;
  history: Array<{ reportDate: string } & Record<NetSeriesKey, number>>;
  valueKey: NetSeriesKey;
  stroke: string;
  zoneFillUpper: string;
  zoneFillLower: string;
};

const W = 640;
const H = 132;
const PAD_L = 44;
const PAD_R = 10;
const PAD_T = 14;
const PAD_B = 22;

function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0;
  const s = [...values].sort((a, b) => a - b);
  if (s.length === 1) return s[0];
  const r = (p / 100) * (s.length - 1);
  const lo = Math.floor(r);
  const hi = Math.ceil(r);
  if (lo === hi) return s[lo];
  return s[lo] + (s[hi] - s[lo]) * (r - lo);
}

export function CotNetPositionChart({
  title,
  history,
  valueKey,
  stroke,
  zoneFillUpper,
  zoneFillLower,
}: CotNetPositionChartProps) {
  const clipUid = useId().replace(/:/g, "");
  const geom = useMemo(() => {
    if (history.length < 2) return null;

    const values = history.map((h) => h[valueKey]);
    const p20 = percentile(values, 20);
    const p80 = percentile(values, 80);
    const minV = Math.min(...values, 0);
    const maxV = Math.max(...values, 0);
    const span = maxV - minV || 1;
    const pad = span * 0.06;
    let yMin = Math.min(minV, p20, 0) - pad;
    let yMax = Math.max(maxV, p80, 0) + pad;
    if (yMax === yMin) {
      yMax += 1;
      yMin -= 1;
    }

    const innerW = W - PAD_L - PAD_R;
    const innerH = H - PAD_T - PAD_B;

    const xAt = (i: number) => PAD_L + (i / (history.length - 1)) * innerW;
    const yAt = (v: number) => PAD_T + ((yMax - v) / (yMax - yMin)) * innerH;

    const pathD = history
      .map((h, i) => `${i === 0 ? "M" : "L"} ${xAt(i).toFixed(2)} ${yAt(h[valueKey]).toFixed(2)}`)
      .join(" ");

    const yP20 = yAt(p20);
    const yP80 = yAt(p80);
    const yTop = PAD_T;
    const yBot = PAD_T + innerH;

    const upperZonePath = `M ${PAD_L} ${yTop} L ${PAD_L + innerW} ${yTop} L ${PAD_L + innerW} ${yP80} L ${PAD_L} ${yP80} Z`;
    const lowerZonePath = `M ${PAD_L} ${yP20} L ${PAD_L + innerW} ${yP20} L ${PAD_L + innerW} ${yBot} L ${PAD_L} ${yBot} Z`;

    const fmt = (n: number) => {
      const a = Math.abs(n);
      if (a >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
      if (a >= 1_000) return `${(n / 1_000).toFixed(0)}k`;
      return String(Math.round(n));
    };

    const ticks = [yMax, (yMax + yMin) / 2, yMin].map((v) => ({
      y: yAt(v),
      label: fmt(v),
    }));

    return {
      pathD,
      upperZonePath,
      lowerZonePath,
      zeroY: yAt(0),
      p20,
      p80,
      ticks,
      lastDate: history[history.length - 1].reportDate,
    };
  }, [history, valueKey]);

  if (!geom) {
    return (
      <div className="cot-net-chart cot-net-chart--empty">
        <span className="cot-net-chart-title">{title}</span>
        <span className="cot-net-chart-empty">Insufficient history</span>
      </div>
    );
  }

  return (
    <div className="cot-net-chart">
      <div className="cot-net-chart-head">
        <span className="cot-net-chart-title">{title}</span>
        <span className="cot-net-chart-meta">{geom.lastDate}</span>
      </div>
      <svg className="cot-net-chart-svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
        <clipPath id={`cot-clip-${clipUid}`}>
          <rect x={PAD_L} y={PAD_T} width={W - PAD_L - PAD_R} height={H - PAD_T - PAD_B} />
        </clipPath>
        <g clipPath={`url(#cot-clip-${clipUid})`}>
          <path d={geom.upperZonePath} fill={zoneFillUpper} />
          <path d={geom.lowerZonePath} fill={zoneFillLower} />
        </g>
        <line
          className="cot-net-chart-zero"
          x1={PAD_L}
          x2={W - PAD_R}
          y1={geom.zeroY}
          y2={geom.zeroY}
        />
        <path d={geom.pathD} fill="none" stroke={stroke} strokeWidth="2" strokeLinejoin="round" />
        {geom.ticks.map((t) => (
          <text key={t.label} className="cot-net-chart-tick" x={PAD_L - 6} y={t.y + 3} textAnchor="end">
            {t.label}
          </text>
        ))}
      </svg>
      <div className="cot-net-chart-legend">
        <span>
          <i className="cot-legend-dot" style={{ background: zoneFillUpper }} /> Upper zone (≥80th pct)
        </span>
        <span>
          <i className="cot-legend-dot" style={{ background: zoneFillLower }} /> Lower zone (≤20th pct)
        </span>
      </div>
    </div>
  );
}
