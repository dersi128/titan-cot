import { useMemo } from "react";
import type { CotDashboardData } from "../../../types";
import type { InstitutionalMarket } from "../../../config/institutionalMarkets";
import { INSTITUTIONAL_MARKETS } from "../../../config/institutionalMarkets";
import type { AppSection } from "../../../lib/titanAppRoute";
import { buildHomeOverviewStats } from "../../../lib/titanHomeOverview";
import { HOME_OVERVIEW_MOCK, HOME_REGIME_SHIFTS_MOCK } from "../../../lib/titanHomeMock";
import { convictionRankScore, CONVICTION_MAX } from "../../../lib/titanConviction";
import { useTitanI18n } from "../../../i18n";
import type { ScannerRowModel } from "../GlobalCotScanner";
import {
  buildFlowMapFromRows,
  ConvictionMini,
  flowToneClass,
  GlassCard,
  regimePillClass,
  WatchlistPanel,
} from "../ui/titanCmdShared";
import { FLOW_MAP_CLASSES } from "../../../lib/titanHomeMock";

type TitanHomePageProps = {
  rows: ScannerRowModel[];
  bundle: Record<string, CotDashboardData>;
  onSelectMarket: (market: InstitutionalMarket) => void;
  onNavigate: (section: AppSection) => void;
};

function ModuleLaunchCard({
  title,
  description,
  onOpen,
}: {
  title: string;
  description: string;
  onOpen: () => void;
}) {
  return (
    <button type="button" onClick={onOpen} className="titan-module-card group text-left">
      <p className="titan-cmd-kicker">{title}</p>
      <p className="mt-2 text-[12px] leading-snug text-stone-400 group-hover:text-stone-300">{description}</p>
      <span className="titan-module-card__cta mt-3 inline-block font-mono text-[10px] uppercase tracking-[0.14em] text-titan-gold/80">
        →
      </span>
    </button>
  );
}

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

  const dominantRegimeCard = useMemo(() => {
    const top = [...stats.regimeCards].sort((a, b) => b.count - a.count).find((c) => c.count > 0);
    if (!top) return HOME_OVERVIEW_MOCK.regime.value;
    return `${t(`positioning.regime.${top.regime}`)} · ${top.pct}%`;
  }, [stats.regimeCards, t]);

  return (
    <div className="titan-cmd space-y-4 md:space-y-5">
      <section className="titan-cmd-overview" aria-label={t("home.cmdOverview")}>
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4 lg:gap-3">
          <GlassCard glow="gold">
            <p className="titan-cmd-kicker">{t("home.cmdDmeTitle")}</p>
            <p className="titan-cmd-value mt-2">{HOME_OVERVIEW_MOCK.dme.value}</p>
            <p className="titan-cmd-sub mt-1">{HOME_OVERVIEW_MOCK.dme.sub}</p>
          </GlassCard>
          <GlassCard>
            <p className="titan-cmd-kicker">{t("home.cmdRegimeTitle")}</p>
            <p className="titan-cmd-value mt-2">{dominantRegimeCard}</p>
            <p className="titan-cmd-sub mt-1">{t("home.cmdRegimeSub", { count: String(stats.liveCount) })}</p>
          </GlassCard>
          <GlassCard>
            <p className="titan-cmd-kicker">{t("home.cmdFlowTitle")}</p>
            <p className="titan-cmd-value mt-2 font-mono">{HOME_OVERVIEW_MOCK.flow.value}</p>
            <p className="titan-cmd-sub mt-1">{HOME_OVERVIEW_MOCK.flow.sub}</p>
          </GlassCard>
          <GlassCard>
            <p className="titan-cmd-kicker">{t("home.cmdBreadthTitle")}</p>
            <p className="titan-cmd-value mt-2 font-mono">{HOME_OVERVIEW_MOCK.breadth.value}</p>
            <p className="titan-cmd-sub mt-1">
              {stats.commercialDominancePct}% {t("home.dominanceCaption")}
            </p>
          </GlassCard>
        </div>
      </section>

      <section className="grid gap-2 sm:grid-cols-3" aria-label={t("nav.modules")}>
        <ModuleLaunchCard
          title={t("nav.scanner")}
          description={t("home.moduleScannerDesc")}
          onOpen={() => onNavigate("scanner")}
        />
        <ModuleLaunchCard
          title={t("nav.seasonality")}
          description={t("home.moduleSeasonalityDesc")}
          onOpen={() => onNavigate("seasonality")}
        />
        <ModuleLaunchCard
          title={t("nav.dme")}
          description={t("home.moduleDmeDesc")}
          onOpen={() => onNavigate("dme")}
        />
      </section>

      <section className="grid gap-2 md:grid-cols-2 xl:grid-cols-4 xl:gap-3" aria-label={t("home.cmdConvictionStrip")}>
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
        <GlassCard className="p-3">
          <h3 className="titan-cmd-kicker">{t("home.cmdRegimeShifts")}</h3>
          <ul className="mt-2.5 space-y-2">
            {HOME_REGIME_SHIFTS_MOCK.map((s) => (
              <li key={s.market} className="rounded border border-white/[0.05] bg-black/25 px-2 py-1.5">
                <p className="font-display text-[11px] font-semibold tracking-wide text-stone-200">{s.market}</p>
                <p className="mt-0.5 text-[10px] text-stone-500">
                  <span className="text-stone-600">{s.from}</span>
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
                    {s.to}
                  </span>
                </p>
              </li>
            ))}
          </ul>
        </GlassCard>
      </section>

      <section className="lg:col-span-3" aria-label={t("home.cmdFlowMap")}>
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
    </div>
  );
}
