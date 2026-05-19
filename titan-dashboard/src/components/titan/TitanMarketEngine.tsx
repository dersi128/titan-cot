import type { CSSProperties, ReactNode } from "react";
import type { CotDashboardData } from "../../types";
import type { InstitutionalMarket } from "../../config/institutionalMarkets";
import {
  evaluateTitanPositioning,
  type CommercialZoneId,
  type DivergenceStateId,
  type MarketRegimeId,
  type ReversalStateId,
} from "../../lib/titanCommercialIndex";
import { useTitanI18n } from "../../i18n";

type TitanMarketEngineProps = {
  market: InstitutionalMarket;
  data: CotDashboardData | null;
  loading: boolean;
};

function IconBuilding() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
      <path d="M4 20V8l8-4 8 4v12" stroke="currentColor" strokeWidth="1.2" />
      <path d="M9 20v-5h6v5M9 12h1M14 12h1" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function IconCrowd() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
      <circle cx="9" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="16" cy="9" r="2" stroke="currentColor" strokeWidth="1.2" />
      <path d="M5 18c0-2.5 2-4 4-4M15 18c0-2 1.5-3.5 3-3.5" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function IconReversal() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
      <path d="M6 16l4-8 4 5 4-9" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconDivergence() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
      <path d="M5 18V9M12 18V5M19 18v-7" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
      <path d="M5 9l7-4 7 3" stroke="currentColor" strokeWidth="1" opacity="0.45" strokeDasharray="2 2" />
    </svg>
  );
}

function IconRegime() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="1.2" />
      <path d="M12 5v3M12 16v3M5 12h3M16 12h3" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function RangeBar({ value, glow }: { value: number; glow: number }) {
  const pct = Math.max(0, Math.min(100, value));
  const glowAlpha = Math.min(1, glow / 100);
  return (
    <div className="titan-engine-meter titan-engine-meter--range" style={{ "--zone-glow": glowAlpha } as CSSProperties}>
      <div className="titan-engine-meter__track">
        <span className="titan-engine-meter__fill" style={{ width: `${pct}%` }} />
        <span className="titan-engine-meter__marker" style={{ left: `${pct}%` }} aria-hidden />
      </div>
      <div className="mt-1 flex justify-between font-mono text-[9px] text-stone-600">
        <span>0</span>
        <span>50</span>
        <span>100</span>
      </div>
    </div>
  );
}

function EngineCard({
  icon,
  title,
  metric,
  metricSub,
  stateLabel,
  viz,
  description,
  tone = "gold",
  delayMs = 0,
}: {
  icon: ReactNode;
  title: string;
  metric: string;
  metricSub?: string;
  stateLabel: string;
  viz: ReactNode;
  description: string;
  tone?: "gold" | "bull" | "bear" | "neutral" | "warn";
  delayMs?: number;
}) {
  const toneClass =
    tone === "bull"
      ? "titan-engine-card--bull"
      : tone === "bear"
        ? "titan-engine-card--bear"
        : tone === "warn"
          ? "titan-engine-card--warn"
          : tone === "neutral"
            ? "titan-engine-card--neutral"
            : "";

  return (
    <article className={`titan-engine-card group ${toneClass}`} style={{ animationDelay: `${delayMs}ms` }}>
      <div className="titan-engine-card__shine" aria-hidden />
      <div className="flex items-start justify-between gap-3">
        <span className="titan-engine-card__icon">{icon}</span>
        <div className="text-right">
          <p className="font-mono text-xl font-semibold tabular-nums text-white">{metric}</p>
          {metricSub ? <p className="font-mono text-[10px] text-stone-500">{metricSub}</p> : null}
        </div>
      </div>
      <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-titan-gold/90">{title}</p>
      <p className="mt-1 text-sm font-medium text-stone-200">{stateLabel}</p>
      <div className="mt-3">{viz}</div>
      <p className="mt-3 text-[12px] leading-snug text-stone-500">{description}</p>
    </article>
  );
}

function zoneTone(zone: CommercialZoneId): "bull" | "bear" | "gold" | "neutral" {
  if (zone === "extreme_long" || zone === "strong_long" || zone === "bullish") return "bull";
  if (zone === "extreme_short" || zone === "strong_short" || zone === "bearish") return "bear";
  return "neutral";
}

function reversalTone(state: ReversalStateId): "gold" | "bull" | "bear" | "warn" | "neutral" {
  if (state === "confirmed_top" || state === "potential_top") return "bear";
  if (state === "confirmed_bottom" || state === "potential_bottom") return "bull";
  return "neutral";
}

function divergenceTone(state: DivergenceStateId): "gold" | "bull" | "bear" | "neutral" {
  if (state === "bearish") return "bear";
  if (state === "bullish") return "bull";
  return "neutral";
}

function regimeTone(state: MarketRegimeId): "gold" | "bull" | "bear" | "neutral" {
  if (state === "accumulation") return "bull";
  if (state === "distribution") return "bear";
  if (state === "trend") return "gold";
  return "neutral";
}

