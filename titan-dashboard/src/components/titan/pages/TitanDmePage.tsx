import { useEffect, useMemo, useState } from "react";
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
import type { CotDashboardData } from "../../../types";
import type { InstitutionalMarket } from "../../../config/institutionalMarkets";
import { getInstitutionalMarketBySymbol } from "../../../config/institutionalMarkets";
import { useTitanI18n } from "../../../i18n";
import { loadMacroRates, type FredSeriesSnapshot, type MacroRatesResponse } from "../../../data/macroRates";
import {
  buildDmeOverview,
  computeMacroAlignment,
  formatContractsDelta,
  ratesLeanFromChanges,
  type DmeChartMode,
  type MacroAlignmentId,
  type RatesLeanId,
  type UsdStanceId,
} from "../../../lib/titanDmeOverview";
import {
  commercialIndexToneClass,
  formatCommercialIndex,
  getCotIndexZoneThresholds,
  subscribeCotIndexZoneThresholds,
} from "../../../lib/titanCotIndexSettings";
import { GlassCard } from "../ui/titanCmdShared";
import { TitanPageHeader } from "../ui/TitanPageHeader";

type TitanDmePageProps = {
  bundle: Record<string, CotDashboardData>;
  onSelectMarket: (market: InstitutionalMarket) => void;
};

function tonePos(id: string): string {
  if (
    id === "bullish" ||
    id === "strong_bullish" ||
    id === "moderate_bullish" ||
    id === "usd_plus" ||
    id === "usd_favoring" ||
    id === "rising"
  ) {
    return "text-emerald-400";
  }
  if (
    id === "bearish" ||
    id === "strong_bearish" ||
    id === "moderate_bearish" ||
    id === "usd_minus" ||
    id === "fx_favoring" ||
    id === "falling"
  ) {
    return "text-rose-400";
  }
  if (id === "mixed") return "text-amber-300";
  return "text-stone-400";
}

function pillClass(kind: "bull" | "bear" | "neutral" | "info" | "mixed"): string {
  if (kind === "bull") {
    return "border-emerald-500/35 bg-emerald-500/10 text-emerald-300";
  }
  if (kind === "bear") {
    return "border-rose-500/35 bg-rose-500/10 text-rose-300";
  }
  if (kind === "mixed") {
    return "border-amber-500/35 bg-amber-500/10 text-amber-200";
  }
  if (kind === "info") {
    return "border-sky-500/30 bg-sky-500/10 text-sky-200";
  }
  return "border-white/10 bg-white/[0.03] text-stone-300";
}

function formatRate(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "—";
  return `${value.toFixed(2)}%`;
}

/** Convert percentage-point change to basis points for display. */
function formatBp(changePp: number | null | undefined): string {
  if (changePp === null || changePp === undefined || !Number.isFinite(changePp)) return "—";
  const bp = Math.round(changePp * 100);
  return `${bp > 0 ? "+" : ""}${bp} bp`;
}

function deltaTone(changePp: number | null | undefined): string {
  if (changePp === null || changePp === undefined || !Number.isFinite(changePp)) return "text-stone-500";
  if (changePp > 0.005) return "text-emerald-400";
  if (changePp < -0.005) return "text-rose-400";
  return "text-stone-500";
}

function deltaArrow(changePp: number | null | undefined): string {
  if (changePp === null || changePp === undefined || !Number.isFinite(changePp)) return "";
  if (changePp > 0.005) return "↑";
  if (changePp < -0.005) return "↓";
  return "→";
}

function HeroPill({
  label,
  value,
  kind,
}: {
  label: string;
  value: string;
  kind: "bull" | "bear" | "neutral" | "info" | "mixed";
}) {
  return (
    <div className={`inline-flex min-w-0 flex-col rounded-md border px-3 py-2 ${pillClass(kind)}`}>
      <span className="text-[9px] font-semibold uppercase tracking-[0.14em] opacity-70">{label}</span>
      <span className="mt-0.5 font-display text-[13px] font-semibold uppercase tracking-[0.06em]">{value}</span>
    </div>
  );
}

function MetricRow({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-white/[0.04] py-2 last:border-b-0">
      <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-stone-500">{label}</span>
      <span className={`font-mono text-[13px] font-semibold tabular-nums ${valueClass ?? "text-stone-100"}`}>
        {value}
      </span>
    </div>
  );
}

