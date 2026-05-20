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
import type { SeasonalityResult } from "../types";
import { useTitanI18n } from "../../i18n";
import { SeasonalityChartLegend, type SeasonalityLegendFocus } from "./SeasonalityChartLegend";
import { SeasonalityChartTooltip } from "./SeasonalityChartTooltip";
import { SeasonalityYearMonthlyPanel } from "./SeasonalityYearMonthlyPanel";
import { SeasonalityTimingPanel } from "./SeasonalityTimingPanel";
import {
  buildRollingChartRows,
  CURRENT_YEAR_CHART_KEY,
  CURRENT_YEAR_LINE_COLOR,
  ROLLING_CHART_COLORS,
  ROLLING_CHART_KEYS,
  ROLLING_CHART_ORDER,
  type RollingChartRow,
} from "../utils/rollingChartData";
import { EVENT_COLORS } from "../utils/seasonalEvents";

type SeasonalityMainChartProps = {
  result: SeasonalityResult;
  currentMonth: number;
};

const TITAN_GOLD = "#d4af37";

function lineOpacity(focus: SeasonalityLegendFocus, key: string, base: number): number {
  if (focus === null) return base;
  if (focus === CURRENT_YEAR_CHART_KEY) {
    return key === CURRENT_YEAR_CHART_KEY ? 1 : base * 0.2;
  }
  return focus === key ? Math.min(1, base + 0.12) : key === CURRENT_YEAR_CHART_KEY ? 1 : base * 0.2;
}

export function SeasonalityMainChart({ result, currentMonth }: SeasonalityMainChartProps) {
  const { t } = useTitanI18n();
  const [legendFocus, setLegendFocus] = useState<SeasonalityLegendFocus>(null);

  const chartData = useMemo(() => buildRollingChartRows(result), [result]);
  const currentYear = new Date(result.currentDate).getFullYear();

  const eventLines = useMemo(
    () => (result.seasonalEvents ?? []).filter((e) => Math.abs(e.tdyOffset) <= 45),
    [result.seasonalEvents],
  );

  return (
    <div className="titan-seasonality-chart rounded-lg border border-titan-gold/12 p-4">
      <SeasonalityChartLegend focus={legendFocus} onFocusChange={setLegendFocus} />

      <div className="mt-2 flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="titan-cmd-kicker">{t("seasonality.chartTitleRolling")}</p>
          <p className="mt-1 text-[10px] text-stone-600">{t("seasonality.chartSeasonalNote")}</p>
        </div>
        <p className="font-mono text-[10px] text-titan-gold/80">
          TDY {result.tradingDayOfYear ?? "—"} · {t(`seasonality.volatility.${result.volatilityRegime ?? "NORMAL"}`)}
        </p>
      </div>

      <div className="titan-seasonality-chart-layout mt-3">
        <div className="titan-seasonality-chart-plot titan-seasonality-chart-plot--main h-[320px] min-w-0 flex-1 md:h-[380px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 28, right: 8, left: 0, bottom: 6 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis
                dataKey="offsetLabel"
                tick={{ fill: "#78716c", fontSize: 9 }}
                axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={["auto", "auto"]}
                tick={{ fill: "#78716c", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                width={40}
                label={{
                  value: t("seasonality.chartYAxisRolling"),
                  angle: -90,
                  position: "insideLeft",
                  fill: "#57534e",
                  fontSize: 9,
                  offset: 8,
                }}
              />
              <Tooltip content={<SeasonalityChartTooltip mode="rolling" />} cursor={{ stroke: "rgba(255,255,255,0.1)" }} />

              {ROLLING_CHART_ORDER.map((w) => {
                const key = ROLLING_CHART_KEYS[w];
                const baseOp = w === 60 ? 0.95 : 0.55;
                return (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    name={key}
                    stroke={ROLLING_CHART_COLORS[w]}
                    strokeWidth={w === 60 ? 2 : 1.4}
                    strokeOpacity={lineOpacity(legendFocus, key, baseOp)}
                    dot={false}
                    connectNulls
                    style={
                      legendFocus === key || (legendFocus === null && w === 60)
                        ? { filter: `drop-shadow(0 0 8px ${ROLLING_CHART_COLORS[w]}66)` }
                        : undefined
                    }
                  />
                );
              })}

              {result.currentYearCurve.length > 0 ? (
                <Line
                  type="monotone"
                  dataKey={CURRENT_YEAR_CHART_KEY}
                  name={CURRENT_YEAR_CHART_KEY}
                  stroke={CURRENT_YEAR_LINE_COLOR}
                  strokeWidth={3.75}
                  className="titan-seasonality-line-current-year"
                  strokeOpacity={lineOpacity(legendFocus, CURRENT_YEAR_CHART_KEY, 1)}
                  dot={false}
                  connectNulls={false}
                  activeDot={{ r: 5, fill: CURRENT_YEAR_LINE_COLOR, stroke: TITAN_GOLD, strokeWidth: 1.5 }}
                />
              ) : null}

              <ReferenceLine
                x="T+0"
                stroke={TITAN_GOLD}
                strokeWidth={1.5}
                strokeDasharray="4 4"
                strokeOpacity={0.9}
              >
                <Label
                  value="TODAY"
                  position="top"
                  offset={10}
                  fill={TITAN_GOLD}
                  fontSize={8}
                  fontWeight={700}
                />
              </ReferenceLine>

              {eventLines.map((ev) => {
                const xLabel = ev.tdyOffset === 0 ? "T+0" : ev.tdyOffset > 0 ? `T+${ev.tdyOffset}` : `T${ev.tdyOffset}`;
                if (!chartData.some((r) => r.offsetLabel === xLabel)) return null;
                return (
                <ReferenceLine
                  key={`${ev.type}-${ev.date}`}
                  x={xLabel}
                  stroke={EVENT_COLORS[ev.type]}
                  strokeWidth={1}
                  strokeOpacity={0.55}
                  strokeDasharray="2 4"
                  label={{
                    value: ev.label,
                    position: "insideTopRight",
                    fill: EVENT_COLORS[ev.type],
                    fontSize: 7,
                    opacity: 0.75,
                  }}
                />
              ))}

              {chartData
                .filter((row: RollingChartRow) => row.isToday)
                .map((row) => {
                  const cyY = row[CURRENT_YEAR_CHART_KEY];
                  if (typeof cyY !== "number") return null;
                  return (
                    <ReferenceDot
                      key="cy-dot"
                      x={row.offsetLabel}
                      y={cyY}
                      r={6}
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
          returns={result.currentYearMonthlyReturns}
          ytdPct={result.currentYearPerformance}
        />
      </div>

      <SeasonalityTimingPanel result={result} />
    </div>
  );
}
