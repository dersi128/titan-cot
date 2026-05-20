import { useTitanI18n } from "../../../i18n";
import { SEASONALITY_PAGE_MOCK } from "../../../lib/titanHomeMock";
import { GlassCard, MiniCurve } from "../ui/titanCmdShared";
import { TitanPageHeader } from "../ui/TitanPageHeader";

const MONTHS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

export function TitanSeasonalityPage() {
  const { t } = useTitanI18n();

  return (
    <div className="titan-page-module animate-fade-up">
      <TitanPageHeader
        eyebrow={t("pages.seasonality.eyebrow")}
        title={t("pages.seasonality.title")}
        description={t("pages.seasonality.description")}
        aside={
          <span className="titan-page-mock-badge">{t("pages.visualOnly")}</span>
        }
      />

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {SEASONALITY_PAGE_MOCK.map((item) => (
          <GlassCard key={item.id} glow={item.tone === "bull" ? "bull" : item.tone === "bear" ? "bear" : undefined} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-display text-sm font-bold tracking-wider text-titan-goldBright">{item.label}</p>
                <p className="mt-1 text-[11px] text-stone-400">{item.bias}</p>
              </div>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider ${
                  item.tone === "bull"
                    ? "text-emerald-400/90"
                    : item.tone === "bear"
                      ? "text-rose-400/90"
                      : "text-stone-500"
                }`}
              >
                {item.tone === "bull" ? "▲" : item.tone === "bear" ? "▼" : "—"}
              </span>
            </div>

            <div className="mt-4 rounded border border-white/[0.05] bg-black/35 px-3 py-3">
              <MiniCurve points={item.curve} tone={item.tone} tall />
              <div className="mt-2 flex justify-between gap-1">
                {MONTHS.map((m) => (
                  <span key={m} className="flex-1 text-center font-mono text-[8px] text-stone-600">
                    {m}
                  </span>
                ))}
              </div>
            </div>

            <dl className="mt-3 grid grid-cols-2 gap-2">
              <div className="rounded border border-white/[0.05] bg-black/25 px-2 py-1.5">
                <dt className="text-[9px] uppercase tracking-[0.12em] text-stone-600">{t("pages.seasonality.window")}</dt>
                <dd className="mt-0.5 font-mono text-[11px] text-stone-300">{item.window}</dd>
              </div>
              <div className="rounded border border-white/[0.05] bg-black/25 px-2 py-1.5">
                <dt className="text-[9px] uppercase tracking-[0.12em] text-stone-600">{t("pages.seasonality.hitRate")}</dt>
                <dd className="mt-0.5 font-mono text-[11px] text-stone-300">{item.hitRate}</dd>
              </div>
            </dl>
          </GlassCard>
        ))}
      </div>

      <GlassCard className="mt-3 p-4">
        <p className="titan-cmd-kicker">{t("pages.seasonality.noteTitle")}</p>
        <p className="mt-2 text-[12px] leading-relaxed text-stone-500">{t("pages.seasonality.noteBody")}</p>
      </GlassCard>
    </div>
  );
}
