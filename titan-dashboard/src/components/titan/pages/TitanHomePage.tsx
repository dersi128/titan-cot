import { useMemo } from "react";
import type { CotDashboardData } from "../../../types";
import type { InstitutionalMarket } from "../../../config/institutionalMarkets";
import { INSTITUTIONAL_MARKETS } from "../../../config/institutionalMarkets";
import type { AppSection, NavigateSectionOptions } from "../../../lib/titanAppRoute";
import { buildHomeOverviewStats } from "../../../lib/titanHomeOverview";
import { FLOW_MAP_CLASSES } from "../../../lib/titanHomeMock";
import { convictionRankScore, CONVICTION_MAX } from "../../../lib/titanConviction";
import { useTitanI18n } from "../../../i18n";
import type { ScannerRowModel } from "../GlobalCotScanner";
import { HomePulseCards } from "../home/HomePulseCards";
import {
  buildFlowMapFromRows,
  ConvictionMini,
  flowToneClass,
  GlassCard,
  regimePillClass,
  WatchlistPanel,
} from "../ui/titanCmdShared";

type TitanHomePageProps = {
  rows: ScannerRowModel[];
  bundle: Record<string, CotDashboardData>;
  onSelectMarket: (market: InstitutionalMarket) => void;
  onNavigate: (section: AppSection, options?: NavigateSectionOptions) => void;
};

export function TitanHomePage({ rows, bundle, onSelectMarket, onNavigate }: TitanHomePageProps) {
  const { t } = useTitanI18n();

  const homeRows = useMemo(
    () =>
      rows.map((r) => ({
        market: r.market,
        score: r.score,
        conviction: r.conviction,
        persistenceWeeks: r.persistenceWeeks,
        regime: r.regime,
        status: r.status,
      })),
    [rows],
  );

  const stats = useMemo(
    () => buildHomeOverviewStats(INSTITUTIONAL_MARKETS, bundle, homeRows),
    [bundle, homeRows],
  );

  const highestConviction = useMemo(() => {
    return rows
      .filter((r) => r.status === "live")
      .map((r) => ({
        market: r.market,
        score: r.score,
        conviction: r.conviction,
        rank: convictionRankScore(r.score, r.conviction, r.persistenceWeeks),
      }))
      .sort((a, b) => b.rank - a.rank)
      .slice(0, 4);
  }, [rows]);

  const flowMap = useMemo(() => buildFlowMapFromRows(rows), [rows]);

  return (
    <div className="titan-cmd space-y-3 md:space-y-4">
      <section aria-label={t("home.cmdFlowMap")}>
        <GlassCard className="p-3">
          <h3 className="titan-cmd-kicker">{t("home.cmdFlowMap")}</h3>
          <ul className="mt-3 grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {FLOW_MAP_CLASSES.map((cls) => {
              const cell = flowMap[cls];
              return (
                <li
                  key={cls}
                  className="titan-cmd-flow-row grid grid-cols-[4.5rem_1fr_auto] items-center gap-2 rounded border border-white/[0.04] px-2 py-1.5"
                >
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                    {t(`home.cmdFlowClass.${cls}`)}
                  </span>
                  {cell ? (
                    <>
                      <span
                        className={`titan-regime-pill inline-flex max-w-full items-center justify-center px-1.5 py-0.5 text-[8px] font-bold uppercase ${regimePillClass(cell.regime)}`}
                      >
                        {t(`positioning.regime.${cell.regime}`)}
                      </span>
                      <span className={`text-right font-mono text-[10px] font-semibold uppercase ${flowToneClass(cell.direction)}`}>
                        {t(`home.cmdFlowDir.${cell.direction}`)}
                      </span>
                    </>
                  ) : (
                    <span className="col-span-2 text-[10px] text-stone-600">—</span>
                  )}
                </li>
              );
            })}
          </ul>
        </GlassCard>
      </section>

      <HomePulseCards bundle={bundle} onNavigate={onNavigate} />

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4" aria-label={t("home.cmdConvictionStrip")}>
        <WatchlistPanel
          title={t("home.strongestLongs")}
          entries={stats.strongestLongs}
          tone="bull"
          emptyLabel={t("home.noActiveExtremes")}
          onSelect={onSelectMarket}
        />
        <WatchlistPanel
          title={t("home.strongestShorts")}
          entries={stats.strongestShorts}
          tone="bear"
          emptyLabel={t("home.noActiveExtremes")}
          onSelect={onSelectMarket}
        />
        <GlassCard glow="gold" className="p-3">
          <h3 className="titan-cmd-kicker">{t("home.cmdHighestConviction")}</h3>
          <ul className="mt-2.5 space-y-0.5">
            {highestConviction.length === 0 ? (
              <li className="py-3 text-[11px] text-stone-600">{t("home.noActiveExtremes")}</li>
            ) : (
              highestConviction.map((e) => (
                <li key={e.market.id}>
                  <button
                    type="button"
                    onClick={() => onSelectMarket(e.market)}
                    className="titan-cmd-watch__row flex w-full items-center gap-2 rounded px-1.5 py-1.5 text-left"
                  >
                    <span className="min-w-0 flex-1 truncate font-display text-[11px] font-semibold text-stone-200">
                      {e.market.shortLabel}
                    </span>
                    <span className="font-mono text-[10px] text-titan-gold/90">
                      {e.conviction}/{CONVICTION_MAX}
                    </span>
                    <ConvictionMini level={e.conviction} />
                  </button>
                </li>
              ))
            )}
          </ul>
        </GlassCard>
        <GlassCard glow="gold" className="p-3">
          <h3 className="titan-cmd-kicker">{t("home.cmdRegimeShifts")}</h3>
          <ul className="mt-2.5 space-y-2">
            {stats.regimeShifts.length === 0 ? (
              <li className="py-3 text-[11px] text-stone-600">{t("home.noRegimeShifts")}</li>
            ) : (
              stats.regimeShifts.map((s) => (
                <li key={s.market.id}>
                  <button
                    type="button"
                    onClick={() => onSelectMarket(s.market)}
                    className="w-full rounded border border-white/[0.05] bg-black/25 px-2 py-1.5 text-left transition hover:border-white/10"
                  >
                    <p className="font-display text-[11px] font-semibold tracking-wide text-stone-200">
                      {s.market.shortLabel}
                    </p>
                    <p className="mt-0.5 text-[10px] text-stone-500">
                      <span className="text-stone-600">{t(`positioning.zones.${s.from}`)}</span>
                      <span className="mx-1 text-titan-gold/60">→</span>
                      <span
                        className={
                          s.tone === "bull"
                            ? "text-emerald-400/90"
                            : s.tone === "bear"
                              ? "text-rose-400/90"
                              : "text-amber-300/90"
                        }
                      >
                        {t(`positioning.zones.${s.to}`)}
                      </span>
                    </p>
                  </button>
                </li>
              ))
            )}
          </ul>
        </GlassCard>
      </section>
    </div>
  );
}
