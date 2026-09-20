import type { AppSection } from "../../lib/titanAppRoute";
import { useTitanI18n } from "../../i18n";

type TitanAppNavProps = {
  active: AppSection;
  onNavigate: (section: AppSection) => void;
};

const NAV_ORDER: AppSection[] = ["home", "scanner", "heatmap", "seasonality", "dme"];

function NavIcon({ section }: { section: AppSection }) {
  switch (section) {
    case "home":
      return (
        <svg viewBox="0 0 16 16" className="titan-app-nav__icon" aria-hidden>
          <path fill="currentColor" d="M8 2.1 1.8 7.2V14h4.5v-4.2h3.4V14H14.2V7.2L8 2.1Z" />
        </svg>
      );
    case "scanner":
      return (
        <svg viewBox="0 0 16 16" className="titan-app-nav__icon" aria-hidden>
          <path
            fill="currentColor"
            d="M7.1 2.2a4.9 4.9 0 1 0 3.1 8.7l2.6 2.6 1.1-1.1-2.6-2.6A4.9 4.9 0 0 0 7.1 2.2Zm0 1.5a3.4 3.4 0 1 1 0 6.8 3.4 3.4 0 0 1 0-6.8Z"
          />
        </svg>
      );
    case "heatmap":
      return (
        <svg viewBox="0 0 16 16" className="titan-app-nav__icon" aria-hidden>
          <path
            fill="currentColor"
            d="M2 2h3.5v3.5H2V2Zm4.25 0h3.5v3.5h-3.5V2ZM10.5 2H14v3.5h-3.5V2ZM2 6.25h3.5v3.5H2v-3.5Zm4.25 0h3.5v3.5h-3.5v-3.5Zm4.25 0H14v3.5h-3.5v-3.5ZM2 10.5h3.5V14H2v-3.5Zm4.25 0h3.5V14h-3.5v-3.5Zm4.25 0H14V14h-3.5v-3.5Z"
          />
        </svg>
      );
    case "seasonality":
      return (
        <svg viewBox="0 0 16 16" className="titan-app-nav__icon" aria-hidden>
          <path fill="currentColor" d="M2.2 13.2h1.8V7.4H2.2v5.8Zm3.3 0h1.8V3.2H5.5v10Zm3.3 0h1.8V6.1H8.8v7.1Zm3.3 0h1.8V4.6h-1.8v8.6Z" />
        </svg>
      );
    case "dme":
      return (
        <svg viewBox="0 0 16 16" className="titan-app-nav__icon" aria-hidden>
          <path
            fill="currentColor"
            d="M8 2.2c-2.8 0-5 .7-5 1.6v1.6c0 .9 2.2 1.6 5 1.6s5-.7 5-1.6V3.8c0-.9-2.2-1.6-5-1.6Zm-5 5.1v1.7c0 .9 2.2 1.6 5 1.6s5-.7 5-1.6V7.3c-.9.7-2.8 1.1-5 1.1s-4.1-.4-5-1.1Zm0 3.3v1.6c0 .9 2.2 1.6 5 1.6s5-.7 5-1.6v-1.6c-.9.7-2.8 1.1-5 1.1s-4.1-.4-5-1.1Z"
          />
        </svg>
      );
  }
}

export function TitanAppNav({ active, onNavigate }: TitanAppNavProps) {
  const { t } = useTitanI18n();

  const label = (section: AppSection) => {
    switch (section) {
      case "home":
        return t("nav.home");
      case "scanner":
        return t("nav.scanner");
      case "heatmap":
        return t("nav.heatmap");
      case "seasonality":
        return t("nav.seasonality");
      case "dme":
        return t("nav.dme");
    }
  };

  return (
    <nav className="titan-app-nav" aria-label={t("nav.aria")}>
      <div className="titan-app-nav__inner">
        {NAV_ORDER.map((section) => {
          const isActive = active === section;
          return (
            <button
              key={section}
              type="button"
              onClick={() => onNavigate(section)}
              className={`titan-app-nav__item ${isActive ? "titan-app-nav__item--active" : ""}`}
              aria-current={isActive ? "page" : undefined}
            >
              <NavIcon section={section} />
              {label(section)}
            </button>
          );
        })}
      </div>
      <p className="titan-app-nav__slogan">{t("brand.slogan")}</p>
    </nav>
  );
}
