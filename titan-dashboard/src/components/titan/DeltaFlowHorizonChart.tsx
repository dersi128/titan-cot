import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { DeltaFlowRow } from "../../lib/titanCommercialIndex";
import {
  horizonDeltas,
  horizonFlowStrengthClass,
  horizonFlowTone,
  horizonPanelTrend,
  type DeltaPanelTrend,
  type HorizonFlowTone,
} from "./deltaFlowHorizon";

const TOOLTIP = {
  background: "rgba(12, 12, 16, 0.96)",
  border: "1px solid rgba(37, 37, 45, 0.9)",
  borderRadius: 10,
  fontSize: 12,
};

function fmtDeltaShort(n: number): string {
  if (!Number.isFinite(n)) return "—";
  const a = Math.abs(n);
  if (a >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (a >= 10_000) return `${(n / 1000).toFixed(1)}K`;
  return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

function strokeForTone(tone: HorizonFlowTone): string {
  if (tone === "bull") return "#5b8f75";
  if (tone === "bear") return "#b87878";
  return "#7d8288";
}

function fillIdForTone(tone: HorizonFlowTone): string {
  if (tone === "bull") return "deltaFlowPos";
  if (tone === "bear") return "deltaFlowNeg";
  return "deltaFlowMix";
}

function valueClassForFlowTone(tone: HorizonFlowTone): string {
  if (tone === "bull") return "text-[#6eb692]";
  if (tone === "bear") return "text-[#c99494]";
  return "text-stone-500";
}

function valueClassForPanelTrend(trend: DeltaPanelTrend): string {
  if (trend === "bullish_accel" || trend === "weakening_bull") return "text-[#6eb692]";
  if (trend === "bearish_accel" || trend === "weakening_bear") return "text-[#c99494]";
  return "text-stone-500";
}

type DeltaFlowHorizonChartProps = {
  rows: DeltaFlowRow[];
  t: (key: string) => string;
};

export function DeltaFlowHorizonChart({ rows, t }: DeltaFlowHorizonChartProps) {
  const { w1, w4, w13 } = horizonDeltas(rows);
  const tone = horizonFlowTone(w1, w4, w13);
  const panelTrend = horizonPanelTrend(w1, w4, w13);
  const strength = horizonFlowStrengthClass(tone, w1, w4, w13);
  const stroke = strokeForTone(tone);
  const gradId = fillIdForTone(tone);

  const chartData = [
    { tf: "1W", delta: w1 },
    { tf: "4W", delta: w4 },
    { tf: "13W", delta: w13 },
  ];

  const vals = [w1, w4, w13, 0].filter(Number.isFinite);
  const rawMin = Math.min(...vals);
  const rawMax = Math.max(...vals);
  const span = Math.max(rawMax - rawMin, Math.abs(rawMax), Math.abs(rawMin), 1);
  const pad = Math.max(span * 0.15, 1);
  const yMin = Math.min(rawMin - pad, 0);
  const yMax = Math.max(rawMax + pad, 0);

  const flowKey =
    tone === "bull"
      ? "positioning.delta.flowTrend.bull"
      : tone === "bear"
        ? "positioning.delta.flowTrend.bear"
        : "positioning.delta.flowTrend.mixed";

  const trendKey = `positioning.delta.trend_${panelTrend}`;
  const strengthKey = `positioning.delta.flowStrength.${strength}`;

  const flowValueClass = valueClassForFlowTone(tone);
  const trendValueClass = valueClassForPanelTrend(panelTrend);
  const strengthValueClass = strength === "mixed" ? "text-stone-500" : flowValueClass;

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch lg:gap-5">
      <div className="min-h-[132px] min-w-0 flex-1 lg:max-w-[72%]">
        <ResponsiveContainer width="100%" height={132}>
          <AreaChart data={chartData} margin={{ top: 8, right: 6, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="deltaFlowPos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(91, 143, 117, 0.26)" />
                <stop offset="100%" stopColor="rgba(91, 143, 117, 0.02)" />
              </linearGradient>
              <linearGradient id="deltaFlowNeg" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor="rgba(184, 120, 120, 0.24)" />
                <stop offset="100%" stopColor="rgba(184, 120, 120, 0.02)" />
              </linearGradient>
              <linearGradient id="deltaFlowMix" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(125, 130, 136, 0.16)" />
                <stop offset="100%" stopColor="rgba(125, 130, 136, 0.02)" />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="tf"
              tick={{ fill: "#57534e", fontSize: 10, fontFamily: "JetBrains Mono" }}
              tickLine={false}
              axisLine={{ stroke: "rgba(45,45,52,0.85)" }}
            />
            <YAxis
              width={40}
              domain={[yMin, yMax]}
              tick={{ fill: "#57534e", fontSize: 9, fontFamily: "JetBrains Mono" }}
              tickLine={false}
              axisLine={{ stroke: "rgba(45,45,52,0.85)" }}
              tickFormatter={(v) => {
                const n = Number(v);
                if (!Number.isFinite(n)) return "";
                if (n === 0) return "0";
                const a = Math.abs(n);
                if (a >= 1000) return `${Math.round(n / 1000)}k`;
                return String(Math.round(n));
              }}
            />
            <Tooltip
              contentStyle={TOOLTIP}
              labelStyle={{ color: "#a8a29e" }}
              formatter={(v: number) => [fmtDeltaShort(v), t("positioning.delta.delta")]}
            />
            <Area
              type="monotone"
              dataKey="delta"
              stroke={stroke}
              strokeWidth={1.75}
              fill={`url(#${gradId})`}
              fillOpacity={1}
              dot={false}
              activeDot={{ r: 4, fill: stroke, stroke: "#0c0c10", strokeWidth: 1 }}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-col justify-center gap-3 border-t border-white/[0.06] pt-3 text-[10px] font-semibold uppercase tracking-[0.14em] lg:w-[min(28%,240px)] lg:flex-shrink-0 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
        <div>
          <p className="text-stone-600">{t("positioning.delta.panelCurrentDelta")}</p>
          <p className={`mt-1 font-mono text-sm tracking-tight ${flowValueClass}`}>{fmtDeltaShort(w1)}</p>
        </div>
        <div>
          <p className="text-stone-600">{t("positioning.delta.panelFlow")}</p>
          <p className={`mt-1 text-xs tracking-wide ${flowValueClass}`}>{t(flowKey)}</p>
        </div>
        <div>
          <p className="text-stone-600">{t("positioning.delta.panelTrend")}</p>
          <p className={`mt-1 text-xs tracking-wide ${trendValueClass}`}>{t(trendKey)}</p>
        </div>
        <div>
          <p className="text-stone-600">{t("positioning.delta.panelStrength")}</p>
          <p className={`mt-1 text-xs tracking-wide ${strengthValueClass}`}>{t(strengthKey)}</p>
        </div>
      </div>
    </div>
  );
}
