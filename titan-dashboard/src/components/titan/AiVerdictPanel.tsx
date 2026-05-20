import type { CotDashboardData } from "../../types";
import {
  buildInstitutionalNarrative,
  commercialTrend,
  computeTitanDashboardScore,
  evaluateTitanCot,
  resolveTitanVerdict,
  verdictAccentClass,
} from "../../lib/titanCotScore";
import type { InstitutionalMarket } from "../../config/institutionalMarkets";
import { translateApiLabel, translateTrend, useTitanI18n } from "../../i18n";
import { TitanBadge, TitanScoreGauge } from "./ui/TitanPrimitives";
import { TitanBiasEngine } from "./TitanBiasEngine";

type AiVerdictPanelProps = {
  market: InstitutionalMarket;
  data: CotDashboardData | null;
  loading: boolean;
  variant?: "standalone" | "embedded" | "insights";
};

function phaseTone(regime: string): "gold" | "bull" | "bear" | "warn" | "neutral" {
  const u = regime.toUpperCase();
  if (u.includes("ACCUMULATION") || u.includes("CROWDED SHORT")) return "bull";
  if (u.includes("DISTRIBUTION") || u.includes("CROWDED LONG")) return "bear";
  if (u.includes("EXHAUSTION") || u.includes("TRANSITION")) return "warn";
  if (u.includes("TRENDING")) return "gold";
  return "neutral";
}

export function AiVerdictPanel({ market, data, loading, variant = "standalone" }: AiVerdictPanelProps) {
  const { t, locale } = useTitanI18n();

  // Market detail uses only TitanBiasEngine — skip verdict/narrative/trend work that can throw on partial API rows.
  if (variant === "insights") {
    return <TitanBiasEngine market={market} data={data} loading={loading} />;
  }

  const score = data ? computeTitanDashboardScore(data) : null;
  const verdict = data ? resolveTitanVerdict(data) : null;
  const scoring = data ? evaluateTitanCot(data) : null;
  const narrative =
    data && score !== null && verdict !== null ? buildInstitutionalNarrative(data, score, verdict) : null;
  const trend = data ? commercialTrend(data) : null;
  const isEmbedded = variant === "embedded";
  const showHeaderMeta = !isEmbedded;

  const componentLabels: { key: keyof NonNullable<typeof scoring>["components"]; label: string }[] = [
    { key: "commercialPositioning", label: t("verdict.compPositioning") },
    { key: "commercialDeltaFlow", label: t("verdict.compFlow") },
    { key: "persistence", label: t("verdict.compPersistence") },
    { key: "ncDivergence", label: t("verdict.compNcDiv") },
    { key: "retailCrowding", label: t("verdict.compRetail") },
  ];

  const body = (
    <div className="space-y-5 px-5 py-5">
      {loading ? (
        <div className="space-y-3">
          <div className="h-4 w-48 animate-pulse rounded bg-titan-elevated" />
          <div className="h-24 animate-pulse rounded-xl bg-titan-elevated/80" />
        </div>
      ) : !data ? (
        <p className="text-sm text-stone-500">{t("verdict.unavailable", { market: market.shortLabel })}</p>
      ) : (
        <>
          {showHeaderMeta ? (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">{t("verdict.active")}</p>
              <p className="mt-1 font-display text-lg text-stone-100">
                {market.shortLabel} <span className="text-titan-goldDim">{market.symbol}</span>
              </p>
            </div>
          ) : null}

          <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
            <TitanScoreGauge score={score ?? 0} />
            <div className="min-w-0 flex-1 space-y-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">{t("verdict.verdict")}</p>
                <p
                  className={`mt-1 text-sm font-semibold leading-snug sm:text-base ${
                    verdict ? verdictAccentClass(verdict) : ""
                  }`}
                >
                  {verdict}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {scoring?.market_regime ? (
                  <TitanBadge tone={phaseTone(scoring.market_regime)}>
                    {translateApiLabel(scoring.market_regime, locale)}
                  </TitanBadge>
                ) : data.marketPhase ? (
                  <TitanBadge tone={phaseTone(data.marketPhase)}>
                    {translateApiLabel(data.marketPhase, locale)}
                  </TitanBadge>
                ) : null}
                {trend ? (
                  <TitanBadge tone={trend === "accumulation" ? "bull" : trend === "distribution" ? "bear" : "neutral"}>
                    {translateTrend(trend, locale, t)}
                  </TitanBadge>
                ) : null}
              </div>
              {scoring && scoring.persistence_weeks_for_badge > 0 ? (
                <p className="text-xs text-stone-500">
                  {scoring.persistence_side === "bull"
                    ? t("verdict.persistenceBull")
                    : scoring.persistence_side === "bear"
                      ? t("verdict.persistenceBear")
                      : t("verdict.persistenceNeutral")}{" "}
                  {t("verdict.persistenceWeeks", { weeks: scoring.persistence_weeks_for_badge })}
                </p>
              ) : null}
            </div>
          </div>

          {scoring ? (
            <div className="rounded-xl border border-titan-line/70 bg-titan-black/35 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                {t("verdict.scoreBreakdown")}
              </p>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {componentLabels.map(({ key, label }) => {
                  const pts = scoring.components[key];
                  const positive = pts > 0;
                  const negative = pts < 0;
                  return (
                    <li
                      key={key}
                      className="flex items-center justify-between rounded-lg border border-titan-line/50 bg-titan-elevated/25 px-3 py-2"
                    >
                      <span className="text-[11px] text-stone-500">{label}</span>
                      <span
                        className={`font-mono text-sm font-medium tabular-nums ${
                          positive ? "text-emerald-400" : negative ? "text-rose-400" : "text-stone-500"
                        }`}
                      >
                        {pts > 0 ? `+${pts}` : pts}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}

          <div className="rounded-xl border border-titan-line/70 bg-gradient-to-br from-titan-black/50 to-titan-elevated/20 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-titan-goldDim">
              {t("verdict.narrative")}
            </p>
            <p className="mt-2 text-balance text-sm leading-relaxed text-stone-400">{narrative}</p>
          </div>
        </>
      )}
    </div>
  );

  if (isEmbedded) {
    return (
      <div className="overflow-hidden rounded-xl border border-titan-gold/20 bg-gradient-to-br from-titan-void/90 via-titan-panel/50 to-titan-black/60 shadow-insetGold">
        <header className="border-b border-titan-line/70 px-5 py-3.5">
          <h3 className="font-display text-[10px] font-semibold uppercase tracking-[0.22em] text-titan-gold">
            {t("verdict.panelTitle")}
          </h3>
          <p className="mt-0.5 text-xs text-stone-500">{t("verdict.panelSub")}</p>
        </header>
        {body}
      </div>
    );
  }

  return (
    <aside className="titan-glass overflow-hidden">
      <header className="border-b border-titan-line/80 px-5 py-4">
        <h2 className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-titan-gold">
          {t("verdict.panelStandalone")}
        </h2>
        <p className="mt-1 text-sm text-stone-500">{t("verdict.panelStandaloneSub")}</p>
      </header>
      {body}
    </aside>
  );
}
