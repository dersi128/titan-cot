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
import {
  commercialIndexToneClass,
  formatCommercialIndex,
} from "../../lib/titanCotIndexSettings";
import { formatContractsDelta } from "../../lib/titanDmeOverview";
import { MarketDetailHeroBias } from "./MarketDetailHeroBias";
import { TitanBiasEngine } from "./TitanBiasEngine";
import { TitanPositioningCore, TitanPositioningSignal } from "./TitanMarketEngine";
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

function flowTone(v: number | null | undefined): string {
  if (v === null || v === undefined || !Number.isFinite(v)) return "text-stone-300";
  if (v > 0) return "text-emerald-400";
  if (v < 0) return "text-rose-400";
  return "text-stone-300";
}

function CommercialIndexPanel({ data, tr }: { data: CotDashboardData; tr: (key: string, params?: Record<string, string>) => string }) {
  const read = evaluateTitanPositioning(data);
  const c = data.commercials;
  const persist = read?.commercialPersistenceWeeks ?? 0;

  const rows: Array<{ label: string; value: string; valueClass?: string }> = [
    {
      label: tr("detail.indexPanel.comm26"),
      value: formatCommercialIndex(c.index26w),
      valueClass: commercialIndexToneClass(c.index26w),
    },
    {
      label: tr("detail.indexPanel.comm52"),
      value: formatCommercialIndex(c.index52w),
      valueClass: commercialIndexToneClass(c.index52w),
    },
    {
      label: tr("detail.indexPanel.delta1w"),
      value: formatContractsDelta(c.weeklyChange),
      valueClass: flowTone(c.weeklyChange),
    },
    {
      label: tr("detail.indexPanel.delta4w"),
      value: formatContractsDelta(c.delta4w),
      valueClass: flowTone(c.delta4w),
    },
    {
      label: tr("detail.indexPanel.delta13w"),
      value: formatContractsDelta(c.delta13w),
      valueClass: flowTone(c.delta13w),
    },
    {
      label: tr("detail.indexPanel.persistence"),
      value:
        persist > 0
          ? tr("detail.indexPanel.persistenceWeeks", { count: String(persist) })
          : tr("detail.indexPanel.persistenceNone"),
    },
  ];

  return (
    <section className="rounded-xl border border-white/[0.07] bg-black/25 p-4 md:p-5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500">
        {tr("detail.indexPanel.title")}
      </p>
      <p className="mt-1 text-[11px] text-stone-600">{tr("detail.indexPanel.caption")}</p>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {rows.map((row) => (
          <div key={row.label} className="rounded-lg border border-white/[0.06] bg-black/30 px-3 py-2.5">
            <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-stone-600">{row.label}</p>
            <p className={`mt-1 font-mono text-base font-semibold tabular-nums leading-tight ${row.valueClass ?? "text-stone-100"}`}>
              {row.value}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function CompactMetricsStrip({ data, tr }: { data: CotDashboardData; tr: (key: string) => string }) {
  const read = evaluateTitanPositioning(data);
  if (!read) return null;

  const cells: { label: string; value: string }[] = [
    { label: tr("detail.metricStripRegime"), value: tr(`positioning.regime.${read.regime}`) },
    { label: tr("detail.metricStripDivergence"), value: tr(`positioning.divergence.headline.${read.divergence}`) },
    { label: tr("detail.metricStripRetail26"), value: formatCommercialIndex(data.retail.index26w) },
    { label: tr("detail.metricStripDelta13"), value: fmtLocaleInt(data.commercials.delta13w) },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
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
  trimmed,
  loading,
  tr,
}: {
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
                  stroke="#2ea8ff"
                  strokeWidth={2.25}
                  dot={false}
                  activeDot={{ r: 4, fill: "#7dd3fc" }}
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
      <MarketDetailHeroBias market={market} data={data} loading={loading} />

      <div className="border-b border-white/[0.06] bg-black/10 px-5 py-3 md:px-7 md:py-4">
        <TitanBiasEngine market={market} data={data} loading={loading} embedded />
      </div>

      <TitanPositioningCore market={market} data={data} loading={loading} />
      <TitanPositioningSignal market={market} data={data} loading={loading} />

      <div className="space-y-6 border-t border-white/[0.06] p-5 md:p-6">
        {error ? (
          <p className="rounded-lg border border-rose-500/25 bg-rose-950/20 px-4 py-3 text-sm text-rose-300/90">{error}</p>
        ) : null}

        {data ? (
          <>
            <CommercialIndexPanel data={data} tr={t} />
            <ChartsSection trimmed={trimmed} loading={loading} tr={t} />
            <div className="border-t border-white/[0.06] pt-5">
              <CompactMetricsStrip data={data} tr={t} />
            </div>
          </>
        ) : null}
      </div>
    </TitanPanel>
  );
}
