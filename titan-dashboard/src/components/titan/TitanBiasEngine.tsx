import { useState } from "react";
import { useTitanI18n } from "../../i18n";
import type { CotDashboardData } from "../../types";
import type { InstitutionalMarket } from "../../config/institutionalMarkets";
import {
  DRIVER_POINTS_MAX_ABS,
  driverBarSegments,
  impactToneForDriver,
  type ImpactTone,
} from "../../lib/titanBiasEngineView";
import { getTitanCotRead, type TitanCotScoringResult } from "../../lib/titanCotScore";
import type { BiasDriverId } from "../../lib/titanCotScoringCore";

function driverLabel(t: (key: string, vars?: Record<string, string | number>) => string, id: BiasDriverId): string {
  return t(`biasEngine.drivers.${id}.name`);
}

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

type TitanBiasEngineAnalyticsProps = {
  scoring: TitanCotScoringResult;
  transparencyOpen: boolean;
  setTransparencyOpen: (v: boolean | ((prev: boolean) => boolean)) => void;
};

export function TitanBiasEngineAnalytics({
  scoring,
  transparencyOpen,
  setTransparencyOpen,
}: TitanBiasEngineAnalyticsProps) {
  const { t } = useTitanI18n();

  return (
    <div className="titan-bias-analytics space-y-4">
      <div className="titan-bias-structural rounded-lg border border-white/[0.06] bg-titan-black/15 px-4 py-3">
        <p className="titan-bias-kicker text-titan-gold/85">{t("biasEngine.structuralTitle")}</p>
        <ul className="titan-bias-structural__list mt-2.5 space-y-1.5">
          {scoring.key_drivers_structural.map((line) => (
            <li key={line} className="titan-bias-bullet text-[13px] leading-snug text-stone-400">
              <span className="titan-bias-bullet__dot" aria-hidden />
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="titan-bias-execution-note px-0.5 text-[11px] leading-relaxed text-stone-600">
        {t("biasEngine.executionLine1")}
        <span className="block text-stone-700">{t("biasEngine.executionLine2")}</span>
      </p>

      <div className="titan-bias-transparency">
        <button
          type="button"
          className="titan-bias-transparency__toggle flex w-full items-center justify-between border-y border-white/[0.06] py-2.5 text-left"
          onClick={() => setTransparencyOpen((v) => !v)}
          aria-expanded={transparencyOpen}
        >
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-500">
            {t("biasEngine.transparencyToggle")}
          </span>
          <span className="font-mono text-xs text-stone-600" aria-hidden>
            {transparencyOpen ? "−" : "+"}
          </span>
        </button>

        {transparencyOpen ? (
          <div className="titan-bias-transparency__body space-y-4 border-b border-white/[0.06] py-4">
            <div className="titan-bias-table-wrap overflow-x-auto opacity-90">
              <table className="titan-bias-table w-full min-w-[480px] text-left text-[11px]">
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
                        <td className="font-medium text-stone-300">
                          {driverLabel(t, row.id)}
                          {isPrimary ? (
                            <span className="ml-2 text-[9px] uppercase tracking-wider text-titan-gold/70">
                              {t("biasEngine.primaryTag")}
                            </span>
                          ) : null}
                        </td>
                        <td className="font-mono text-stone-600">{row.importance}</td>
                        <td className={impactToneClass(impactKey)}>{row.impact}</td>
                        <td
                          className={`font-mono tabular-nums ${tone === "bear" ? "text-rose-400/90" : tone === "bull" ? "text-emerald-400/90" : "text-stone-500"}`}
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
                    <td className="font-semibold text-stone-400">{t("biasEngine.col.totalRow")}</td>
                    <td />
                    <td />
                    <td
                      className={`font-mono text-xs font-semibold tabular-nums ${
                        scoring.score < 0 ? "text-rose-400/90" : scoring.score > 0 ? "text-emerald-400/90" : "text-stone-500"
                      }`}
                    >
                      {scoring.score > 0 ? `+${scoring.score}` : scoring.score}
                    </td>
                    <td />
                  </tr>
                </tbody>
              </table>
            </div>

            <ul className="space-y-2">
              {scoring.drivers.map((d) => (
                <li
                  key={d.id}
                  className="rounded-lg border border-white/[0.05] bg-black/20 px-3 py-2.5 text-xs text-stone-500"
                >
                  <p className="font-medium text-stone-400">
                    {driverLabel(t, d.id)}
                    {d.is_primary ? (
                      <span className="ml-2 text-[9px] uppercase tracking-wider text-titan-gold/70">
                        {t("biasEngine.primaryTag")}
                      </span>
                    ) : null}
                  </p>
                  <p className="mt-1 leading-relaxed">{d.explanation}</p>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}

type TitanBiasEngineProps = {
  market: InstitutionalMarket;
  data: CotDashboardData | null;
  loading: boolean;
  embedded?: boolean;
};

/** Standalone bias panel (e.g. legacy AiVerdict wrapper). Market detail uses MarketDetailHeroBias. */
export function TitanBiasEngine({ market: _market, data, loading, embedded = false }: TitanBiasEngineProps) {
  const { t } = useTitanI18n();
  const [transparencyOpen, setTransparencyOpen] = useState(false);

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

  return (
    <section
      className={`titan-bias-engine relative titan-bias-engine--${panelTone} overflow-hidden backdrop-blur-xl ${
        embedded ? "rounded-none border-0 bg-transparent" : "rounded-2xl border border-titan-gold/15"
      }`}
    >
      {embedded ? null : <div className="titan-bias-engine__backdrop pointer-events-none absolute inset-0" aria-hidden />}
      {embedded ? null : (
        <header className="relative border-b border-white/[0.06] px-5 py-3 md:px-6">
          <h3 className="font-display text-[10px] font-semibold uppercase tracking-[0.32em] text-titan-gold">
            {t("biasEngine.title")}
          </h3>
        </header>
      )}

      <div className={`relative ${embedded ? "px-0 py-0" : "px-5 py-4 md:px-6 md:py-5"}`}>
        {loading ? (
          <div className="space-y-3">
            <div className="h-20 animate-pulse rounded-lg bg-white/[0.03]" />
            <div className="h-6 animate-pulse rounded bg-white/[0.02]" />
          </div>
        ) : !scoring || !data ? (
          <p className="text-sm text-stone-500">{t("biasEngine.unavailable")}</p>
        ) : (
          <TitanBiasEngineAnalytics
            scoring={scoring}
            transparencyOpen={transparencyOpen}
            setTransparencyOpen={setTransparencyOpen}
          />
        )}
      </div>
    </section>
  );
}
