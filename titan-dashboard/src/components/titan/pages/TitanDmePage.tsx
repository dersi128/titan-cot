import { useMemo, type CSSProperties } from "react";
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

export function TitanDmePage({ bundle, onSelectMarket }: TitanDmePageProps) {
  const { t } = useTitanI18n();
  const dme = useMemo(() => buildDmeOverview(bundle), [bundle]);

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
