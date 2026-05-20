import type { SeasonalityResult } from "../types";
import { useTitanI18n } from "../../i18n";
import { EVENT_COLORS } from "../utils/seasonalEvents";

type SeasonalityTimingPanelProps = {
  result: SeasonalityResult;
};

export function SeasonalityTimingPanel({ result }: SeasonalityTimingPanelProps) {
  const { t } = useTitanI18n();
  const trend = result.trendStrength ?? 0;
  const vol = result.volatilityRegime ?? "NORMAL";

  return (
    <div className="titan-seasonality-timing mt-3 rounded border border-white/[0.06] bg-black/20 p-3">
      <p className="titan-cmd-kicker mb-2">{t("seasonality.timing.title")}</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className="titan-seasonality-timing__cell">
          <span className="text-[9px] uppercase tracking-wider text-stone-600">{t("seasonality.timing.trend")}</span>
          <p className={`mt-1 font-mono text-sm font-semibold${trend >= 0 ? " text-emerald-400/90" : " text-rose-400/90"}`}>
            {trend >= 0 ? "+" : ""}
            {(trend * 100).toFixed(0)}%
          </p>
        </div>
        <div className="titan-seasonality-timing__cell">
          <span className="text-[9px] uppercase tracking-wider text-stone-600">{t("seasonality.timing.volatility")}</span>
          <p className="mt-1 font-mono text-sm font-semibold text-stone-200">{t(`seasonality.volatility.${vol}`)}</p>
        </div>
        <div className="titan-seasonality-timing__cell col-span-2 sm:col-span-2">
          <span className="text-[9px] uppercase tracking-wider text-stone-600">{t("seasonality.timing.intramonth")}</span>
          <div className="mt-1 flex flex-wrap gap-1">
            {(result.intramonthBuckets ?? [])
              .filter((b) => b.month === new Date(result.currentDate).getMonth() + 1)
              .map((b) => (
                <span
                  key={`${b.month}-w${b.week}`}
                  className={`rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase${b.bias === "BULLISH" ? " bg-emerald-500/15 text-emerald-400/90" : b.bias === "BEARISH" ? " bg-rose-500/15 text-rose-400/90" : " bg-stone-500/10 text-stone-400"}`}
                >
                  W{b.week} {(b.avgReturn * 100).toFixed(2)}%
                </span>
              ))}
          </div>
        </div>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {(result.seasonalEvents ?? []).slice(0, 8).map((ev) => (
          <span
            key={`${ev.type}-${ev.date}`}
            className="rounded border border-white/[0.08] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide"
            style={{ color: EVENT_COLORS[ev.type], borderColor: `${EVENT_COLORS[ev.type]}44` }}
          >
            {ev.label} {ev.tdyOffset >= 0 ? `+${ev.tdyOffset}d` : `${ev.tdyOffset}d`}
          </span>
        ))}
      </div>
    </div>
  );
}
