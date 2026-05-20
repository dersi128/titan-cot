import type { CSSProperties } from "react";
import { useTitanI18n } from "../../i18n";
import {
  CHART_LOOKBACK_ORDER,
  CURRENT_YEAR_CHART_KEY,
  lookbackChartKey,
} from "../utils/chartData";
import { lookbackColor, lookbackLabel } from "../yearsLookback";
import {
  ROLLING_CHART_COLORS,
  ROLLING_CHART_KEYS,
  ROLLING_CHART_ORDER,
  rollingWindowLabel,
} from "../utils/rollingChartData";
import type { SeasonalityComparison } from "../services/seasonalityService";

export type SeasonalityLegendFocus = string | null;

type SeasonalityChartLegendProps = {
  comparison: SeasonalityComparison;
  focus: SeasonalityLegendFocus;
  onFocusChange: (key: SeasonalityLegendFocus) => void;
};

export function SeasonalityChartLegend({
  comparison,
  focus,
  onFocusChange,
}: SeasonalityChartLegendProps) {
  const { t } = useTitanI18n();
  const clearFocus = () => onFocusChange(null);
  const isDimmed = (key: string) => focus !== null && focus !== key;

  return (
    <div
      className="titan-seasonality-legend-row"
      role="list"
      onMouseLeave={clearFocus}
    >
      <div className="titan-seasonality-legend-row__curves">
        <button
          type="button"
          className={`titan-seasonality-legend-item titan-seasonality-legend-item--current-year${focus === CURRENT_YEAR_CHART_KEY ? " titan-seasonality-legend-item--active" : ""}${isDimmed(CURRENT_YEAR_CHART_KEY) ? " titan-seasonality-legend-item--dimmed" : ""}`}
          style={{ "--legend-color": "#f5f5f4" } as CSSProperties}
          onMouseEnter={() => onFocusChange(CURRENT_YEAR_CHART_KEY)}
          onFocus={() => onFocusChange(CURRENT_YEAR_CHART_KEY)}
          onBlur={clearFocus}
        >
          <span className="titan-seasonality-legend-item__swatch titan-seasonality-legend-item__swatch--thick" />
          <span className="titan-seasonality-legend-item__label">
            {t("seasonality.legendLivePath")}
          </span>
        </button>

        {ROLLING_CHART_ORDER.map((w) => {
          const key = ROLLING_CHART_KEYS[w];
          return (
            <button
              key={key}
              type="button"
              className={`titan-seasonality-legend-item${focus === key ? " titan-seasonality-legend-item--active" : ""}${isDimmed(key) ? " titan-seasonality-legend-item--dimmed" : ""}`}
              style={{ "--legend-color": ROLLING_CHART_COLORS[w] } as CSSProperties}
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

        {CHART_LOOKBACK_ORDER.map((lb) => {
          if (!comparison[lb]) return null;
          const key = lookbackChartKey(lb);
          return (
            <button
              key={key}
              type="button"
              className={`titan-seasonality-legend-item${focus === key ? " titan-seasonality-legend-item--active" : ""}${isDimmed(key) ? " titan-seasonality-legend-item--dimmed" : ""}${lb === 10 ? " titan-seasonality-legend-item--primary" : ""}`}
              style={{ "--legend-color": lookbackColor(lb) } as CSSProperties}
              onMouseEnter={() => onFocusChange(key)}
              onFocus={() => onFocusChange(key)}
              onBlur={clearFocus}
            >
              <span className="titan-seasonality-legend-item__swatch" />
              <span className="titan-seasonality-legend-item__label">
                {lookbackLabel(lb)} {t("seasonality.legendContext")}
              </span>
            </button>
          );
        })}
      </div>
      <div className="titan-seasonality-legend-row__zones">
        <span className="titan-seasonality-legend-zone titan-seasonality-legend-zone--bull">
          <span className="titan-seasonality-legend-band titan-seasonality-legend-band--bull" />
          {t("seasonality.legendBull")}
        </span>
        <span className="titan-seasonality-legend-zone titan-seasonality-legend-zone--bear">
          <span className="titan-seasonality-legend-band titan-seasonality-legend-band--bear" />
          {t("seasonality.legendBear")}
        </span>
      </div>
    </div>
  );
}
