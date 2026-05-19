import { INSTITUTIONAL_MARKETS } from "../../config/institutionalMarkets";
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

/** Decorative institutional widgets — visual context, not live macro feeds. */
export function TitanInstitutionalRail({ liveCount }: { liveCount: number }) {
  const { t } = useTitanI18n();

  return (
    <aside className="hidden w-full shrink-0 xl:block xl:w-[280px]">
      <div className="sticky top-28 space-y-3">
        <div className="titan-glass-premium rounded-2xl p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-titan-gold">
            {t("rail.eyebrow")}
          </p>
          <p className="mt-1 text-sm text-titan-muted">{t("rail.sub")}</p>
        </div>

        <RailCard
          title={t("rail.aiRegime")}
          value={t("rail.aiRegimeValue")}
          sub={t("rail.aiRegimeSub")}
          accent="gold"
        />
        <RailCard
          title={t("rail.smartMoney")}
          value={`${liveCount}/${INSTITUTIONAL_MARKETS.length}`}
          sub={t("rail.smartMoneySub")}
          accent="bull"
        />
        <RailCard title={t("rail.dominance")} value="68%" sub={t("rail.dominanceSub")} accent="gold" />
        <RailCard title={t("rail.macroRisk")} value={t("rail.macroRiskValue")} sub={t("rail.macroRiskSub")} />
        <RailCard title={t("rail.dxy")} value="104.2" sub={t("rail.dxySub")} accent="neutral" />

        <div className="titan-glass-premium rounded-2xl p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-titan-muted">
              {t("rail.pressure")}
            </p>
            <span className="titan-ai-pill">{t("rail.aiLive")}</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/40">
            <span className="titan-pressure-bar block h-full w-[62%] rounded-full" />
          </div>
          <p className="mt-2 text-[11px] text-titan-muted">{t("rail.pressureSub")}</p>
        </div>
      </div>
    </aside>
  );
}
