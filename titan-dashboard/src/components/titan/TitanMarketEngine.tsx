import type { ReactNode } from "react";
import type { CotDashboardData } from "../../types";
import type { InstitutionalMarket } from "../../config/institutionalMarkets";
import {
  commercialTrend,
  computeTitanDashboardScore,
  resolveTitanVerdict,
} from "../../lib/titanCotScore";
import { useTitanI18n } from "../../i18n";

type TitanMarketEngineProps = {
  market: InstitutionalMarket;
  data: CotDashboardData | null;
  loading: boolean;
};

function IconChip() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
      <rect x="5" y="5" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.2" />
      <path d="M9 9h2v2H9zm4 0h2v2h-2zm-4 4h2v2H9zm4 0h2v2h-2z" fill="currentColor" opacity="0.85" />
    </svg>
  );
}

function IconBuilding() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
      <path d="M4 20V8l8-4 8 4v12" stroke="currentColor" strokeWidth="1.2" />
      <path d="M9 20v-5h6v5M9 12h1M14 12h1M9 15h1M14 15h1" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function IconNetwork() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
      <circle cx="12" cy="6" r="2" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="6" cy="18" r="2" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="18" cy="18" r="2" stroke="currentColor" strokeWidth="1.2" />
      <path d="M12 8v4M10.5 14.5 7 16.5M13.5 14.5 17 16.5" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function IconPulse() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
      <path d="M4 12h3l2-5 3 10 2-5h6" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconChart() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
      <path d="M5 18V8M10 18V5M15 18v-6M20 18v-9" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
    </svg>
  );
}

function IconRadar() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.2" />
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1" opacity="0.4" />
    </svg>
  );
}

