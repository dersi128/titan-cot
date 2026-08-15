import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { SeasonalityComparison } from "../services/seasonalityService";
import type { OhlcBar, SeasonalityResult } from "../types";
import type { YearsLookback } from "../yearsLookback";
import {
  buildSeasonaxChartRows,
  seasonaxChartTitle,
  seasonaxTodayTdy,
  seasonaxYDomain,
  type SeasonaxChartRow,
} from "../utils/seasonaxChartData";
import {
  analyzeManualSeasonalWindow,
  type ManualSeasonalWindowStats,
} from "../utils/seasonalWindowEngineV2";
import { SeasonalityLookbackControl } from "./SeasonalityLookbackControl";
import { SeasonalityPresidentialFilter } from "./SeasonalityPresidentialFilter";
import { useTitanI18n } from "../../i18n";
import type { PresidentialCyclePhase } from "../utils/presidentialCycle";

type SeasonalityMainChartProps = {
  result: SeasonalityResult | null;
  comparison: SeasonalityComparison | null;
  /** Raw OHLC for manual-window year returns (does not feed bias/score). */
  ohlcBars?: OhlcBar[] | null;
  marketLabel: string;
  lookback: YearsLookback;
  onLookbackChange: (lookback: YearsLookback) => void;
  currentMonth: number;
  presidentialPhases: PresidentialCyclePhase[];
  onPresidentialPhasesChange: (phases: PresidentialCyclePhase[]) => void;
  filtersDisabled?: boolean;
  loading?: boolean;
};

/** Selection geometry only — never feeds bias / score / window engine. */
type ManualWindow = {
  startTdy: number;
  endTdy: number;
  startDoy: number;
  endDoy: number;
};

type StoredManualWindow = {
  startDoy: number;
  endDoy: number;
};

const TITAN_GOLD = "#2ea8ff";
const GRAD_ID = "titanSeasonFill";
const STORAGE_KEY = "titan.seasonality.manualWindow";

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

function readStored(): StoredManualWindow | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredManualWindow;
    if (
      typeof parsed?.startDoy === "number" &&
      typeof parsed?.endDoy === "number" &&
      Number.isFinite(parsed.startDoy) &&
      Number.isFinite(parsed.endDoy)
    ) {
      return parsed;
    }
  } catch {
    /* ignore */
  }
  return null;
}

function nearestRow(rows: SeasonaxChartRow[], doy: number): SeasonaxChartRow | null {
  if (!rows.length) return null;
  let best = rows[0]!;
  let bestDist = Math.abs(best.dayOfYear - doy);
  for (const row of rows) {
    const d = Math.abs(row.dayOfYear - doy);
    if (d < bestDist) {
      best = row;
      bestDist = d;
    }
  }
  return best;
}

function buildManualWindow(
  rows: SeasonaxChartRow[],
  aTdy: number,
  bTdy: number,
): ManualWindow | null {
  if (!rows.length) return null;
  const lo = Math.min(aTdy, bTdy);
  const hi = Math.max(aTdy, bTdy);
  const start = rows.reduce((best, row) =>
    Math.abs(row.tdy - lo) < Math.abs(best.tdy - lo) ? row : best,
  );
  const end = rows.reduce((best, row) =>
    Math.abs(row.tdy - hi) < Math.abs(best.tdy - hi) ? row : best,
  );
  if (start.tdy === end.tdy) return null;
  const left = start.tdy <= end.tdy ? start : end;
  const right = start.tdy <= end.tdy ? end : start;
  return {
    startTdy: left.tdy,
    endTdy: right.tdy,
    startDoy: left.dayOfYear,
    endDoy: right.dayOfYear,
  };
}

function lookbackYears(lookback: YearsLookback): number {
  return lookback === "ALL" ? 20 : lookback;
}

function fmtPct(v: number): string {
  const sign = v > 0 ? "+" : "";
  return `${sign}${(v * 100).toFixed(1)}%`;
}

