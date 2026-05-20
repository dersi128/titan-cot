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
import type { SeasonalityResult } from "../types";
import type { SeasonalityComparison } from "../services/seasonalityService";
import {
  CHART_COMPARISON_LOOKBACKS,
  LOOKBACK_CHART_COLORS,
  LOOKBACK_CHART_KEYS,
  lookbackLabel,
  type YearsLookback,
} from "../yearsLookback";
import { buildMonthlyChartRows, seasonalCurveToMonthlyValues } from "../utils/chartData";
import { useTitanI18n } from "../../i18n";
import { SeasonalityLookbackControl } from "./SeasonalityLookbackControl";

type SeasonalityMainChartProps = {
  comparison: SeasonalityComparison;
  primaryLookback: YearsLookback;
  onPrimaryLookbackChange: (lookback: YearsLookback) => void;
  currentMonth: number;
  lookbackDisabled?: boolean;
};

function monthFromDoy(doy: number): number {
  return new Date(2024, 0, doy).getMonth() + 1;
}

export function SeasonalityMainChart({
  comparison,
  primaryLookback,
  onPrimaryLookbackChange,
  currentMonth,
  lookbackDisabled = false,
}: SeasonalityMainChartProps) {
  const { t } = useTitanI18n();

  const primaryResult = comparison[primaryLookback] ?? comparison[10] ?? Object.values(comparison)[0];

  const activeLookbacks = useMemo(
    () => CHART_COMPARISON_LOOKBACKS.filter((lb) => comparison[lb]),
    [comparison],
  );

  const chartData = useMemo(() => {
    const series = activeLookbacks.map((lb) => ({
      key: LOOKBACK_CHART_KEYS[lb],
      values: seasonalCurveToMonthlyValues(comparison[lb]!.seasonalCurve),
    }));
    return buildMonthlyChartRows(series, currentMonth);
  }, [comparison, activeLookbacks, currentMonth]);

  const windowBands = useMemo(() => {
    if (!primaryResult) return [];
    const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const bands: { x1: string; x2: string; bias: "bullish" | "bearish" }[] = [];
    const add = (w: SeasonalityResult["bullishWindows"][0], bias: "bullish" | "bearish") => {
      const m1 = monthFromDoy(w.startDay);
      const m2 = monthFromDoy(w.endDay);
      bands.push({ x1: MONTHS[m1 - 1], x2: MONTHS[m2 - 1], bias });
    };
    primaryResult.bullishWindows.forEach((w) => add(w, "bullish"));
    primaryResult.bearishWindows.forEach((w) => add(w, "bearish"));
    return bands;
  }, [primaryResult]);

  const primaryKey = LOOKBACK_CHART_KEYS[primaryLookback];

  return (
    <div className="titan-seasonality-chart rounded-lg border border-titan-gold/12 bg-titan-panel/40 p-4">
      <SeasonalityLookbackControl
        value={primaryLookback}
        onChange={onPrimaryLookbackChange}
        disabled={lookbackDisabled}
      />
      <p className="mt-2 text-[10px] text-stone-600">{t("seasonality.lookbackCompareHint")}</p>

      <div className="mt-3 flex flex-wrap items-end justify-between gap-2 border-b border-white/[0.06] pb-3">
        <div>
          <p className="titan-cmd-kicker">{t("seasonality.chartTitle")}</p>
          <p className="mt-1 font-display text-[11px] font-semibold uppercase tracking-[0.14em] text-titan-gold/90">
            {t("seasonality.historicalWindowCompare")}
          </p>
          <p className="mt-1 text-[10px] text-stone-600">
            {t("seasonality.historicalWindowPrimary", { period: lookbackLabel(primaryLookback) })}
          </p>
          <p className="mt-1 text-[10px] text-stone-600">{t("seasonality.disclaimer")}</p>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            {activeLookbacks.map((lb) => {
              const isPrimary = lb === primaryLookback;
              return (
                <span
                  key={String(lb)}
                  className={`inline-flex items-center gap-1.5 text-[9px] uppercase tracking-wider ${
                    isPrimary ? "text-titan-goldBright" : "text-stone-500"
                  }`}
                >
                  <span
                    className="h-0.5 w-4 rounded-full"
                    style={{
                      background: LOOKBACK_CHART_COLORS[lb],
                      opacity: isPrimary ? 1 : 0.55,
                      height: isPrimary ? 3 : 2,
                    }}
                  />
                  {lookbackLabel(lb)}
                </span>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-3 text-[9px] uppercase tracking-wider text-stone-500">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-3 rounded-sm bg-emerald-500/25" />
              {t("seasonality.legendBull")}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-3 rounded-sm bg-rose-500/25" />
              {t("seasonality.legendBear")}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-0.5 w-3 bg-titan-gold/80" />
              {t("seasonality.legendCurrent")}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3 h-[280px] w-full md:h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
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
            <Tooltip
              contentStyle={{
                background: "#0a0b0e",
                border: "1px solid rgba(212,175,55,0.2)",
                borderRadius: 4,
                fontSize: 11,
              }}
              formatter={(value: number, name: string) => {
                const lb = activeLookbacks.find((k) => LOOKBACK_CHART_KEYS[k] === name);
                const label = lb ? lookbackLabel(lb) : name;
                return [typeof value === "number" ? value.toFixed(1) : value, label];
              }}
            />
            {windowBands.map((band, i) => (
              <ReferenceArea
                key={`${band.bias}-${i}`}
                x1={band.x1}
                x2={band.x2}
                fill={band.bias === "bullish" ? "rgba(0,208,132,0.08)" : "rgba(255,77,109,0.08)"}
                strokeOpacity={0}
              />
            ))}
            {activeLookbacks.map((lb) => {
              const isPrimary = lb === primaryLookback;
              const dataKey = LOOKBACK_CHART_KEYS[lb];
              return (
                <Line
                  key={dataKey}
                  type="monotone"
                  dataKey={dataKey}
                  name={dataKey}
                  stroke={LOOKBACK_CHART_COLORS[lb]}
                  strokeWidth={isPrimary ? 2.5 : 1.25}
                  strokeOpacity={isPrimary ? 1 : 0.55}
                  dot={false}
                  activeDot={isPrimary ? { r: 4, fill: LOOKBACK_CHART_COLORS[lb] } : { r: 3 }}
                />
              );
            })}
            {chartData
              .filter((row) => row.isCurrent)
              .map((row) => {
                const y = row[primaryKey];
                if (typeof y !== "number") return null;
                return (
                  <ReferenceDot
                    key={`dot-${String(row.month)}`}
                    x={String(row.month)}
                    y={y}
                    r={6}
                    fill={LOOKBACK_CHART_COLORS[primaryLookback]}
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
