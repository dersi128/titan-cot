import { useTitanI18n } from "../../i18n";
import { lookbackColor, lookbackLabel, YEARS_LOOKBACK_OPTIONS, type YearsLookback } from "../yearsLookback";

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
          const color = lookbackColor(option);
          return (
            <button
              key={String(option)}
              type="button"
              disabled={disabled}
              className={`titan-seasonality-lookback-btn${active ? " titan-seasonality-lookback-btn--active" : ""}`}
              style={
                active
                  ? {
                      color,
                      borderBottomColor: color,
                      background: `${color}1a`,
                      boxShadow: `inset 0 -2px 0 ${color}`,
                    }
                  : { color: "#78716c" }
              }
              onClick={() => onChange(option)}
              aria-pressed={active}
            >
              <span
                className="mr-1.5 inline-block h-2 w-2 shrink-0 rounded-full"
                style={{ background: color, opacity: active ? 1 : 0.65 }}
                aria-hidden
              />
              {lookbackLabel(option)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
