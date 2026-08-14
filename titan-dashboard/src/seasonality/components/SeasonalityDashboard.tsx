import { useMemo } from "react";
import { useTitanI18n } from "../../i18n";
import { SEASONALITY_MARKETS } from "../markets";
import type { SeasonalityComparison } from "../services/seasonalityService";
import type { SeasonalityResult } from "../types";
import { buildDashboardInsights, type LookbackTrend, type WatchItem } from "../utils/dashboardInsights";

type Props = {
  result: SeasonalityResult;
  comparison: SeasonalityComparison;
  marketId: string;
  marketLabel: string;
  onMarketChange: (id: string) => void;
};

function card(extra = "") {
  return `rounded-2xl border border-titan-gold/15 bg-titan-panel/80 shadow-card backdrop-blur-md ${extra}`;
}

function formatDataStamp(iso: string, locale: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(locale === "cs" ? "cs-CZ" : "en-GB", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  });
}

function toneText(tone: WatchItem["tone"]): string {
  if (tone === "bull") return "text-emerald-400";
  if (tone === "bear") return "text-rose-400";
  if (tone === "warn") return "text-amber-300";
  return "text-stone-400";
}

function toneBar(tone: WatchItem["tone"]): string {
  if (tone === "bull") return "bg-emerald-400";
  if (tone === "bear") return "bg-rose-400";
  if (tone === "warn") return "bg-amber-300";
  return "bg-stone-500";
}

function tonePill(tone: WatchItem["tone"]): string {
  if (tone === "bull") return "border-emerald-500/25 bg-emerald-500/10 text-emerald-400";
  if (tone === "bear") return "border-rose-500/25 bg-rose-500/10 text-rose-400";
  if (tone === "warn") return "border-amber-400/25 bg-amber-400/10 text-amber-300";
  return "border-white/10 bg-white/[0.04] text-stone-400";
}

function TrendMini({ trend }: { trend: LookbackTrend }) {
  const up = trend.bias === "BULLISH";
  const down = trend.bias === "BEARISH";
  const color = up ? "text-emerald-400" : down ? "text-rose-400" : "text-stone-400";
  const title = trend.lookback === 20 ? "20Y" : `${trend.lookback}Y`;
  return (
    <div className="rounded-xl border border-white/[0.06] bg-black/25 px-3 py-2.5">
      <p className="text-[10px] font-medium uppercase tracking-wider text-stone-500">{title}</p>
      <p className={`mt-1 text-[12px] font-semibold ${color}`}>
        {up ? "↑ " : down ? "↓ " : "→ "}
        {trend.label}
      </p>
    </div>
  );
}

