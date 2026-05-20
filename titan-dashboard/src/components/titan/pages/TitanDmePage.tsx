import { useTitanI18n } from "../../../i18n";
import { DME_PAGE_MOCK } from "../../../lib/titanHomeMock";
import { GlassCard, MiniCurve } from "../ui/titanCmdShared";
import { TitanPageHeader } from "../ui/TitanPageHeader";

export function TitanDmePage() {
  const { t } = useTitanI18n();

  return (
    <div className="titan-page-module animate-fade-up">
      <TitanPageHeader
        eyebrow={t("pages.dme.eyebrow")}
        title={t("pages.dme.title")}
        description={t("pages.dme.description")}
        aside={<span className="titan-page-mock-badge">{t("pages.visualOnly")}</span>}
      />

      <div className="grid gap-3 lg:grid-cols-12">
        <GlassCard glow="gold" className="lg:col-span-5 p-4">
          <p className="titan-cmd-kicker">{t("pages.dme.regimeHeadline")}</p>
          <p className="titan-cmd-value mt-3 text-lg">{DME_PAGE_MOCK.headline}</p>
          <p className="titan-cmd-sub mt-2">{DME_PAGE_MOCK.sub}</p>
          <div className="mt-5 rounded border border-white/[0.06] bg-black/35 px-3 py-3">
            <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-stone-600">
              {t("pages.dme.pressureIndex")}
            </p>
            <MiniCurve points={DME_PAGE_MOCK.timeline} tone="bear" tall />
          </div>
        </GlassCard>

        <div className="grid gap-2 sm:grid-cols-2 lg:col-span-7">
          {(
            [
              ["dxyRegime", DME_PAGE_MOCK.metrics.dxyRegime],
              ["fxBreadth", DME_PAGE_MOCK.metrics.fxBreadth],
              ["dollarPressure", DME_PAGE_MOCK.metrics.dollarPressure],
              ["liquidityRegime", DME_PAGE_MOCK.metrics.liquidityRegime],
            ] as const
          ).map(([key, val]) => (
            <GlassCard key={key} className="p-3">
              <p className="titan-cmd-kicker">{t(`home.cmdDme.${key}`)}</p>
              <p className="titan-cmd-value mt-2 font-mono text-base">{val}</p>
            </GlassCard>
          ))}
        </div>
      </div>

      <section className="mt-3">
        <p className="titan-cmd-kicker mb-2 px-0.5">{t("pages.dme.fxMatrix")}</p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {DME_PAGE_MOCK.panels.map((p) => (
            <GlassCard key={p.label} className="p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">{p.label}</p>
              <p
                className={`mt-1.5 font-mono text-[13px] font-medium ${
                  p.tone === "bull"
                    ? "text-emerald-400/90"
                    : p.tone === "bear"
                      ? "text-rose-400/90"
                      : "text-stone-300"
                }`}
              >
                {p.value}
              </p>
            </GlassCard>
          ))}
        </div>
      </section>

      <GlassCard className="mt-3 flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[12px] text-stone-500">{t("pages.dme.footerNote")}</p>
        <button type="button" className="titan-cmd-dme-btn w-full sm:w-auto" disabled>
          {t("home.cmdDmeOpen")}
        </button>
      </GlassCard>
    </div>
  );
}