function ManualWindowPanel({
  stats,
  lookback,
}: {
  stats: ManualSeasonalWindowStats;
  lookback: YearsLookback;
}) {
  const { t } = useTitanI18n();
  const bearish =
    stats.avgReturn < 0 && stats.medianReturn < 0 && stats.lossRate >= stats.winRate;
  const rateLabel = bearish
    ? t("seasonality.manualWindow.bearRate")
    : t("seasonality.manualWindow.winRate");
  const rateValue = bearish ? stats.lossRate : stats.winRate;
  const rateTone = bearish ? "text-rose-300" : "text-emerald-300";
  const yearsLine = bearish
    ? t("seasonality.manualWindow.downYears", {
        n: String(stats.downYears),
        total: String(stats.sampleSize),
      })
    : t("seasonality.manualWindow.upYears", {
        n: String(stats.upYears),
        total: String(stats.sampleSize),
      });

  return (
    <div className="mx-4 mb-3 rounded-lg border border-titan-gold/20 bg-black/35 px-3 py-2.5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-titan-gold/85">
          {t("seasonality.manualWindow.title")}
        </p>
        <p className="font-mono text-[10px] text-stone-500">
          {lookback === "ALL" ? "20Y" : `${lookback}Y`}
        </p>
      </div>
      <p className="mt-1 font-display text-[15px] font-semibold tracking-wide text-stone-100">
        {stats.startDateLabel} → {stats.endDateLabel}
      </p>
      <p className="mt-0.5 text-[11px] text-stone-500">{yearsLine}</p>
      <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5 sm:grid-cols-3 lg:grid-cols-6">
        <div>
          <dt className="text-[9px] uppercase tracking-wider text-stone-600">{rateLabel}</dt>
          <dd className={`font-mono text-[13px] font-semibold ${rateTone}`}>
            {(rateValue * 100).toFixed(0)}%
          </dd>
        </div>
        {!bearish ? (
          <div>
            <dt className="text-[9px] uppercase tracking-wider text-stone-600">
              {t("seasonality.manualWindow.lossRate")}
            </dt>
            <dd className="font-mono text-[13px] font-semibold text-rose-300/90">
              {(stats.lossRate * 100).toFixed(0)}%
            </dd>
          </div>
        ) : null}
        <div>
          <dt className="text-[9px] uppercase tracking-wider text-stone-600">
            {t("seasonality.manualWindow.avg")}
          </dt>
          <dd
            className={`font-mono text-[13px] font-semibold ${
              stats.avgReturn >= 0 ? "text-emerald-300" : "text-rose-300"
            }`}
          >
            {fmtPct(stats.avgReturn)}
          </dd>
        </div>
        <div>
          <dt className="text-[9px] uppercase tracking-wider text-stone-600">
            {t("seasonality.manualWindow.median")}
          </dt>
          <dd
            className={`font-mono text-[13px] font-semibold ${
              stats.medianReturn >= 0 ? "text-emerald-300" : "text-rose-300"
            }`}
          >
            {fmtPct(stats.medianReturn)}
          </dd>
        </div>
        <div>
          <dt className="text-[9px] uppercase tracking-wider text-stone-600">
            {t("seasonality.manualWindow.sample")}
          </dt>
          <dd className="font-mono text-[13px] font-semibold text-stone-200">{stats.sampleSize}</dd>
        </div>
        <div>
          <dt className="text-[9px] uppercase tracking-wider text-stone-600">
            {t("seasonality.manualWindow.length")}
          </dt>
          <dd className="font-mono text-[13px] font-semibold text-stone-200">
            {stats.lengthTradingDays} TD
          </dd>
        </div>
      </dl>
    </div>
  );
}

