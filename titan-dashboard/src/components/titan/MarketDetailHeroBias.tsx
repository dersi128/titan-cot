import type { CotDashboardData, CotVerdict } from "../../types";
import type { InstitutionalMarket } from "../../config/institutionalMarkets";
import { evaluateTitanPositioning } from "../../lib/titanCommercialIndex";
import { getTitanCotRead, scoreHeatClass, verdictAccentClass } from "../../lib/titanCotScore";
import type { BiasDriverId } from "../../lib/titanCotScoringCore";
import { useTitanI18n } from "../../i18n";
import { TitanMarketIcon } from "./TitanMarketIcon";

type MarketDetailHeroBiasProps = {
  market: InstitutionalMarket;
  data: CotDashboardData | null;
  loading: boolean;
};

function driverLabel(t: (key: string, vars?: Record<string, string | number>) => string, id: BiasDriverId): string {
  return t(`biasEngine.drivers.${id}.name`);
}

function biasContextLabel(
  bias: CotDashboardData["commercials"]["bias"] | undefined,
  t: (key: string) => string,
): string {
  if (bias === "bullish") return t("detail.heroBiasBullish");
  if (bias === "bearish") return t("detail.heroBiasBearish");
  return t("detail.heroBiasNeutral");
}

export function MarketDetailHeroBias({ market, data, loading }: MarketDetailHeroBiasProps) {
  const { t } = useTitanI18n();

  const scoring =
    data && !loading
      ? (() => {
          try {
            return getTitanCotRead(data);
          } catch (err) {
            console.error("[TITAN] MarketDetailHeroBias: score failed", err);
            return null;
          }
        })()
      : null;

  const positioningRead = data && !loading ? evaluateTitanPositioning(data) : null;

  const panelTone =
    scoring && scoring.score < 0 ? "bear" : scoring && scoring.score > 0 ? "bull" : "neutral";

  return (
    <section
      className={`titan-hero-bias-block titan-hero-bias-block--${panelTone} relative overflow-hidden border-b border-white/[0.06]`}
    >
      <div className="titan-hero-bias-block__grid pointer-events-none absolute inset-0" aria-hidden />
      <div className="titan-hero-bias-block__glow pointer-events-none absolute -right-16 top-0 h-48 w-48 rounded-full" aria-hidden />

      <div className="relative px-5 py-4 md:px-7 md:py-5">
        {loading ? (
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)_minmax(0,0.85fr)]">
            <div className="h-24 animate-pulse rounded-xl bg-white/[0.04]" />
            <div className="h-28 animate-pulse rounded-xl bg-white/[0.04]" />
            <div className="h-24 animate-pulse rounded-xl bg-white/[0.04]" />
          </div>
        ) : !scoring || !data ? (
          <p className="text-sm text-stone-500">{t("biasEngine.unavailable")}</p>
        ) : (
          <>
            <div className="titan-hero-bias-block__primary grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)_minmax(0,0.9fr)] lg:items-center lg:gap-5">
              <div className="flex min-w-0 items-start gap-3">
                <div className="titan-hero-bias-block__icon-ring shrink-0 rounded-xl p-0.5">
                  <TitanMarketIcon market={market} size="md" score={scoring.score} />
                </div>
                <div className="min-w-0">
                  <h1 className="font-display text-xl font-semibold uppercase tracking-[0.05em] text-white md:text-2xl">
                    {market.subtitle}
                  </h1>
                  <p className="mt-1 font-mono text-[11px] tracking-wide text-stone-500">
                    CME: <span className="text-stone-300">{market.symbol}</span>
                  </p>
                  {data.reportDate ? (
                    <p className="mt-1.5 font-mono text-[10px] uppercase tracking-wider text-stone-600">
                      CFTC · {data.reportDate}
                    </p>
                  ) : null}
                  <p className="mt-2 max-w-[240px] text-[10px] leading-relaxed text-stone-600">
                    {t("detail.heroBiasLabel")}{" "}
                    <span className="text-stone-400">{biasContextLabel(data.commercials.bias, t)}</span>
                    <span className="text-stone-700"> · </span>
                    {t("biasEngine.biasOnly")}
                  </p>
                </div>
              </div>

              <div className="titan-hero-bias-block__center text-center lg:px-2">
                <p className="titan-bias-kicker">{t("biasEngine.totalScoreLabel")}</p>
                <p className={`titan-hero-bias-block__score ${scoreHeatClass(scoring.score)}`}>
                  {scoring.score > 0 ? `+${scoring.score}` : scoring.score}
                </p>
                <p className={`titan-hero-bias-block__verdict ${verdictAccentClass(scoring.verdict as CotVerdict)}`}>
                  {scoring.verdict}
                </p>
                <dl className="titan-hero-bias-block__score-meta mx-auto mt-2 grid max-w-[200px] gap-0.5 text-[10px] text-stone-500">
                  <div className="flex justify-between gap-3 font-mono tabular-nums">
                    <dt>{t("biasEngine.rawScoreLabel")}</dt>
                    <dd className="opacity-80">
                      {scoring.raw_score > 0 ? `+${scoring.raw_score}` : scoring.raw_score}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3 font-mono tabular-nums">
                    <dt>{t("biasEngine.clampedScoreLabel")}</dt>
                    <dd className="opacity-80">{scoring.score > 0 ? `+${scoring.score}` : scoring.score}</dd>
                  </div>
                </dl>
              </div>

              <div className="titan-hero-bias-block__aside flex flex-col gap-3 lg:items-end lg:text-right">
                {scoring.persistence_weeks_for_badge > 0 ? (
                  <span className="titan-bias-badge w-fit lg:ml-auto">
                    {t("biasEngine.extremeBadge", { weeks: String(scoring.persistence_weeks_for_badge) })}
                  </span>
                ) : null}
                <div>
                  <p className="titan-bias-kicker">{t("biasEngine.confidenceLabel")}</p>
                  <p className="mt-0.5 text-sm font-semibold uppercase tracking-wide text-stone-200">
                    {scoring.confidence}
                  </p>
                </div>
                <div>
                  <p className="titan-bias-kicker">{t("biasEngine.primaryDriver")}</p>
                  <p className="mt-0.5 text-sm font-medium text-stone-200">
                    {driverLabel(t, scoring.primary_driver_id)}
                  </p>
                </div>
              </div>
            </div>

            {positioningRead ? (
              <div className="titan-hero-bias-block__regime mt-3 rounded-xl border border-white/[0.06] bg-black/25 px-4 py-2.5 md:mt-4">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                  <div>
                    <p className="titan-bias-kicker">{t("biasEngine.marketRegimeLabel")}</p>
                    <p className="mt-0.5 font-display text-sm font-semibold uppercase tracking-[0.12em] text-titan-gold/95">
                      {t(`positioning.regime.${positioningRead.regime}`)}
                    </p>
                  </div>
                  <p className="text-xs leading-relaxed text-stone-500 sm:max-w-[55%] sm:text-right">
                    {t(`positioning.regime.hint.${positioningRead.regime}`)}
                  </p>
                </div>
              </div>
            ) : null}
          </>
        )}
      </div>
    </section>
  );
}
