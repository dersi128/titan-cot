import type { AppSection } from "../../lib/titanAppRoute";
import { useTitanI18n } from "../../i18n";

type TitanAppNavProps = {
  active: AppSection;
  onNavigate: (section: AppSection) => void;
};

const NAV_ORDER: AppSection[] = ["home", "scanner", "seasonality", "dme"];

export function TitanAppNav({ active, onNavigate }: TitanAppNavProps) {
  const { t } = useTitanI18n();

  const label = (section: AppSection) => {
    switch (section) {
      case "home":
        return t("nav.home");
      case "scanner":
        return t("nav.scanner");
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
              {label(section)}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
