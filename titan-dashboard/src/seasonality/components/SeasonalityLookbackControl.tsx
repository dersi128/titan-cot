import { useTitanI18n } from "../../i18n";
import { lookbackLabel, YEARS_LOOKBACK_OPTIONS, type YearsLookback } from "../yearsLookback";

type SeasonalityLookbackControlProps = {
  value: YearsLookback;
  onChange: (lookback: YearsLookback) => void;
  disabled?: boolean;
};

export function SeasonalityLookbackControl({
  value,
  onChange,
  disabled = false,
}: SeasonalityLookbackControlProps) {
  const { t } = useTitanI18n();

  return (
    <div className="flex flex-wrap items-center gap-3">
      <p className="titan-cmd-kicker shrink-0">{t("seasonality.lookbackLabel")}</p>
      <div className="titan-seasonality-lookback" role="group" aria-label={t("seasonality.lookbackLabel")}>
        {YEARS_LOOKBACK_OPTIONS.map((option) => {
          const active = value === option;
          return (
            <button
              key={String(option)}
              type="button"
              disabled={disabled}
              className={`titan-seasonality-lookback-btn${active ? " titan-seasonality-lookback-btn--active" : ""}`}
              onClick={() => onChange(option)}
              aria-pressed={active}
            >
              {lookbackLabel(option)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
