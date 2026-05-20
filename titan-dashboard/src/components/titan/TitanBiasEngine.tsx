import type { CotDashboardData, CotVerdict } from "../../types";
import type { InstitutionalMarket } from "../../config/institutionalMarkets";
import {
  buildTitanBiasEngineView,
  driverBarSegments,
  type ImpactTone,
} from "../../lib/titanBiasEngineView";
import { getTitanCotRead, scoreHeatClass, verdictAccentClass } from "../../lib/titanCotScore";
import { useTitanI18n } from "../../i18n";

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
  const scoring = data ? getTitanCotRead(data) : null;
  const view = data && scoring ? buildTitanBiasEngineView(data, scoring) : null;

  const panelTone =
    view && view.score < 0 ? "bear" : view && view.score > 0 ? "bull" : "neutral";

  return (
    <section className={`titan-bias-engine relative titan-bias-engine--${panelTone} overflow-hidden rounded-2xl border border-titan-gold/15 backdrop-blur-xl`}>
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
        ) : !view ? (
          <p className="text-sm text-stone-500">{t("biasEngine.unavailable")}</p>
        ) : (
          <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-5">
              <div className="titan-bias-verdict">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="titan-bias-kicker">{t("biasEngine.totalScore")}</p>
                    <p className={`titan-bias-score ${scoreHeatClass(view.score)}`}>
                      {view.score}
                      <span className="titan-bias-score__scale"> / 100</span>
                    </p>
                  </div>
                  {view.persistenceWeeks > 0 ? (
                    <span className="titan-bias-badge">
                      {t("biasEngine.extremeBadge", { weeks: String(view.persistenceWeeks) })}
                    </span>
                  ) : null}
                </div>
                <div className="mt-4 border-t border-white/[0.06] pt-4">
                  <p className="titan-bias-kicker">{t("biasEngine.verdictLabel")}</p>
                  <p className={`titan-bias-verdict__text ${verdictAccentClass(view.verdict as CotVerdict)}`}>
                    {view.verdict}
                  </p>
                  <p className="mt-1 text-[10px] uppercase tracking-wider text-stone-600">{t("biasEngine.biasOnly")}</p>
                </div>
                <dl className="mt-4 grid gap-2 sm:grid-cols-2">
                  <div>
                    <dt className="titan-bias-kicker">{t("biasEngine.primaryDriver")}</dt>
                    <dd className="mt-0.5 text-sm font-medium text-stone-200">
                      {t(`biasEngine.drivers.${view.primaryDriverId}.name`)}
                    </dd>
                  </div>
                  <div>
                    <dt className="titan-bias-kicker">{t("biasEngine.source")}</dt>
                    <dd className="mt-0.5 text-sm text-stone-400">{t("biasEngine.sourceValue")}</dd>
                  </div>
                </dl>
              </div>

              <div className="titan-bias-table-wrap overflow-x-auto">
                <p className="titan-bias-kicker mb-3 px-1">{t("biasEngine.tableTitle")}</p>
                <table className="titan-bias-table w-full min-w-[520px] text-left">
                  <thead>
                    <tr>
                      <th>{t("biasEngine.col.driver")}</th>
                      <th>{t("biasEngine.col.weight")}</th>
                      <th>{t("biasEngine.col.impact")}</th>
                      <th>{t("biasEngine.col.score")}</th>
                      <th>{t("biasEngine.col.bar")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {view.drivers.map((row) => {
                      const isPrimary = row.id === view.primaryDriverId;
                      const tone = scoreTone(row.score);
                      const filled = driverBarSegments(row.score, row.maxAbs);
                      return (
                        <tr key={row.id} className={isPrimary ? "titan-bias-table__row--primary" : undefined}>
                          <td className="font-medium text-stone-200">
                            {t(`biasEngine.drivers.${row.id}.name`)}
                            {isPrimary ? (
                              <span className="ml-2 text-[9px] uppercase tracking-wider text-titan-gold/80">
                                {t("biasEngine.primaryTag")}
                              </span>
                            ) : null}
                          </td>
                          <td className="font-mono text-stone-500">{row.weightPct}%</td>
                          <td className={impactToneClass(row.impact)}>{t(`biasEngine.impact.${row.impact}`)}</td>
                          <td className={`font-mono tabular-nums ${tone === "bear" ? "text-rose-400" : tone === "bull" ? "text-emerald-400" : "text-stone-500"}`}>
                            {row.score > 0 ? `+${row.score}` : row.score}
                          </td>
                          <td>
                            <SegmentedBar filled={filled} tone={tone} />
                          </td>
                        </tr>
                      );
                    })}
                    <tr className="titan-bias-table__row--total">
                      <td className="font-semibold text-stone-300">{t("biasEngine.col.total")}</td>
                      <td />
                      <td />
                      <td
                        className={`font-mono text-sm font-semibold tabular-nums ${
                          view.componentsSum < 0 ? "text-rose-400" : view.componentsSum > 0 ? "text-emerald-400" : "text-stone-500"
                        }`}
                      >
                        {view.componentsSum > 0 ? `+${view.componentsSum}` : view.componentsSum}
                      </td>
                      <td />
                    </tr>
                  </tbody>
                </table>
                <p className="mt-3 px-1 text-[10px] leading-relaxed text-stone-600">{t("biasEngine.weightNote")}</p>
                <p className="mt-2 px-1 text-[10px] text-stone-600">{t("biasEngine.dataNote")}</p>
              </div>
            </div>

            <aside className="titan-bias-aside flex flex-col justify-between gap-4">
              <div className="titan-bias-summary">
                <p className="titan-bias-kicker text-titan-gold/90">{t("biasEngine.keyDriversTitle")}</p>
                <ul className="mt-4 space-y-3">
                  {view.keyDrivers.map((key) => (
                    <li key={key} className="titan-bias-bullet">
                      <span className="titan-bias-bullet__dot" aria-hidden />
                      <span>{t(`biasEngine.bullets.${key}`)}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <p className="titan-bias-footer text-[11px] leading-relaxed text-stone-600">{t("biasEngine.footer")}</p>
            </aside>
          </div>
        )}
      </div>
    </section>
  );
}
