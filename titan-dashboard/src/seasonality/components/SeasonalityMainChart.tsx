import { useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
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
import { hasPresidentialSelection } from "../utils/presidentialCycle";

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
const POS = "#34d399";
const NEG = "#fb7185";
const GRAD_ID = "titanSeasonFill";

function pct(v: number): string {
  const x = v * 100;
  return `${x >= 0 ? "+" : ""}${x.toFixed(2)}%`;
}

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

function BarTip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value?: number; payload?: { winRate?: number } }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const v = payload[0]?.value;
  const win = payload[0]?.payload?.winRate;
  if (typeof v !== "number") return null;
  return (
    <div className="rounded-lg border border-titan-gold/20 bg-[#0c0d10]/95 px-3 py-2 text-[12px] text-stone-200 shadow-card">
      <p className="text-stone-500">{label}</p>
      <p className="mt-0.5 font-mono text-[13px]" style={{ color: v >= 0 ? POS : NEG }}>
        {pct(v)}
      </p>
      {typeof win === "number" ? (
        <p className="mt-0.5 text-[10px] text-stone-600">Win {win.toFixed(0)}%</p>
      ) : null}
    </div>
  );
}

export function SeasonalityMainChart({
  result,
  comparison,
  marketLabel,
  lookback,
  onLookbackChange,
  currentMonth,
  presidentialPhases,
  onPresidentialPhasesChange,
  filtersDisabled = false,
  loading = false,
}: SeasonalityMainChartProps) {
  const { t } = useTitanI18n();
  const hasCycles = hasPresidentialSelection(presidentialPhases);

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

  const monthData = useMemo(
    () =>
      (activeResult?.monthlyStats ?? []).map((m) => ({
        label: m.monthLabel,
        month: m.month,
        avgReturn: m.avgReturn,
        winRate: m.winRate,
        isCurrent: m.month === currentMonth,
      })),
    [activeResult?.monthlyStats, currentMonth],
  );

  const weekdayData = useMemo(
    () =>
      (activeResult?.weekdayStats ?? []).map((w) => ({
        label: w.weekdayLabel,
        avgReturn: w.avgReturn,
        winRate: w.winRate,
      })),
    [activeResult?.weekdayStats],
  );

  const todayWeekday = useMemo(() => {
    if (!activeResult) return null;
    const d = new Date(activeResult.currentDate);
    const js = d.getDay();
    return js >= 1 && js <= 5 ? ["Mon", "Tue", "Wed", "Thu", "Fri"][js - 1] : null;
  }, [activeResult]);

  return (
    <div className="overflow-hidden rounded-xl border border-titan-gold/15 bg-titan-panel/80 shadow-card backdrop-blur-md">
      <SeasonalityPresidentialFilter
        value={presidentialPhases}
        onChange={onPresidentialPhasesChange}
        disabled={filtersDisabled}
        compact
      />

      <div className="flex flex-col gap-3 border-b border-white/[0.05] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <SeasonalityLookbackControl
          value={lookback}
          onChange={onLookbackChange}
          disabled={!hasCycles || filtersDisabled}
        />
      </div>

      <div className="px-4 pt-4">
        <p className="text-center font-display text-[11px] font-semibold uppercase tracking-[0.22em] text-titan-gold/90">
          {t("seasonality.chartTitle")}
        </p>
        <p className="mt-1 text-center text-[13px] text-stone-300">{title}</p>
      </div>

      <div className="relative h-[340px] w-full px-2 pb-1 sm:h-[400px]">
        {!hasCycles ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
            <p className="font-display text-[11px] uppercase tracking-[0.28em] text-titan-gold/80">
              {t("seasonality.presidentialLabel")}
            </p>
            <p className="max-w-md text-sm text-stone-400">{t("seasonality.presidentialPick")}</p>
          </div>
        ) : loading && curveData.length < 2 ? (
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

      {hasCycles && activeResult ? (
        <div className="grid gap-3 border-t border-titan-gold/10 p-4 lg:grid-cols-2">
          <div className="rounded-xl border border-white/[0.06] bg-black/20 p-3">
            <p className="titan-cmd-kicker mb-2">{t("seasonality.avgReturnByWeekday")}</p>
            <div className="h-[190px] w-full">
              {weekdayData.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weekdayData} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
                    <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis
                      dataKey="label"
                      tick={{ fill: "#78716c", fontSize: 11 }}
                      tickLine={false}
                      axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
                    />
                    <YAxis
                      tick={{ fill: "#78716c", fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                      width={42}
                      tickFormatter={(v) => `${(Number(v) * 100).toFixed(2)}`}
                    />
                    <Tooltip content={<BarTip />} cursor={{ fill: "rgba(212,175,55,0.04)" }} />
                    <ReferenceLine y={0} stroke="rgba(255,255,255,0.12)" />
                    <Bar dataKey="avgReturn" radius={[4, 4, 0, 0]} maxBarSize={36}>
                      {weekdayData.map((row) => (
                        <Cell
                          key={row.label}
                          fill={row.avgReturn >= 0 ? POS : NEG}
                          fillOpacity={todayWeekday === row.label ? 1 : 0.72}
                          stroke={todayWeekday === row.label ? TITAN_GOLD : "transparent"}
                          strokeWidth={todayWeekday === row.label ? 1.5 : 0}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : null}
            </div>
          </div>

          <div className="rounded-xl border border-white/[0.06] bg-black/20 p-3">
            <p className="titan-cmd-kicker mb-2">{t("seasonality.avgReturnByMonth")}</p>
            <div className="h-[190px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthData} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: "#78716c", fontSize: 10 }}
                    tickLine={false}
                    axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
                    interval={0}
                  />
                  <YAxis
                    tick={{ fill: "#78716c", fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    width={42}
                    tickFormatter={(v) => `${(Number(v) * 100).toFixed(1)}`}
                  />
                  <Tooltip content={<BarTip />} cursor={{ fill: "rgba(212,175,55,0.04)" }} />
                  <ReferenceLine y={0} stroke="rgba(255,255,255,0.12)" />
                  <Bar dataKey="avgReturn" radius={[4, 4, 0, 0]} maxBarSize={28}>
                    {monthData.map((row) => (
                      <Cell
                        key={row.label}
                        fill={row.avgReturn >= 0 ? POS : NEG}
                        fillOpacity={row.isCurrent ? 1 : 0.72}
                        stroke={row.isCurrent ? TITAN_GOLD : "transparent"}
                        strokeWidth={row.isCurrent ? 1.5 : 0}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
