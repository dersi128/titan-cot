import type { CotDashboardData } from "../../types";
import type { InstitutionalMarket } from "../../config/institutionalMarkets";
import {
  computeTitanDashboardScore,
  evaluateTitanCot,
  resolveTitanVerdict,
  verdictAccentClass,
} from "../../lib/titanCotScore";
import { useTitanI18n, translateApiLabel } from "../../i18n";
import { TitanMarketIcon } from "./TitanMarketIcon";
import { TitanBadge, TitanScoreGauge } from "./ui/TitanPrimitives";

type MarketDetailHeroProps = {
  market: InstitutionalMarket;
  data: CotDashboardData | null;
  loading: boolean;
};

export function MarketDetailHero({ market, data, loading }: MarketDetailHeroProps) {
  const { t, locale } = useTitanI18n();
  const score = data ? computeTitanDashboardScore(data) : null;
  const verdict = data ? resolveTitanVerdict(data) : null;
  const scoring = data ? evaluateTitanCot(data) : null;
  const phase = scoring?.marketPhase ?? data?.marketPhase;

  return (
    <header className="titan-detail-hero relative overflow-hidden border-b border-white/[0.06] px-5 py-6 md:px-7 md:py-8">
      <div className="titan-detail-hero__grid pointer-events-none absolute inset-0" aria-hidden />
      <div className="titan-detail-hero__glow pointer-events-none absolute -right-20 top-0 h-64 w-64 rounded-full" aria-hidden />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-start gap-4 md:gap-5">
          <div className="titan-detail-hero__icon-ring shrink-0 rounded-2xl p-1">
            <TitanMarketIcon market={market} size="lg" score={score ?? undefined} />
          </div>
          <div className="min-w-0">
            <p className="font-display text-[10px] font-semibold uppercase tracking-[0.28em] text-titan-gold/90">
              {t("detail.eyebrow")}
            </p>
            <h1 className="mt-2 font-display text-2xl font-semibold uppercase tracking-[0.06em] text-white md:text-3xl">
              {market.subtitle}
            </h1>
            <p className="mt-1 font-mono text-sm tracking-wide text-titan-goldBright/90">
              CME: <span className="text-white">{market.symbol}</span>
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <TitanBadge tone="bull">{t("engine.badges.live")}</TitanBadge>
              <TitanBadge tone="gold">{t("engine.badges.cftc")}</TitanBadge>
              <TitanBadge tone="neutral">{t("engine.badges.ai")}</TitanBadge>
            </div>
            {data?.reportDate ? (
              <p className="mt-3 font-mono text-[11px] text-stone-500">
                {t("detail.cftcReport", { date: data.reportDate })}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-center gap-4 sm:flex-row lg:flex-col lg:items-end">
          {loading ? (
            <div className="h-[108px] w-[108px] animate-pulse rounded-full bg-white/5" />
          ) : score !== null ? (
            <TitanScoreGauge score={score} />
          ) : null}
          <div className="text-center lg:text-right">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-500">
              {t("engine.regime")}
            </p>
            <p className="mt-1 max-w-[220px] text-sm font-medium text-stone-200">
              {phase ? translateApiLabel(phase, locale) : "—"}
            </p>
            <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-500">
              {t("engine.bias")}
            </p>
            <p
              className={`mt-1 text-sm font-semibold uppercase tracking-wide ${
                verdict ? verdictAccentClass(verdict) : "text-stone-500"
              }`}
            >
              {verdict ?? "—"}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
