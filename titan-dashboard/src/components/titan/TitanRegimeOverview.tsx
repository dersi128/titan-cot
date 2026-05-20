import type { RegimeOverviewCard } from "../../lib/titanHomeOverview";
import type { MarketRegimeId } from "../../lib/titanCommercialIndex";
import { useTitanI18n } from "../../i18n";

function regimeCardAccent(regime: MarketRegimeId): string {
  if (regime === "accumulation" || regime === "trending") return "titan-regime-card--bull";
  if (regime === "distribution") return "titan-regime-card--bear";
  if (regime === "exhaustion" || regime === "transition") return "titan-regime-card--warn";
  return "titan-regime-card--neutral";
}

function MicroSparkline({ values }: { values: number[] }) {
  const max = Math.max(...values, 0.01);
  return (
    <div className="titan-regime-spark flex h-4 items-end gap-px" aria-hidden>
      {values.map((v, i) => (
        <span
          key={i}
          className="titan-regime-spark__bar flex-1 rounded-[1px] bg-current"
          style={{ height: `${Math.max(20, (v / max) * 100)}%`, opacity: 0.22 + (i / values.length) * 0.18 }}
        />
      ))}
    </div>
  );
}

type TitanRegimeOverviewProps = {
  cards: RegimeOverviewCard[];
  liveCount: number;
  totalMarkets: number;
};

export function TitanRegimeOverview({ cards, liveCount, totalMarkets }: TitanRegimeOverviewProps) {
  const { t } = useTitanI18n();

  return (
    <section className="titan-regime-overview rounded-lg border border-white/[0.06] bg-titan-panel/35 px-4 py-3 backdrop-blur-md">
      <header className="mb-2.5 flex flex-wrap items-end justify-between gap-1">
        <div>
          <p className="font-display text-[9px] font-semibold uppercase tracking-[0.26em] text-titan-gold/90">
            {t("home.regimeOverviewTitle")}
          </p>
          <p className="mt-0.5 text-[10px] text-stone-600">{t("home.regimeOverviewSub", { count: liveCount })}</p>
        </div>
      </header>
      <div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        {cards.map((card) => (
          <article
            key={card.regime}
            className={`titan-regime-card flex min-h-[4.5rem] flex-col rounded-md border border-white/[0.05] px-2 py-2 ${regimeCardAccent(card.regime)}`}
          >
            <p className="truncate text-[8px] font-bold uppercase tracking-[0.12em] opacity-85">
              {t(`positioning.regime.${card.regime}`)}
            </p>
            <p className="mt-1 font-mono text-lg font-semibold leading-none tabular-nums">{card.count}</p>
            <p className="mt-0.5 font-mono text-[9px] tabular-nums opacity-70">
              {t("home.regimeMarketsOf", { count: card.count, total: totalMarkets })}
            </p>
            <p className="font-mono text-[9px] tabular-nums opacity-55">{card.pct}%</p>
            <div className="mt-auto pt-1 text-current">
              <MicroSparkline values={card.spark} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
