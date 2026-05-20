import { TitanLogo } from "../../TitanLogo";
import { LanguageSwitcher, useTitanI18n } from "../../../i18n";
import { TitanLivePill } from "../ui/TitanPrimitives";

type TitanHomeHeroProps = {
  liveCount: number;
  refreshSec: number;
  refreshLabel: string;
};

export function TitanHomeHero({ liveCount, refreshSec, refreshLabel }: TitanHomeHeroProps) {
  const { t } = useTitanI18n();

  return (
    <div className="titan-home-hero-v2">
      <div className="flex min-w-0 flex-1 items-center gap-5 md:gap-6 lg:gap-8">
        <div className="titan-home-hero-v2__logo-ring shrink-0">
          <TitanLogo className="titan-home-hero-v2__logo" showWordmark={false} />
        </div>
        <div className="min-w-0 border-l border-titan-gold/15 pl-5 md:pl-6">
          <p className="font-display text-[10px] font-semibold uppercase tracking-[0.38em] text-titan-gold/80">
            {t("home.heroEyebrow")}
          </p>
          <h1 className="titan-home-hero-v2__title mt-2 font-display text-2xl font-bold uppercase tracking-[0.12em] text-stone-50 md:text-[1.65rem] lg:text-[1.85rem]">
            {t("header.institutionalCot")}
          </h1>
          <p className="mt-2 max-w-md text-[12px] font-medium leading-relaxed tracking-[0.06em] text-stone-400 md:text-[13px]">
            {t("home.heroSubtitleLine")}
          </p>
        </div>
      </div>

      <div className="titan-home-hero-v2__meta flex flex-wrap items-center justify-end gap-2.5">
        <LanguageSwitcher />
        <span className="titan-home-hero-v2__badge">{t("home.heroLegacy")}</span>
        <TitanLivePill label={t("header.marketsLive", { count: liveCount })} />
        <div className="titan-home-hero-v2__clock rounded-lg border border-titan-gold/15 bg-titan-panel/80 px-3 py-2 shadow-insetGold backdrop-blur-md">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">{t("header.data")}</p>
          <p className="mt-0.5 font-mono text-sm font-medium text-titan-goldBright">
            {t("header.refreshSec", { sec: refreshSec })}
          </p>
          <p className="mt-1 text-[10px] text-stone-600">{t("header.updated", { time: refreshLabel })}</p>
        </div>
      </div>
    </div>
  );
}
