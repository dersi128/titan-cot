import { useMemo } from "react";
import type { CotDashboardData } from "../../../types";
import type { InstitutionalMarket } from "../../../config/institutionalMarkets";
import { getInstitutionalMarketBySymbol } from "../../../config/institutionalMarkets";
import { useTitanI18n } from "../../../i18n";
import { buildDmeOverview, dmeSparkTone } from "../../../lib/titanDmeOverview";
import { formatHomeFlowDelta } from "../../../lib/titanHomeOverview";
import { GlassCard, MiniCurve } from "../ui/titanCmdShared";
import { TitanPageHeader } from "../ui/TitanPageHeader";

type TitanDmePageProps = {
  bundle: Record<string, CotDashboardData>;
  onSelectMarket: (market: InstitutionalMarket) => void;
};

export function TitanDmePage({ bundle, onSelectMarket }: TitanDmePageProps) {
  const { t } = useTitanI18n();
  const dme = useMemo(() => buildDmeOverview(bundle), [bundle]);

  const headline =
    dme.dxyAvailable && dme.dxyRegime
      ? t(`positioning.regime.${dme.dxyRegime}`)
      : t("home.dmeUnavailable");

  const sub =
    dme.dxyAvailable && dme.dxyScore !== null && dme.dxyCommercial26w !== null
      ? t("pages.dme.liveSub", {
          score: String(dme.dxyScore),
          index: String(dme.dxyCommercial26w),
        })
      : t("pages.dme.liveSubFallback");

  const openDxy = () => {
    const market = getInstitutionalMarketBySymbol("DX1!");
    if (market) onSelectMarket(market);
  };

  return (
    <div className="titan-page-module animate-fade-up">
      <TitanPageHeader
        eyebrow={t("pages.dme.eyebrow")}
        title={t("pages.dme.title")}
        description={t("pages.dme.description")}
      />

      <div className="grid gap-3 lg:grid-cols-12">
        <GlassCard glow="gold" className="lg:col-span-5 p-4">
          <p className="titan-cmd-kicker">{t("pages.dme.regimeHeadline")}</p>
          <p className="titan-cmd-value mt-3 text-lg">{headline}</p>
          <p className="titan-cmd-sub mt-2">{sub}</p>
          <div className="mt-5 rounded border border-white/[0.06] bg-black/35 px-3 py-3">
            <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-stone-600">
              {t("pages.dme.pressureIndex")}
            </p>
            <MiniCurve points={dme.dxyIndexSpark} tone={dmeSparkTone(dme.dollarPressure)} tall />
          </div>
        </GlassCard>

        <div className="grid gap-2 sm:grid-cols-2 lg:col-span-7">
          <GlassCard className="p-3">
            <p className="titan-cmd-kicker">{t("home.cmdDme.dxyRegime")}</p>
            <p className="titan-cmd-value mt-2 font-mono text-base">
              {dme.dxyRegime ? t(`positioning.regime.${dme.dxyRegime}`) : "—"}
            </p>
          </GlassCard>
          <GlassCard className="p-3">
            <p className="titan-cmd-kicker">{t("home.cmdDme.fxBreadth")}</p>
            <p className="titan-cmd-value mt-2 font-mono text-base">
              {t(`pages.dme.breadth.${dme.fxBreadth}`)}
            </p>
            <p className="titan-cmd-sub mt-1">
              {t("pages.dme.breadthSub", {
                usd: String(dme.usdFavoringCount),
                total: String(dme.fxLiveCount),
              })}
            </p>
          </GlassCard>
          <GlassCard className="p-3">
            <p className="titan-cmd-kicker">{t("home.cmdDme.dollarPressure")}</p>
            <p className="titan-cmd-value mt-2 font-mono text-base">
              {t(`pages.dme.pressure.${dme.dollarPressure}`)}
            </p>
            <p className="titan-cmd-sub mt-1">
              {dme.dxyScore !== null
                ? t("pages.dme.pressureSub", { score: String(dme.dxyScore) })
                : "—"}
            </p>
          </GlassCard>
          <GlassCard className="p-3">
            <p className="titan-cmd-kicker">{t("pages.dme.dxyFlow")}</p>
            <p className="titan-cmd-value mt-2 font-mono text-base">
              {formatHomeFlowDelta(
                dme.dxyWeeklyChange === null ? null : Math.round(dme.dxyWeeklyChange),
              )}
            </p>
            <p className="titan-cmd-sub mt-1">
              {t("pages.dme.dxyFlowSub", { count: String(dme.fxExtremeCount) })}
            </p>
          </GlassCard>
        </div>
      </div>

      <section className="mt-3">
        <p className="titan-cmd-kicker mb-2 px-0.5">{t("pages.dme.fxMatrix")}</p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {dme.panels.map((p) => (
            <button
              key={p.market.id}
              type="button"
              disabled={p.status !== "live"}
              onClick={() => onSelectMarket(p.market)}
              className="text-left disabled:cursor-default"
            >
              <GlassCard className="p-3 transition hover:border-white/10">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                    {p.market.shortLabel}
                  </p>
                  {p.status === "live" ? (
                    <span
                      className={`text-[9px] font-bold uppercase tracking-wider ${
                        p.usdFavoring ? "text-emerald-400/85" : "text-rose-400/85"
                      }`}
                    >
                      {p.usdFavoring ? t("pages.dme.usdSoftFx") : t("pages.dme.fxBid")}
                    </span>
                  ) : (
                    <span className="text-[9px] text-stone-600">—</span>
                  )}
                </div>
                <p
                  className={`mt-1.5 font-mono text-[13px] font-medium ${
                    p.score > 0
                      ? "text-emerald-400/90"
                      : p.score < 0
                        ? "text-rose-400/90"
                        : "text-stone-300"
                  }`}
                >
                  {p.status === "live" ? `${p.score > 0 ? "+" : ""}${p.score}` : "—"}
                </p>
                <p className="mt-1 text-[10px] text-stone-500">
                  {p.status === "live"
                    ? t(`positioning.regime.${p.regime}`)
                    : t("pages.dme.fxMissing")}
                </p>
              </GlassCard>
            </button>
          ))}
        </div>
      </section>

      <GlassCard className="mt-3 flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[12px] text-stone-500">{t("pages.dme.footerNote")}</p>
        <button type="button" className="titan-cmd-dme-btn w-full sm:w-auto" onClick={openDxy}>
          {t("pages.dme.openDxy")}
        </button>
      </GlassCard>
    </div>
  );
}