function WatchPanel({ items }: { items: WatchItem[] }) {
  const { t } = useTitanI18n();
  return (
    <div className={card("flex h-full flex-col p-5")}>
      <div className="mb-4 flex items-baseline justify-between gap-2">
        <p className="titan-cmd-kicker">{t("seasonality.dash.watchTitle")}</p>
        <p className="text-[10px] uppercase tracking-[0.16em] text-stone-600">
          {t("seasonality.dash.watchSub")}
        </p>
      </div>
      <ul className="flex flex-1 flex-col gap-2.5">
        {items.map((item) => (
          <li
            key={item.id}
            className="rounded-xl border border-white/[0.06] bg-black/30 px-3.5 py-3 transition-colors hover:border-titan-gold/20"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex h-5 min-w-5 items-center justify-center rounded-md border px-1.5 text-[10px] font-bold ${tonePill(item.tone)}`}
                  >
                    {item.tone === "bull" ? "↑" : item.tone === "bear" ? "↓" : item.tone === "warn" ? "!" : "·"}
                  </span>
                  <p className="truncate text-[13px] font-medium text-stone-200">
                    {t(`seasonality.dash.watch.${item.key}`, item.params)}
                  </p>
                </div>
                {item.detail ? (
                  <p className="mt-1 pl-7 text-[11px] text-stone-500">{item.detail}</p>
                ) : null}
                {typeof item.level === "number" ? (
                  <div className="mt-2.5 pl-7">
                    <div className="h-1 overflow-hidden rounded-full bg-white/[0.06]">
                      <div
                        className={`h-full rounded-full ${toneBar(item.tone)}`}
                        style={{ width: `${Math.max(6, Math.min(100, item.level))}%` }}
                      />
                    </div>
                  </div>
                ) : null}
              </div>
              {item.metric ? (
                <span className={`shrink-0 font-mono text-[13px] font-semibold ${toneText(item.tone)}`}>
                  {item.metric}
                </span>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SeasonalityDashboard({
  result,
  comparison,
  marketId,
  marketLabel,
  onMarketChange,
}: Props) {
  const { t, locale } = useTitanI18n();
  const insights = useMemo(
    () => buildDashboardInsights(result, comparison),
    [result, comparison],
  );

  const biasIsBull = insights.bias === "BULLISH";
  const biasIsBear = insights.bias === "BEARISH";
  const biasColor = biasIsBull ? "text-emerald-400" : biasIsBear ? "text-rose-400" : "text-amber-300";
  const agreeMajor = Math.max(insights.agreement.bullish, insights.agreement.bearish);

  const marketOptions = useMemo(() => {
    const preset = SEASONALITY_MARKETS.some((m) => m.id === marketId);
    if (preset) return [...SEASONALITY_MARKETS];
    return [{ id: marketId, label: marketLabel, dataSymbol: marketId }, ...SEASONALITY_MARKETS];
  }, [marketId, marketLabel]);

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-[15px] font-semibold uppercase tracking-[0.22em] text-stone-100">
          {t("seasonality.dash.title")}
        </h1>
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-[11px] uppercase tracking-[0.14em] text-stone-500">
            {t("seasonality.dash.data")}: {formatDataStamp(insights.currentDate, locale)}
          </p>
          <label className="flex items-center gap-2 text-[12px] text-stone-400">
            <span>{t("seasonality.dash.instrument")}</span>
            <select
              value={marketId}
              onChange={(e) => onMarketChange(e.target.value)}
              className="rounded-lg border border-titan-gold/20 bg-[#0c0d10] px-3 py-1.5 text-[13px] font-medium text-stone-100 outline-none focus:border-titan-gold/50"
            >
              {marketOptions.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {/* Bias + Watch */}
      <div className="grid gap-3 lg:grid-cols-[0.95fr_1.25fr]">
        <div className={card("flex flex-col p-5")}>
          <p className="titan-cmd-kicker">{t("seasonality.dash.biasTitle")}</p>
          <div className="mt-5 flex flex-1 flex-col items-center justify-center text-center">
            <div
              className={`flex h-[76px] w-[76px] items-center justify-center rounded-full border-2 ${
                biasIsBull
                  ? "border-emerald-500/50 bg-emerald-500/10 shadow-[0_0_36px_rgba(52,211,153,0.12)]"
                  : biasIsBear
                    ? "border-rose-500/50 bg-rose-500/10 shadow-[0_0_36px_rgba(251,113,133,0.12)]"
                    : "border-titan-gold/40 bg-titan-gold/10"
              }`}
            >
              <span className={`text-3xl ${biasColor}`}>
                {biasIsBull ? "↑" : biasIsBear ? "↓" : "◆"}
              </span>
            </div>
            <p className={`mt-4 font-display text-[26px] font-bold tracking-wide ${biasColor}`}>
              {insights.bias}
            </p>
            <p className="mt-1 font-mono text-xl text-stone-200">
              {insights.score}
              <span className="text-stone-500"> / 100</span>
            </p>
            <p className="mt-2 max-w-[240px] text-[12px] leading-snug text-stone-400">
              {t(`seasonality.dash.biasSub.${insights.bias}`, {
                strength: t(`seasonality.strength.${insights.strength}`),
              })}
            </p>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {insights.trends
              .filter((tr) => tr.lookback === 5 || tr.lookback === 10 || tr.lookback === 20)
              .map((tr) => (
                <TrendMini key={tr.lookback} trend={tr} />
              ))}
          </div>
        </div>

        <WatchPanel items={insights.watch} />
      </div>

      {/* Bottom intel cards */}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className={card("p-4")}>
          <p className="titan-cmd-kicker mb-3">{t("seasonality.dash.windowTitle")}</p>
          <dl className="space-y-2.5 text-[13px]">
            {(
              [
                ["winRate", `${insights.windowStats.winRate.toFixed(0)}%`, insights.windowStats.winRate >= 55],
                [
                  "avgMove",
                  `${insights.windowStats.avgMovePct >= 0 ? "+" : ""}${insights.windowStats.avgMovePct.toFixed(1)}%`,
                  insights.windowStats.avgMovePct >= 0,
                ],
                [
                  "dailyAvg",
                  `${insights.windowStats.dailyAvgPct >= 0 ? "+" : ""}${insights.windowStats.dailyAvgPct.toFixed(3)}%`,
                  insights.windowStats.dailyAvgPct >= 0,
                ],
                ["sample", `${insights.windowStats.sampleYears} ${t("seasonality.dash.years")}`, null],
              ] as const
            ).map(([key, val, pos]) => (
              <div key={key} className="flex justify-between gap-2">
                <dt className="text-stone-500">{t(`seasonality.dash.${key}`)}</dt>
                <dd
                  className={`font-mono font-semibold ${
                    pos === null ? "text-stone-200" : pos ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {val}
                </dd>
              </div>
            ))}
          </dl>
          <div
            className={`mt-4 rounded-xl px-3 py-2.5 text-[12px] font-semibold ${
              insights.windowStats.strongPeriod
                ? "bg-emerald-500/15 text-emerald-400"
                : "bg-white/[0.04] text-stone-400"
            }`}
          >
            {insights.windowStats.strongPeriod
              ? t("seasonality.dash.strongWindow")
              : t("seasonality.dash.weakWindow")}
          </div>
        </div>

        <div className={card("p-4")}>
          <p className="titan-cmd-kicker mb-3">{t("seasonality.dash.alignTitle")}</p>
          <ul className="space-y-2.5">
            {insights.trends.map((tr) => {
              const up = tr.bias === "BULLISH";
              const down = tr.bias === "BEARISH";
              return (
                <li key={tr.lookback} className="flex items-center justify-between text-[13px]">
                  <span className="text-stone-500">{tr.lookback}Y</span>
                  <span
                    className={`font-semibold ${
                      up ? "text-emerald-400" : down ? "text-rose-400" : "text-stone-400"
                    }`}
                  >
                    {up ? "↑ " : down ? "↓ " : "→ "}
                    {up ? "bullish" : down ? "bearish" : "neutral"}
                  </span>
                </li>
              );
            })}
          </ul>
          <p
            className={`mt-4 text-[13px] font-semibold ${
              agreeMajor === insights.agreement.total ? "text-emerald-400" : "text-amber-300"
            }`}
          >
            {t("seasonality.dash.agreement", {
              value: `${agreeMajor}/${insights.agreement.total}`,
            })}
          </p>
        </div>

        <div className={card("p-4")}>
          <p className="titan-cmd-kicker mb-3">{t("seasonality.dash.turnTitle")}</p>
          <dl className="space-y-3 text-[13px]">
            <div className="flex justify-between gap-2">
              <dt className="text-stone-500">{t("seasonality.dash.turnStart")}</dt>
              <dd className="font-semibold text-emerald-400">{insights.turn.startLabel}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-stone-500">{t("seasonality.dash.turnPeak")}</dt>
              <dd className="font-semibold text-amber-300">{insights.turn.peakLabel}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-stone-500">{t("seasonality.dash.turnEnd")}</dt>
              <dd className="font-semibold text-rose-400">{insights.turn.endLabel}</dd>
            </div>
          </dl>
          <div
            className={`mt-4 rounded-xl border px-3 py-2.5 text-[12px] font-semibold ${
              insights.turn.afterTurnWarn
                ? "border-rose-500/30 bg-rose-500/10 text-rose-300"
                : "border-white/[0.06] bg-white/[0.03] text-stone-400"
            }`}
          >
            {insights.turn.afterTurnWarn
              ? t("seasonality.dash.turnWarn", { date: insights.turn.endLabel })
              : t("seasonality.dash.turnOk")}
          </div>
        </div>

        <div className={card("p-4")}>
          <p className="titan-cmd-kicker mb-3">{t("seasonality.dash.conclTitle")}</p>
          <dl className="space-y-4 text-[13px]">
            <div className="flex justify-between gap-2">
              <dt className="text-stone-500">{t("seasonality.dash.conclBias")}</dt>
              <dd
                className={`font-semibold uppercase ${
                  insights.conclusion.biasSide === "long"
                    ? "text-emerald-400"
                    : insights.conclusion.biasSide === "short"
                      ? "text-rose-400"
                      : "text-amber-300"
                }`}
              >
                {insights.conclusion.biasSide}
              </dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-stone-500">{t("seasonality.dash.conclWindow")}</dt>
              <dd className="max-w-[55%] text-right font-semibold text-stone-200">
                {insights.conclusion.windowLabel}
              </dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-stone-500">{t("seasonality.dash.conclRisk")}</dt>
              <dd
                className={`max-w-[55%] text-right font-semibold ${
                  insights.conclusion.riskKey === "regimeOk" ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {t(`seasonality.dash.risk.${insights.conclusion.riskKey}`)}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}