export function TitanMarketEngine({ market: _market, data, loading }: TitanMarketEngineProps) {
  const { t } = useTitanI18n();
  const read = data ? evaluateTitanPositioning(data) : null;

  return (
    <section className="titan-market-engine relative px-5 py-6 md:px-7 md:py-8">
      <div className="titan-market-engine__backdrop pointer-events-none absolute inset-0" aria-hidden />

      <header className="relative mb-6 md:mb-8">
        <p className="font-display text-[11px] font-semibold uppercase tracking-[0.32em] text-titan-gold">
          {t("positioning.eyebrow")}
        </p>
        <h2 className="mt-2 font-display text-xl font-semibold tracking-tight text-white md:text-2xl">
          {t("positioning.subtitle")}
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-stone-500">{t("positioning.disclaimer")}</p>
      </header>

      {loading ? (
        <div className="relative grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="titan-engine-card h-44 animate-pulse bg-white/[0.03]" />
          ))}
        </div>
      ) : !read ? (
        <p className="relative text-sm text-stone-500">{t("positioning.unavailable")}</p>
      ) : (
        <div className="relative grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <EngineCard
            icon={<IconBuilding />}
            title={t("positioning.cards.commercial.title")}
            metric={`${Math.round(read.commercialIndex)}`}
            metricSub="/ 100"
            stateLabel={t(`positioning.zones.${read.commercialZone}`)}
            viz={<RangeBar value={read.commercialIndex} glow={read.commercialGlow} />}
            description={t("positioning.cards.commercial.desc")}
            tone={zoneTone(read.commercialZone)}
            delayMs={0}
          />
          <EngineCard
            icon={<IconCrowd />}
            title={t("positioning.cards.retail.title")}
            metric={`${Math.round(read.retailIndex)}`}
            metricSub="/ 100"
            stateLabel={t(`positioning.zones.${read.retailZone}`)}
            viz={<RangeBar value={read.retailIndex} glow={commercialGlowFromZone(read.retailZone)} />}
            description={t("positioning.cards.retail.desc")}
            tone="neutral"
            delayMs={40}
          />
          <EngineCard
            icon={<IconReversal />}
            title={t("positioning.cards.reversal.title")}
            metric={t(`positioning.reversal.${read.reversal}`)}
            stateLabel={
              read.smTurnDown
                ? t("positioning.reversal.signalDown")
                : read.smTurnUp
                  ? t("positioning.reversal.signalUp")
                  : t("positioning.reversal.signalNone")
            }
            viz={
              <div className="flex gap-2 text-[10px] uppercase tracking-wider">
                <span className={read.retailConfirmsTop || read.retailConfirmsBottom ? "text-emerald-400/90" : "text-stone-600"}>
                  {t("positioning.retailConfirm")}{" "}
                  {read.retailConfirmsTop || read.retailConfirmsBottom ? "✓" : "—"}
                </span>
              </div>
            }
            description={t(`positioning.reversal.hint.${read.reversal}`)}
            tone={reversalTone(read.reversal)}
            delayMs={80}
          />
          <EngineCard
            icon={<IconDivergence />}
            title={t("positioning.cards.divergence.title")}
            metric={t(`positioning.divergence.${read.divergence}`)}
            stateLabel={t("positioning.cards.divergence.stateLabel")}
            viz={
              <p className="font-mono text-[11px] text-stone-500">
                {read.divergence === "unavailable" ? t("positioning.divergence.note") : "COT net · 26W"}
              </p>
            }
            description={t(`positioning.divergence.hint.${read.divergence}`)}
            tone={divergenceTone(read.divergence)}
            delayMs={120}
          />
          <EngineCard
            icon={<IconRegime />}
            title={t("positioning.cards.regime.title")}
            metric={t(`positioning.regime.${read.regime}`)}
            stateLabel={t("positioning.cards.regime.stateLabel")}
            viz={
              <div className="grid grid-cols-4 gap-1">
                {(["accumulation", "distribution", "range", "trend"] as const).map((r) => (
                  <span
                    key={r}
                    className={`rounded px-1 py-1 text-center text-[8px] font-semibold uppercase tracking-wide ${
                      read.regime === r ? "bg-titan-gold/20 text-titan-goldBright" : "bg-white/5 text-stone-600"
                    }`}
                  >
                    {t(`positioning.regime.${r}`).slice(0, 4)}
                  </span>
                ))}
              </div>
            }
            description={t(`positioning.regime.hint.${read.regime}`)}
            tone={regimeTone(read.regime)}
            delayMs={160}
          />
        </div>
      )}
    </section>
  );
}

function commercialGlowFromZone(zone: CommercialZoneId): number {
  if (zone === "extreme_long" || zone === "extreme_short") return 88;
  if (zone === "strong_long" || zone === "strong_short") return 70;
  return 40;
}
