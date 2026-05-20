import { useState } from "react";
import { useTitanI18n } from "../../i18n";
import type { CotDashboardData, CotVerdict } from "../../types";
import type { InstitutionalMarket } from "../../config/institutionalMarkets";
import {
  DRIVER_POINTS_MAX_ABS,
  driverBarSegments,
  impactToneForDriver,
  type ImpactTone,
} from "../../lib/titanBiasEngineView";
import { getTitanCotRead, scoreHeatClass, verdictAccentClass } from "../../lib/titanCotScore";
import type { BiasDriverId } from "../../lib/titanCotScoringCore";
import { CommercialDeltaFlowMini } from "./CommercialDeltaFlowMini";

function driverLabel(t: (key: string, vars?: Record<string, string | number>) => string, id: BiasDriverId): string {
  return t(`biasEngine.drivers.${id}.name`);
}

type TitanBiasEngineProps = {
  market: InstitutionalMarket;
  data: CotDashboardData | null;
  loading: boolean;
};

function SegmentedBar({ filled, tone }: { filled: number; tone: "bear" | "bull" | "neutral" }) {
  return (
    <div className="titan-bias-bar" aria-hidden>
      {Array.from({ length: 10 }).map((_, i) => (
        <span key={i} className={`titan-bias-bar__seg ${i < filled ? `titan-bias-bar__seg--${tone}` : ""}`} />
      ))}
    </div>
  );
}

function scoreTone(score: number): "bear" | "bull" | "neutral" {
  if (score > 0) return "bull";
  if (score < 0) return "bear";
  return "neutral";
}

function impactToneClass(impact: ImpactTone): string {
  if (impact === "strong_bear" || impact === "contrarian_bear" || impact === "bear") return "titan-bias-impact--bear";
  if (impact === "strong_bull" || impact === "contrarian_bull" || impact === "bull") return "titan-bias-impact--bull";
  return "titan-bias-impact--neutral";
}

