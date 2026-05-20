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
import { useTitanI18n } from "../../i18n";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

type SeasonalityMainChartProps = {
  result: SeasonalityResult;
  currentMonth: number;
};

type ChartRow = {
  month: string;
  monthIndex: number;
  value: number;
  isCurrent: boolean;
};

function monthFromDoy(doy: number): number {
  return new Date(2024, 0, doy).getMonth() + 1;
}

export function SeasonalityMainChart({ result, currentMonth }: SeasonalityMainChartProps) {
  const { t } = useTitanI18n();

  const chartData = useMemo(() => {
    const sums = Array.from({ length: 12 }, () => ({ sum: 0, count: 0 }));
    for (const p of result.seasonalCurve) {
      const m = p.month - 1;
      sums[m].sum += p.smoothed;
      sums[m].count += 1;
    }
    return MONTHS.map((month, i) => ({
      month,
      monthIndex: i + 1,
      value: sums[i].count ? sums[i].sum / sums[i].count : 0,
      isCurrent: i + 1 === currentMonth,
    })) satisfies ChartRow[];
  }, [result.seasonalCurve, currentMonth]);

  const windowBands = useMemo(() => {
    const bands: { x1: string; x2: string; bias: "bullish" | "bearish" }[] = [];
    const add = (w: SeasonalityResult["bullishWindows"][0], bias: "bullish" | "bearish") => {
      const m1 = monthFromDoy(w.startDay);
      const m2 = monthFromDoy(w.endDay);
      bands.push({ x1: MONTHS[m1 - 1], x2: MONTHS[m2 - 1], bias });
    };
    result.bullishWindows.forEach((w) => add(w, "bullish"));
    result.bearishWindows.forEach((w) => add(w, "bearish"));
    return bands;
  }, [result.bullishWindows, result.bearishWindows]);

  return (
    <div className="titan-seasonality-chart rounded-lg border border-titan-gold/12 bg-titan-panel/40 p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="titan-cmd-kicker">{t("seasonality.chartTitle")}</p>
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

      <div className="h-[280px] w-full md:h-[320px]">
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
              formatter={(v: number) => [v.toFixed(1), t("seasonality.chartTooltip")]}
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
            <Line type="monotone" dataKey="value" stroke="#d4af37" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: "#f0d060" }} />
            {chartData
              .filter((row) => row.isCurrent)
              .map((row) => (
                <ReferenceDot
                  key={row.month}
                  x={row.month}
                  y={row.value}
                  r={6}
                  fill="#f0d060"
                  stroke="#0a0b0e"
                  strokeWidth={2}
                />
              ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
