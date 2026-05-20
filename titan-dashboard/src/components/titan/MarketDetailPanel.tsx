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
import { evaluateTitanPositioning } from "../../lib/titanCommercialIndex";
import { AiVerdictPanel } from "./AiVerdictPanel";
import { MarketDetailHero } from "./MarketDetailHero";
import { TitanPositioningCore, TitanPositioningSignal } from "./TitanMarketEngine";
import { TradingViewChart } from "./TradingViewChart";
import { useTitanI18n } from "../../i18n";
import { TitanPanel } from "./ui/TitanPrimitives";

function fmtLocaleInt(n: unknown): string {
  if (n === null || n === undefined) return "—";
  const x = Number(n);
  return Number.isFinite(x) ? x.toLocaleString() : "—";
}

type MarketDetailPanelProps = {
  market: InstitutionalMarket;
  data: CotDashboardData | null;
  loading: boolean;
  error: string | null;
};

const CHART_TOOLTIP_STYLE = {
  background: "rgba(12, 12, 16, 0.96)",
  border: "1px solid rgba(37, 37, 45, 0.9)",
  borderRadius: 10,
  fontSize: 12,
  boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
};

type CotChartPoint = {
  reportDate: string;
  commercialNet: number;
  nonCommercialNet: number;
  retailNet: number;
};

function CompactMetricsStrip({ data, tr }: { data: CotDashboardData; tr: (key: string) => string }) {
  const read = evaluateTitanPositioning(data);
  if (!read) return null;

  const cells: { label: string; value: string }[] = [
    { label: tr("detail.metricStripComm26"), value: data.commercials.index26w.toFixed(0) },
    { label: tr("detail.metricStripRetail26"), value: data.retail.index26w.toFixed(0) },
    { label: tr("detail.metricStripDelta13"), value: fmtLocaleInt(data.commercials.delta13w) },
    { label: tr("detail.metricStripRegime"), value: tr(`positioning.regime.${read.regime}`) },
    { label: tr("detail.metricStripDivergence"), value: tr(`positioning.divergence.headline.${read.divergence}`) },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
      {cells.map((c) => (
        <div key={c.label} className="rounded-lg border border-white/[0.06] bg-black/30 px-3 py-2.5">
          <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-stone-600">{c.label}</p>
          <p className="mt-1 font-mono text-sm font-medium tabular-nums leading-tight text-stone-200">{c.value}</p>
        </div>
      ))}
    </div>
  );
}

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
    <section id="market-charts" className="space-y-4">
      <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-500">{tr("detail.chartsTitle")}</h3>

      <div className="flex min-h-[400px] flex-col rounded-xl border border-titan-line/70 bg-titan-black/40 p-3">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-stone-600">{tr("detail.cotHistory")}</p>
        <div className="min-h-[340px] flex-1">
          {loading ? (
            <p className="flex h-full items-center justify-center text-sm text-stone-500 animate-pulse-soft">
              {tr("detail.loadingHistory")}
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
            <p className="flex h-full items-center justify-center text-sm text-stone-500">{tr("detail.notEnoughHistory")}</p>
          )}
        </div>
      </div>

      <TradingViewChart market={market} selectionKey={market.symbol} compact />
    </section>
  );
}

export function MarketDetailPanel({ market, data, loading, error }: MarketDetailPanelProps) {
  const { t } = useTitanI18n();

  const chartData =
    data?.history?.map((h) => ({
      reportDate: String(h.reportDate ?? "").slice(0, 10),
      commercialNet: Number(h.commercialNet),
      nonCommercialNet: Number(h.nonCommercialNet),
      retailNet: Number(h.retailNet),
    })) ?? [];

  const trimmed = chartData.length > 120 ? chartData.slice(-120) : chartData;

  return (
    <TitanPanel className="titan-detail-panel overflow-hidden p-0">
      <MarketDetailHero market={market} data={data} loading={loading} />

      <div className="border-b border-white/[0.06] px-5 py-5 md:px-7 md:py-6">
        <AiVerdictPanel variant="insights" market={market} data={data} loading={loading} />
      </div>

      <TitanPositioningCore market={market} data={data} loading={loading} />
      <TitanPositioningSignal market={market} data={data} loading={loading} />

      <div className="space-y-6 border-t border-white/[0.06] p-5 md:p-6">
        {error ? (
          <p className="rounded-lg border border-rose-500/25 bg-rose-950/20 px-4 py-3 text-sm text-rose-300/90">{error}</p>
        ) : null}

        {data ? (
          <>
            <ChartsSection market={market} trimmed={trimmed} loading={loading} tr={t} />
            <div className="border-t border-white/[0.06] pt-5">
              <CompactMetricsStrip data={data} tr={t} />
            </div>
          </>
        ) : null}
      </div>

      <footer className="border-t border-white/[0.06] px-5 py-4 text-center md:px-7">
        <p className="text-[11px] leading-relaxed text-stone-500">{t("detail.footerDisclaimer")}</p>
      </footer>
    </TitanPanel>
  );
}
