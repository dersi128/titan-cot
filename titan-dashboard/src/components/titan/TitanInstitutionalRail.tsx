import type { HomeOverviewStats } from "../../lib/titanHomeOverview";
import type { InstitutionalMarket } from "../../config/institutionalMarkets";
import { CONVICTION_MAX } from "../../lib/titanConviction";
import { scoreHeatClass } from "../../lib/titanCotScore";
import { useTitanI18n } from "../../i18n";

type RailStatProps = {
  title: string;
  value: string;
  caption: string;
  accent?: "gold" | "bull" | "bear" | "neutral";
};

function RailStat({ title, value, caption, accent = "neutral" }: RailStatProps) {
  const accentBar =
    accent === "gold"
      ? "from-titan-gold/70 to-transparent"
      : accent === "bull"
        ? "from-titan-bull/70 to-transparent"
        : accent === "bear"
          ? "from-titan-bear/70 to-transparent"
          : "from-stone-500/40 to-transparent";

  return (
    <article className="titan-rail-stat relative rounded-lg border border-white/[0.06] bg-titan-panel/30 px-3 py-2.5">
      <div className={`absolute inset-y-2 left-0 w-px bg-gradient-to-b ${accentBar}`} />
      <p className="pl-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-stone-500">{title}</p>
      <p className="mt-1 pl-2 font-mono text-lg font-semibold tabular-nums text-stone-100">{value}</p>
      <p className="mt-1 pl-2 text-[10px] leading-snug text-stone-600">{caption}</p>
    </article>
  );
}

function ConvictionMini({ level }: { level: number }) {
  return (
    <span className="titan-conviction-stars shrink-0 text-[10px] tracking-[0.06em]" aria-hidden>
      {Array.from({ length: CONVICTION_MAX }).map((_, i) => (
        <span key={i} className={i < level ? "text-titan-gold/80" : "text-stone-700"}>
          {i < level ? "★" : "☆"}
        </span>
      ))}
    </span>
  );
}

function WatchlistRow({
  entry,
  onSelect,
}: {
  entry: HomeOverviewStats["strongestLongs"][number];
  onSelect: (m: InstitutionalMarket) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(entry.market)}
      className="titan-extreme-row flex w-full items-center gap-2 rounded border border-transparent px-2 py-1.5 text-left transition-colors hover:border-white/[0.06] hover:bg-white/[0.03]"
    >
      <span className="min-w-0 flex-1 truncate font-display text-[11px] font-semibold tracking-wide text-stone-200">
        {entry.market.shortLabel}
      </span>
      <ConvictionMini level={entry.conviction} />
      <span className={`shrink-0 font-mono text-xs font-semibold tabular-nums ${scoreHeatClass(entry.score)}`}>
        {entry.score > 0 ? `+${entry.score}` : entry.score}
      </span>
    </button>
  );
}

function WatchlistSection({
  label,
  entries,
  tone,
  emptyLabel,
  onSelect,
}: {
  label: string;
  entries: HomeOverviewStats["strongestLongs"];
  tone: "bull" | "bear";
  emptyLabel: string;
  onSelect: (m: InstitutionalMarket) => void;
}) {
  return (
    <div>
      <p
        className={`text-[9px] font-semibold uppercase tracking-wider ${
          tone === "bull" ? "text-emerald-400/85" : "text-rose-400/85"
        }`}
      >
        {label}
      </p>
      <div className="mt-1.5 space-y-0.5">
        {entries.length === 0 ? (
          <p className="px-2 py-1 text-[10px] italic text-stone-600">{emptyLabel}</p>
        ) : (
          entries.map((e) => <WatchlistRow key={e.market.id} entry={e} onSelect={onSelect} />)
        )}
      </div>
    </div>
  );
}

type TitanInstitutionalRailProps = {
  stats: HomeOverviewStats;
  onSelectMarket: (market: InstitutionalMarket) => void;
};

export function TitanInstitutionalRail({ stats, onSelectMarket }: TitanInstitutionalRailProps) {
  const { t } = useTitanI18n();

  return (
    <aside className="titan-home-rail hidden w-full shrink-0 xl:block xl:w-[252px]">
      <div className="sticky top-[5.5rem] space-y-2">
        <RailStat
          title={t("rail.smartMoney")}
          value={`${stats.liveCount}/${stats.totalMarkets}`}
          caption={t("rail.smartMoneySub")}
          accent="bull"
        />

        <RailStat
          title={t("rail.dominance")}
          value={`${stats.commercialDominancePct}%`}
          caption={t("home.dominanceCaption")}
          accent="gold"
        />

        <RailStat
          title={t("home.extremeMarketsTitle")}
          value={String(stats.extremeMarketsCount)}
          caption={t("home.extremeMarketsCaption")}
          accent="gold"
        />

        <div className="rounded-lg border border-white/[0.06] bg-titan-panel/30 px-3 py-2.5">
          <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-titan-gold/90">
            {t("home.topExtremesTitle")}
          </p>
          <div className="mt-3 space-y-3">
            <WatchlistSection
              label={t("home.strongestLongs")}
              entries={stats.strongestLongs}
              tone="bull"
              emptyLabel={t("home.noActiveExtremes")}
              onSelect={onSelectMarket}
            />
            <WatchlistSection
              label={t("home.strongestShorts")}
              entries={stats.strongestShorts}
              tone="bear"
              emptyLabel={t("home.noActiveExtremes")}
              onSelect={onSelectMarket}
            />
          </div>
        </div>
      </div>
    </aside>
  );
}
