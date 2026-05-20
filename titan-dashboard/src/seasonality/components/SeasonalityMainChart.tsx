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
  CHART_LOOKBACK_ORDER,
  CURRENT_YEAR_CHART_KEY,
  CURRENT_YEAR_LINE_COLOR,
  lookbackChartKey,
  MONTHS,
} from "../utils/chartData";
import { buildInstitutionalChartRows } from "../utils/institutionalChartData";
import {
  ROLLING_CHART_COLORS,
  ROLLING_CHART_KEYS,
  ROLLING_CHART_ORDER,
} from "../utils/rollingChartData";
import { useTitanI18n } from "../../i18n";
import { SeasonalityChartLegend, type SeasonalityLegendFocus } from "./SeasonalityChartLegend";
import { SeasonalityChartTooltip } from "./SeasonalityChartTooltip";
import { SeasonalityChartZoneDefs, SeasonalityChartZones } from "./SeasonalityChartZones";
import { SeasonalityYearMonthlyPanel } from "./SeasonalityYearMonthlyPanel";

type SeasonalityMainChartProps = {
  result: SeasonalityResult;
  comparison: SeasonalityComparison;
  currentMonth: number;
};

const HISTORICAL_STROKE = { 5: 1.1, 10: 1.35, 15: 1.1, 20: 1.05 } as const;
const HISTORICAL_OPACITY = { 5: 0.3, 10: 0.48, 15: 0.3, 20: 0.26 } as const;
const PROJECTION_OPACITY = { 30: 0.42, 60: 0.52, 90: 0.58 } as const;
const TITAN_GOLD = "#d4af37";

function monthFromDoy(doy: number): number {
  return new Date(2024, 0, doy).getMonth() + 1;
}

function lineOpacity(focus: SeasonalityLegendFocus, key: string, base: number): number {
  if (focus === null) return base;
  if (focus === CURRENT_YEAR_CHART_KEY) {
    return key === CURRENT_YEAR_CHART_KEY ? 1 : base * 0.2;
  }
  return focus === key ? Math.min(1, base + 0.1) : key === CURRENT_YEAR_CHART_KEY ? 1 : base * 0.2;
}

