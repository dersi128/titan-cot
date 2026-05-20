import type { HomeOverviewStats } from "../../lib/titanHomeOverview";
import type { InstitutionalMarket } from "../../config/institutionalMarkets";
import { scoreHeatClass } from "../../lib/titanCotScore";
import { useTitanI18n } from "../../i18n";

type RailCardProps = {
  title: string;
  value: string;
  sub?: string;
  accent?: "gold" | "bull" | "bear" | "neutral";
};

function RailCard({ title, value, sub, accent = "neutral" }: RailCardProps) {
  const accentBar =
    accent === "gold"
      ? "from-titan-gold/80 to-transparent"
      : accent === "bull"
        ? "from-titan-bull/80 to-transparent"
        : accent === "bear"
          ? "from-titan-bear/80 to-transparent"
          : "from-stone-500/50 to-transparent";

  return (
    <article className="titan-rail-card group relative overflow-hidden rounded-2xl p-4">
      <div className={`absolute inset-y-0 left-0 w-0.5 bg-gradient-to-b ${accentBar}`} />
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-titan-muted">{title}</p>
      <p className="mt-2 font-mono text-xl font-semibold tabular-nums text-titan-text">{value}</p>
      {sub ? <p className="mt-1 text-[11px] leading-snug text-titan-muted">{sub}</p> : null}
    </article>
  );
}

function WatchlistRow({
  entry,
  onSelect,
}: {
  entry: HomeOverviewStats["strongestLongs"][number];
  onSelect: (m: InstitutionalMarket) => void;
}) {
  const { t } = useTitanI18n();
  return (
    <button
      type="button"
      onClick={() => onSelect(entry.market)}
      className="titan-extreme-row flex w-full items-center justify-between gap-2 rounded-lg border border-transparent px-2 py-1.5 text-left transition-colors hover:border-white/[0.08] hover:bg-white/[0.03]"
    >
      <span className="min-w-0 truncate font-display text-xs font-semibold tracking-wide text-stone-200">
        {entry.market.shortLabel}
      </span>
      <span className="shrink-0 font-mono text-[10px] tabular-nums text-stone-500">
        {entry.conviction}/{t("home.convictionMax")}
      </span>
      <span className={`shrink-0 font-mono text-sm font-semibold tabular-nums ${scoreHeatClass(entry.score)}`}>
        {entry.score > 0 ? `+${entry.score}` : entry.score}
      </span>
    </button>
  );
}

type TitanInstitutionalRailProps = {
  stats: HomeOverviewStats;
  onSelectMarket: (market: InstitutionalMarket) => void;
};

export function TitanInstitutionalRail({ stats, onSelectMarket }: TitanInstitutionalRailProps) {
  const { t } = useTitanI18n();

  return (
    <aside className="hidden w-full shrink-0 xl:block xl:w-[280px]">
      <div className="sticky top-28 space-y-3">
        <RailCard
          title={t("rail.smartMoney")}
          value={`${stats.liveCount}/${stats.totalMarkets}`}
          sub={t("rail.smartMoneySub")}
          accent="bull"
        />

        <RailCard
          title={t("rail.dominance")}
          value={`${stats.commercialDominancePct}%`}
          sub={t("rail.dominanceSub")}
          accent="gold"
        />

        <RailCard
          title={t("home.extremeMarketsTitle")}
          value={String(stats.extremeMarketsCount)}
          sub={t("home.extremeMarketsSub", { count: stats.extremeMarketsCount })}
          accent="gold"
        />

        <div className="titan-glass-premium rounded-2xl p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-titan-gold">
            {t("home.topExtremesTitle")}
          </p>

          <p className="mt-4 text-[9px] font-semibold uppercase tracking-wider text-emerald-400/90">
            {t("home.strongestLongs")}
          </p>
          <div className="mt-2 space-y-0.5">
            {stats.strongestLongs.length === 0 ? (
              <p className="text-[11px] text-stone-600">—</p>
            ) : (
              stats.strongestLongs.map((e) => (
                <WatchlistRow key={e.market.id} entry={e} onSelect={onSelectMarket} />
              ))
            )}
          </div>

          <p className="mt-4 text-[9px] font-semibold uppercase tracking-wider text-rose-400/90">
            {t("home.strongestShorts")}
          </p>
          <div className="mt-2 space-y-0.5">
            {stats.strongestShorts.length === 0 ? (
              <p className="text-[11px] text-stone-600">—</p>
            ) : (
              stats.strongestShorts.map((e) => (
                <WatchlistRow key={e.market.id} entry={e} onSelect={onSelectMarket} />
              ))
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
