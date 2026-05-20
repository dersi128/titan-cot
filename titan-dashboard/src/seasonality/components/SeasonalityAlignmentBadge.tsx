import type { SeasonalityAlignment } from "../types";
import { useTitanI18n } from "../../i18n";

type SeasonalityAlignmentBadgeProps = {
  alignment: SeasonalityAlignment;
};

const BADGE_CLASS: Record<SeasonalityAlignment, string> = {
  ALIGNED: "titan-seasonality-alignment--aligned",
  DIVERGING: "titan-seasonality-alignment--diverging",
  STRONGLY_DIVERGING: "titan-seasonality-alignment--strong",
};

export function SeasonalityAlignmentBadge({ alignment }: SeasonalityAlignmentBadgeProps) {
  const { t } = useTitanI18n();

  return (
    <div className={`titan-seasonality-alignment ${BADGE_CLASS[alignment]}`}>
      <span className="titan-cmd-kicker">{t("seasonality.alignment.label")}</span>
      <span className="titan-seasonality-alignment__value">{t(`seasonality.alignment.${alignment}`)}</span>
    </div>
  );
}
