import { useMemo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { SeasonalityComparison } from "../services/seasonalityService";
import { DEFAULT_YEARS_LOOKBACK } from "../yearsLookback";
import { lookbackColor, lookbackLabel } from "../yearsLookback";
import {
  buildMonthlyChartRows,
  CHART_LOOKBACK_ORDER,
  CURRENT_YEAR_CHART_KEY,
  CURRENT_YEAR_LINE_COLOR,
  currentYearCurveToMonthlyValues,
  lookbackChartKey,
  seasonalCurveToMonthlyValues,
} from "../utils/chartData";
import { useTitanI18n } from "../../i18n";
import { SeasonalityAlignmentBadge } from "./SeasonalityAlignmentBadge";
import { SeasonalityChartTooltip } from "./SeasonalityChartTooltip";

type SeasonalityMainChartProps = {
  comparison: SeasonalityComparison;
  currentMonth: number;
};

const HISTORICAL_STROKE = {
  5: 1.4,
  10: 1.65,
  15: 1.5,
  20: 1.4,
} as const satisfies Record<5 | 10 | 15 | 20, number>;

/** Bull/bear seasonal windows — readable on institutional world-map backdrop. */
const WINDOW_BAND_STYLE = {
  bullish: {
    fill: "#00d084",
    fillOpacity: 0.22,
    stroke: "rgba(0, 208, 132, 0.55)",
    strokeWidth: 1,
    strokeOpacity: 0.85,
  },
  bearish: {
    fill: "#ff4d6d",
    fillOpacity: 0.22,
    stroke: "rgba(255, 77, 109, 0.55)",
    strokeWidth: 1,
    strokeOpacity: 0.85,
  },
} as const;

function monthFromDoy(doy: number): number {
  return new Date(2024, 0, doy).getMonth() + 1;
}

export function SeasonalityMainChart({ comparison, currentMonth }: SeasonalityMainChartProps) {
  const { t } = useTitanI18n();

  const primaryResult = comparison[DEFAULT_YEARS_LOOKBACK] ?? comparison[10];

  const chartData = useMemo(() => {
    if (!primaryResult) return [];

    const series: { key: string; values: (number | null)[] | number[] }[] = [];

    for (const lb of CHART_LOOKBACK_ORDER) {
      const res = comparison[lb];
      if (!res) continue;
      series.push({
        key: lookbackChartKey(lb),
        values: seasonalCurveToMonthlyValues(res.seasonalCurve),
      });
    }

    if (primaryResult.currentYearCurve.length > 0) {
      series.push({
        key: CURRENT_YEAR_CHART_KEY,
        values: currentYearCurveToMonthlyValues(primaryResult.currentYearCurve, currentMonth),
      });
    }

    return buildMonthlyChartRows(series, currentMonth);
  }, [comparison, primaryResult, currentMonth]);

  const windowBands = useMemo(() => {
    if (!primaryResult) return [];
    const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const bands: { x1: string; x2: string; bias: "bullish" | "bearish" }[] = [];
    const add = (w: (typeof primaryResult)["bullishWindows"][0], bias: "bullish" | "bearish") => {
      const m1 = monthFromDoy(w.startDay);
      const m2 = monthFromDoy(w.endDay);
      bands.push({ x1: MONTHS[m1 - 1], x2: MONTHS[m2 - 1], bias });
    };
    primaryResult.bullishWindows.forEach((w) => add(w, "bullish"));
    primaryResult.bearishWindows.forEach((w) => add(w, "bearish"));
    return bands;
  }, [primaryResult]);

  if (!primaryResult) return null;

  const currentYear = new Date(primaryResult.currentDate).getFullYear();

  return (
    <div className="titan-seasonality-chart rounded-lg border border-titan-gold/12 bg-titan-panel/40 p-4">
      <div className="flex flex-wrap items-center gap-2 border-b border-white/[0.06] pb-3">
        <SeasonalityAlignmentBadge alignment={primaryResult.seasonalityAlignment} />
      </div>

      <div className="titan-seasonality-legend-row mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
        {CHART_LOOKBACK_ORDER.map((lb) => {
          if (!comparison[lb]) return null;
          const color = lookbackColor(lb);
          return (
            <span
              key={lb}
              className="inline-flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-wider"
              style={{ color }}
            >
              <span className="rounded-full" style={{ background: color, width: 12, height: 2 }} />
              {lookbackLabel(lb)} {t("seasonality.legendSeasonalitySuffix")}
            </span>
          );
        })}
        <span className="inline-flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-wider text-stone-100">
          <span className="rounded-full bg-stone-100" style={{ width: 14, height: 3 }} />
          {t("seasonality.legendCurrentYear", { year: currentYear })}
        </span>
        <span className="inline-flex items-center gap-1.5 text-[9px] uppercase tracking-wider text-emerald-400/80">
          <span className="titan-seasonality-legend-band titan-seasonality-legend-band--bull" />
          {t("seasonality.legendBull")}
        </span>
        <span className="inline-flex items-center gap-1.5 text-[9px] uppercase tracking-wider text-rose-400/80">
          <span className="titan-seasonality-legend-band titan-seasonality-legend-band--bear" />
          {t("seasonality.legendBear")}
        </span>
      </div>

      <div className="mt-2">
        <p className="titan-cmd-kicker">{t("seasonality.chartTitle")}</p>
        <p className="mt-1 text-[10px] text-stone-600">{t("seasonality.disclaimer")}</p>
      </div>

      <div className="titan-seasonality-chart-plot mt-3 h-[300px] w-full md:h-[360px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.07)" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fill: "#78716c", fontSize: 10 }}
              axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fill: "#78716c", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={36}
            />
            <Tooltip content={<SeasonalityChartTooltip />} cursor={{ stroke: "rgba(255,255,255,0.08)" }} />
            {windowBands.map((band, i) => {
              const style = WINDOW_BAND_STYLE[band.bias];
              return (
                <ReferenceArea
                  key={`${band.bias}-${i}`}
                  x1={band.x1}
                  x2={band.x2}
                  fill={style.fill}
                  fillOpacity={style.fillOpacity}
                  stroke={style.stroke}
                  strokeWidth={style.strokeWidth}
                  strokeOpacity={style.strokeOpacity}
                  ifOverflow="visible"
                />
              );
            })}
            {CHART_LOOKBACK_ORDER.map((lb) => {
              const key = lookbackChartKey(lb);
              if (!comparison[lb]) return null;
              return (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  name={key}
                  stroke={lookbackColor(lb)}
                  strokeWidth={HISTORICAL_STROKE[lb as 5 | 10 | 15 | 20]}
                  strokeOpacity={lb === 10 ? 1 : 0.72}
                  dot={false}
                  activeDot={false}
                  connectNulls
                />
              );
            })}
            <Line
              type="monotone"
              dataKey={CURRENT_YEAR_CHART_KEY}
              name={CURRENT_YEAR_CHART_KEY}
              stroke={CURRENT_YEAR_LINE_COLOR}
              strokeWidth={2.75}
              className="titan-seasonality-line-current-year"
              dot={false}
              connectNulls={false}
              activeDot={{ r: 4, fill: CURRENT_YEAR_LINE_COLOR, stroke: "#0a0b0e", strokeWidth: 1 }}
            />
            {chartData
              .filter((row) => row.isCurrent)
              .map((row) => {
                const cyY = row[CURRENT_YEAR_CHART_KEY];
                if (typeof cyY !== "number") return null;
                return (
                  <ReferenceDot
                    key="cy-dot"
                    x={String(row.month)}
                    y={cyY}
                    r={5}
                    fill={CURRENT_YEAR_LINE_COLOR}
                    stroke="#0a0b0e"
                    strokeWidth={2}
                  />
                );
              })
              .filter(Boolean)}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
