import { TitanLogo } from "../../TitanLogo";
import { useTitanI18n } from "../../../i18n";
import { TitanUserButton } from "../../../auth/TitanUserButton";
import { TitanHeaderTools } from "../ui/TitanHeaderTools";
import type { AppSection } from "../../../lib/titanAppRoute";

type TitanHomeHeroProps = {
  section: AppSection;
  liveCount: number;
  refreshSec: number;
  refreshLabel: string;
  positionsDate: string | null;
};

function sectionEyebrow(section: AppSection, t: (key: string) => string): string {
  switch (section) {
    case "scanner":
      return t("nav.scanner");
    case "heatmap":
      return t("nav.heatmap");
    case "seasonality":
      return t("nav.seasonality");
    case "dme":
      return t("nav.dme");
    default:
      return t("home.heroEyebrow");
  }
}

export function TitanHomeHero({
  section,
  liveCount,
  refreshSec,
  refreshLabel,
  positionsDate,
}: TitanHomeHeroProps) {
  const { t } = useTitanI18n();

  return (
    <div className="titan-home-hero-v2">
      <div className="titan-home-hero-v2__brand">
        <div className="titan-home-hero-v2__logo-wrap">
          <TitanLogo className="titan-home-hero-v2__logo" showWordmark={false} />
          <span className="titan-home-hero-v2__logo-shine" aria-hidden />
        </div>
        <div className="titan-home-hero-v2__titles">
          <p className="titan-home-hero-v2__eyebrow">{sectionEyebrow(section, t)}</p>
          <h1 className="titan-home-hero-v2__title">{t("header.institutionalCot")}</h1>
          <p className="titan-home-hero-v2__sub">{t("home.heroSubtitleLine")}</p>
        </div>
      </div>

      <div className="titan-home-hero-v2__meta">
        <TitanHeaderTools />
        <TitanUserButton />
        <div className="titan-home-hero-v2__live">
          <span className="titan-home-hero-v2__live-row">
            <i className="titan-home-hero-v2__led" aria-hidden />
            {t("header.heroBadge")}
          </span>
          <span className="titan-home-hero-v2__live-row">
            <i className="titan-home-hero-v2__led" aria-hidden />
            {t("header.marketsLive", { count: liveCount })}
          </span>
        </div>
        <div className="titan-home-hero-v2__clock">
          <span className="titan-home-hero-v2__clock-kicker">{t("header.report")}</span>
          <span className="titan-home-hero-v2__clock-value">{positionsDate ?? "—"}</span>
          <span className="titan-home-hero-v2__clock-sub">
            {t("header.updated", { time: refreshLabel })} · {t("header.refreshSec", { sec: refreshSec })} ·{" "}
            {t("header.refreshNotCot")}
          </span>
        </div>
      </div>
    </div>
  );
}
