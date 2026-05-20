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
  CHART_LOOKBACK_ORDER,
  CURRENT_YEAR_CHART_KEY,
  CURRENT_YEAR_LINE_COLOR,
  currentYearCurveToMonthlyValues,
  lookbackChartKey,
  MONTHS,
  seasonalCurveToMonthlyValues,
} from "../utils/chartData";
import { useTitanI18n } from "../../i18n";
import { SeasonalityAlignmentBadge } from "./SeasonalityAlignmentBadge";
import { SeasonalityChartLegend, type SeasonalityLegendFocus } from "./SeasonalityChartLegend";
import { SeasonalityChartTooltip } from "./SeasonalityChartTooltip";
import { SeasonalityChartZoneDefs, SeasonalityChartZones } from "./SeasonalityChartZones";
import { SeasonalityDeviationHeat } from "./SeasonalityDeviationHeat";

type SeasonalityMainChartProps = {
  comparison: SeasonalityComparison;
  currentMonth: number;
  result: SeasonalityResult;
};

const HISTORICAL_STROKE = {
  5: 1.2,
  10: 1.35,
  15: 1.2,
  20: 1.15,
} as const satisfies Record<5 | 10 | 15 | 20, number>;

const HISTORICAL_BASE_OPACITY = {
  5: 0.38,
  10: 0.48,
  15: 0.38,
  20: 0.34,
} as const satisfies Record<5 | 10 | 15 | 20, number>;

const TITAN_GOLD = "#d4af37";

function monthFromDoy(doy: number): number {
  return new Date(2024, 0, doy).getMonth() + 1;
}

function lineOpacity(focus: SeasonalityLegendFocus, key: string, base: number): number {
  if (focus === null) return base;
  if (focus === CURRENT_YEAR_CHART_KEY) {
    return key === CURRENT_YEAR_CHART_KEY ? 1 : base * 0.18;
  }
  return focus === key ? Math.min(1, base + 0.15) : base * 0.18;
}

export function SeasonalityMainChart({ comparison, currentMonth, result }: SeasonalityMainChartProps) {
  const { t } = useTitanI18n();
  const [legendFocus, setLegendFocus] = useState<SeasonalityLegendFocus>(null);

  const primaryResult = result;
  const deviation = primaryResult.deviationAnalysis;

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

  const breakdownDots = useMemo(() => {
    if (!deviation) return [];
    return deviation.breakdownMarkers.map((m) => {
      const row = chartData.find((r) => r.monthIndex === m.monthIndex);
      const y = row?.[CURRENT_YEAR_CHART_KEY];
      return typeof y === "number" ? { ...m, y } : null;
    }).filter(Boolean) as { month: string; monthIndex: number; y: number }[];
  }, [deviation, chartData]);

  if (!primaryResult) return null;

  const currentYear = new Date(primaryResult.currentDate).getFullYear();
  const currentMonthKey = MONTHS[currentMonth - 1] ?? MONTHS[0];
  const alignment = deviation?.alignment ?? primaryResult.seasonalityAlignment;

  return (
    <div className="titan-seasonality-chart rounded-lg border border-titan-gold/12 p-4">
      <div className="flex flex-wrap items-center gap-2 border-b border-white/[0.06] pb-3">
        <SeasonalityAlignmentBadge alignment={alignment} />
        {deviation ? (
          <span className="titan-seasonality-chart-deviation-pill">
            {t(`seasonality.deviation.level.${deviation.level}`)}
            <span className="titan-seasonality-chart-deviation-pill__sep">·</span>
            {deviation.deviationPct >= 0 ? "+" : ""}
            {deviation.deviationPct.toFixed(1)}%
          </span>
        ) : null}
      </div>

      <SeasonalityChartLegend
        comparison={comparison}
        currentYear={currentYear}
        focus={legendFocus}
        onFocusChange={setLegendFocus}
      />

      <div className="mt-2">
        <p className="titan-cmd-kicker">{t("seasonality.chartTitle")}</p>
        <p className="mt-1 text-[10px] text-stone-600">{t("seasonality.disclaimer")}</p>
      </div>

      <div className="titan-seasonality-chart-plot mt-3 h-[300px] w-full md:h-[360px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 32, right: 14, left: 0, bottom: 6 }}>
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
                    style={isCurrent ? { filter: "drop-shadow(0 0 6px rgba(212,175,55,0.45))" } : undefined}
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
            />
            <Tooltip content={<SeasonalityChartTooltip />} cursor={{ stroke: "rgba(255,255,255,0.1)" }} />

            {deviation ? (
              <SeasonalityDeviationHeat heat={deviation.monthlyDeviationHeat} throughMonth={currentMonth} />
            ) : null}

            <SeasonalityChartZones
              bands={windowBands}
              bullLabel={t("seasonality.chartLabelBull")}
              bearLabel={t("seasonality.chartLabelBear")}
            />

            {CHART_LOOKBACK_ORDER.map((lb) => {
              const key = lookbackChartKey(lb);
              if (!comparison[lb]) return null;
              const baseOp = HISTORICAL_BASE_OPACITY[lb as 5 | 10 | 15 | 20];
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
                  activeDot={false}
                  connectNulls
                  style={
                    legendFocus === key
                      ? { filter: `drop-shadow(0 0 6px ${lookbackColor(lb)}66)` }
                      : undefined
                  }
                />
              );
            })}

            <Line
              type="monotone"
              dataKey={CURRENT_YEAR_CHART_KEY}
              name={CURRENT_YEAR_CHART_KEY}
              stroke={CURRENT_YEAR_LINE_COLOR}
              strokeWidth={legendFocus === CURRENT_YEAR_CHART_KEY || legendFocus === null ? 3.75 : 3.25}
              className="titan-seasonality-line-current-year"
              strokeOpacity={lineOpacity(legendFocus, CURRENT_YEAR_CHART_KEY, 1)}
              dot={false}
              connectNulls={false}
              activeDot={{ r: 5, fill: CURRENT_YEAR_LINE_COLOR, stroke: TITAN_GOLD, strokeWidth: 1.5 }}
              style={{ filter: "drop-shadow(0 0 14px rgba(245,245,244,0.55))" }}
            />

            <ReferenceLine
              x={currentMonthKey}
              stroke={TITAN_GOLD}
              strokeWidth={2}
              strokeOpacity={0.95}
              className="titan-seasonality-current-month-line"
            >
              <Label
                value={currentMonthKey.toUpperCase()}
                position="top"
                offset={14}
                fill={TITAN_GOLD}
                fontSize={9}
                fontWeight={700}
                style={{
                  fontFamily: "var(--font-display, Cinzel, serif)",
                  letterSpacing: "0.2em",
                  filter: "drop-shadow(0 0 10px rgba(212,175,55,0.6))",
                }}
              />
            </ReferenceLine>

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
                    r={7}
                    fill={TITAN_GOLD}
                    stroke="#0a0b0e"
                    strokeWidth={2}
                    className="titan-seasonality-current-month-dot"
                  />
                );
              })
              .filter(Boolean)}

            {breakdownDots.map((m) => (
              <ReferenceDot
                key={`breakdown-${m.month}`}
                x={m.month}
                y={m.y}
                r={4}
                fill="rgba(196, 92, 122, 0.85)"
                stroke="#0a0b0e"
                strokeWidth={1.5}
              >
                <Label
                  value="◆"
                  position="top"
                  offset={8}
                  fill="rgba(196, 92, 122, 0.7)"
                  fontSize={8}
                />
              </ReferenceDot>
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