export function SeasonalityMainChart({
  result,
  comparison,
  ohlcBars = null,
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

  const [manual, setManual] = useState<ManualWindow | null>(null);
  const [draft, setDraft] = useState<{ anchor: number; current: number } | null>(null);
  const [selecting, setSelecting] = useState(false);

  useEffect(() => {
    if (curveData.length < 2) return;
    const stored = readStored();
    if (!stored) return;
    const a = nearestRow(curveData, stored.startDoy);
    const b = nearestRow(curveData, stored.endDoy);
    if (!a || !b) return;
    setManual(buildManualWindow(curveData, a.tdy, b.tdy));
  }, [curveData]);

  const manualStats = useMemo(() => {
    if (!manual || !ohlcBars?.length || !activeResult) return null;
    return analyzeManualSeasonalWindow(
      ohlcBars,
      manual.startTdy,
      manual.endTdy,
      lookbackYears(lookback),
      activeResult.currentDate,
    );
  }, [manual, ohlcBars, lookback, activeResult]);

  const activeRange = draft
    ? {
        left: Math.min(draft.anchor, draft.current),
        right: Math.max(draft.anchor, draft.current),
      }
    : manual
      ? { left: manual.startTdy, right: manual.endTdy }
      : null;

  const onChartMouseDown = useCallback((state: unknown) => {
    const s = state as { activeLabel?: string | number } | null;
    if (s?.activeLabel == null) return;
    const tdy = Number(s.activeLabel);
    if (!Number.isFinite(tdy)) return;
    setSelecting(true);
    setDraft({ anchor: tdy, current: tdy });
  }, []);

  const onChartMouseMove = useCallback(
    (state: unknown) => {
      if (!selecting) return;
      const s = state as { activeLabel?: string | number } | null;
      if (s?.activeLabel == null) return;
      const tdy = Number(s.activeLabel);
      if (!Number.isFinite(tdy)) return;
      setDraft((prev) => (prev ? { ...prev, current: tdy } : null));
    },
    [selecting],
  );

  const finishSelect = useCallback(() => {
    if (!draft) {
      setSelecting(false);
      return;
    }
    const next = buildManualWindow(curveData, draft.anchor, draft.current);
    setManual(next);
    setDraft(null);
    setSelecting(false);
  }, [curveData, draft]);

  const clearManual = useCallback(() => {
    setManual(null);
    setDraft(null);
    setSelecting(false);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const saveManual = useCallback(() => {
    if (!manual) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          startDoy: manual.startDoy,
          endDoy: manual.endDoy,
        } satisfies StoredManualWindow),
      );
    } catch {
      /* ignore */
    }
  }, [manual]);

  const rangeSummary = manualStats
    ? `${manualStats.startDateLabel} → ${manualStats.endDateLabel}`
    : manual
      ? `TDY ${manual.startTdy} → ${manual.endTdy}`
      : null;

  return (
    <div className="titan-seasonality-chart overflow-hidden">
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

      <div className="flex flex-wrap items-end justify-between gap-3 px-4 pt-3">
        <div>
          <p className="text-[13px] text-stone-400">{title}</p>
          <p className="mt-1 text-[11px] text-stone-600">{t("seasonality.manualWindow.hint")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {rangeSummary ? (
            <p className="font-mono text-[11px] text-stone-400">{rangeSummary}</p>
          ) : (
            <p className="text-[11px] text-stone-600">{t("seasonality.manualWindow.empty")}</p>
          )}
          <button
            type="button"
            onClick={clearManual}
            disabled={!manual && !draft}
            className="rounded border border-white/10 bg-black/30 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-stone-400 transition hover:border-white/20 hover:text-stone-200 disabled:opacity-40"
          >
            {t("seasonality.manualWindow.clear")}
          </button>
          <button
            type="button"
            onClick={saveManual}
            disabled={!manual}
            className="rounded border border-titan-gold/25 bg-titan-gold/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-titan-gold transition hover:border-titan-gold/40 disabled:opacity-40"
          >
            {t("seasonality.manualWindow.save")}
          </button>
        </div>
      </div>

      {manualStats ? <ManualWindowPanel stats={manualStats} lookback={lookback} /> : null}

      <div className="relative h-[320px] w-full px-2 pb-3 sm:h-[380px]">
        {loading && curveData.length < 2 ? (
          <div className="flex h-full items-center justify-center text-sm text-stone-500">
            {t("seasonality.loading")}
          </div>
        ) : curveData.length >= 2 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={curveData}
              margin={{ top: 12, right: 16, left: 8, bottom: 8 }}
              onMouseDown={onChartMouseDown}
              onMouseMove={onChartMouseMove}
              onMouseUp={finishSelect}
              onMouseLeave={finishSelect}
            >
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
                axisLine={{ stroke: "rgba(46, 168, 255,0.2)" }}
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
              <Tooltip content={<CurveTip />} cursor={{ stroke: "rgba(46, 168, 255,0.2)" }} />
              {activeRange && activeRange.left !== activeRange.right ? (
                <ReferenceArea
                  x1={activeRange.left}
                  x2={activeRange.right}
                  fill="rgba(46, 168, 255, 0.16)"
                  stroke="rgba(46, 168, 255, 0.35)"
                  strokeOpacity={0.8}
                  ifOverflow="extendDomain"
                />
              ) : null}
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
