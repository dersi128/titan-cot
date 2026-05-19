import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { CotDashboardData } from "../../types";
import type { InstitutionalMarket } from "../../config/institutionalMarkets";
import { AiVerdictPanel } from "./AiVerdictPanel";

type MarketDetailPanelProps = {
  market: InstitutionalMarket;
  data: CotDashboardData | null;
  loading: boolean;
  error: string | null;
};

function MetricCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-lg border border-titan-line/90 bg-titan-elevated/40 px-4 py-3 transition-colors duration-300 hover:border-titan-gold/15">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">{label}</p>
      <p className="mt-1 font-mono text-lg text-stone-100">{value}</p>
      {sub ? <p className="mt-0.5 text-[11px] text-stone-500">{sub}</p> : null}
    </div>
  );
}

function divLabel(d: CotDashboardData["nonCommercials"]["divergence"]): string {
  if (d === "bullish") return "Bullish institutional divergence (weekly)";
  if (d === "bearish") return "Bearish institutional divergence (weekly)";
  return "No clear weekly divergence";
}

export function MarketDetailPanel({ market, data, loading, error }: MarketDetailPanelProps) {
  const chartData =
    data?.history?.map((h) => ({
      reportDate: h.reportDate.slice(0, 10),
      commercialNet: h.commercialNet,
      nonCommercialNet: h.nonCommercialNet,
      retailNet: h.retailNet,
    })) ?? [];

  const trimmed = chartData.length > 120 ? chartData.slice(-120) : chartData;

  return (
    <section className="rounded-xl border border-titan-line bg-titan-panel/80 shadow-card backdrop-blur-sm transition-all duration-300 hover:border-titan-gold/15">
      <header className="flex flex-col gap-2 border-b border-titan-line px-5 py-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-titan-gold">
            Market Detail
          </h2>
          <p className="mt-1 font-display text-xl text-stone-100 transition-all duration-300">
            {market.shortLabel}{" "}
            <span className="text-titan-goldDim">{market.symbol}</span>
          </p>
        </div>
        {data?.reportDate ? (
          <p className="font-mono text-xs text-stone-500">Last CFTC report · {data.reportDate}</p>
        ) : null}
      </header>

      <div className="space-y-8 p-5">
        <div key={market.symbol} className="titan-market-surface">
          <AiVerdictPanel variant="embedded" market={market} data={data} loading={loading} />
        </div>

        {error ? (
          <p className="text-sm text-rose-400/90">{error}</p>
        ) : null}

        {data ? (
          <>
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm text-stone-400">
              <strong className="text-titan-gold">Disclaimer:</strong> This dashboard expresses{" "}
              <em>bias and positioning context</em> only. It does not provide buy, sell, or timing signals.
            </div>

            <div>
              <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-500">
                Positioning snapshot
              </h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                  label="Commercial 26W index"
                  value={data.commercials.index26w.toFixed(1)}
                  sub="Percentile vs 26-week net range"
                />
                <MetricCard
                  label="Commercial 52W index"
                  value={data.commercials.index52w.toFixed(1)}
                  sub="Percentile vs 52-week net range"
                />
                <MetricCard
                  label="Retail 26W / 52W"
                  value={`${data.retail.index26w.toFixed(0)} / ${data.retail.index52w.toFixed(0)}`}
                />
                <MetricCard
                  label="Non-comm 26W / 52W"
                  value={`${data.nonCommercials.index26w.toFixed(0)} / ${data.nonCommercials.index52w.toFixed(0)}`}
                />
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                  label="Δ Commercial (1W · 4W · 13W)"
                  value={`${data.commercials.weeklyChange.toLocaleString()} · ${data.commercials.delta4w.toLocaleString()} · ${data.commercials.delta13w.toLocaleString()}`}
                />
                <MetricCard
                  label="Δ Non-comm (1W)"
                  value={data.nonCommercials.weeklyChange.toLocaleString()}
                />
                <MetricCard label="Δ Retail (1W)" value={data.retail.weeklyChange.toLocaleString()} />
                <MetricCard
                  label="Divergence"
                  value={divLabel(data.nonCommercials.divergence)}
                />
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-500">
                Historical net positioning
              </h3>
              <div
                key={market.symbol}
                className="h-[380px] w-full min-w-0 rounded-lg border border-titan-line/80 bg-titan-black/30 p-2 transition-opacity duration-300"
              >
                {trimmed.length >= 2 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trimmed} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2a2a30" vertical={false} />
                      <XAxis
                        dataKey="reportDate"
                        tick={{ fill: "#78716c", fontSize: 9 }}
                        tickLine={false}
                        axisLine={{ stroke: "#2a2a30" }}
                        interval="preserveStartEnd"
                        angle={-30}
                        textAnchor="end"
                        height={54}
                      />
                      <YAxis
                        tick={{ fill: "#78716c", fontSize: 10 }}
                        tickLine={false}
                        axisLine={{ stroke: "#2a2a30" }}
                        tickFormatter={(v) => `${Math.round(v / 1000)}k`}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "#0e0e11",
                          border: "1px solid #232328",
                          borderRadius: 6,
                          fontSize: 12,
                        }}
                        labelStyle={{ color: "#a8a29e" }}
                      />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Line
                        type="monotone"
                        dataKey="commercialNet"
                        name="Commercial net"
                        stroke="#c9a227"
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={true}
                        animationDuration={600}
                      />
                      <Line
                        type="monotone"
                        dataKey="nonCommercialNet"
                        name="Non-commercial net"
                        stroke="#38bdf8"
                        strokeWidth={1.8}
                        dot={false}
                        isAnimationActive={true}
                        animationDuration={600}
                      />
                      <Line
                        type="monotone"
                        dataKey="retailNet"
                        name="Retail net"
                        stroke="#f472b6"
                        strokeWidth={1.8}
                        dot={false}
                        isAnimationActive={true}
                        animationDuration={600}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="flex h-full items-center justify-center text-sm text-stone-500">
                    Not enough history for chart.
                  </p>
                )}
              </div>
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}
