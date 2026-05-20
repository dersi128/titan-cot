import { useTitanI18n } from "../../i18n";

export function SeasonalityHero() {
  const { t } = useTitanI18n();

  return (
    <header className="titan-seasonality-hero mb-5 border-b border-white/[0.06] pb-5">
      <p className="font-display text-[10px] font-semibold uppercase tracking-[0.36em] text-titan-gold/85">
        {t("seasonality.heroEyebrow")}
      </p>
      <h1 className="mt-2 font-display text-2xl font-bold uppercase tracking-[0.1em] text-stone-50 md:text-3xl">
        {t("seasonality.heroTitle")}
      </h1>
      <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-stone-400">{t("seasonality.heroSub")}</p>
      <p className="mt-3 text-[11px] leading-relaxed text-stone-600">{t("seasonality.disclaimer")}</p>
    </header>
  );
}