function YieldRow({
  title,
  series,
}: {
  title: string;
  series: FredSeriesSnapshot | null | undefined;
}) {
  const latest = series?.latest?.value ?? null;
  const d1w = series?.change1w ?? null;
  const d1m = series?.change1m ?? null;
  return (
    <div className="border-b border-white/[0.04] py-2.5 last:border-b-0">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-stone-500">{title}</span>
        <span className="font-mono text-[15px] font-semibold text-stone-100">{formatRate(latest)}</span>
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 font-mono text-[11px]">
        <span className={deltaTone(d1w)}>
          {deltaArrow(d1w)} {formatBp(d1w)} / 1W
        </span>
        <span className={deltaTone(d1m)}>
          {deltaArrow(d1m)} {formatBp(d1m)} / 1M
        </span>
      </div>
    </div>
  );
}

function stanceLabel(stance: UsdStanceId, t: (k: string) => string): string {
  if (stance === "usd_plus") return t("pages.dme.stance.usdPlus");
  if (stance === "usd_minus") return t("pages.dme.stance.usdMinus");
  return t("pages.dme.stance.neutral");
}

/** Currency COT lean (presentation only — inverse of USD impact). */
function fxCotLeanFromStance(stance: UsdStanceId): "bullish" | "bearish" | "neutral" {
  if (stance === "usd_minus") return "bullish";
  if (stance === "usd_plus") return "bearish";
  return "neutral";
}

function fxCotLeanLabel(lean: "bullish" | "bearish" | "neutral", t: (k: string) => string): string {
  if (lean === "bullish") return t("pages.dme.fxCot.bullish");
  if (lean === "bearish") return t("pages.dme.fxCot.bearish");
  return t("pages.dme.fxCot.neutral");
}

function alignmentKind(id: MacroAlignmentId): "bull" | "bear" | "neutral" | "mixed" {
  if (id === "strong_bullish" || id === "moderate_bullish") return "bull";
  if (id === "strong_bearish" || id === "moderate_bearish") return "bear";
  if (id === "mixed") return "mixed";
  return "neutral";
}

