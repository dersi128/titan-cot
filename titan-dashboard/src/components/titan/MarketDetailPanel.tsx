import { useMemo, useState } from "react";
import type { CotDashboardData } from "../../types";
import type { InstitutionalMarket } from "../../config/institutionalMarkets";
import { evaluateTitanPositioning } from "../../lib/titanCommercialIndex";
import {
  commercialIndexToneClass,
  formatCommercialIndex,
} from "../../lib/titanCotIndexSettings";
import { formatContractsDelta } from "../../lib/titanDmeOverview";
import {
  buildTimeMachineWeeks,
  rebuildCotDashboardAsOf,
} from "../../lib/cotAsOfSnapshot";
import {
  DEFAULT_COT_CHART_MODE,
  DEFAULT_COT_CHART_RANGE,
  type CotChartMode,
  type CotChartRangeWeeks,
} from "../../lib/cotHistoryChart";
import { MarketDetailHeroBias } from "./MarketDetailHeroBias";
import { TitanBiasEngine } from "./TitanBiasEngine";
import { TitanPositioningCore, TitanPositioningSignal } from "./TitanMarketEngine";
import { CotTimeMachine } from "./CotTimeMachine";
import { CotHistoryChartPanel } from "./CotHistoryChartPanel";
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

export function MarketDetailPanel({ market, data, loading, error }: MarketDetailPanelProps) {
  const { t } = useTitanI18n();
  const [asOfDate, setAsOfDate] = useState<string | null>(null);
  const [rangeWeeks, setRangeWeeks] = useState<CotChartRangeWeeks>(DEFAULT_COT_CHART_RANGE);
  const [chartMode, setChartMode] = useState<CotChartMode>(DEFAULT_COT_CHART_MODE);

  const latestDate = data?.reportDate ? data.reportDate.slice(0, 10) : null;
  const asOfExists =
    asOfDate != null &&
    Boolean(data?.history?.some((point) => String(point.reportDate).slice(0, 10) === asOfDate));
  const effectiveAsOf = asOfExists && asOfDate !== latestDate ? asOfDate : null;

  const weekRows = useMemo(() => (data ? buildTimeMachineWeeks(data) : []), [data]);

  const viewData = useMemo(() => {
    if (!data) return null;
    if (!effectiveAsOf) return data;
    return rebuildCotDashboardAsOf(data, effectiveAsOf) ?? data;
  }, [data, effectiveAsOf]);

  return (
    <TitanPanel className="titan-detail-panel overflow-hidden p-0">
      <MarketDetailHeroBias market={market} data={viewData} loading={loading} />

      <div className="border-b border-white/[0.06] bg-black/10 px-5 py-3 md:px-7 md:py-4">
        <TitanBiasEngine market={market} data={viewData} loading={loading} embedded />
      </div>

      <TitanPositioningCore market={market} data={viewData} loading={loading} />
      <TitanPositioningSignal market={market} data={viewData} loading={loading} />

      <div className="space-y-6 border-t border-white/[0.06] p-5 md:p-6">
        {error ? (
          <p className="rounded-lg border border-rose-500/25 bg-rose-950/20 px-4 py-3 text-sm text-rose-300/90">{error}</p>
        ) : null}

        {viewData ? (
          <>
            <CotTimeMachine
              rows={weekRows}
              selectedDate={effectiveAsOf}
              latestDate={latestDate}
              onSelect={setAsOfDate}
            />
            <CommercialIndexPanel data={viewData} tr={t} />
            <CotHistoryChartPanel
              history={data?.history}
              loading={loading}
              rangeWeeks={rangeWeeks}
              chartMode={chartMode}
              markerDate={effectiveAsOf ?? latestDate}
              onRangeWeeks={setRangeWeeks}
              onChartMode={setChartMode}
            />
            <div className="border-t border-white/[0.06] pt-5">
              <CompactMetricsStrip data={viewData} tr={t} />
            </div>
          </>
        ) : null}
      </div>
    </TitanPanel>
  );
}
