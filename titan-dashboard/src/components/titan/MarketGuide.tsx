import type { InstitutionalMarket } from "../../config/institutionalMarkets";
import { useTitanI18n } from "../../i18n";

type MarketGuideProps = {
  market: InstitutionalMarket;
};

const GUIDE_KEYS = ["score", "comm26", "delta", "retail", "tv", "cot"] as const;

export function MarketGuide({ market }: MarketGuideProps) {
  const { t } = useTitanI18n();

  return (
    <section className="rounded-xl border border-titan-gold/20 bg-gradient-to-br from-titan-gold/[0.06] via-titan-panel/40 to-titan-black/30 px-4 py-4 md:px-5 md:py-5">
      <header className="mb-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-titan-gold">
          {t("guide.title", { market: market.shortLabel })}
        </p>
        <h2 className="mt-1 text-base font-semibold text-stone-100">{t("guide.heading")}</h2>
        <p className="mt-2 text-sm leading-relaxed text-stone-500">
          {t("guide.intro")}{" "}
          <span className="text-titan-goldDim">{t("guide.introDisclaimer")}</span> {t("guide.introNoSignal")}
        </p>
      </header>
      <ul className="grid gap-3 sm:grid-cols-2">
        {GUIDE_KEYS.map((key) => (
          <li
            key={key}
            className="rounded-lg border border-titan-line/60 bg-titan-black/25 px-3 py-3"
          >
            <p className="text-[11px] font-semibold uppercase tracking-wider text-titan-goldBright/90">
              {t(`guide.items.${key}.title`)}
            </p>
            <p className="mt-1.5 text-[13px] leading-snug text-stone-500">{t(`guide.items.${key}.body`)}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