export function TitanBiasEngine({ market: _market, data, loading }: TitanBiasEngineProps) {
  const { t } = useTitanI18n();
  const [debugOpen, setDebugOpen] = useState(false);

  const scoring =
    data && !loading
      ? (() => {
          try {
            return getTitanCotRead(data);
          } catch (err) {
            console.error("[TITAN] TitanBiasEngine: score failed", err);
            return null;
          }
        })()
      : null;

  const panelTone =
    scoring && scoring.score < 0 ? "bear" : scoring && scoring.score > 0 ? "bull" : "neutral";

  const clampNote =
    scoring && scoring.raw_score !== scoring.score
      ? t("biasEngine.clampNote", {
          raw:
            scoring.raw_score > 0 ? `+${scoring.raw_score}` : String(scoring.raw_score),
        })
      : null;

  return (
    <section
      className={`titan-bias-engine relative titan-bias-engine--${panelTone} overflow-hidden rounded-2xl border border-titan-gold/15 backdrop-blur-xl`}
    >
      <div className="titan-bias-engine__backdrop pointer-events-none absolute inset-0" aria-hidden />
      <header className="relative border-b border-white/[0.06] px-5 py-4 md:px-6">
        <h3 className="font-display text-[10px] font-semibold uppercase tracking-[0.32em] text-titan-gold">
          {t("biasEngine.title")}
        </h3>
        <p className="mt-1 text-xs text-stone-500">{t("biasEngine.subtitle")}</p>
      </header>

      <div className="relative px-5 py-5 md:px-6 md:py-6">
        {loading ? (
          <div className="space-y-4">
            <div className="h-28 animate-pulse rounded-xl bg-white/[0.04]" />
            <div className="h-40 animate-pulse rounded-xl bg-white/[0.04]" />
          </div>
        ) : !scoring || !data ? (
          <p className="text-sm text-stone-500">{t("biasEngine.unavailable")}</p>
        ) : (
          <div className="space-y-6">
            <div className="grid gap-5 xl:grid-cols-[1fr_0.95fr]">
              <div className="space-y-5">
                <div className="titan-bias-verdict">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="titan-bias-kicker">{t("biasEngine.totalScoreLabel")}</p>
                      <p className={`titan-bias-score ${scoreHeatClass(scoring.score)}`}>
                        {scoring.score}
                        <span className="titan-bias-score__scale"> / 100</span>
                      </p>
                      <dl className="mt-3 grid gap-1 text-xs text-stone-400">
                        <div className="flex justify-between gap-4 font-mono tabular-nums">
                          <dt>{t("biasEngine.rawScoreLabel")}</dt>
                          <dd className={scoring.raw_score < 0 ? "text-rose-300/80" : scoring.raw_score > 0 ? "text-emerald-300/80" : ""}>
                            {scoring.raw_score > 0 ? `+${scoring.raw_score}` : scoring.raw_score}
                          </dd>
                        </div>
                        <div className="flex justify-between gap-4 font-mono tabular-nums">
                          <dt>{t("biasEngine.clampedScoreLabel")}</dt>
                          <dd className={scoring.score < 0 ? "text-rose-300/80" : scoring.score > 0 ? "text-emerald-300/80" : ""}>
                            {scoring.score > 0 ? `+${scoring.score}` : scoring.score}
                          </dd>
                        </div>
                      </dl>
                      {clampNote ? <p className="mt-2 text-[10px] text-stone-600">{clampNote}</p> : null}
                    </div>
                    {scoring.persistence_weeks_for_badge > 0 ? (
                      <span className="titan-bias-badge">{t("biasEngine.extremeBadge", { weeks: String(scoring.persistence_weeks_for_badge) })}</span>
                    ) : null}
                  </div>

                  <div className="mt-4 border-t border-white/[0.06] pt-4">
                    <p className="titan-bias-kicker">{t("biasEngine.verdictLabel")}</p>
                    <p className={`titan-bias-verdict__text ${verdictAccentClass(scoring.verdict as CotVerdict)}`}>
                      {scoring.verdict}
                    </p>
                    <div className="mt-3 flex flex-wrap items-baseline gap-x-4 gap-y-1">
                      <div>
                        <p className="titan-bias-kicker">{t("biasEngine.confidenceLabel")}</p>
                        <p className="text-sm font-medium tracking-wide text-stone-200">{scoring.confidence}</p>
                      </div>
                    </div>
                    <p className="mt-2 text-[10px] uppercase tracking-wider text-stone-600">{t("biasEngine.biasOnly")}</p>
                  </div>

                  <div className="mt-4 rounded-xl border border-white/[0.06] bg-titan-black/25 px-4 py-3">
                    <p className="titan-bias-kicker">{t("biasEngine.marketRegimeLabel")}</p>
                    <p className="mt-1 text-sm font-semibold tracking-wide text-titan-gold/95">{scoring.market_regime}</p>
                    <p className="mt-1 text-xs leading-relaxed text-stone-400">{scoring.regime_explanation}</p>
                  </div>

                  <dl className="mt-4 grid gap-2 sm:grid-cols-2">
                    <div>
                      <dt className="titan-bias-kicker">{t("biasEngine.primaryDriver")}</dt>
                      <dd className="mt-0.5 text-sm font-medium text-stone-200">
                        {driverLabel(t, scoring.primary_driver_id)}
                      </dd>
                    </div>
                    <div>
                      <dt className="titan-bias-kicker">{t("biasEngine.source")}</dt>
                      <dd className="mt-0.5 text-sm text-stone-400">{t("biasEngine.sourceValue")}</dd>
                    </div>
                  </dl>
                </div>
              </div>

              <CommercialDeltaFlowMini
                data={data}
                title={t("biasEngine.deltaFlowTitle")}
                labels={{ w1: t("biasEngine.delta1w"), w4: t("biasEngine.delta4w"), w13: t("biasEngine.delta13w") }}
              />
            </div>

            <div className="titan-bias-table-wrap overflow-x-auto">
              <p className="titan-bias-kicker mb-3 px-1">{t("biasEngine.importanceTitle")}</p>
              <table className="titan-bias-table w-full min-w-[520px] text-left">
                <thead>
                  <tr>
                    <th>{t("biasEngine.col.driver")}</th>
                    <th>{t("biasEngine.col.importance")}</th>
                    <th>{t("biasEngine.col.impact")}</th>
                    <th>{t("biasEngine.col.score")}</th>
                    <th>{t("biasEngine.col.bar")}</th>
                  </tr>
                </thead>
                <tbody>
                  {scoring.drivers.map((row) => {
                    const isPrimary = row.is_primary;
                    const tone = scoreTone(row.points);
                    const maxAbs = DRIVER_POINTS_MAX_ABS[row.id];
                    const filled = driverBarSegments(row.points, maxAbs);
                    const impactKey = impactToneForDriver(row.id, row.points);
                    return (
                      <tr key={row.id} className={isPrimary ? "titan-bias-table__row--primary" : undefined}>
                        <td className="font-medium text-stone-200">
                          {driverLabel(t, row.id)}
                          {isPrimary ? (
                            <span className="ml-2 text-[9px] uppercase tracking-wider text-titan-gold/80">{t("biasEngine.primaryTag")}</span>
                          ) : null}
                        </td>
                        <td className="font-mono text-stone-500">{row.importance}</td>
                        <td className={impactToneClass(impactKey)}>
                          {row.impact}
                        </td>
                        <td
                          className={`font-mono tabular-nums ${tone === "bear" ? "text-rose-400" : tone === "bull" ? "text-emerald-400" : "text-stone-500"}`}
                        >
                          {row.points > 0 ? `+${row.points}` : row.points}
                        </td>
                        <td>
                          <SegmentedBar filled={filled} tone={tone} />
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="titan-bias-table__row--total">
                    <td className="font-semibold text-stone-300">{t("biasEngine.col.totalRow")}</td>
                    <td />
                    <td />
                    <td
                      className={`font-mono text-sm font-semibold tabular-nums ${
                        scoring.score < 0 ? "text-rose-400" : scoring.score > 0 ? "text-emerald-400" : "text-stone-500"
                      }`}
                    >
                      <span className="block">{scoring.score > 0 ? `+${scoring.score}` : scoring.score}</span>
                      {scoring.raw_score !== scoring.score ? (
                        <span className="mt-1 block text-[10px] font-normal font-sans normal-case tracking-normal text-stone-500">
                          {t("biasEngine.componentSumRaw", {
                            raw: scoring.raw_score > 0 ? `+${scoring.raw_score}` : String(scoring.raw_score),
                          })}
                        </span>
                      ) : null}
                    </td>
                    <td />
                  </tr>
                </tbody>
              </table>
              <p className="mt-3 px-1 text-[10px] leading-relaxed text-stone-600">{t("biasEngine.importanceNote")}</p>
              <p className="mt-2 px-1 text-[10px] text-stone-600">{t("biasEngine.dataNote")}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-white/[0.06] bg-titan-black/20 p-4">
                <p className="titan-bias-kicker text-titan-gold/90">{t("biasEngine.structuralTitle")}</p>
                <ul className="mt-3 space-y-2 text-sm leading-relaxed text-stone-400">
                  {scoring.key_drivers_structural.map((line) => (
                    <li key={line} className="flex gap-2">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-titan-gold/60" aria-hidden />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border border-white/[0.06] bg-titan-black/20 p-4">
                <p className="titan-bias-kicker text-titan-gold/90">{t("biasEngine.executionTitle")}</p>
                <ul className="mt-3 space-y-2 text-sm leading-relaxed text-stone-400">
                  {scoring.key_drivers_execution.map((line) => (
                    <li key={line} className="flex gap-2">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-stone-500" aria-hidden />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="space-y-2 rounded-xl border border-dashed border-white/[0.08] bg-titan-black/15 p-4">
              <button
                type="button"
                className="flex w-full items-center justify-between text-left text-[10px] font-semibold uppercase tracking-wider text-stone-500 hover:text-stone-400"
                onClick={() => setDebugOpen((v) => !v)}
              >
                {t("biasEngine.debugToggle")}
                <span className="font-mono text-stone-600">{debugOpen ? "−" : "+"}</span>
              </button>
              {debugOpen ? (
                <ul className="space-y-3 text-xs text-stone-500">
                  {scoring.drivers.map((d) => (
                    <li key={d.id} className="rounded-lg border border-white/[0.05] bg-black/20 p-3">
                      <p className="font-medium text-stone-300">
                        {driverLabel(t, d.id)}
                        {d.is_primary ? (
                          <span className="ml-2 text-[9px] uppercase tracking-wider text-titan-gold/80">{t("biasEngine.primaryTag")}</span>
                        ) : null}
                      </p>
                      <p className="mt-1 leading-relaxed">{d.explanation}</p>
                      <p className="mt-2 font-mono text-[10px] text-stone-600">{d.trigger_conditions.join(" · ")}</p>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>

            <div className="space-y-2 rounded-lg border border-amber-500/15 bg-amber-500/[0.04] px-4 py-3 text-[11px] leading-relaxed text-stone-500">
              <p>{t("biasEngine.disclaimerBias")}</p>
              <p>{t("biasEngine.disclaimerDeterministic")}</p>
            </div>

            <p className="titan-bias-footer text-[11px] leading-relaxed text-stone-600">{t("biasEngine.footer")}</p>
          </div>
        )}
      </div>
    </section>
  );
}
