import { useEffect, useMemo, useState, type CSSProperties } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
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
import { buildDmeOverview } from "../../../lib/titanDmeOverview";
import { formatHomeFlowDelta } from "../../../lib/titanHomeOverview";
import { GlassCard } from "../ui/titanCmdShared";
import { TitanPageHeader } from "../ui/TitanPageHeader";

type TitanDmePageProps = {
  bundle: Record<string, CotDashboardData>;
  onSelectMarket: (market: InstitutionalMarket) => void;
};

function scoreToneClass(score: number | null): string {
  if (score === null) return "text-stone-300";
  if (score >= 25) return "text-emerald-400";
  if (score <= -25) return "text-rose-400";
  return "text-amber-300/90";
}

function fxTileStyle(usdFavoring: boolean, score: number): CSSProperties {
  const intensity = Math.min(Math.abs(score) / 80, 1);
  const alpha = 0.08 + intensity * 0.18;
  if (usdFavoring) {
    return {
      borderColor: "rgba(16, 185, 129, 0.35)",
      background: `rgba(16, 185, 129, ${alpha})`,
    };
  }
  return {
    borderColor: "rgba(244, 63, 94, 0.35)",
    background: `rgba(244, 63, 94, ${alpha})`,
  };
}

function formatRate(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "—";
  return `${value.toFixed(2)}%`;
}

function formatRateChange(change: number | null | undefined): string {
  if (change === null || change === undefined || !Number.isFinite(change)) return "—";
  const sign = change > 0 ? "+" : "";
  return `${sign}${change.toFixed(2)} pp`;
}

function RateCard({
  title,
  series,
  emptyLabel,
  change1yLabel,
}: {
  title: string;
  series: FredSeriesSnapshot | null;
  emptyLabel: string;
  change1yLabel: string;
}) {
  const latest = series?.latest?.value ?? null;
  const change = series?.change ?? null;
  const change1y = series?.change1y ?? null;
  const history = series?.history?.length
    ? series.history
    : series?.spark?.map((value, i) => ({ date: String(i), value })) ?? [];
  const gradId = `rateFill-${series?.seriesId ?? "x"}`;

  return (
    <GlassCard className="p-4">
      <p className="titan-cmd-kicker">{title}</p>
      <p className="mt-2 font-mono text-2xl font-semibold text-stone-100">{formatRate(latest)}</p>
      <p
        className={`mt-1 font-mono text-[12px] ${
          change !== null && change > 0
            ? "text-rose-400/90"
            : change !== null && change < 0
              ? "text-emerald-400/90"
              : "text-stone-500"
        }`}
      >
        {series ? formatRateChange(change) : emptyLabel}
        {series && change1y !== null ? (
          <span className="ml-2 text-stone-500">
            · {change1yLabel} {formatRateChange(change1y)}
          </span>
        ) : null}
      </p>
      {series?.latest?.date ? (
        <p className="mt-1 text-[10px] text-stone-600">{series.latest.date}</p>
      ) : null}
      <div className="mt-3 h-[140px] w-full">
        {history.length >= 2 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#d4af37" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#d4af37" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fill: "#78716c", fontSize: 9 }}
                tickLine={false}
                axisLine={false}
                minTickGap={48}
              />
              <YAxis
                domain={["auto", "auto"]}
                tick={{ fill: "#78716c", fontSize: 9 }}
                tickLine={false}
                axisLine={false}
                width={32}
              />
              <Tooltip
                contentStyle={{
                  background: "#121212",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(value) => [`${Number(value).toFixed(2)}%`, title]}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#d4af37"
                fill={`url(#${gradId})`}
                strokeWidth={1.75}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-[11px] text-stone-600">
            {emptyLabel}
          </div>
        )}
      </div>
    </GlassCard>
  );
}

