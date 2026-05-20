import type { SeasonalityResult } from "../types";
import { useTitanI18n } from "../../i18n";
import { SeasonalityAlignmentBadge } from "./SeasonalityAlignmentBadge";
import { SeasonalityInstitutionalPanels } from "./SeasonalityInstitutionalPanels";

type SeasonalityDeviationSectionProps = {
  result: SeasonalityResult;
};

export function SeasonalityDeviationSection({ result }: SeasonalityDeviationSectionProps) {
  const { t } = useTitanI18n();
  const deviation = result.deviationAnalysis;
  const alignment = deviation?.alignment ?? result.seasonalityAlignment;

  if (!deviation) return null;

  return (
    <section className="titan-seasonality-deviation-section rounded-lg border border-white/[0.08] bg-black/25 p-4">
      <div className="flex flex-wrap items-center gap-2 border-b border-white/[0.06] pb-3">
        <p className="titan-cmd-kicker">{t("seasonality.deviation.sectionTitle")}</p>
        <SeasonalityAlignmentBadge alignment={alignment} />
        <span className="titan-seasonality-chart-deviation-pill">
          {t(`seasonality.deviation.level.${deviation.level}`)}
          <span className="titan-seasonality-chart-deviation-pill__sep">·</span>
          {deviation.deviationPct >= 0 ? "+" : ""}
          {deviation.deviationPct.toFixed(1)} pts
        </span>
      </div>
      <p className="mt-2 text-[10px] text-stone-600">{t("seasonality.deviation.sectionSub")}</p>
      <div className="mt-4">
        <SeasonalityInstitutionalPanels result={result} />
      </div>
    </section>
  );
}
