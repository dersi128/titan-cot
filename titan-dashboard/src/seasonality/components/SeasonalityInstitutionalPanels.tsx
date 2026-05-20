import type { SeasonalityResult } from "../types";
import type { SeasonalDeviationLevel, SeasonalStability } from "../utils/seasonalDeviationEngine";
import { useTitanI18n } from "../../i18n";

type SeasonalityInstitutionalPanelsProps = {
  result: SeasonalityResult;
};

function levelClass(level: SeasonalDeviationLevel): string {
  if (level === "EXTREME") return "titan-seasonality-deviation--extreme";
  if (level === "HIGH") return "titan-seasonality-deviation--high";
  if (level === "MODERATE") return "titan-seasonality-deviation--moderate";
  return "titan-seasonality-deviation--low";
}

function stabilityClass(s: SeasonalStability): string {
  if (s === "FRAGMENTED") return "text-rose-300/90";
  if (s === "UNSTABLE") return "text-amber-300/90";
  return "text-emerald-300/90";
}

function signedPct(pct: number): string {
  return `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%`;
}

export function SeasonalityInstitutionalPanels({ result }: SeasonalityInstitutionalPanelsProps) {
  const { t } = useTitanI18n();
  const dev = result.deviationAnalysis;
  if (!dev) return null;

  const trackingKey =
    dev.trackingStatus === "above"
      ? "seasonality.deviation.trackingAbove"
      : dev.trackingStatus === "below"
        ? "seasonality.deviation.trackingBelow"
        : "seasonality.deviation.trackingOnPath";

  return (
    <div className="titan-seasonality-institutional">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <article className={`titan-seasonality-deviation-card ${levelClass(dev.level)}`}>
          <p className="titan-cmd-kicker">{t("seasonality.deviation.title")}</p>
          <p className="titan-seasonality-deviation-card__value mt-2">
            {t(`seasonality.deviation.level.${dev.level}`)}
          </p>
          <p className="titan-seasonality-deviation-card__pct mt-1">{signedPct(dev.deviationPct)}</p>
          <p className="mt-2 text-[10px] text-stone-500">{t("seasonality.deviation.vs10y")}</p>
        </article>

        <article className="titan-seasonality-deviation-card titan-seasonality-deviation-card--neutral">
          <p className="titan-cmd-kicker">{t("seasonality.deviation.vs10yTitle")}</p>
          <p className="titan-seasonality-deviation-card__value mt-2 text-stone-100">
            {t(trackingKey)}
          </p>
          <p className="mt-2 text-[10px] text-stone-500">
            {t("seasonality.deviation.meanDistance", { value: dev.meanAbsDistance.toFixed(1) })}
          </p>
        </article>

        <article
          className={`titan-seasonality-deviation-card${dev.failure ? " titan-seasonality-deviation-card--failure" : ""}`}
        >
          <p className="titan-cmd-kicker">{t("seasonality.deviation.failureTitle")}</p>
          {dev.failure ? (
            <p className="titan-seasonality-deviation-card__value mt-2 text-rose-300/95">
              {t(dev.failure.messageKey, { month: dev.failure.monthLabel })}
            </p>
          ) : (
            <p className="titan-seasonality-deviation-card__value mt-2 text-emerald-300/85">
              {t("seasonality.deviation.failureNone")}
            </p>
          )}
        </article>

        <article className="titan-seasonality-deviation-card titan-seasonality-deviation-card--neutral">
          <p className="titan-cmd-kicker">{t("seasonality.deviation.stabilityTitle")}</p>
          <p className={`titan-seasonality-deviation-card__value mt-2 ${stabilityClass(dev.stability)}`}>
            {t(`seasonality.deviation.stability.${dev.stability}`)}
          </p>
          <p className="mt-2 text-[10px] text-stone-500">{t("seasonality.deviation.stabilitySub")}</p>
        </article>
      </div>
    </div>
  );
}
