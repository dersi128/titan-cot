import { useMemo } from "react";
import type { CotDashboardData } from "../../../types";
import type { InstitutionalMarket } from "../../../config/institutionalMarkets";
import { INSTITUTIONAL_MARKETS } from "../../../config/institutionalMarkets";
import type { AppSection, NavigateSectionOptions } from "../../../lib/titanAppRoute";
import { buildHomeOverviewStats, selectHighestConviction } from "../../../lib/titanHomeOverview";
import { FLOW_MAP_CLASSES } from "../../../lib/titanHomeMock";
import { CONVICTION_MAX } from "../../../lib/titanConviction";
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

  const highestConviction = useMemo(() => selectHighestConviction(rows), [rows]);

  const flowMap = useMemo(() => buildFlowMapFromRows(rows), [rows]);

  return (
    <div className="titan-cmd titan-cmd--home titan-page-module">
      <section className="titan-cmd-flow-wrap" aria-label={t("home.cmdFlowMap")}>
        <GlassCard className="titan-cmd-flow-card">
          <h3 className="titan-cmd-kicker">{t("home.cmdFlowMap")}</h3>
          <ul className="titan-cmd-flow">
            {FLOW_MAP_CLASSES.map((cls) => {
              const cell = flowMap[cls];
              return (
                <li key={cls} className="titan-cmd-flow__cell">
                  <span className="titan-cmd-flow__class">{t(`home.cmdFlowClass.${cls}`)}</span>
                  {cell ? (
                    <>
                      <span
                        className={`titan-regime-pill titan-cmd-flow__badge ${regimePillClass(cell.regime, cell.score)}`}
                      >
                        {t(`positioning.regime.${cell.regime}`)}
                      </span>
                      <span className={`titan-cmd-flow__dir ${flowToneClass(cell.direction)}`}>
                        {t(`home.cmdFlowDir.${cell.direction}`)}
                      </span>
                    </>
                  ) : (
                    <span className="titan-cmd-flow__empty">—</span>
                  )}
                </li>
              );
            })}
          </ul>
        </GlassCard>
      </section>

      <HomePulseCards bundle={bundle} onNavigate={onNavigate} />

      <section className="titan-home-row titan-home-row--watch" aria-label={t("home.cmdConvictionStrip")}>
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
        <GlassCard glow="cyan" className="titan-cmd-conviction p-2">
          <h3 className="titan-cmd-kicker">{t("home.cmdHighestConviction")}</h3>
          <ul className="titan-cmd-watch__list">
            {highestConviction.length === 0 ? (
              <li className="titan-cmd-watch__empty">{t("home.noActiveExtremes")}</li>
            ) : (
              highestConviction.map((e) => (
                <li key={e.market.id}>
                  <button
                    type="button"
                    onClick={() => onSelectMarket(e.market)}
                    className="titan-cmd-watch__row"
                  >
                    <span className="titan-cmd-watch__name">{e.market.shortLabel}</span>
                    <span className="titan-cmd-watch__conv">
                      {e.conviction}/{CONVICTION_MAX}
                    </span>
                    <ConvictionMini level={e.conviction} />
                  </button>
                </li>
              ))
            )}
          </ul>
        </GlassCard>
        <GlassCard className="titan-cmd-shifts p-2">
          <h3 className="titan-cmd-kicker">{t("home.cmdRegimeShifts")}</h3>
          <ul className="titan-cmd-shifts__list">
            {stats.regimeShifts.length === 0 ? (
              <li className="titan-cmd-watch__empty">{t("home.noRegimeShifts")}</li>
            ) : (
              stats.regimeShifts.map((s) => {
                const extreme = s.to === "extreme_short" || s.to === "extreme_long";
                const arrow = s.tone === "bull" ? "↑" : s.tone === "bear" ? "↓" : "→";
                return (
                  <li key={s.market.id}>
                    <button
                      type="button"
                      onClick={() => onSelectMarket(s.market)}
                      className="titan-cmd-watch__row titan-cmd-shift"
                    >
                      <span className="titan-cmd-watch__name">{s.market.shortLabel}</span>
                      <span className="titan-cmd-shift__path">
                        <span>{t(`positioning.zones.${s.from}`)}</span>
                        <span
                          className={`titan-cmd-shift__arrow titan-cmd-shift__arrow--${s.tone}`}
                          aria-hidden
                        >
                          {arrow}
                        </span>
                        <span className={extreme ? "titan-cmd-shift__to--extreme" : undefined}>
                          {t(`positioning.zones.${s.to}`)}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </GlassCard>
      </section>
    </div>
  );
}
