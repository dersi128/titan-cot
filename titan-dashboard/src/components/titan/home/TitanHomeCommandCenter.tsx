import { useMemo, type ReactNode } from "react";
import type { CotDashboardData } from "../../../types";
import type { InstitutionalMarket } from "../../../config/institutionalMarkets";
import { INSTITUTIONAL_MARKETS } from "../../../config/institutionalMarkets";
import { buildHomeOverviewStats, type WatchlistEntry } from "../../../lib/titanHomeOverview";
import {
  FLOW_MAP_CLASSES,
  HOME_DME_MOCK,
  HOME_OVERVIEW_MOCK,
  HOME_REGIME_SHIFTS_MOCK,
  HOME_SEASONALITY_MOCK,
  type FlowDirection,
  type FlowMapClassId,
} from "../../../lib/titanHomeMock";
import type { MarketRegimeId } from "../../../lib/titanCommercialIndex";
import { convictionRankScore, CONVICTION_MAX } from "../../../lib/titanConviction";
import { scoreHeatClass } from "../../../lib/titanCotScore";
import { useTitanI18n } from "../../../i18n";
import type { ScannerRowModel } from "../GlobalCotScanner";

type TitanHomeCommandCenterProps = {
  rows: ScannerRowModel[];
  bundle: Record<string, CotDashboardData>;
  onSelectMarket: (market: InstitutionalMarket) => void;
  scanner: ReactNode;
};

function GlassCard({
  children,
  className = "",
  glow,
}: {
  children: ReactNode;
  className?: string;
  glow?: "gold" | "bull" | "bear" | "neutral";
}) {
  const glowClass =
    glow === "bull"
      ? "titan-cmd-card--glow-bull"
      : glow === "bear"
        ? "titan-cmd-card--glow-bear"
        : glow === "gold"
          ? "titan-cmd-card--glow-gold"
          : "";
  return <article className={`titan-cmd-card ${glowClass} ${className}`}>{children}</article>;
}

function MiniCurve({ points, tone }: { points: readonly number[]; tone: "bull" | "bear" | "neutral" }) {
  const w = 128;
  const h = 36;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const coords = points.map((p, i) => {
    const x = (i / (points.length - 1)) * w;
    const y = h - ((p - min) / range) * (h - 6) - 3;
    return `${x},${y}`;
  });
  const stroke =
    tone === "bull" ? "rgba(0, 208, 132, 0.85)" : tone === "bear" ? "rgba(255, 77, 109, 0.85)" : "rgba(168, 162, 158, 0.7)";

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="titan-cmd-curve h-9 w-full" aria-hidden>
      <polyline fill="none" stroke={stroke} strokeWidth="1.5" points={coords.join(" ")} />
    </svg>
  );
}

function ConvictionMini({ level }: { level: number }) {
  return (
    <span className="titan-conviction-stars shrink-0 text-[10px]" aria-hidden>
      {Array.from({ length: CONVICTION_MAX }).map((_, i) => (
        <span key={i} className={i < level ? "text-titan-gold/85" : "text-stone-700"}>
          {i < level ? "★" : "☆"}
        </span>
      ))}
    </span>
  );
}

function WatchlistPanel({
  title,
  entries,
  tone,
  emptyLabel,
  onSelect,
}: {
  title: string;
  entries: WatchlistEntry[];
  tone: "bull" | "bear";
  emptyLabel: string;
  onSelect: (m: InstitutionalMarket) => void;
}) {
  const glow = tone === "bull" ? "bull" : "bear";
  return (
    <GlassCard glow={glow} className="titan-cmd-watch p-3">
      <h3 className="titan-cmd-kicker">{title}</h3>
      <ul className="mt-2.5 space-y-0.5">
        {entries.length === 0 ? (
          <li className="py-3 text-[11px] text-stone-600">{emptyLabel}</li>
        ) : (
          entries.map((e) => (
            <li key={e.market.id}>
              <button
                type="button"
                onClick={() => onSelect(e.market)}
                className="titan-cmd-watch__row flex w-full items-center gap-2 rounded px-1.5 py-1.5 text-left"
              >
                <span className="min-w-0 flex-1 truncate font-display text-[11px] font-semibold tracking-wide text-stone-200">
                  {e.market.shortLabel}
                </span>
                <ConvictionMini level={e.conviction} />
                <span className={`shrink-0 font-mono text-xs font-semibold tabular-nums ${scoreHeatClass(e.score)}`}>
                  {e.score > 0 ? `+${e.score}` : e.score}
                </span>
              </button>
            </li>
          ))
        )}
      </ul>
    </GlassCard>
  );
}

function regimePillClass(regime: MarketRegimeId): string {
  if (regime === "accumulation" || regime === "trending") return "titan-regime-pill--bull";
  if (regime === "distribution") return "titan-regime-pill--bear";
  if (regime === "exhaustion" || regime === "transition") return "titan-regime-pill--warn";
  return "titan-regime-pill--neutral";
}

function flowToneClass(dir: FlowDirection): string {
  if (dir === "inflow") return "text-emerald-400/90";
  if (dir === "outflow") return "text-rose-400/90";
  return "text-stone-400";
}

