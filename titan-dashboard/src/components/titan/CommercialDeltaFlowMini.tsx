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
import type { CotDashboardData } from "../../types";
import { commercialWeeklyDeltaSeries } from "../../lib/titanCotScoringCore";

const TOOLTIP_STYLE = {
  background: "rgba(12, 12, 16, 0.96)",
  border: "1px solid rgba(37, 37, 45, 0.9)",
  borderRadius: 10,
  fontSize: 12,
  boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
};

type CommercialDeltaFlowMiniProps = {
  data: CotDashboardData;
  title: string;
  labels: { w1: string; w4: string; w13: string };
};

export function CommercialDeltaFlowMini({ data, title, labels }: CommercialDeltaFlowMiniProps) {
  const series = commercialWeeklyDeltaSeries(data.history);
  const chartData = series.map((p) => ({
    reportDate: p.reportDate.slice(0, 10),
    delta: p.delta,
  }));

  const w1 = data.commercials.weeklyChange;
  const w4 = data.commercials.delta4w;
  const w13 = data.commercials.delta13w;

  const fmt = (n: number) => (Number.isFinite(n) ? n.toLocaleString() : "—");

  if (chartData.length < 1) {
    return (
      <div className="rounded-xl border border-white/[0.06] bg-titan-black/35 p-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">{title}</p>
        <p className="mt-2 text-xs text-stone-500">Insufficient history for weekly commercial net deltas.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/[0.06] bg-titan-black/35 p-3">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-stone-500">{title}</p>
      <div className="h-[180px] w-full min-h-[160px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
            <defs>
              <linearGradient id="cotDeltaFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(52, 211, 153, 0.22)" />
                <stop offset="50%" stopColor="rgba(148, 163, 184, 0.06)" />
                <stop offset="100%" stopColor="rgba(251, 113, 133, 0.2)" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(37,37,45,0.5)" vertical={false} />
            <XAxis
              dataKey="reportDate"
              tick={{ fill: "#78716c", fontSize: 8, fontFamily: "JetBrains Mono" }}
              tickLine={false}
              axisLine={{ stroke: "rgba(37,37,45,0.7)" }}
              interval="preserveStartEnd"
            />
            <YAxis
              width={44}
              tick={{ fill: "#78716c", fontSize: 9, fontFamily: "JetBrains Mono" }}
              tickLine={false}
              axisLine={{ stroke: "rgba(37,37,45,0.7)" }}
              tickFormatter={(v) => {
                const n = Number(v);
                if (!Number.isFinite(n)) return "";
                const a = Math.abs(n);
                if (a >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
                if (a >= 10_000) return `${(n / 1000).toFixed(0)}k`;
                return String(Math.round(n));
              }}
            />
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              labelStyle={{ color: "#a8a29e" }}
              formatter={(value: number) => [fmt(value), "Δ net"]}
            />
            <ReferenceLine y={0} stroke="rgba(212, 175, 55, 0.35)" strokeDasharray="4 4" />
            <Area
              type="monotone"
              dataKey="delta"
              stroke="#c4b5a0"
              strokeWidth={1.5}
              fill="url(#cotDeltaFill)"
              dot={false}
              activeDot={{ r: 3, fill: "#d4af37" }}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <dl className="mt-3 grid grid-cols-3 gap-2 border-t border-white/[0.06] pt-3 font-mono text-[11px] tabular-nums text-stone-300">
        <div>
          <dt className="text-[9px] uppercase tracking-wider text-stone-600">{labels.w1}</dt>
          <dd className={w1 < 0 ? "text-rose-300/90" : w1 > 0 ? "text-emerald-300/90" : "text-stone-500"}>
            {fmt(w1)}
          </dd>
        </div>
        <div>
          <dt className="text-[9px] uppercase tracking-wider text-stone-600">{labels.w4}</dt>
          <dd className={w4 < 0 ? "text-rose-300/90" : w4 > 0 ? "text-emerald-300/90" : "text-stone-500"}>
            {fmt(w4)}
          </dd>
        </div>
        <div>
          <dt className="text-[9px] uppercase tracking-wider text-stone-600">{labels.w13}</dt>
          <dd className={w13 < 0 ? "text-rose-300/90" : w13 > 0 ? "text-emerald-300/90" : "text-stone-500"}>
            {fmt(w13)}
          </dd>
        </div>
      </dl>
      <p className="mt-2 text-[10px] leading-relaxed text-stone-600">
        Positive week-over-week delta suggests commercials added net long / reduced net short; negative suggests the
        opposite. Mixed horizons imply no clean flow read.
      </p>
    </div>
  );
}
