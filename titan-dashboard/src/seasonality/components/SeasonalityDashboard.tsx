import { useMemo } from "react";
import { useTitanI18n } from "../../i18n";
import type { SeasonalityComparison } from "../services/seasonalityService";
import type { SeasonalityResult } from "../types";
import { buildDashboardInsights } from "../utils/dashboardInsights";

type Props = {
  result: SeasonalityResult;
  comparison: SeasonalityComparison;
  currentMonth: number;
};

function tone(bias: string): string {
  if (bias === "BULLISH" || bias === "long" || bias === "bull") return "text-emerald-400";
  if (bias === "BEARISH" || bias === "short" || bias === "bear") return "text-rose-400";
  return "text-amber-300";
}

/** One clean 5-second strip — no card spam. */
export function SeasonalityDashboard({ result, comparison, currentMonth }: Props) {
  const { t } = useTitanI18n();
  const insights = useMemo(
    () => buildDashboardInsights(result, comparison),
    [result, comparison],
  );

  const month = result.monthlyStats.find((m) => m.month === currentMonth);
  const monthPct = month
    ? `${month.avgReturn >= 0 ? "+" : ""}${(month.avgReturn * 100).toFixed(2)}%`
    : "—";
  const topWatch = insights.watch.slice(0, 3);

  return (
    <section className="rounded-xl border border-titan-gold/15 bg-titan-panel/70 px-4 py-4 shadow-card backdrop-blur-md sm:px-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="titan-cmd-kicker">{t("seasonality.dash.biasTitle")}</p>
          <p className={`mt-1 font-display text-3xl font-semibold tracking-wide ${tone(insights.bias)}`}>
            {insights.bias}
            <span className="ml-2 font-mono text-xl text-stone-400">{insights.score}/100</span>
          </p>
          <p className="mt-1 max-w-md text-[12px] text-stone-500">
            {t(`seasonality.dash.biasSub.${insights.bias}`, {
              strength: t(`seasonality.strength.${insights.strength}`),
            })}
          </p>
        </div>

        <div className="flex flex-wrap gap-6 sm:gap-8">
          <div>
            <p className="text-[10px] uppercase tracking-[0.16em] text-stone-600">
              {t("seasonality.dash.thisMonth")}
            </p>
            <p
              className={`mt-1 font-mono text-xl font-semibold ${
                month && month.avgReturn >= 0 ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {monthPct}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.16em] text-stone-600">
              {t("seasonality.dash.conclBias")}
            </p>
            <p className={`mt-1 text-xl font-semibold uppercase ${tone(insights.conclusion.biasSide)}`}>
              {insights.conclusion.biasSide}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.16em] text-stone-600">
              {t("seasonality.dash.conclRisk")}
            </p>
            <p
              className={`mt-1 max-w-[11rem] text-[13px] font-medium leading-snug ${
                insights.conclusion.riskKey === "regimeOk" ? "text-stone-300" : "text-rose-300"
              }`}
            >
              {t(`seasonality.dash.risk.${insights.conclusion.riskKey}`)}
            </p>
          </div>
        </div>
      </div>

      {topWatch.length ? (
        <div className="mt-4 flex flex-wrap gap-2 border-t border-white/[0.05] pt-3">
          <span className="self-center text-[10px] uppercase tracking-[0.16em] text-stone-600">
            {t("seasonality.dash.watchTitle")}
          </span>
          {topWatch.map((item) => (
            <span
              key={item.id}
              className={`inline-flex items-center gap-1.5 rounded-md border border-white/[0.06] bg-black/25 px-2.5 py-1 text-[12px] ${tone(item.tone)}`}
            >
              <span className="text-stone-400">
                {t(`seasonality.dash.watch.${item.key}`, item.params)}
              </span>
              {item.metric ? <span className="font-mono font-semibold">{item.metric}</span> : null}
            </span>
          ))}
        </div>
      ) : null}
    </section>
  );
}