function buildFlowMapFromRows(rows: ScannerRowModel[]): Record<
  FlowMapClassId,
  { regime: MarketRegimeId; direction: FlowDirection; conviction: number } | null
> {
  const out = {} as Record<FlowMapClassId, { regime: MarketRegimeId; direction: FlowDirection; conviction: number } | null>;
  for (const cls of FLOW_MAP_CLASSES) {
    const live = rows.filter((r) => r.status === "live" && r.market.category === cls);
    if (live.length === 0) {
      out[cls] = null;
      continue;
    }
    const regimeCounts = new Map<MarketRegimeId, number>();
    let scoreSum = 0;
    let convSum = 0;
    for (const r of live) {
      regimeCounts.set(r.regime, (regimeCounts.get(r.regime) ?? 0) + 1);
      scoreSum += r.score;
      convSum += r.conviction;
    }
    let dominant: MarketRegimeId = "neutral";
    let max = 0;
    regimeCounts.forEach((c, reg) => {
      if (c > max) {
        max = c;
        dominant = reg;
      }
    });
    const avg = scoreSum / live.length;
    const direction: FlowDirection = avg > 12 ? "inflow" : avg < -12 ? "outflow" : "mixed";
    out[cls] = {
      regime: dominant,
      direction,
      conviction: Math.round(convSum / live.length),
    };
  }
  return out;
}

export function TitanHomeCommandCenter({
  rows,
  bundle,
  onSelectMarket,
  scanner,
}: TitanHomeCommandCenterProps) {
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
            <p className="titan-cmd-sub mt-1">
              {t("home.cmdRegimeSub", { count: String(stats.liveCount) })}
            </p>
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
                  <span className={s.tone === "bull" ? "text-emerald-400/90" : s.tone === "bear" ? "text-rose-400/90" : "text-amber-300/90"}>
                    {s.to}
                  </span>
                </p>
              </li>
            ))}
          </ul>
        </GlassCard>
      </section>

      <div className="grid gap-3 lg:grid-cols-12">
        <section className="lg:col-span-5" aria-label={t("home.cmdSeasonality")}>
          <GlassCard className="h-full p-3">
            <h3 className="titan-cmd-kicker">{t("home.cmdSeasonality")}</h3>
            <div className="mt-3 grid gap-2 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {HOME_SEASONALITY_MOCK.map((item) => (
                <div key={item.id} className="titan-cmd-season rounded border border-white/[0.06] bg-black/30 px-2.5 py-2">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-display text-[11px] font-bold tracking-wider text-titan-goldBright">{item.label}</span>
                    <span
                      className={`text-[9px] font-semibold uppercase tracking-wider ${
                        item.tone === "bull" ? "text-emerald-400/80" : "text-rose-400/80"
                      }`}
                    >
                      {item.tone === "bull" ? "▲" : "▼"}
                    </span>
                  </div>
                  <MiniCurve points={item.curve} tone={item.tone} />
                  <p className="mt-1 text-[10px] leading-snug text-stone-500">{item.bias}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        </section>

        <section className="lg:col-span-4" aria-label={t("home.cmdDmePreview")}>
          <GlassCard glow="gold" className="flex h-full flex-col p-3">
            <h3 className="titan-cmd-kicker">{t("home.cmdDmePreview")}</h3>
            <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2.5">
              {(
                [
                  ["dxyRegime", HOME_DME_MOCK.dxyRegime],
                  ["fxBreadth", HOME_DME_MOCK.fxBreadth],
                  ["dollarPressure", HOME_DME_MOCK.dollarPressure],
                  ["liquidityRegime", HOME_DME_MOCK.liquidityRegime],
                ] as const
              ).map(([key, val]) => (
                <div key={key} className="rounded border border-white/[0.05] bg-black/25 px-2 py-1.5">
                  <dt className="text-[9px] font-semibold uppercase tracking-[0.14em] text-stone-600">
                    {t(`home.cmdDme.${key}`)}
                  </dt>
                  <dd className="mt-0.5 font-mono text-[12px] font-medium text-stone-200">{val}</dd>
                </div>
              ))}
            </dl>
            <button type="button" className="titan-cmd-dme-btn mt-auto pt-3" disabled>
              {t("home.cmdDmeOpen")}
            </button>
          </GlassCard>
        </section>

        <section className="lg:col-span-3" aria-label={t("home.cmdFlowMap")}>
          <GlassCard className="h-full p-3">
            <h3 className="titan-cmd-kicker">{t("home.cmdFlowMap")}</h3>
            <ul className="mt-3 space-y-1.5">
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

      <section className="titan-cmd-scanner-wrap" aria-label={t("scanner.eyebrow")}>
        <div className="titan-cmd-scanner-label mb-2 flex items-center gap-3">
          <span className="font-display text-[10px] font-semibold uppercase tracking-[0.28em] text-titan-gold/75">
            {t("home.cmdScannerLabel")}
          </span>
          <span className="h-px flex-1 bg-gradient-to-r from-titan-gold/25 to-transparent" />
        </div>
        {scanner}
      </section>
    </div>
  );
}