export function SeasonalityMainChart({ result, comparison, currentMonth }: SeasonalityMainChartProps) {
  const { t } = useTitanI18n();
  const [legendFocus, setLegendFocus] = useState<SeasonalityLegendFocus>(null);

  const chartData = useMemo(
    () => buildInstitutionalChartRows(result, comparison, currentMonth),
    [result, comparison, currentMonth],
  );

  const currentYear = new Date(result.currentDate).getFullYear();
  const currentMonthKey = MONTHS[currentMonth - 1] ?? MONTHS[0];

  const windowBands = useMemo(() => {
    const bands: { x1: string; x2: string; bias: "bullish" | "bearish" }[] = [];
    const add = (w: (typeof result)["bullishWindows"][0], bias: "bullish" | "bearish") => {
      const m1 = monthFromDoy(w.startDay);
      const m2 = monthFromDoy(w.endDay);
      bands.push({ x1: MONTHS[m1 - 1], x2: MONTHS[m2 - 1], bias });
    };
    result.bullishWindows.forEach((w) => add(w, "bullish"));
    result.bearishWindows.forEach((w) => add(w, "bearish"));
    return bands;
  }, [result]);

  const monthlyPanelRows = useMemo(
    () =>
      chartData.map((row) => ({
        month: row.month,
        pct: row.monthReturnPct ?? null,
        vs10Y: typeof row.seasonalIndex === "number" ? row.seasonalIndex : null,
        isCurrent: row.isCurrent,
      })),
    [chartData],
  );

  return (
    <div className="titan-seasonality-chart rounded-lg border border-titan-gold/12 p-4">
      <SeasonalityChartLegend
        comparison={comparison}
        focus={legendFocus}
        onFocusChange={setLegendFocus}
      />

      <div className="mt-2">
        <p className="titan-cmd-kicker">{t("seasonality.chartTitle")}</p>
        <p className="mt-1 text-[10px] text-stone-600">{t("seasonality.chartSeasonalNote")}</p>
      </div>

      <div className="titan-seasonality-chart-layout mt-3">
        <div className="titan-seasonality-chart-plot titan-seasonality-chart-plot--main h-[320px] min-w-0 flex-1 md:h-[380px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 24, right: 8, left: 0, bottom: 6 }}>
              <SeasonalityChartZoneDefs />
              <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
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
                width={36}
                label={{
                  value: t("seasonality.chartYAxis"),
                  angle: -90,
                  position: "insideLeft",
                  fill: "#57534e",
                  fontSize: 9,
                  offset: 10,
                }}
              />
              <Tooltip content={<SeasonalityChartTooltip mode="monthly" />} cursor={{ stroke: "rgba(212,175,55,0.15)" }} />

              <SeasonalityChartZones
                bands={windowBands}
                bullLabel={t("seasonality.chartLabelBull")}
                bearLabel={t("seasonality.chartLabelBear")}
              />

              {CHART_LOOKBACK_ORDER.map((lb) => {
                const key = lookbackChartKey(lb);
                if (!comparison[lb]) return null;
                return (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stroke={lookbackColor(lb)}
                    strokeWidth={HISTORICAL_STROKE[lb]}
                    strokeOpacity={lineOpacity(legendFocus, key, HISTORICAL_OPACITY[lb])}
                    dot={false}
                    connectNulls
                  />
                );
              })}

              {ROLLING_CHART_ORDER.map((w) => {
                const key = ROLLING_CHART_KEYS[w];
                return (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stroke={ROLLING_CHART_COLORS[w]}
                    strokeWidth={w === 60 ? 1.65 : 1.25}
                    strokeOpacity={lineOpacity(legendFocus, key, PROJECTION_OPACITY[w])}
                    strokeDasharray={w === 90 ? "6 4" : undefined}
                    dot={false}
                    connectNulls
                  />
                );
              })}

              <Line
                type="monotone"
                dataKey={CURRENT_YEAR_CHART_KEY}
                stroke={CURRENT_YEAR_LINE_COLOR}
                strokeWidth={4}
                className="titan-seasonality-line-current-year"
                strokeOpacity={lineOpacity(legendFocus, CURRENT_YEAR_CHART_KEY, 1)}
                dot={false}
                connectNulls={false}
                activeDot={{ r: 5, fill: CURRENT_YEAR_LINE_COLOR, stroke: TITAN_GOLD, strokeWidth: 1.5 }}
              />

              <ReferenceLine
                x={currentMonthKey}
                stroke={TITAN_GOLD}
                strokeWidth={1.5}
                strokeOpacity={0.85}
                strokeDasharray="4 4"
              >
                <Label
                  value={t("seasonality.todayMarker")}
                  position="top"
                  offset={10}
                  fill={TITAN_GOLD}
                  fontSize={8}
                  fontWeight={700}
                  style={{ letterSpacing: "0.14em" }}
                />
              </ReferenceLine>

              {chartData
                .filter((row) => row.isCurrent)
                .map((row) => {
                  const y = row[CURRENT_YEAR_CHART_KEY];
                  if (typeof y !== "number") return null;
                  return (
                    <ReferenceDot
                      key="live-anchor"
                      x={row.month}
                      y={y}
                      r={5}
                      fill={TITAN_GOLD}
                      stroke="#0a0b0e"
                      strokeWidth={2}
                    />
                  );
                })}
            </LineChart>
          </ResponsiveContainer>
        </div>

        <SeasonalityYearMonthlyPanel
          year={currentYear}
          rows={monthlyPanelRows}
          ytdPct={result.currentYearPerformance}
        />
      </div>
    </div>
  );
}
