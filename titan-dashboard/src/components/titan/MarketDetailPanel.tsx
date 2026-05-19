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
import { MarketGuide } from "./MarketGuide";
import { TradingViewChart } from "./TradingViewChart";
import { useTitanI18n } from "../../i18n";
import { TitanMetricCard, TitanPanel, TitanPanelHeader } from "./ui/TitanPrimitives";

type MarketDetailPanelProps = {
  market: InstitutionalMarket;
  data: CotDashboardData | null;
  loading: boolean;
  error: string | null;
};

function divLabel(
  d: CotDashboardData["nonCommercials"]["divergence"],
  tr: (key: string) => string,
): string {
  if (d === "bullish") return tr("detail.divBullish");
  if (d === "bearish") return tr("detail.divBearish");
  return tr("detail.divNone");
}

const CHART_TOOLTIP_STYLE = {
  background: "rgba(12, 12, 16, 0.96)",
  border: "1px solid rgba(37, 37, 45, 0.9)",
  borderRadius: 10,
  fontSize: 12,
  boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
};

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
    <TitanPanel className="overflow-hidden">
      <TitanPanelHeader
        eyebrow={t("detail.eyebrow")}
        title={`${market.shortLabel} · ${market.symbol}`}
        aside={
          data?.reportDate ? (
            <p className="font-mono text-xs text-stone-500">{t("detail.cftcReport", { date: data.reportDate })}</p>
          ) : null
        }
      />

      <div className="space-y-8 p-5 md:p-6">
        <MarketGuide market={market} />

        <div key={market.symbol}>
          <AiVerdictPanel variant="embedded" market={market} data={data} loading={loading} />
        </div>

        {error ? (
          <p className="rounded-lg border border-rose-500/25 bg-rose-950/20 px-4 py-3 text-sm text-rose-300/90">
            {error}
          </p>
        ) : null}

        {data ? (
          <>
            <div className="flex items-start gap-3 rounded-xl border border-amber-500/15 bg-gradient-to-r from-amber-500/5 to-transparent px-4 py-3.5 text-sm text-stone-400">
              <span className="mt-0.5 text-titan-gold" aria-hidden>
                ◆
              </span>
              <p>
                <strong className="font-medium text-titan-goldBright">Disclaimer:</strong> {t("detail.disclaimer")}
              </p>
            </div>

            <section>
              <h3 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-500">
                {t("detail.positioningSnapshot")}
              </h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <TitanMetricCard
                  label={t("detail.metricComm26")}
                  value={data.commercials.index26w.toFixed(1)}
                  index={data.commercials.index26w}
                  sub={t("detail.metricComm26Sub")}
                />
                <TitanMetricCard
                  label={t("detail.metricComm52")}
                  value={data.commercials.index52w.toFixed(1)}
                  index={data.commercials.index52w}
                  sub={t("detail.metricComm52Sub")}
                />
                <TitanMetricCard
                  label={t("detail.metricRetail")}
                  value={`${data.retail.index26w.toFixed(0)} / ${data.retail.index52w.toFixed(0)}`}
                  index={data.retail.index26w}
                />
                <TitanMetricCard
                  label={t("detail.metricNonComm")}
                  value={`${data.nonCommercials.index26w.toFixed(0)} / ${data.nonCommercials.index52w.toFixed(0)}`}
                  index={data.nonCommercials.index26w}
                />
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <TitanMetricCard
                  label="Δ Commercial"
                  value={`${data.commercials.weeklyChange.toLocaleString()} · ${data.commercials.delta4w.toLocaleString()} · ${data.commercials.delta13w.toLocaleString()}`}
                  sub="1W · 4W · 13W"
                />
                <TitanMetricCard
                  label={t("detail.metricDeltaNc1w")}
                  value={data.nonCommercials.weeklyChange.toLocaleString()}
                />
                <TitanMetricCard
                  label={t("detail.metricDeltaRetail1w")}
                  value={data.retail.weeklyChange.toLocaleString()}
                />
                <TitanMetricCard
                  label={t("detail.metricDivergence")}
                  value={divLabel(data.nonCommercials.divergence, t)}
                />
              </div>
            </section>

          </>
        ) : null}

        <ChartsSection market={market} trimmed={trimmed} loading={loading} tr={t} />
      </div>
    </TitanPanel>
  );
}

type CotChartPoint = {
  reportDate: string;
  commercialNet: number;
  nonCommercialNet: number;
  retailNet: number;
};

function ChartsSection({
  market,
  trimmed,
  loading,
  tr,
}: {
  market: InstitutionalMarket;
  trimmed: CotChartPoint[];
  loading: boolean;
  tr: (key: string) => string;
}) {
  return (
    <section id="market-charts">
      <h3 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-500">
        {tr("detail.chartsTitle")}
      </h3>
      <div className="flex flex-col gap-4">
        <TradingViewChart market={market} selectionKey={market.symbol} />

        <div className="flex min-h-[400px] flex-col rounded-xl border border-titan-line/70 bg-titan-black/40 p-3">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-stone-600">
            COT · historické net pozice
          </p>
          <div className="min-h-[340px] flex-1">
            {loading ? (
              <p className="flex h-full items-center justify-center text-sm text-stone-500 animate-pulse-soft">
                Loading CFTC history…
              </p>
            ) : trimmed.length >= 2 ? (
              <ResponsiveContainer width="100%" height="100%" minHeight={340}>
                <LineChart data={trimmed} margin={{ top: 12, right: 16, left: 4, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(37,37,45,0.6)" vertical={false} />
                  <XAxis
                    dataKey="reportDate"
                    tick={{ fill: "#78716c", fontSize: 9, fontFamily: "JetBrains Mono" }}
                    tickLine={false}
                    axisLine={{ stroke: "rgba(37,37,45,0.8)" }}
                    interval="preserveStartEnd"
                    angle={-28}
                    textAnchor="end"
                    height={52}
                  />
                  <YAxis
                    tick={{ fill: "#78716c", fontSize: 10, fontFamily: "JetBrains Mono" }}
                    tickLine={false}
                    axisLine={{ stroke: "rgba(37,37,45,0.8)" }}
                    tickFormatter={(v) => `${Math.round(Number(v) / 1000)}k`}
                  />
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} labelStyle={{ color: "#a8a29e" }} />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                  <Line
                    type="monotone"
                    dataKey="commercialNet"
                    name={tr("detail.chartCommercial")}
                    stroke="#d4af37"
                    strokeWidth={2.25}
                    dot={false}
                    activeDot={{ r: 4, fill: "#f0d060" }}
                    animationDuration={500}
                  />
                  <Line
                    type="monotone"
                    dataKey="nonCommercialNet"
                    name={tr("detail.chartNonCommercial")}
                    stroke="#38bdf8"
                    strokeWidth={1.75}
                    dot={false}
                    animationDuration={500}
                  />
                  <Line
                    type="monotone"
                    dataKey="retailNet"
                    name={tr("detail.chartRetail")}
                    stroke="#f472b6"
                    strokeWidth={1.75}
                    dot={false}
                    animationDuration={500}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="flex h-full items-center justify-center text-sm text-stone-500">
                {tr("detail.notEnoughHistory")}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
