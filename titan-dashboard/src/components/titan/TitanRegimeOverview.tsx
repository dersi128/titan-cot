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
    <div className="titan-regime-spark flex h-7 items-end gap-0.5" aria-hidden>
      {values.map((v, i) => (
        <span
          key={i}
          className="titan-regime-spark__bar flex-1 rounded-sm bg-current opacity-60"
          style={{ height: `${Math.max(12, (v / max) * 100)}%` }}
        />
      ))}
    </div>
  );
}

type TitanRegimeOverviewProps = {
  cards: RegimeOverviewCard[];
  liveCount: number;
};

export function TitanRegimeOverview({ cards, liveCount }: TitanRegimeOverviewProps) {
  const { t } = useTitanI18n();

  return (
    <section className="titan-regime-overview rounded-2xl border border-white/[0.06] bg-titan-panel/40 p-5 backdrop-blur-md md:p-6">
      <header className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="font-display text-[10px] font-semibold uppercase tracking-[0.28em] text-titan-gold">
            {t("home.regimeOverviewTitle")}
          </p>
          <p className="mt-1 text-xs text-stone-500">{t("home.regimeOverviewSub", { count: liveCount })}</p>
        </div>
      </header>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        {cards.map((card) => (
          <article
            key={card.regime}
            className={`titan-regime-card rounded-xl border border-white/[0.06] px-3 py-3 ${regimeCardAccent(card.regime)}`}
          >
            <p className="text-[9px] font-bold uppercase tracking-[0.14em] opacity-90">
              {t(`positioning.regime.${card.regime}`)}
            </p>
            <p className="mt-2 font-mono text-2xl font-semibold tabular-nums">{card.count}</p>
            <p className="mt-0.5 font-mono text-[11px] tabular-nums opacity-75">{card.pct}%</p>
            <div className="mt-2 text-current">
              <MicroSparkline values={card.spark} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
