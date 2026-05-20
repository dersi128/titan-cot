import type { CotDashboardData } from "../../types";
import type { InstitutionalMarket } from "../../config/institutionalMarkets";
import {
  computeTitanDashboardScore,
  getTitanCotRead,
  resolveTitanVerdict,
  verdictAccentClass,
  type TitanBiasVerdict,
} from "../../lib/titanCotScore";
import { evaluateTitanPositioning } from "../../lib/titanCommercialIndex";
import { useTitanI18n } from "../../i18n";
import { TitanMarketIcon } from "./TitanMarketIcon";
import { TitanScoreGauge } from "./ui/TitanPrimitives";

type MarketDetailHeroProps = {
  market: InstitutionalMarket;
  data: CotDashboardData | null;
  loading: boolean;
};

function biasSummaryLabel(bias: CotDashboardData["commercials"]["bias"] | undefined, t: (k: string) => string): string {
  if (bias === "bullish") return t("detail.heroBiasBullish");
  if (bias === "bearish") return t("detail.heroBiasBearish");
  return t("detail.heroBiasNeutral");
}

export function MarketDetailHero({ market, data, loading }: MarketDetailHeroProps) {
  const { t } = useTitanI18n();
  let score: number | null = null;
  let verdict: TitanBiasVerdict | null = null;
  let cotRead: ReturnType<typeof getTitanCotRead> | null = null;
  if (data) {
    try {
      score = computeTitanDashboardScore(data);
      verdict = resolveTitanVerdict(data);
      cotRead = getTitanCotRead(data);
    } catch (err) {
      console.error("[TITAN] MarketDetailHero: scoring failed", err);
    }
  }
  const positioning = data ? evaluateTitanPositioning(data) : null;

  return (
    <header className="titan-detail-hero relative overflow-hidden border-b border-white/[0.06] px-5 py-7 md:px-7 md:py-9">
      <div className="titan-detail-hero__grid pointer-events-none absolute inset-0" aria-hidden />
      <div className="titan-detail-hero__glow pointer-events-none absolute -right-20 top-0 h-64 w-64 rounded-full" aria-hidden />

      <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-start gap-4 md:gap-5">
          <div className="titan-detail-hero__icon-ring shrink-0 rounded-2xl p-1">
            <TitanMarketIcon market={market} size="lg" score={score ?? undefined} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-display text-[10px] font-semibold uppercase tracking-[0.28em] text-titan-gold/90">{t("detail.eyebrow")}</p>
            <h1 className="mt-2 font-display text-2xl font-semibold uppercase tracking-[0.06em] text-white md:text-3xl">
              {market.subtitle}
            </h1>
            <p className="mt-1.5 font-mono text-xs tracking-wide text-stone-500">
              CME <span className="text-stone-300">{market.symbol}</span>
              {data?.reportDate ? (
                <span className="text-stone-600">
                  {" "}
                  · {data.reportDate}
                </span>
              ) : null}
            </p>
            {data ? (
              <p className="mt-4 text-[11px] font-medium uppercase tracking-[0.18em] text-stone-500">
                {t("detail.heroBiasLabel")}{" "}
                <span className="normal-case tracking-normal text-stone-300">{biasSummaryLabel(data.commercials.bias, t)}</span>
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-stretch gap-5 sm:flex-row sm:items-center lg:flex-col lg:items-end">
          {loading ? (
            <div className="h-[108px] w-[108px] animate-pulse rounded-full bg-white/5" />
          ) : score !== null ? (
            <TitanScoreGauge score={score} />
          ) : null}

          <div className="min-w-[min(100%,220px)] text-left sm:text-right">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-500">{t("engine.regime")}</p>
            <p className="mt-1 text-sm font-medium leading-snug text-stone-200">
              {positioning ? t(`positioning.zones.${positioning.commercialZone}`) : "—"}
            </p>
            <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-500">{t("engine.bias")}</p>
            <p className={`mt-1 text-base font-semibold uppercase tracking-wide ${verdict ? verdictAccentClass(verdict) : "text-stone-500"}`}>
              {verdict ?? "—"}
            </p>
            {cotRead && cotRead.persistence_weeks_for_badge > 0 ? (
              <p className="mt-4 inline-flex rounded-full border border-titan-gold/30 bg-titan-gold/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-titan-goldBright">
                {t("biasEngine.extremeBadge", { weeks: String(cotRead.persistence_weeks_for_badge) })}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
