import type { CSSProperties } from "react";
import { useTitanI18n } from "../../i18n";
import { CHART_LOOKBACK_ORDER, lookbackChartKey } from "../utils/chartData";
import { lookbackColor, lookbackLabel } from "../yearsLookback";
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

  const setFocus = (key: string) => onFocusChange(key);
  const clearFocus = () => onFocusChange(null);
  const isDimmed = (key: string) => focus !== null && focus !== key;

  return (
    <div
      className="titan-seasonality-legend-row"
      role="list"
      aria-label={t("seasonality.chartTitle")}
      onMouseLeave={clearFocus}
    >
      <div className="titan-seasonality-legend-row__curves">
        {CHART_LOOKBACK_ORDER.map((lb) => {
          if (!comparison[lb]) return null;
          const key = lookbackChartKey(lb);
          const color = lookbackColor(lb);
          const active = focus === key;
          const dimmed = isDimmed(key);
          return (
            <button
              key={key}
              type="button"
              role="listitem"
              className={`titan-seasonality-legend-item${active ? " titan-seasonality-legend-item--active" : ""}${dimmed ? " titan-seasonality-legend-item--dimmed" : ""}${lb === 10 ? " titan-seasonality-legend-item--primary" : ""}`}
              style={{ "--legend-color": color } as CSSProperties}
              onMouseEnter={() => setFocus(key)}
              onFocus={() => setFocus(key)}
              onBlur={clearFocus}
            >
              <span className="titan-seasonality-legend-item__swatch" />
              <span className="titan-seasonality-legend-item__label">
                {lookbackLabel(lb)}
                <span className="titan-seasonality-legend-item__suffix">
                  {t("seasonality.legendSeasonalitySuffix")}
                </span>
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
