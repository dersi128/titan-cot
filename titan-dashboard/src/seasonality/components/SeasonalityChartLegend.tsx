import type { CSSProperties } from "react";
import { useTitanI18n } from "../../i18n";
import {
  CURRENT_YEAR_CHART_KEY,
  ROLLING_CHART_COLORS,
  ROLLING_CHART_KEYS,
  ROLLING_CHART_ORDER,
  rollingWindowLabel,
} from "../utils/rollingChartData";
import type { RollingWindowDays } from "../types";

export type SeasonalityLegendFocus = string | null;

type SeasonalityChartLegendProps = {
  focus: SeasonalityLegendFocus;
  onFocusChange: (key: SeasonalityLegendFocus) => void;
};

export function SeasonalityChartLegend({ focus, onFocusChange }: SeasonalityChartLegendProps) {
  const { t } = useTitanI18n();
  const clearFocus = () => onFocusChange(null);
  const isDimmed = (key: string) => focus !== null && focus !== key;

  return (
    <div
      className="titan-seasonality-legend-row"
      role="list"
      aria-label={t("seasonality.chartTitleRolling")}
      onMouseLeave={clearFocus}
    >
      <div className="titan-seasonality-legend-row__curves">
        {ROLLING_CHART_ORDER.map((w: RollingWindowDays) => {
          const key = ROLLING_CHART_KEYS[w];
          const color = ROLLING_CHART_COLORS[w];
          return (
            <button
              key={key}
              type="button"
              className={`titan-seasonality-legend-item${focus === key ? " titan-seasonality-legend-item--active" : ""}${isDimmed(key) ? " titan-seasonality-legend-item--dimmed" : ""}${w === 60 ? " titan-seasonality-legend-item--primary" : ""}`}
              style={{ "--legend-color": color } as CSSProperties}
              onMouseEnter={() => onFocusChange(key)}
              onFocus={() => onFocusChange(key)}
              onBlur={clearFocus}
            >
              <span className="titan-seasonality-legend-item__swatch" />
              <span className="titan-seasonality-legend-item__label">
                {rollingWindowLabel(w)} {t("seasonality.legendProjection")}
              </span>
            </button>
          );
        })}
        <button
          type="button"
          className={`titan-seasonality-legend-item titan-seasonality-legend-item--current-year${focus === CURRENT_YEAR_CHART_KEY ? " titan-seasonality-legend-item--active" : ""}${isDimmed(CURRENT_YEAR_CHART_KEY) ? " titan-seasonality-legend-item--dimmed" : ""}`}
          style={{ "--legend-color": "#f5f5f4" } as CSSProperties}
          onMouseEnter={() => onFocusChange(CURRENT_YEAR_CHART_KEY)}
          onFocus={() => onFocusChange(CURRENT_YEAR_CHART_KEY)}
          onBlur={clearFocus}
        >
          <span className="titan-seasonality-legend-item__swatch titan-seasonality-legend-item__swatch--thick" />
          <span className="titan-seasonality-legend-item__label">{t("seasonality.legendLivePath")}</span>
        </button>
      </div>
      <div className="titan-seasonality-legend-row__zones">
        <span className="text-[9px] uppercase tracking-wider text-stone-600">{t("seasonality.legendEvents")}</span>
      </div>
    </div>
  );
}
