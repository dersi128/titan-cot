import { TitanLogo } from "../../TitanLogo";
import { LanguageSwitcher, useTitanI18n } from "../../../i18n";
import { TitanLivePill } from "../ui/TitanPrimitives";
import { TitanUserButton } from "../../../auth/TitanUserButton";
import type { AppSection } from "../../../lib/titanAppRoute";

type TitanHomeHeroProps = {
  section: AppSection;
  liveCount: number;
  refreshSec: number;
  refreshLabel: string;
};

export function TitanHomeHero({ liveCount, refreshSec, refreshLabel }: TitanHomeHeroProps) {
  const { t } = useTitanI18n();

  return (
    <div className="titan-home-hero-v2">
      <div className="titan-home-hero-v2__brand">
        <TitanLogo className="titan-home-hero-v2__logo" showWordmark={false} />
        <div className="titan-home-hero-v2__titles">
          <p className="titan-home-hero-v2__brand-name">{t("brand.name")}</p>
          <h1 className="titan-home-hero-v2__title">{t("header.institutionalCot")}</h1>
          <p className="titan-home-hero-v2__sub">{t("home.heroSubtitleLine")}</p>
        </div>
      </div>

      <div className="titan-home-hero-v2__meta">
        <LanguageSwitcher />
        <TitanUserButton />
        <TitanLivePill label={t("header.marketsLive", { count: liveCount })} />
        <div className="titan-home-hero-v2__clock">
          <span className="titan-home-hero-v2__clock-kicker">{t("header.data")}</span>
          <span className="titan-home-hero-v2__clock-value">
            {t("header.refreshSec", { sec: refreshSec })}
          </span>
          <span className="titan-home-hero-v2__clock-sub">{t("header.updated", { time: refreshLabel })}</span>
        </div>
      </div>
    </div>
  );
}
