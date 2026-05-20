import { useMemo, useState } from "react";
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
import { lookbackLabel, type YearsLookback } from "../yearsLookback";
import {
  buildMonthlyChartRows,
  CURRENT_YEAR_CHART_KEY,
  CURRENT_YEAR_LINE_COLOR,
  currentYearCurveToMonthlyValues,
  HISTORICAL_CHART_KEY,
  HISTORICAL_LINE_COLOR,
  seasonalCurveToMonthlyValues,
} from "../utils/chartData";
import { useTitanI18n } from "../../i18n";
import { SeasonalityAlignmentBadge } from "./SeasonalityAlignmentBadge";
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
  const [showCurrentYear, setShowCurrentYear] = useState(true);

  const primaryResult = comparison[primaryLookback] ?? comparison[10] ?? Object.values(comparison)[0];

  const chartData = useMemo(() => {
    if (!primaryResult) return [];
    const series: { key: string; values: (number | null)[] | number[] }[] = [
      {
        key: HISTORICAL_CHART_KEY,
        values: seasonalCurveToMonthlyValues(primaryResult.seasonalCurve),
      },
    ];
    if (showCurrentYear && primaryResult.currentYearCurve.length > 0) {
      series.push({
        key: CURRENT_YEAR_CHART_KEY,
        values: currentYearCurveToMonthlyValues(primaryResult.currentYearCurve, currentMonth),
      });
    }
    return buildMonthlyChartRows(series, currentMonth);
  }, [primaryResult, showCurrentYear, currentMonth]);

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

  if (!primaryResult) return null;

  const currentYear = new Date(primaryResult.currentDate).getFullYear();

  return (
    <div className="titan-seasonality-chart rounded-lg border border-titan-gold/12 bg-titan-panel/40 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SeasonalityLookbackControl
          value={primaryLookback}
          onChange={onPrimaryLookbackChange}
          disabled={lookbackDisabled}
        />
        <label className="titan-seasonality-overlay-toggle inline-flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            className="titan-seasonality-overlay-toggle__input"
            checked={showCurrentYear}
            disabled={lookbackDisabled}
            onChange={(e) => setShowCurrentYear(e.target.checked)}
          />
          <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-stone-400">
            {t("seasonality.showCurrentYear")}
          </span>
        </label>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <SeasonalityAlignmentBadge alignment={primaryResult.seasonalityAlignment} />
      </div>

      <div className="mt-3 flex flex-wrap items-end justify-between gap-2 border-b border-white/[0.06] pb-3">
        <div>
          <p className="titan-cmd-kicker">{t("seasonality.chartTitle")}</p>
          <p className="mt-1 font-display text-[11px] font-semibold uppercase tracking-[0.14em] text-titan-gold/90">
            {t("seasonality.historicalWindowPrimary", { period: lookbackLabel(primaryLookback) })}
          </p>
          <p className="mt-1 text-[10px] text-stone-600">{t("seasonality.disclaimer")}</p>
        </div>
        <div className="flex flex-wrap gap-3 text-[9px] uppercase tracking-wider text-stone-500">
          <span className="inline-flex items-center gap-1.5">
            <span className="titan-seasonality-legend-line titan-seasonality-legend-line--historical" />
            {t("seasonality.legendHistorical")}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="titan-seasonality-legend-line titan-seasonality-legend-line--current-year" />
            {t("seasonality.legendCurrentYear", { year: currentYear })}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-3 rounded-sm bg-emerald-500/25" />
            {t("seasonality.legendBull")}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-3 rounded-sm bg-rose-500/25" />
            {t("seasonality.legendBear")}
          </span>
        </div>
      </div>

      <div className="mt-3 h-[300px] w-full md:h-[340px]">
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
                if (value == null || Number.isNaN(value)) return ["—", name];
                const label =
                  name === HISTORICAL_CHART_KEY
                    ? t("seasonality.legendHistorical")
                    : name === CURRENT_YEAR_CHART_KEY
                      ? t("seasonality.legendCurrentYearShort", { year: currentYear })
                      : name;
                return [value.toFixed(1), label];
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
            <Line
              type="monotone"
              dataKey={HISTORICAL_CHART_KEY}
              name={HISTORICAL_CHART_KEY}
              stroke={HISTORICAL_LINE_COLOR}
              strokeWidth={2.5}
              className="titan-seasonality-line-historical"
              dot={false}
              activeDot={{ r: 4, fill: HISTORICAL_LINE_COLOR }}
              connectNulls
            />
            {showCurrentYear ? (
              <Line
                type="monotone"
                dataKey={CURRENT_YEAR_CHART_KEY}
                name={CURRENT_YEAR_CHART_KEY}
                stroke={CURRENT_YEAR_LINE_COLOR}
                strokeWidth={2}
                className="titan-seasonality-line-current-year"
                dot={false}
                connectNulls={false}
                activeDot={{ r: 4, fill: CURRENT_YEAR_LINE_COLOR, stroke: "#0a0b0e", strokeWidth: 1 }}
              />
            ) : null}
            {chartData
              .filter((row) => row.isCurrent)
              .map((row) => {
                const histY = row[HISTORICAL_CHART_KEY];
                if (typeof histY !== "number") return null;
                return (
                  <ReferenceDot
                    key={`hist-dot-${String(row.month)}`}
                    x={String(row.month)}
                    y={histY}
                    r={5}
                    fill={HISTORICAL_LINE_COLOR}
                    stroke="#0a0b0e"
                    strokeWidth={2}
                  />
                );
              })
              .filter(Boolean)}
            {showCurrentYear
              ? chartData
                  .filter((row) => row.isCurrent)
                  .map((row) => {
                    const cyY = row[CURRENT_YEAR_CHART_KEY];
                    if (typeof cyY !== "number") return null;
                    return (
                      <ReferenceDot
                        key={`cy-dot-${String(row.month)}`}
                        x={String(row.month)}
                        y={cyY}
                        r={5}
                        fill={CURRENT_YEAR_LINE_COLOR}
                        stroke="#0a0b0e"
                        strokeWidth={2}
                      />
                    );
                  })
                  .filter(Boolean)
              : null}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
