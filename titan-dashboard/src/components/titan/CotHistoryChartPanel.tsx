import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { CotHistoryPoint } from "../../types";
import {
  buildCotHistoryChart,
  COT_CHART_RANGE_OPTIONS,
  type CotChartMode,
  type CotChartRangeWeeks,
  type CotHistoryChartPoint,
} from "../../lib/cotHistoryChart";
import { useTitanI18n } from "../../i18n";

const CHART_TOOLTIP_STYLE = {
  background: "rgba(12, 12, 16, 0.96)",
  border: "1px solid rgba(37, 37, 45, 0.9)",
  borderRadius: 10,
  fontSize: 12,
  boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
};

type SeriesDef = {
  dataKey: keyof CotHistoryChartPoint;
  name: string;
  stroke: string;
  strokeWidth: number;
};

function toggleClass(active: boolean): string {
  return `rounded border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] transition ${
    active
      ? "border-sky-400/45 bg-sky-500/15 text-sky-200"
      : "border-white/[0.08] bg-transparent text-stone-500 hover:border-white/15 hover:text-stone-300"
  }`;
}

function yTick(mode: CotChartMode, value: number): string {
  if (mode === "index26w") return String(Math.round(value));
  const n = Number(value);
  if (!Number.isFinite(n)) return "";
  const a = Math.abs(n);
  if (a >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (a >= 1000) return `${Math.round(n / 1000)}k`;
  return String(Math.round(n));
}

type CotHistoryChartPanelProps = {
  history: CotHistoryPoint[] | undefined;
  loading: boolean;
  rangeWeeks: CotChartRangeWeeks;
  chartMode: CotChartMode;
  markerDate: string | null;
  onRangeWeeks: (weeks: CotChartRangeWeeks) => void;
  onChartMode: (mode: CotChartMode) => void;
};

export function CotHistoryChartPanel({
  history,
  loading,
  rangeWeeks,
  chartMode,
  markerDate,
  onRangeWeeks,
  onChartMode,
}: CotHistoryChartPanelProps) {
  const { t } = useTitanI18n();
  const trimmed = buildCotHistoryChart(history, rangeWeeks, chartMode);
  const marker =
    markerDate && trimmed.some((point) => point.reportDate === markerDate) ? markerDate : null;

  const series: SeriesDef[] =
    chartMode === "index26w"
      ? [
          { dataKey: "commercialIndex", name: t("detail.chartCommercialIndex"), stroke: "#2ea8ff", strokeWidth: 2.25 },
          { dataKey: "retailIndex", name: t("detail.chartRetailIndex"), stroke: "#f472b6", strokeWidth: 1.75 },
        ]
      : chartMode === "delta1w"
        ? [
            { dataKey: "commercialDelta", name: t("detail.chartCommercialDelta"), stroke: "#2ea8ff", strokeWidth: 2.25 },
            { dataKey: "nonCommercialDelta", name: t("detail.chartNonCommercialDelta"), stroke: "#38bdf8", strokeWidth: 1.75 },
            { dataKey: "retailDelta", name: t("detail.chartRetailDelta"), stroke: "#f472b6", strokeWidth: 1.75 },
          ]
        : [
            { dataKey: "commercialNet", name: t("detail.chartCommercial"), stroke: "#2ea8ff", strokeWidth: 2.25 },
            { dataKey: "nonCommercialNet", name: t("detail.chartNonCommercial"), stroke: "#38bdf8", strokeWidth: 1.75 },
            { dataKey: "retailNet", name: t("detail.chartRetail"), stroke: "#f472b6", strokeWidth: 1.75 },
          ];

  const modes: Array<{ id: CotChartMode; label: string }> = [
    { id: "net", label: t("detail.chartMode.net") },
    { id: "index26w", label: t("detail.chartMode.index26w") },
    { id: "delta1w", label: t("detail.chartMode.delta1w") },
  ];

  return (
    <section id="market-charts" className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-500">
            {t("detail.chartsTitle")}
          </h3>
          <p className="mt-1 text-[12px] text-stone-500">{t(`detail.chartModeHint.${chartMode}`)}</p>
        </div>
        <div className="flex flex-col items-stretch gap-2 sm:items-end">
          <div className="flex flex-wrap gap-1.5" role="group" aria-label={t("detail.chartRangeLabel")}>
            {COT_CHART_RANGE_OPTIONS.map((weeks) => (
              <button
                key={weeks}
                type="button"
                onClick={() => onRangeWeeks(weeks)}
                className={toggleClass(rangeWeeks === weeks)}
              >
                {t(`detail.chartRange.${weeks}`)}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label={t("detail.chartModeLabel")}>
            {modes.map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => onChartMode(mode.id)}
                className={toggleClass(chartMode === mode.id)}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex min-h-[400px] flex-col rounded-xl border border-titan-line/70 bg-titan-black/40 p-3">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-stone-600">
          {t("detail.cotHistory")}
        </p>
        <div className="min-h-[340px] flex-1">
          {loading ? (
            <p className="flex h-full items-center justify-center text-sm text-stone-500 animate-pulse-soft">
              {t("detail.loadingHistory")}
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
                  tickFormatter={(value) => yTick(chartMode, Number(value))}
                />
                <Tooltip contentStyle={CHART_TOOLTIP_STYLE} labelStyle={{ color: "#a8a29e" }} />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                {marker ? (
                  <ReferenceLine
                    x={marker}
                    stroke="rgba(252, 211, 77, 0.7)"
                    strokeDasharray="4 4"
                    label={{
                      value: t("detail.chartAsOfMarker"),
                      fill: "#fcd34d",
                      fontSize: 10,
                      position: "insideTopRight",
                    }}
                  />
                ) : null}
                {series.map((line) => (
                  <Line
                    key={String(line.dataKey)}
                    type="monotone"
                    dataKey={line.dataKey}
                    name={line.name}
                    stroke={line.stroke}
                    strokeWidth={line.strokeWidth}
                    dot={false}
                    activeDot={{ r: 4 }}
                    animationDuration={400}
                    connectNulls
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="flex h-full items-center justify-center text-sm text-stone-500">
              {t("detail.notEnoughHistory")}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
