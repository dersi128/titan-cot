import { useMemo } from "react";
import {
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
import { seasonaxChartTitle } from "../utils/seasonaxChartData";
import { SeasonalityLookbackControl } from "./SeasonalityLookbackControl";
import { useTitanI18n } from "../../i18n";

type SeasonalityMainChartProps = {
  result: SeasonalityResult;
  comparison: SeasonalityComparison;
  marketLabel: string;
  lookback: YearsLookback;
  onLookbackChange: (lookback: YearsLookback) => void;
  currentMonth: number;
};

const POS = "#5BDBF0";
const NEG = "#F472B6";
const TODAY = "#EC4899";

function pct(v: number): string {
  const x = v * 100;
  return `${x >= 0 ? "+" : ""}${x.toFixed(2)}%`;
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
    <div className="rounded-md border border-white/10 bg-[#12161c]/95 px-3 py-2 text-[12px] text-stone-200 shadow-lg">
      <p className="text-stone-400">{label}</p>
      <p className="mt-0.5 font-mono text-[13px]" style={{ color: v >= 0 ? POS : NEG }}>
        {pct(v)}
      </p>
      {typeof win === "number" ? (
        <p className="mt-0.5 text-[10px] text-stone-500">Win {win.toFixed(0)}%</p>
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
}: SeasonalityMainChartProps) {
  const { t } = useTitanI18n();

  const activeResult = useMemo(() => comparison[lookback] ?? result, [comparison, lookback, result]);
  const title = useMemo(
    () => seasonaxChartTitle(marketLabel, lookback, activeResult.currentDate),
    [marketLabel, lookback, activeResult.currentDate],
  );

  const monthData = useMemo(
    () =>
      activeResult.monthlyStats.map((m) => ({
        label: m.monthLabel,
        month: m.month,
        avgReturn: m.avgReturn,
        winRate: m.winRate,
        isCurrent: m.month === currentMonth,
      })),
    [activeResult.monthlyStats, currentMonth],
  );

  const weekdayData = useMemo(
    () =>
      (activeResult.weekdayStats ?? []).map((w) => ({
        label: w.weekdayLabel,
        avgReturn: w.avgReturn,
        winRate: w.winRate,
      })),
    [activeResult.weekdayStats],
  );

  const todayWeekday = useMemo(() => {
    const d = new Date(activeResult.currentDate);
    const js = d.getDay();
    return js >= 1 && js <= 5 ? ["Mon", "Tue", "Wed", "Thu", "Fri"][js - 1] : null;
  }, [activeResult.currentDate]);

  return (
    <div className="overflow-hidden rounded-lg border border-white/[0.06] bg-[#0e1218]">
      <div className="flex flex-col gap-3 border-b border-white/[0.05] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <SeasonalityLookbackControl value={lookback} onChange={onLookbackChange} />
      </div>

      <div className="px-4 pt-4">
        <p className="text-center text-[13px] font-medium tracking-wide text-stone-300 sm:text-[14px]">
          {title}
        </p>
        <p className="mt-1 text-center text-[10px] text-stone-600">{t("seasonality.barsNote")}</p>
      </div>

      <div className="grid gap-4 p-4 lg:grid-cols-2">
        <div className="rounded-md border border-white/[0.05] bg-[#0b0f14] p-3">
          <p className="mb-2 text-[12px] font-medium text-stone-300">
            {t("seasonality.avgReturnByWeekday")}
          </p>
          <div className="h-[220px] w-full">
            {weekdayData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weekdayData} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
                  <CartesianGrid stroke="rgba(148,163,184,0.1)" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                    tickLine={false}
                    axisLine={{ stroke: "rgba(148,163,184,0.2)" }}
                  />
                  <YAxis
                    tick={{ fill: "#94a3b8", fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    width={42}
                    tickFormatter={(v) => `${(Number(v) * 100).toFixed(2)}`}
                  />
                  <Tooltip content={<BarTip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                  <ReferenceLine y={0} stroke="rgba(148,163,184,0.35)" />
                  <Bar dataKey="avgReturn" radius={[3, 3, 0, 0]} maxBarSize={36}>
                    {weekdayData.map((row) => (
                      <Cell
                        key={row.label}
                        fill={row.avgReturn >= 0 ? POS : NEG}
                        fillOpacity={todayWeekday === row.label ? 1 : 0.75}
                        stroke={todayWeekday === row.label ? TODAY : "transparent"}
                        strokeWidth={todayWeekday === row.label ? 2 : 0}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-[12px] text-stone-600">
                {t("seasonality.loading")}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-md border border-white/[0.05] bg-[#0b0f14] p-3">
          <p className="mb-2 text-[12px] font-medium text-stone-300">
            {t("seasonality.avgReturnByMonth")}
          </p>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthData} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
                <CartesianGrid stroke="rgba(148,163,184,0.1)" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "#94a3b8", fontSize: 10 }}
                  tickLine={false}
                  axisLine={{ stroke: "rgba(148,163,184,0.2)" }}
                  interval={0}
                />
                <YAxis
                  tick={{ fill: "#94a3b8", fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  width={42}
                  tickFormatter={(v) => `${(Number(v) * 100).toFixed(1)}`}
                />
                <Tooltip content={<BarTip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                <ReferenceLine y={0} stroke="rgba(148,163,184,0.35)" />
                <Bar dataKey="avgReturn" radius={[3, 3, 0, 0]} maxBarSize={28}>
                  {monthData.map((row) => (
                    <Cell
                      key={row.label}
                      fill={row.avgReturn >= 0 ? POS : NEG}
                      fillOpacity={row.isCurrent ? 1 : 0.75}
                      stroke={row.isCurrent ? TODAY : "transparent"}
                      strokeWidth={row.isCurrent ? 2 : 0}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