export function TitanDmePage({ bundle, onSelectMarket }: TitanDmePageProps) {
  const { t } = useTitanI18n();
  const dme = useMemo(() => buildDmeOverview(bundle), [bundle]);
  const [rates, setRates] = useState<MacroRatesResponse | null>(null);
  const [chartMode, setChartMode] = useState<DmeChartMode>("index26w");
  const [zoneTick, setZoneTick] = useState(0);

  useEffect(() => subscribeCotIndexZoneThresholds(() => setZoneTick((n) => n + 1)), []);
  const zones = useMemo(() => getCotIndexZoneThresholds(), [zoneTick]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const payload = await loadMacroRates();
        if (!cancelled) setRates(payload);
      } catch {
        if (!cancelled) setRates(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const yield2y = rates?.yield2y ?? null;
  const yield5y = rates?.yield5y ?? null;
  const yield10y = rates?.yield10y ?? null;
  const fedFunds = rates?.fedFunds ?? null;

  const ratesLean: RatesLeanId = useMemo(
    () =>
      ratesLeanFromChanges([
        yield2y?.change1w,
        yield5y?.change1w,
        yield10y?.change1w,
      ]),
    [yield2y?.change1w, yield5y?.change1w, yield10y?.change1w],
  );

  const alignmentResult = useMemo(
    () =>
      computeMacroAlignment({
        usdPositioning: dme.usdPositioning,
        breadthLean: dme.breadthLean,
        ratesLean,
      }),
    [dme.usdPositioning, dme.breadthLean, ratesLean],
  );
  const alignment = alignmentResult.id;

  const chartData = useMemo(() => {
    const rows = dme.historyChart;
    if (chartMode === "index26w") {
      return rows
        .filter((p) => p.index26w !== null)
        .slice(-104)
        .map((p) => ({ date: p.date, value: p.index26w as number }));
    }
    if (chartMode === "index52w") {
      return rows
        .filter((p) => p.index52w !== null)
        .slice(-104)
        .map((p) => ({ date: p.date, value: p.index52w as number }));
    }
    if (chartMode === "delta4w") {
      return rows
        .filter((p) => p.delta4w !== null)
        .slice(-104)
        .map((p) => ({ date: p.date, value: p.delta4w as number }));
    }
    return rows.slice(-104).map((p) => ({ date: p.date, value: p.net }));
  }, [dme.historyChart, chartMode]);

  const chartIsIndex = chartMode === "index26w" || chartMode === "index52w";
  const lastChart = chartData.length > 0 ? chartData[chartData.length - 1] : null;

  const openDxy = () => {
    const market = getInstitutionalMarketBySymbol("DX1!");
    if (market) onSelectMarket(market);
  };

  const scoreText =
    dme.dxyScore === null ? "—" : `${dme.dxyScore > 0 ? "+" : ""}${dme.dxyScore}`;

  const posKind =
    dme.usdPositioning === "bullish" ? "bull" : dme.usdPositioning === "bearish" ? "bear" : "neutral";

  const flowTone = (v: number | null) => {
    if (v === null || !Number.isFinite(v)) return "text-stone-400";
    if (v > 0) return "text-emerald-400";
    if (v < 0) return "text-rose-400";
    return "text-stone-400";
  };

  const chartModes: Array<{ id: DmeChartMode; label: string }> = [
    { id: "index26w", label: t("pages.dme.chartMode.index26w") },
    { id: "index52w", label: t("pages.dme.chartMode.index52w") },
    { id: "net", label: t("pages.dme.chartMode.net") },
    { id: "delta4w", label: t("pages.dme.chartMode.delta4w") },
  ];

  return (
    <div className="titan-page-module titan-dme-v2 animate-fade-up space-y-4 md:space-y-5">
      <TitanPageHeader
        eyebrow={t("pages.dme.eyebrow")}
        title={t("pages.dme.titleHero")}
        description={t("pages.dme.subtitle")}
        aside={
          <button type="button" className="titan-cmd-dme-btn" onClick={openDxy}>
            {t("pages.dme.openDxy")}
          </button>
        }
      />

      {/* Hero */}
      <GlassCard className="p-4 md:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2.5">
            <HeroPill
              label={t("pages.dme.hero.usdPositioning")}
              value={t(`pages.dme.positioning.${dme.usdPositioning}`)}
              kind={posKind}
            />
            <HeroPill
              label={t("pages.dme.hero.macroAlignment")}
              value={t(`pages.dme.alignment.${alignment}`)}
              kind={alignmentKind(alignment)}
            />
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[12px] text-stone-300">
            <span>
              <span className="text-stone-500">DXY COT </span>
              <span className={tonePos(dme.usdPositioning)}>{scoreText}</span>
            </span>
            <span className="text-stone-700">|</span>
            <span>
              <span className="text-stone-500">{t("pages.dme.hero.breadth")} </span>
              <span className="text-stone-100">
                {dme.usdFavoringCount}/{dme.fxLiveCount || 7} USD+
              </span>
            </span>
            <span className="text-stone-700">|</span>
            <span className={deltaTone(yield2y?.change1w)}>
              US 2Y {deltaArrow(yield2y?.change1w) || "—"}
            </span>
            <span className={deltaTone(yield10y?.change1w)}>
              US 10Y {deltaArrow(yield10y?.change1w) || "—"}
            </span>
          </div>
        </div>
      </GlassCard>

      {/* Three columns */}
      <div className="grid gap-3 lg:grid-cols-3 lg:gap-4">
        {/* DXY COT */}
        <GlassCard glow={posKind === "bull" ? "bull" : posKind === "bear" ? "bear" : undefined} className="flex flex-col p-4 md:p-5">
          <p className="titan-cmd-kicker">{t("pages.dme.panels.dxyCot")}</p>
          <div className="mt-3 flex-1">
            <MetricRow
              label={t("pages.dme.metrics.comm26")}
              value={formatCommercialIndex(dme.dxyCommercial26w)}
              valueClass={commercialIndexToneClass(dme.dxyCommercial26w)}
            />
            <MetricRow
              label={t("pages.dme.metrics.comm52")}
              value={formatCommercialIndex(dme.dxyCommercial52w)}
              valueClass={commercialIndexToneClass(dme.dxyCommercial52w)}
            />
            <MetricRow
              label={t("pages.dme.metrics.delta1w")}
              value={formatContractsDelta(dme.dxyWeeklyChange)}
              valueClass={flowTone(dme.dxyWeeklyChange)}
            />
            <MetricRow
              label={t("pages.dme.metrics.delta4w")}
              value={formatContractsDelta(dme.dxyDelta4w)}
              valueClass={flowTone(dme.dxyDelta4w)}
            />
            <MetricRow
              label={t("pages.dme.metrics.delta13w")}
              value={formatContractsDelta(dme.dxyDelta13w)}
              valueClass={flowTone(dme.dxyDelta13w)}
            />
            <MetricRow
              label={t("pages.dme.metrics.persistence")}
              value={
                dme.dxyPersistenceWeeks > 0
                  ? t("pages.dme.metrics.persistenceWeeks", { count: String(dme.dxyPersistenceWeeks) })
                  : t("pages.dme.metrics.persistenceNone")
              }
            />
          </div>
          <div
            className={`mt-4 rounded-md border px-3 py-2.5 text-center font-display text-[12px] font-semibold uppercase tracking-[0.08em] ${pillClass(posKind)}`}
          >
            {t(`pages.dme.cotVerdict.${dme.cotVerdict}`)}
          </div>
        </GlassCard>

        {/* USD Breadth */}
        <GlassCard className="flex flex-col p-4 md:p-5">
          <p className="titan-cmd-kicker">{t("pages.dme.panels.breadth")}</p>
          <p className={`mt-3 font-display text-2xl font-semibold tracking-tight ${tonePos(dme.breadthLean)}`}>
            {dme.usdFavoringCount} / {dme.fxLiveCount || 7} {t("pages.dme.breadthHeadline")}
          </p>
          <p className="mt-1 text-[11px] text-stone-500">{t("pages.dme.breadthCaption")}</p>
          <ul className="mt-4 flex-1 space-y-1">
            {dme.panels.map((p) => {
              const cotLean = fxCotLeanFromStance(p.stance);
              return (
                <li key={p.market.id}>
                  <button
                    type="button"
                    disabled={p.status !== "live"}
                    onClick={() => onSelectMarket(p.market)}
                    className="grid w-full grid-cols-[2.5rem_minmax(0,1fr)_auto] items-center gap-2 rounded-md border border-transparent px-2 py-1.5 text-left transition hover:border-white/[0.06] hover:bg-white/[0.03] disabled:cursor-default disabled:opacity-50"
                  >
                    <span className="text-[12px] font-semibold uppercase tracking-[0.1em] text-stone-200">
                      {p.market.shortLabel}
                    </span>
                    {p.status === "live" ? (
                      <>
                        <span
                          className={`truncate font-mono text-[11px] font-semibold uppercase tracking-[0.04em] ${
                            cotLean === "bullish"
                              ? "text-emerald-400"
                              : cotLean === "bearish"
                                ? "text-rose-400"
                                : "text-stone-500"
                          }`}
                        >
                          {fxCotLeanLabel(cotLean, t)}
                        </span>
                        <span
                          className={`font-mono text-[12px] font-semibold ${
                            p.stance === "usd_plus"
                              ? "text-emerald-400"
                              : p.stance === "usd_minus"
                                ? "text-rose-400"
                                : "text-stone-500"
                          }`}
                        >
                          → {stanceLabel(p.stance, t)}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="font-mono text-[11px] text-stone-600">—</span>
                        <span className="font-mono text-[12px] text-stone-600">—</span>
                      </>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </GlassCard>

        {/* US Rates */}
        <GlassCard className="flex flex-col p-4 md:p-5">
          <p className="titan-cmd-kicker">{t("pages.dme.panels.rates")}</p>
          <div className="mt-3 flex-1">
            <div className="border-b border-white/[0.04] py-2.5">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-stone-500">
                  {t("pages.dme.fedFunds")}
                </span>
                <span className="font-mono text-[15px] font-semibold text-stone-100">
                  {formatRate(fedFunds?.latest?.value)}
                </span>
              </div>
            </div>
            <YieldRow title={t("pages.dme.yield2y")} series={yield2y} />
            <YieldRow title={t("pages.dme.yield5y")} series={yield5y} />
            <YieldRow title={t("pages.dme.yield10y")} series={yield10y} />
          </div>
          {!rates || rates.status !== "ok" ? (
            <p className="mt-3 text-[11px] text-stone-600">
              {rates?.status === "unconfigured"
                ? t("pages.dme.ratesUnconfigured")
                : rates?.status === "error"
                  ? t("pages.dme.ratesError")
                  : t("pages.dme.ratesLoading")}
            </p>
          ) : null}
        </GlassCard>
      </div>

      {/* Positioning agreement */}
      <GlassCard className="p-4 md:p-5">
        <p className="titan-cmd-kicker">{t("pages.dme.panels.agreement")}</p>
        <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="grid flex-1 gap-2 sm:grid-cols-3">
            <div className="rounded-md border border-white/[0.06] bg-black/20 px-3 py-2.5">
              <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-stone-500">
                {t("pages.dme.agreement.dxyCot")}
              </p>
              <p className={`mt-1 font-display text-[13px] font-semibold uppercase tracking-[0.06em] ${tonePos(dme.usdPositioning)}`}>
                {t(`pages.dme.positioning.${dme.usdPositioning}`)}
              </p>
            </div>
            <div className="rounded-md border border-white/[0.06] bg-black/20 px-3 py-2.5">
              <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-stone-500">
                {t("pages.dme.agreement.fxBreadth")}
              </p>
              <p className={`mt-1 font-display text-[13px] font-semibold uppercase tracking-[0.06em] ${tonePos(dme.breadthLean)}`}>
                {t(`pages.dme.breadthLean.${dme.breadthLean}`)}
              </p>
            </div>
            <div className="rounded-md border border-white/[0.06] bg-black/20 px-3 py-2.5">
              <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-stone-500">
                {t("pages.dme.agreement.rates")}
              </p>
              <p className={`mt-1 font-display text-[13px] font-semibold uppercase tracking-[0.06em] ${tonePos(ratesLean)}`}>
                {t(`pages.dme.ratesLean.${ratesLean}`)}
              </p>
            </div>
          </div>
          <div
            className={`shrink-0 rounded-md border px-5 py-3 text-center font-display text-sm font-semibold uppercase tracking-[0.1em] ${pillClass(alignmentKind(alignment))}`}
          >
            {t(`pages.dme.alignment.${alignment}`)}
          </div>
        </div>
        {import.meta.env.DEV ? (
          <pre className="mt-4 overflow-x-auto rounded-md border border-white/[0.06] bg-black/40 p-3 font-mono text-[11px] leading-relaxed text-stone-400">
            {`DXY contribution: ${alignmentResult.contributions.dxy}
FX breadth contribution: ${alignmentResult.contributions.breadth}
Rates contribution: ${alignmentResult.contributions.rates}
Final alignment: ${t(`pages.dme.alignment.${alignment}`)}`}
          </pre>
        ) : null}
      </GlassCard>

      {/* History chart */}
      <GlassCard className="p-4 md:p-5">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="titan-cmd-kicker">{t("pages.dme.chartTitle")}</p>
            <p className="mt-1 text-[12px] text-stone-500">{t(`pages.dme.chartModeHint.${chartMode}`)}</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {chartModes.map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => setChartMode(mode.id)}
                className={`rounded border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] transition ${
                  chartMode === mode.id
                    ? "border-sky-400/45 bg-sky-500/15 text-sky-200"
                    : "border-white/[0.08] bg-transparent text-stone-500 hover:border-white/15 hover:text-stone-300"
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        <div className="h-[240px] w-full md:h-[300px]">
          {chartData.length >= 2 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="dmeHistFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2ea8ff" stopOpacity={0.28} />
                    <stop offset="100%" stopColor="#2ea8ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#78716c", fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  minTickGap={48}
                />
                <YAxis
                  domain={
                    chartIsIndex
                      ? [
                          (dataMin: number) => Math.min(dataMin, zones.extremeLow) - 5,
                          (dataMax: number) => Math.max(dataMax, zones.extremeHigh) + 5,
                        ]
                      : ["auto", "auto"]
                  }
                  tick={{ fill: "#78716c", fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  width={40}
                />
                {chartIsIndex ? (
                  <>
                    <ReferenceLine y={zones.neutralHigh} stroke="rgba(16,185,129,0.18)" strokeDasharray="3 4" />
                    <ReferenceLine y={zones.neutralLow} stroke="rgba(244,63,94,0.18)" strokeDasharray="3 4" />
                    <ReferenceLine y={zones.highExtreme} stroke="rgba(16,185,129,0.12)" strokeDasharray="2 6" />
                    <ReferenceLine y={zones.lowExtreme} stroke="rgba(244,63,94,0.12)" strokeDasharray="2 6" />
                  </>
                ) : null}
                <Tooltip
                  contentStyle={{
                    background: "#0c1018",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  labelStyle={{ color: "#a8a29e" }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  name={chartModes.find((m) => m.id === chartMode)?.label}
                  stroke="#2ea8ff"
                  fill="url(#dmeHistFill)"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 3.5, fill: "#34d399", stroke: "#0c1018", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-[12px] text-stone-600">
              {t("pages.dme.chartEmpty")}
            </div>
          )}
        </div>
        {lastChart && chartIsIndex ? (
          <p className="mt-2 text-right font-mono text-[12px] text-emerald-400/90">
            {t("pages.dme.chartLatest", { value: String(lastChart.value) })}
          </p>
        ) : null}
      </GlassCard>
    </div>
  );
}