export function TitanDmePage({ bundle, onSelectMarket }: TitanDmePageProps) {
  const { t } = useTitanI18n();
  const dme = useMemo(() => buildDmeOverview(bundle), [bundle]);
  const [rates, setRates] = useState<MacroRatesResponse | null>(null);
  const [ratesError, setRatesError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const payload = await loadMacroRates();
        if (!cancelled) {
          setRates(payload);
          setRatesError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setRatesError(err instanceof Error ? err.message : "rates failed");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const ratesStatusNote =
    ratesError
      ? t("pages.dme.ratesError")
      : rates?.status === "unconfigured"
        ? t("pages.dme.ratesUnconfigured")
        : rates?.status === "error"
          ? t("pages.dme.ratesError")
          : rates?.status === "ok"
            ? t("pages.dme.ratesSource")
            : t("pages.dme.ratesLoading");

  const biasLabel =
    dme.dxyScore === null
      ? "—"
      : dme.dxyScore >= 25
        ? t("pages.dme.biasUsdFirm")
        : dme.dxyScore <= -25
          ? t("pages.dme.biasUsdSoft")
          : t("pages.dme.biasUsdNeutral");

  const verdict = dme.dxyAvailable
    ? t("pages.dme.verdict", {
        pressure: t(`pages.dme.pressure.${dme.dollarPressure}`),
        usd: String(dme.usdFavoringCount),
        total: String(dme.fxLiveCount),
      })
    : t("pages.dme.liveSubFallback");

  const openDxy = () => {
    const market = getInstitutionalMarketBySymbol("DX1!");
    if (market) onSelectMarket(market);
  };

  return (
    <div className="titan-page-module animate-fade-up space-y-3">
      <TitanPageHeader
        eyebrow={t("pages.dme.eyebrow")}
        title={t("pages.dme.title")}
        description={t("pages.dme.description")}
      />

      {/* 1) Hero DXY */}
      <GlassCard glow="gold" className="p-4 md:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="titan-cmd-kicker">{t("pages.dme.regimeHeadline")}</p>
            <p className={`mt-2 font-display text-2xl font-semibold tracking-tight md:text-3xl ${scoreToneClass(dme.dxyScore)}`}>
              {biasLabel}
            </p>
            <p className="titan-cmd-sub mt-2 max-w-2xl text-[13px] leading-relaxed text-stone-400">
              {verdict}
            </p>
          </div>
          <button type="button" className="titan-cmd-dme-btn" onClick={openDxy}>
            {t("pages.dme.openDxy")}
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">
          <div className="rounded-lg border border-white/[0.06] bg-black/30 px-3 py-2.5">
            <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-stone-600">
              {t("pages.dme.metricScore")}
            </p>
            <p className={`mt-1 font-mono text-lg font-semibold ${scoreToneClass(dme.dxyScore)}`}>
              {dme.dxyScore === null ? "—" : `${dme.dxyScore > 0 ? "+" : ""}${dme.dxyScore}`}
            </p>
          </div>
          <div className="rounded-lg border border-white/[0.06] bg-black/30 px-3 py-2.5">
            <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-stone-600">
              {t("pages.dme.metricComm26")}
            </p>
            <p className="mt-1 font-mono text-lg font-semibold text-stone-200">
              {dme.dxyCommercial26w ?? "—"}
            </p>
          </div>
          <div className="rounded-lg border border-white/[0.06] bg-black/30 px-3 py-2.5">
            <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-stone-600">
              {t("pages.dme.dxyFlow")}
            </p>
            <p className="mt-1 font-mono text-lg font-semibold text-stone-200">
              {formatHomeFlowDelta(
                dme.dxyWeeklyChange === null ? null : Math.round(dme.dxyWeeklyChange),
              )}
            </p>
          </div>
          <div className="rounded-lg border border-white/[0.06] bg-black/30 px-3 py-2.5">
            <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-stone-600">
              {t("home.cmdDme.dxyRegime")}
            </p>
            <p className="mt-1 font-mono text-[13px] font-semibold text-stone-200">
              {dme.dxyRegime ? t(`positioning.regime.${dme.dxyRegime}`) : "—"}
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Rates from FRED */}
      <section>
        <div className="mb-2 flex flex-wrap items-end justify-between gap-2 px-0.5">
          <div>
            <p className="titan-cmd-kicker">{t("pages.dme.ratesTitle")}</p>
            <p className="titan-cmd-sub mt-1">{ratesStatusNote}</p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <RateCard
            title={t("pages.dme.fedFunds")}
            series={rates?.status === "ok" || rates?.fedFunds ? rates.fedFunds : null}
            emptyLabel={t("pages.dme.ratesEmpty")}
            change1yLabel={t("pages.dme.change1y")}
          />
          <RateCard
            title={t("pages.dme.yield2y")}
            series={rates?.status === "ok" || rates?.yield2y ? rates.yield2y : null}
            emptyLabel={t("pages.dme.ratesEmpty")}
            change1yLabel={t("pages.dme.change1y")}
          />
        </div>
      </section>

      {/* 2) USD vs world + pressure */}
      <div className="grid gap-3 lg:grid-cols-2">
        <GlassCard className="p-4">
          <p className="titan-cmd-kicker">{t("pages.dme.usdVsWorld")}</p>
          <p className="mt-2 font-display text-lg font-semibold text-stone-100">
            {t(`pages.dme.breadth.${dme.fxBreadth}`)}
          </p>
          <p className="titan-cmd-sub mt-1">
            {t("pages.dme.breadthSub", {
              usd: String(dme.usdFavoringCount),
              total: String(dme.fxLiveCount),
            })}
          </p>
          <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-stone-800/90">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500/80 to-titan-gold/80 transition-all duration-500"
              style={{ width: `${dme.usdBiasPct}%` }}
            />
          </div>
          <p className="mt-2 font-mono text-[11px] text-stone-500">
            {t("pages.dme.usdBiasPct", { pct: String(dme.usdBiasPct) })}
          </p>
        </GlassCard>

        <GlassCard className="p-4">
          <p className="titan-cmd-kicker">{t("home.cmdDme.dollarPressure")}</p>
          <p className={`mt-2 font-display text-lg font-semibold ${scoreToneClass(dme.dxyScore)}`}>
            {t(`pages.dme.pressure.${dme.dollarPressure}`)}
          </p>
          <p className="titan-cmd-sub mt-1">
            {dme.dxyScore !== null
              ? t("pages.dme.pressureSub", { score: String(dme.dxyScore) })
              : "—"}
          </p>
          <p className="mt-4 text-[12px] leading-relaxed text-stone-500">
            {t("pages.dme.pressureHint")}
          </p>
        </GlassCard>
      </div>

      {/* 3) DXY history chart */}
      <GlassCard className="p-4">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="titan-cmd-kicker">{t("pages.dme.chartTitle")}</p>
            <p className="titan-cmd-sub mt-1">{t("pages.dme.chartSub")}</p>
          </div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-stone-600">
            {t("pages.dme.chartWindow")}
          </p>
        </div>
        <div className="h-[220px] w-full md:h-[280px]">
          {dme.dxyChart.length >= 2 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dme.dxyChart} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="dmeDxyFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#d4af37" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#d4af37" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#78716c", fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  minTickGap={40}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fill: "#78716c", fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  width={28}
                />
                <Tooltip
                  contentStyle={{
                    background: "#121212",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  labelStyle={{ color: "#a8a29e" }}
                />
                <Area
                  type="monotone"
                  dataKey="index"
                  name={t("pages.dme.metricComm26")}
                  stroke="#d4af37"
                  fill="url(#dmeDxyFill)"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 3, fill: "#d4af37" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-[12px] text-stone-600">
              {t("pages.dme.chartEmpty")}
            </div>
          )}
        </div>
      </GlassCard>

      {/* 4) FX heatmap */}
      <section>
        <p className="titan-cmd-kicker mb-2 px-0.5">{t("pages.dme.fxMatrix")}</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {dme.panels.map((p) => (
            <button
              key={p.market.id}
              type="button"
              disabled={p.status !== "live"}
              onClick={() => onSelectMarket(p.market)}
              className="text-left disabled:cursor-default"
            >
              <div
                className="rounded-xl border px-3 py-3 transition hover:brightness-110"
                style={
                  p.status === "live"
                    ? fxTileStyle(p.usdFavoring, p.score)
                    : { borderColor: "rgba(255,255,255,0.05)", background: "rgba(0,0,0,0.25)" }
                }
              >
                <p className="text-[10px] font-bold uppercase tracking-wider text-stone-200">
                  {p.market.shortLabel}
                </p>
                <p className="mt-1.5 font-mono text-base font-semibold text-stone-50">
                  {p.status === "live" ? `${p.score > 0 ? "+" : ""}${p.score}` : "—"}
                </p>
                <p className="mt-1 text-[9px] font-semibold uppercase tracking-wider text-stone-400">
                  {p.status === "live"
                    ? p.usdFavoring
                      ? t("pages.dme.usdSoftFx")
                      : t("pages.dme.fxBid")
                    : t("pages.dme.fxMissing")}
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>

      <p className="px-0.5 text-[11px] text-stone-600">{t("pages.dme.footerNote")}</p>
    </div>
  );
}
