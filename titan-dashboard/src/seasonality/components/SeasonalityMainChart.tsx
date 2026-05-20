import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Label,
  Line,
  LineChart,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { SeasonalityComparison } from "../services/seasonalityService";
import type { SeasonalityResult } from "../types";
import { lookbackColor } from "../yearsLookback";
import {
  buildMonthlyChartRows,
  type SeasonalityChartRow,
  CHART_LOOKBACK_ORDER,
  CURRENT_YEAR_CHART_KEY,
  CURRENT_YEAR_LINE_COLOR,
  currentYearCurveToMonthlyValues,
  lookbackChartKey,
  MONTHS,
  seasonalCurveToMonthlyValues,
} from "../utils/chartData";
import { useTitanI18n } from "../../i18n";
import { SeasonalityChartLegend, type SeasonalityLegendFocus } from "./SeasonalityChartLegend";
import { SeasonalityChartTooltip } from "./SeasonalityChartTooltip";
import { SeasonalityChartZoneDefs, SeasonalityChartZones } from "./SeasonalityChartZones";
import { SeasonalityYearMonthlyPanel } from "./SeasonalityYearMonthlyPanel";

type SeasonalityMainChartProps = {
  comparison: SeasonalityComparison;
  currentMonth: number;
  result: SeasonalityResult;
};

const HISTORICAL_STROKE = {
  5: 1.35,
  10: 1.65,
  15: 1.35,
  20: 1.3,
} as const satisfies Record<5 | 10 | 15 | 20, number>;

const HISTORICAL_BASE_OPACITY = {
  5: 0.55,
  10: 0.92,
  15: 0.55,
  20: 0.48,
} as const satisfies Record<5 | 10 | 15 | 20, number>;

const TITAN_GOLD = "#d4af37";

function monthFromDoy(doy: number): number {
  return new Date(2024, 0, doy).getMonth() + 1;
}

function lineOpacity(focus: SeasonalityLegendFocus, key: string, base: number): number {
  if (focus === null) return base;
  if (focus === CURRENT_YEAR_CHART_KEY) {
    return key === CURRENT_YEAR_CHART_KEY ? 1 : base * 0.22;
  }
  return focus === key ? Math.min(1, base + 0.12) : key === CURRENT_YEAR_CHART_KEY ? 1 : base * 0.22;
}

