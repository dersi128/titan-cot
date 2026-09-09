import { useTitanI18n } from "../../i18n";

export function SeasonalityHero() {
  const { t } = useTitanI18n();

  return (
    <header className="titan-seasonality-hero mb-3 border-b border-white/[0.06] pb-3">
      <p className="font-display text-[10px] font-semibold uppercase tracking-[0.14em] text-titan-gold/85">
        {t("seasonality.heroEyebrow")}
      </p>
      <h1 className="mt-1.5 font-display text-xl font-bold uppercase tracking-[0.06em] text-stone-50 md:text-2xl">
        {t("seasonality.heroTitle")}
      </h1>
    </header>
  );
}