function BarMeter({ value, tone = "gold" }: { value: number; tone?: "gold" | "bull" | "bear" | "neutral" }) {
  const pct = Math.max(0, Math.min(100, value));
  const fill =
    tone === "bull"
      ? "bg-emerald-400"
      : tone === "bear"
        ? "bg-rose-400"
        : tone === "neutral"
          ? "bg-stone-400"
          : "bg-gradient-to-r from-titan-gold/80 to-titan-goldBright";
  return (
    <div className="titan-engine-meter">
      <div className="titan-engine-meter__track">
        <span className={`titan-engine-meter__fill ${fill}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function MomentumBars({ values }: { values: number[] }) {
  const max = Math.max(...values.map(Math.abs), 1);
  return (
    <div className="flex h-8 items-end gap-1" aria-hidden>
      {values.map((v, i) => {
        const h = Math.max(12, (Math.abs(v) / max) * 100);
        const positive = v >= 0;
        return (
          <span
            key={i}
            className={`w-1.5 rounded-sm ${positive ? "bg-emerald-400/85" : "bg-rose-400/85"}`}
            style={{ height: `${h}%` }}
          />
        );
      })}
    </div>
  );
}

function Sparkline({ points }: { points: number[] }) {
  if (points.length < 2) return <div className="h-8" />;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const d = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * 100;
      const y = 100 - ((p - min) / range) * 100;
      return `${i === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ");
  return (
    <svg viewBox="0 0 100 32" className="h-8 w-full" preserveAspectRatio="none" aria-hidden>
      <path d={d} fill="none" stroke="currentColor" strokeWidth="2" className="text-titan-gold/80" />
    </svg>
  );
}

function EngineCard({
  icon,
  title,
  metric,
  metricSub,
  viz,
  description,
  delayMs = 0,
}: {
  icon: ReactNode;
  title: string;
  metric: string;
  metricSub?: string;
  viz: ReactNode;
  description: string;
  delayMs?: number;
}) {
  return (
    <article
      className="titan-engine-card group"
      style={{ animationDelay: `${delayMs}ms` }}
    >
      <div className="titan-engine-card__shine" aria-hidden />
      <div className="flex items-start justify-between gap-3">
        <span className="titan-engine-card__icon">{icon}</span>
        <p className="text-right font-mono text-xl font-semibold tabular-nums text-white">{metric}</p>
      </div>
      {metricSub ? <p className="mt-0.5 text-right font-mono text-[10px] text-stone-500">{metricSub}</p> : null}
      <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-titan-gold/90">{title}</p>
      <div className="mt-3">{viz}</div>
      <p className="mt-3 text-[12px] leading-snug text-stone-500">{description}</p>
    </article>
  );
}

export function TitanMarketEngine({ market, data, loading }: TitanMarketEngineProps) {
  const { t } = useTitanI18n();

  const score = data ? computeTitanDashboardScore(data) : null;
  const verdict = data ? resolveTitanVerdict(data) : null;
  const conviction = score !== null ? Math.min(100, Math.round(Math.abs(score) * 0.85 + 15)) : 0;

  const comm26 = data?.commercials.index26w ?? null;
  const retail26 = data?.retail.index26w ?? null;
  const delta1w = data?.commercials.weeklyChange ?? null;
  const trend = data ? commercialTrend(data) : null;

  const history = data?.history?.slice(-12).map((h) => h.commercialNet) ?? [];
  const spark = history.length >= 2 ? history : [0, 0];

  const commTone =
    comm26 === null ? "gold" : comm26 > 80 ? "bull" : comm26 < 20 ? "bear" : "gold";

  return (
    <section className="titan-market-engine relative px-5 py-6 md:px-7 md:py-8">
      <div className="titan-market-engine__backdrop pointer-events-none absolute inset-0" aria-hidden />

      <header className="relative mb-6 md:mb-8">
        <p className="font-display text-[11px] font-semibold uppercase tracking-[0.32em] text-titan-gold">
          {t("engine.eyebrow")}
        </p>
        <h2 className="mt-2 font-display text-xl font-semibold tracking-tight text-white md:text-2xl">
          {t("engine.subtitle")}
        </h2>
      </header>

      {loading ? (
        <div className="relative grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="titan-engine-card h-40 animate-pulse bg-white/[0.03]" />
          ))}
        </div>
      ) : !data ? (
        <p className="relative text-sm text-stone-500">{t("engine.unavailable")}</p>
      ) : (
        <div className="relative grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <EngineCard
            icon={<IconChip />}
            title={t("engine.cards.score.title")}
            metric={score !== null ? `${score > 0 ? "+" : ""}${score}` : "—"}
            metricSub="/ 100"
            viz={<BarMeter value={conviction} tone={score !== null && score >= 0 ? "bull" : score !== null ? "bear" : "neutral"} />}
            description={t("engine.cards.score.desc")}
            delayMs={0}
          />
          <EngineCard
            icon={<IconBuilding />}
            title={t("engine.cards.comm.title")}
            metric={comm26 !== null ? Math.round(comm26).toString() : "—"}
            metricSub="/ 100"
            viz={<BarMeter value={comm26 ?? 0} tone={commTone} />}
            description={t("engine.cards.comm.desc")}
            delayMs={40}
          />
          <EngineCard
            icon={<IconNetwork />}
            title={t("engine.cards.retail.title")}
            metric={retail26 !== null ? Math.round(retail26).toString() : "—"}
            metricSub="/ 100"
            viz={<BarMeter value={retail26 ?? 0} tone="neutral" />}
            description={t("engine.cards.retail.desc")}
            delayMs={80}
          />
          <EngineCard
            icon={<IconPulse />}
            title={t("engine.cards.delta.title")}
            metric={delta1w !== null ? (delta1w > 0 ? `+${delta1w.toLocaleString()}` : delta1w.toLocaleString()) : "—"}
            viz={
              <MomentumBars
                values={[data.commercials.weeklyChange, data.commercials.delta4w, data.commercials.delta13w]}
              />
            }
            description={t("engine.cards.delta.desc")}
            delayMs={120}
          />
          <EngineCard
            icon={<IconChart />}
            title={t("engine.cards.tv.title")}
            metric={market.symbol}
            viz={<Sparkline points={spark} />}
            description={t("engine.cards.tv.desc")}
            delayMs={160}
          />
          <EngineCard
            icon={<IconRadar />}
            title={t("engine.cards.cot.title")}
            metric={t("engine.cards.cot.metric")}
            viz={
              <BarMeter
                value={comm26 ?? 50}
                tone={trend === "accumulation" ? "bull" : trend === "distribution" ? "bear" : "gold"}
              />
            }
            description={`${t("engine.cards.cot.desc")} · ${verdict ?? ""}`}
            delayMs={200}
          />
        </div>
      )}
    </section>
  );
}
