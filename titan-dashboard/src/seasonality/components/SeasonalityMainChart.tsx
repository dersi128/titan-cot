import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { SeasonalityComparison } from "../services/seasonalityService";
import type { SeasonalityResult } from "../types";
import type { YearsLookback } from "../yearsLookback";
import {
  buildSeasonaxChartRows,
  seasonaxChartTitle,
  seasonaxYDomain,
} from "../utils/seasonaxChartData";
import { SeasonalityLookbackControl } from "./SeasonalityLookbackControl";
import { useTitanI18n } from "../../i18n";

type SeasonalityMainChartProps = {
  result: SeasonalityResult;
  comparison: SeasonalityComparison;
  marketLabel: string;
  lookback: YearsLookback;
  onLookbackChange: (lookback: YearsLookback) => void;
};

const SEASONAX_CYAN = "#5BDBF0";
const GRAD_ID = "seasonaxFill";

function SeasonaxTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload?: { monthLabel?: string; index?: number; offset?: number } }>;
}) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload;
  if (!row || typeof row.index !== "number") return null;
  return (
    <div className="rounded-md border border-white/10 bg-[#12161c]/95 px-3 py-2 text-[12px] text-stone-200 shadow-lg backdrop-blur">
      <p className="text-stone-400">{row.monthLabel}</p>
      <p className="mt-0.5 font-mono text-[13px] text-[#5BDBF0]">
        Index {row.index.toFixed(2)}
      </p>
    </div>
  );
}

export function SeasonalityMainChart({
  result,
  comparison,
  marketLabel,
  lookback,
  onLookbackChange,
}: SeasonalityMainChartProps) {
  const { t } = useTitanI18n();

  const activeResult = useMemo(() => {
    return comparison[lookback] ?? result;
  }, [comparison, lookback, result]);

  const chartData = useMemo(() => buildSeasonaxChartRows(activeResult), [activeResult]);
  const yDomain = useMemo(() => seasonaxYDomain(chartData), [chartData]);
  const title = useMemo(
    () => seasonaxChartTitle(marketLabel, lookback, activeResult.currentDate),
    [marketLabel, lookback, activeResult.currentDate],
  );

  const endIndex = chartData.at(-1)?.index ?? null;
  const changePct =
    endIndex !== null ? (((endIndex / 100) - 1) * 100) : null;

  return (
    <div className="titan-seasonality-chart overflow-hidden rounded-lg border border-white/[0.06] bg-[#0e1218]">
      <div className="flex flex-col gap-3 border-b border-white/[0.05] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <SeasonalityLookbackControl value={lookback} onChange={onLookbackChange} />
        {changePct !== null ? (
          <p
            className={`font-mono text-[12px] ${
              changePct >= 0 ? "text-emerald-400/90" : "text-rose-400/90"
            }`}
          >
            {t("seasonality.seasonaxYearChange")}: {changePct >= 0 ? "+" : ""}
            {changePct.toFixed(1)}%
          </p>
        ) : null}
      </div>

      <div className="px-4 pt-4">
        <p className="text-center text-[13px] font-medium tracking-wide text-stone-300 sm:text-[14px]">
          {title}
        </p>
        <p className="mt-1 text-center text-[10px] text-stone-600">{t("seasonality.seasonaxNote")}</p>
      </div>

      <div className="relative h-[340px] w-full px-2 pb-2 sm:h-[400px]">
        {chartData.length >= 2 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 16, right: 18, left: 4, bottom: 8 }}>
              <defs>
                <linearGradient id={GRAD_ID} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={SEASONAX_CYAN} stopOpacity={0.28} />
                  <stop offset="100%" stopColor={SEASONAX_CYAN} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(148,163,184,0.12)" strokeDasharray="0" />
              <XAxis
                dataKey="offset"
                type="number"
                domain={["dataMin", "dataMax"]}
                ticks={chartData.filter((r) => r.tick).map((r) => r.offset)}
                tickFormatter={(offset) => {
                  const row = chartData.find((r) => r.offset === offset);
                  return row?.tick ?? "";
                }}
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: "rgba(148,163,184,0.2)" }}
                minTickGap={8}
              />
              <YAxis
                domain={yDomain}
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={40}
                tickFormatter={(v) => String(Math.round(Number(v)))}
                label={{
                  value: t("seasonality.chartYAxisIndex"),
                  angle: -90,
                  position: "insideLeft",
                  fill: "#64748b",
                  fontSize: 10,
                  offset: 0,
                }}
              />
              <Tooltip content={<SeasonaxTooltip />} cursor={{ stroke: "rgba(91,219,240,0.25)" }} />
              <Area
                type="linear"
                dataKey="index"
                stroke={SEASONAX_CYAN}
                strokeWidth={2}
                fill={`url(#${GRAD_ID})`}
                dot={false}
                isAnimationActive={false}
                activeDot={{ r: 4, fill: SEASONAX_CYAN, stroke: "#0e1218", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-stone-500">
            {t("seasonality.loading")}
          </div>
        )}
      </div>
    </div>
  );
}
