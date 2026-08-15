import type { SeasonalityResult } from "../types";
import { useTitanI18n } from "../../i18n";

type SeasonalityTraderSnapshotProps = {
  result: SeasonalityResult;
  currentMonth: number;
};

function biasTone(bias: SeasonalityResult["seasonalBias"]): string {
  if (bias === "BULLISH") return "text-emerald-400";
  if (bias === "BEARISH") return "text-rose-400";
  return "text-stone-300";
}

function biasGlow(bias: SeasonalityResult["seasonalBias"]): string {
  if (bias === "BULLISH") return "border-emerald-500/30 bg-emerald-500/[0.07]";
  if (bias === "BEARISH") return "border-rose-500/30 bg-rose-500/[0.07]";
  return "border-titan-gold/20 bg-titan-panel/60";
}

function alignmentTone(a: string): string {
  if (a === "ALIGNED") return "text-emerald-400";
  if (a === "STRONGLY_DIVERGING") return "text-rose-400";
  return "text-amber-300";
}

export function SeasonalityTraderSnapshot({ result, currentMonth }: SeasonalityTraderSnapshotProps) {
  const { t } = useTitanI18n();
  const month = result.monthlyStats.find((m) => m.month === currentMonth);
  const monthPct = month ? (month.avgReturn * 100).toFixed(2) : "—";
  const monthWin = month ? month.winRate.toFixed(0) : "—";
  const alignment = result.deviationAnalysis?.alignment ?? result.seasonalityAlignment;
  const we = result.windowEngine;
  const status = we?.status ?? "NO_ACTIVE";
  const displayBias =
    status === "ACTIVE_BULLISH"
      ? "BULLISH"
      : status === "ACTIVE_BEARISH"
        ? "BEARISH"
        : "NEUTRAL";

  const nextBest = [...result.monthlyStats]
    .filter((m) => m.month !== currentMonth)
    .sort((a, b) => b.avgReturn - a.avgReturn)[0];

  const statusLabel =
    status === "ACTIVE_BULLISH"
      ? "ACTIVE BULLISH WINDOW"
      : status === "ACTIVE_BEARISH"
        ? "ACTIVE BEARISH WINDOW"
        : status === "UPCOMING_BULLISH" || status === "UPCOMING_BEARISH"
          ? "UPCOMING SEASONAL WINDOW"
          : "NO ACTIVE SEASONAL WINDOW";

  const statusDetail =
    displayBias !== "NEUTRAL" && we && we.windowLabel !== "—"
      ? `${we.windowLabel} · WR ${(we.winRate * 100).toFixed(0)}% · Avg ${(we.avgReturn * 100).toFixed(1)}%`
      : status.startsWith("UPCOMING") && we?.upcomingLabel
        ? `${we.upcomingSide === "BEARISH" ? "Bearish" : "Bullish"} starts in ${we.daysUntilStart}d · ${we.upcomingLabel}`
        : t("seasonality.snap.biasLine.NEUTRAL", {
            strength: t("seasonality.strength.LOW"),
          });

  return (
    <section className={`overflow-hidden rounded-xl border shadow-card ${biasGlow(displayBias)}`}>
      <div className="grid gap-0 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        {/* 5-second hero verdict */}
        <div className="border-b border-white/[0.06] p-5 lg:border-b-0 lg:border-r lg:border-white/[0.06]">
          <p className="font-display text-[10px] font-semibold uppercase tracking-[0.14em] text-titan-gold/80">
            {t("seasonality.snap.now")}
          </p>
          <p className={`mt-2 font-display text-2xl font-semibold tracking-wide sm:text-3xl ${biasTone(displayBias)}`}>
            {statusLabel}
          </p>
          <p className="mt-2 text-[13px] leading-snug text-stone-400">{statusDetail}</p>
        </div>

        {/* This month historically */}
        <div className="border-b border-white/[0.06] p-5 lg:border-b-0 lg:border-r lg:border-white/[0.06]">
          <p className="titan-cmd-kicker">{t("seasonality.snap.thisMonth")}</p>
          <p
            className={`mt-2 font-mono text-3xl font-semibold ${
              month && month.avgReturn >= 0 ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {month && month.avgReturn >= 0 ? "+" : ""}
            {monthPct}%
          </p>
          <p className="mt-1 text-[12px] text-stone-500">
            {t("seasonality.snap.thisMonthSub", {
              month: month?.monthLabel ?? "—",
              win: monthWin,
            })}
          </p>
        </div>

        {/* Price vs seasonal path */}
        <div className="border-b border-white/[0.06] p-5 lg:border-b-0 lg:border-r lg:border-white/[0.06]">
          <p className="titan-cmd-kicker">{t("seasonality.snap.vsSeason")}</p>
          <p className={`mt-2 font-display text-2xl font-semibold ${alignmentTone(alignment)}`}>
            {t(`seasonality.snap.align.${alignment}`)}
          </p>
          <p className="mt-1 text-[12px] text-stone-500">{t(`seasonality.snap.alignHint.${alignment}`)}</p>
        </div>

        {/* Next best month hint */}
        <div className="p-5">
          <p className="titan-cmd-kicker">{t("seasonality.snap.nextBest")}</p>
          <p className="mt-2 font-display text-2xl font-semibold text-titan-goldBright">
            {nextBest?.monthLabel ?? "—"}
          </p>
          <p className="mt-1 text-[12px] text-stone-500">
            {nextBest
              ? t("seasonality.snap.nextBestSub", {
                  pct: `${nextBest.avgReturn >= 0 ? "+" : ""}${(nextBest.avgReturn * 100).toFixed(2)}%`,
                })
              : "—"}
          </p>
        </div>
      </div>
    </section>
  );
}