export function SeasonalityMainChart({ comparison, currentMonth, result }: SeasonalityMainChartProps) {
  const { t } = useTitanI18n();
  const [legendFocus, setLegendFocus] = useState<SeasonalityLegendFocus>(null);

  const primaryResult = result;

  const chartData = useMemo(() => {
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

    const rows = buildMonthlyChartRows(series, currentMonth);
    const monthly = primaryResult.currentYearMonthlyReturns ?? [];
    return rows.map((row, i): SeasonalityChartRow => ({
      ...row,
      monthReturnPct: monthly[i]?.pct ?? null,
    }));
  }, [comparison, primaryResult, currentMonth]);

  const windowBands = useMemo(() => {
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

  const currentYear = new Date(primaryResult.currentDate).getFullYear();
  const currentMonthKey = MONTHS[currentMonth - 1] ?? MONTHS[0];

  return (
    <div className="titan-seasonality-chart rounded-lg border border-titan-gold/12 p-4">
      <SeasonalityChartLegend
        comparison={comparison}
        currentYear={currentYear}
        focus={legendFocus}
        onFocusChange={setLegendFocus}
      />

      <div className="mt-2">
        <p className="titan-cmd-kicker">{t("seasonality.chartTitle")}</p>
        <p className="mt-1 text-[10px] text-stone-600">{t("seasonality.chartSeasonalNote")}</p>
      </div>

      <div className="titan-seasonality-chart-layout mt-3">
        <div className="titan-seasonality-chart-plot titan-seasonality-chart-plot--main h-[300px] min-w-0 flex-1 md:h-[360px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 28, right: 8, left: 0, bottom: 6 }}>
              <SeasonalityChartZoneDefs />
              <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis
                dataKey="month"
                tick={(props: { x?: number; y?: number; payload?: { value: string } }) => {
                  const { x = 0, y = 0, payload } = props;
                  const label = payload?.value ?? "";
                  const isCurrent = label === currentMonthKey;
                  return (
                    <text
                      x={x}
                      y={y + 14}
                      textAnchor="middle"
                      fill={isCurrent ? TITAN_GOLD : "#78716c"}
                      fontSize={isCurrent ? 11 : 10}
                      fontWeight={isCurrent ? 700 : 500}
                    >
                      {label}
                    </text>
                  );
                }}
                axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: "#78716c", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                width={32}
                label={{
                  value: t("seasonality.chartYAxis"),
                  angle: -90,
                  position: "insideLeft",
                  fill: "#57534e",
                  fontSize: 9,
                  offset: 12,
                }}
              />
              <Tooltip content={<SeasonalityChartTooltip />} cursor={{ stroke: "rgba(255,255,255,0.1)" }} />

              <SeasonalityChartZones
                bands={windowBands}
                bullLabel={t("seasonality.chartLabelBull")}
                bearLabel={t("seasonality.chartLabelBear")}
              />

              {CHART_LOOKBACK_ORDER.map((lb) => {
                const key = lookbackChartKey(lb);
                if (!comparison[lb]) return null;
                const baseOp = HISTORICAL_BASE_OPACITY[lb as 5 | 10 | 15 | 20];
                const isPrimary = lb === 10;
                return (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    name={key}
                    stroke={lookbackColor(lb)}
                    strokeWidth={HISTORICAL_STROKE[lb as 5 | 10 | 15 | 20]}
                    strokeOpacity={lineOpacity(legendFocus, key, baseOp)}
                    dot={false}
                    activeDot={isPrimary ? { r: 3, fill: lookbackColor(lb) } : false}
                    connectNulls
                    style={
                      legendFocus === key || (legendFocus === null && isPrimary)
                        ? { filter: `drop-shadow(0 0 8px ${lookbackColor(lb)}55)` }
                        : undefined
                    }
                  />
                );
              })}

              {primaryResult.currentYearCurve.length > 0 ? (
                <Line
                  type="monotone"
                  dataKey={CURRENT_YEAR_CHART_KEY}
                  name={CURRENT_YEAR_CHART_KEY}
                  stroke={CURRENT_YEAR_LINE_COLOR}
                  strokeWidth={legendFocus === CURRENT_YEAR_CHART_KEY || legendFocus === null ? 3.5 : 3}
                  className="titan-seasonality-line-current-year"
                  strokeOpacity={lineOpacity(legendFocus, CURRENT_YEAR_CHART_KEY, 1)}
                  dot={false}
                  connectNulls={false}
                  activeDot={{ r: 5, fill: CURRENT_YEAR_LINE_COLOR, stroke: TITAN_GOLD, strokeWidth: 1.5 }}
                />
              ) : null}

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
                      r={6}
                      fill={TITAN_GOLD}
                      stroke="#0a0b0e"
                      strokeWidth={2}
                      className="titan-seasonality-current-month-dot"
                    />
                  );
                })
                .filter(Boolean)}

              <ReferenceLine
                x={currentMonthKey}
                stroke={TITAN_GOLD}
                strokeWidth={1.5}
                strokeOpacity={0.75}
                strokeDasharray="4 4"
                className="titan-seasonality-current-month-line"
              >
                <Label
                  value={currentMonthKey.toUpperCase()}
                  position="top"
                  offset={12}
                  fill={TITAN_GOLD}
                  fontSize={8}
                  fontWeight={700}
                  style={{ letterSpacing: "0.16em", opacity: 0.85 }}
                />
              </ReferenceLine>
            </LineChart>
          </ResponsiveContainer>
        </div>

        <SeasonalityYearMonthlyPanel
          year={currentYear}
          returns={primaryResult.currentYearMonthlyReturns}
          ytdPct={primaryResult.currentYearPerformance}
        />
      </div>
    </div>
  );
}
