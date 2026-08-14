import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
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
  seasonaxTodayTdy,
  seasonaxYDomain,
} from "../utils/seasonaxChartData";
import { SeasonalityLookbackControl } from "./SeasonalityLookbackControl";
import { SeasonalityPresidentialFilter } from "./SeasonalityPresidentialFilter";
import { useTitanI18n } from "../../i18n";
import type { PresidentialCyclePhase } from "../utils/presidentialCycle";

type SeasonalityMainChartProps = {
  result: SeasonalityResult | null;
  comparison: SeasonalityComparison | null;
  marketLabel: string;
  lookback: YearsLookback;
  onLookbackChange: (lookback: YearsLookback) => void;
  currentMonth: number;
  presidentialPhases: PresidentialCyclePhase[];
  onPresidentialPhasesChange: (phases: PresidentialCyclePhase[]) => void;
  filtersDisabled?: boolean;
  loading?: boolean;
};

const TITAN_GOLD = "#d4af37";
const GRAD_ID = "titanSeasonFill";

function CurveTip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload?: { monthLabel?: string; index?: number; isToday?: boolean } }>;
}) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload;
  if (!row || typeof row.index !== "number") return null;
  return (
    <div className="rounded-lg border border-titan-gold/20 bg-[#0c0d10]/95 px-3 py-2 text-[12px] text-stone-200 shadow-card backdrop-blur">
      <p className="text-stone-500">
        {row.monthLabel}
        {row.isToday ? (
          <span className="ml-2 font-semibold uppercase tracking-wider text-titan-gold">Today</span>
        ) : null}
      </p>
      <p className="mt-0.5 font-mono text-[13px] text-titan-goldBright">Index {row.index.toFixed(2)}</p>
    </div>
  );
}

export function SeasonalityMainChart({
  result,
  comparison,
  marketLabel,
  lookback,
  onLookbackChange,
  presidentialPhases,
  onPresidentialPhasesChange,
  filtersDisabled = false,
  loading = false,
}: SeasonalityMainChartProps) {
  const { t } = useTitanI18n();

  const activeResult = useMemo(() => {
    if (!comparison || !result) return null;
    return comparison[lookback] ?? result;
  }, [comparison, lookback, result]);

  const title = useMemo(
    () =>
      activeResult
        ? seasonaxChartTitle(marketLabel, lookback, activeResult.currentDate)
        : t("seasonality.chartTitle"),
    [activeResult, marketLabel, lookback, t],
  );

  const curveData = useMemo(
    () => (activeResult ? buildSeasonaxChartRows(activeResult) : []),
    [activeResult],
  );
  const yDomain = useMemo(() => seasonaxYDomain(curveData), [curveData]);
  const todayX = useMemo(() => seasonaxTodayTdy(curveData), [curveData]);
  const monthTicks = useMemo(
    () => curveData.filter((r) => r.tick).map((r) => r.tdy),
    [curveData],
  );

  return (
    <div className="overflow-hidden rounded-xl border border-titan-gold/15 bg-titan-panel/80 shadow-card backdrop-blur-md">
      <div className="flex flex-col gap-2 border-b border-white/[0.05] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <SeasonalityLookbackControl
          value={lookback}
          onChange={onLookbackChange}
          disabled={filtersDisabled}
        />
        <SeasonalityPresidentialFilter
          value={presidentialPhases}
          onChange={onPresidentialPhasesChange}
          disabled={filtersDisabled}
          compact
        />
      </div>

      <div className="px-4 pt-3">
        <p className="text-[13px] text-stone-400">{title}</p>
      </div>

      <div className="relative h-[320px] w-full px-2 pb-3 sm:h-[380px]">
        {loading && curveData.length < 2 ? (
          <div className="flex h-full items-center justify-center text-sm text-stone-500">
            {t("seasonality.loading")}
          </div>
        ) : curveData.length >= 2 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={curveData} margin={{ top: 12, right: 16, left: 8, bottom: 8 }}>
              <defs>
                <linearGradient id={GRAD_ID} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={TITAN_GOLD} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={TITAN_GOLD} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis
                dataKey="tdy"
                type="number"
                domain={["dataMin", "dataMax"]}
                ticks={monthTicks}
                tickFormatter={(tdy) => curveData.find((r) => r.tdy === tdy)?.tick ?? ""}
                tick={{ fill: "#78716c", fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: "rgba(212,175,55,0.2)" }}
                minTickGap={2}
              />
              <YAxis
                domain={yDomain}
                tick={{ fill: "#78716c", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={44}
                tickFormatter={(v) => {
                  const n = Number(v);
                  return Number.isInteger(n) ? String(n) : n.toFixed(1);
                }}
              />
              <Tooltip content={<CurveTip />} cursor={{ stroke: "rgba(212,175,55,0.2)" }} />
              {todayX !== null ? (
                <ReferenceLine
                  x={todayX}
                  stroke={TITAN_GOLD}
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  label={{
                    value: "TODAY",
                    position: "insideTopRight",
                    fill: TITAN_GOLD,
                    fontSize: 10,
                    fontWeight: 700,
                  }}
                />
              ) : null}
              <Area
                type="monotone"
                dataKey="index"
                stroke={TITAN_GOLD}
                strokeWidth={2}
                fill={`url(#${GRAD_ID})`}
                dot={false}
                isAnimationActive={false}
                activeDot={{ r: 4, fill: TITAN_GOLD, stroke: "#0c0d10", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-stone-500">
            {t("seasonality.loadError")}
          </div>
        )}
      </div>
    </div>
  );
}
