import type { SeasonalityResult } from "../types";
import { useTitanI18n } from "../../i18n";

type SeasonalityStatsCardsProps = {
  result: SeasonalityResult;
};

function StatCard({
  label,
  value,
  sub,
  valueClass = "",
}: {
  label: string;
  value: string;
  sub?: string;
  valueClass?: string;
}) {
  return (
    <article className="titan-seasonality-stat">
      <p className="titan-cmd-kicker">{label}</p>
      <p className={`titan-seasonality-stat__value mt-2 ${valueClass}`}>{value}</p>
      {sub ? <p className="mt-1 text-[10px] text-stone-600">{sub}</p> : null}
    </article>
  );
}

function biasClass(bias: SeasonalityResult["seasonalBias"]): string {
  if (bias === "BULLISH") return "text-emerald-400/95";
  if (bias === "BEARISH") return "text-rose-400/95";
  return "text-stone-400";
}

function strengthClass(s: SeasonalityResult["seasonalStrength"]): string {
  if (s === "EXTREME") return "text-titan-goldBright";
  if (s === "HIGH") return "text-amber-300/90";
  return "text-stone-300";
}

export function SeasonalityStatsCards({ result }: SeasonalityStatsCardsProps) {
  const { t } = useTitanI18n();
  const windowLabel = result.currentSeasonalWindow?.label ?? "—";
  const avgPct = (result.averageReturnInWindow * 100).toFixed(3);
  const winPct = result.overallWinRate.toFixed(1);

  return (
    <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6">
      <StatCard
        label={t("seasonality.stats.bias")}
        value={result.seasonalBias}
        valueClass={biasClass(result.seasonalBias)}
        sub={t(`seasonality.bias.${result.seasonalBias}`)}
      />
      <StatCard
        label={t("seasonality.stats.strength")}
        value={result.seasonalStrength}
        valueClass={strengthClass(result.seasonalStrength)}
        sub={t(`seasonality.strength.${result.seasonalStrength}`)}
      />
      <StatCard label={t("seasonality.stats.years")} value={String(result.yearsUsed)} />
      <StatCard label={t("seasonality.stats.window")} value={windowLabel} />
      <StatCard label={t("seasonality.stats.avgReturn")} value={`${avgPct}%`} sub={t("seasonality.stats.avgReturnSub")} />
      <StatCard label={t("seasonality.stats.winRate")} value={`${winPct}%`} sub={t("seasonality.stats.winRateSub")} />
    </div>
  );
}
