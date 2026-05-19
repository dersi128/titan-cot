import { useId, type CSSProperties, type ReactNode } from "react";
import type { CotDashboardData } from "../../types";
import type { InstitutionalMarket } from "../../config/institutionalMarkets";
import {
  evaluateTitanPositioning,
  retailPositioningLabel,
  type CommercialZoneId,
  type DeltaFlowRow,
  type DeltaFlowTrend,
  type TitanPositioningRead,
} from "../../lib/titanCommercialIndex";
import { useTitanI18n } from "../../i18n";

type TitanMarketEngineProps = {
  market: InstitutionalMarket;
  data: CotDashboardData | null;
  loading: boolean;
};

function fmtNet(n: number): string {
  return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

function fmtDelta(n: number): string {
  const abs = Math.abs(n).toLocaleString(undefined, { maximumFractionDigits: 0 });
  return n > 0 ? `+${abs}` : n < 0 ? `−${abs}` : "0";
}

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

function IconFlow() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
      <path d="M5 18V6M12 18V10M19 18v-8" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
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
      <path d="M7 16l5-9 5 9M4 8h16" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
      <path d="M8 18c2-3 6-3 8 0M8 6c2 3 6 3 8 0" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
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

function clampIdx(v: number): number {
  return Math.max(0, Math.min(100, v));
}

/** Smooth institutional index path — fixed 0–100 scale (not min/max window). */
function IndexTrajectoryChart({
  values,
  tone,
  label,
}: {
  values: number[];
  tone: "bear" | "bull" | "gold";
  label: string;
}) {
  const uid = useId().replace(/:/g, "");

  if (values.length < 2) return null;

  const w = 320;
  const h = 52;
  const padX = 6;
  const padY = 5;
  const plotW = w - padX * 2;
  const plotH = h - padY * 2;

  const coords = values.map((v, i) => ({
    x: padX + (i / (values.length - 1)) * plotW,
    y: padY + (1 - clampIdx(v) / 100) * plotH,
  }));

  const linePath = coords
    .map((p, i) => {
      if (i === 0) return `M ${p.x} ${p.y}`;
      const prev = coords[i - 1]!;
      const cx = (prev.x + p.x) / 2;
      return `Q ${cx} ${prev.y} ${p.x} ${p.y}`;
    })
    .join(" ");

  const last = coords[coords.length - 1]!;
  const first = coords[0]!;
  const areaPath = `${linePath} L ${last.x} ${h - padY} L ${first.x} ${h - padY} Z`;

  const y25 = padY + (1 - 25 / 100) * plotH;
  const y75 = padY + (1 - 75 / 100) * plotH;
  const gradId = `titan-traj-${tone}-${uid}`;

  return (
    <div className={`titan-index-trajectory titan-index-trajectory--${tone}`}>
      <p className="titan-index-trajectory__label">{label}</p>
      <svg viewBox={`0 0 ${w} ${h}`} className="titan-index-trajectory__svg" preserveAspectRatio="none" aria-hidden>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.28" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
        <line x1={padX} y1={y75} x2={w - padX} y2={y75} className="titan-index-trajectory__guide" />
        <line x1={padX} y1={y25} x2={w - padX} y2={y25} className="titan-index-trajectory__guide" />
        <path d={areaPath} fill={`url(#${gradId})`} className="titan-index-trajectory__area" />
        <path d={linePath} fill="none" className="titan-index-trajectory__line" />
        <circle cx={last.x} cy={last.y} r="3.2" className="titan-index-trajectory__dot" />
        <circle cx={last.x} cy={last.y} r="6" className="titan-index-trajectory__dot-halo" />
      </svg>
    </div>
  );
}

function RangeBar({ value, glow, tone }: { value: number; glow: number; tone?: "bear" | "bull" | "gold" }) {
  const pct = Math.max(0, Math.min(100, value));
  const glowAlpha = Math.min(1, glow / 100);
  return (
    <div
      className={`titan-engine-meter titan-engine-meter--range titan-engine-meter--${tone ?? "gold"}`}
      style={{ "--zone-glow": glowAlpha } as CSSProperties}
    >
      <div className="titan-engine-meter__track relative">
        <span className="titan-engine-meter__fill" style={{ width: `${pct}%` }} />
        <span className="titan-engine-meter__marker" style={{ left: `${pct}%` }} aria-hidden />
      </div>
      <div className="mt-1.5 flex justify-between font-mono text-[9px] text-stone-600">
        <span>0</span>
        <span>50</span>
        <span>100</span>
      </div>
    </div>
  );
}

function TerminalCard({
  accent,
  icon,
  title,
  children,
  footer,
  className = "",
}: {
  accent: "red" | "green" | "blue" | "gold" | "purple";
  icon: ReactNode;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}) {
  return (
    <article className={`titan-terminal-card titan-terminal-card--${accent} ${className}`}>
      <div className="titan-terminal-card__border" aria-hidden />
      <div className="titan-terminal-card__glow" aria-hidden />
      <header className="titan-terminal-card__head">
        <span className="titan-terminal-card__icon">{icon}</span>
        <p className="titan-terminal-card__title">{title}</p>
      </header>
      <div className="titan-terminal-card__body">{children}</div>
      {footer ? <footer className="titan-terminal-card__foot">{footer}</footer> : null}
    </article>
  );
}

function CheckItem({ checked, label }: { checked: boolean; label: string }) {
  return (
    <li className={`titan-terminal-check ${checked ? "titan-terminal-check--on" : ""}`}>
      <span className="titan-terminal-check__box" aria-hidden>
        {checked ? (
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5">
            <path d="M3 8.5l3 3 7-8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : null}
      </span>
      <span>{label}</span>
    </li>
  );
}

function trendArrow(trend: DeltaFlowTrend): string {
  if (trend === "accelerating_up") return "↑";
  if (trend === "accelerating_down") return "↓";
  return "→";
}

function DeltaFlowTable({ rows, t }: { rows: DeltaFlowRow[]; t: (k: string) => string }) {
  return (
    <table className="titan-delta-table w-full text-left">
      <thead>
        <tr>
          <th>{t("positioning.delta.timeframe")}</th>
          <th>{t("positioning.delta.delta")}</th>
          <th>{t("positioning.delta.trend")}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.label}>
            <td className="font-mono text-stone-400">{row.label}</td>
            <td className={`font-mono tabular-nums ${row.delta < 0 ? "text-rose-400/95" : row.delta > 0 ? "text-emerald-400/95" : "text-stone-400"}`}>
              {fmtDelta(row.delta)}
            </td>
            <td className="text-[11px] text-stone-500">
              {trendArrow(row.trend)} {t(`positioning.delta.trend_${row.trend}`)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function commercialStateKey(zone: CommercialZoneId): string {
  return `positioning.commercialState.${zone}`;
}

function zoneAccent(zone: CommercialZoneId): "bear" | "bull" | "neutral" {
  if (zone === "extreme_long" || zone === "strong_long" || zone === "bullish") return "bull";
  if (zone === "extreme_short" || zone === "strong_short" || zone === "bearish") return "bear";
  return "neutral";
}

function weekLabel(reportDate: string): string {
  const d = new Date(reportDate);
  if (Number.isNaN(d.getTime())) return reportDate;
  const one = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil(((d.getTime() - one.getTime()) / 86400000 + one.getDay() + 1) / 7);
  return `W${week} ${d.getFullYear()}`;
}

function PositioningContext({
  read,
  t,
}: {
  read: TitanPositioningRead;
  t: (k: string) => string;
}) {
  const commTone = zoneAccent(read.commercialZone);
  const retailTone = zoneAccent(read.retailZone);

  return (
    <div className="titan-terminal-section">
      <h3 className="titan-terminal-section__label">{t("positioning.sections.context")}</h3>
      <div className="titan-terminal-grid titan-terminal-grid--3 mt-4">
        <TerminalCard accent={commTone === "bear" ? "red" : commTone === "bull" ? "green" : "gold"} icon={<IconBuilding />} title={t("positioning.cards.commercial.title")}>
          <div>
            <p className="titan-terminal-metric">
              {Math.round(read.commercialIndex)}
              <span className="titan-terminal-metric__sub"> / 100</span>
            </p>
            <p className={`titan-terminal-state titan-terminal-state--${commTone}`}>{t(commercialStateKey(read.commercialZone))}</p>
          </div>
          <p className="mt-3 text-[12px] leading-snug text-stone-500">{t("positioning.cards.commercial.desc")}</p>
          <div className="mt-4">
            <RangeBar value={read.commercialIndex} glow={read.commercialGlow} tone={commTone === "bear" ? "bear" : commTone === "bull" ? "bull" : "gold"} />
          </div>
          <div className="mt-3">
            <IndexTrajectoryChart
              values={read.commercialSparkline}
              tone={commTone === "bear" ? "bear" : commTone === "bull" ? "bull" : "gold"}
              label={t("positioning.trajectory")}
            />
          </div>
          <footer className="mt-4 grid gap-2 border-t border-white/[0.06] pt-3 sm:grid-cols-2">
            <div>
              <p className="titan-terminal-kicker">{t("positioning.persistence")}</p>
              <p className="font-mono text-[11px] text-stone-300">
                {read.commercialPersistenceWeeks > 0
                  ? t("positioning.persistenceWeeks").replace("{{count}}", String(read.commercialPersistenceWeeks))
                  : t("positioning.persistenceNone")}
              </p>
            </div>
            <div>
              <p className="titan-terminal-kicker">{t("positioning.range26w")}</p>
              <p className="font-mono text-[10px] leading-relaxed text-stone-500">
                {fmtNet(read.commercialRange26w.min)} → {fmtNet(read.commercialRange26w.max)}
              </p>
            </div>
          </footer>
        </TerminalCard>

        <TerminalCard accent={retailTone === "bull" ? "green" : retailTone === "bear" ? "red" : "gold"} icon={<IconCrowd />} title={t("positioning.cards.retail.title")}>
          <div>
            <p className="titan-terminal-metric">
              {Math.round(read.retailIndex)}
              <span className="titan-terminal-metric__sub"> / 100</span>
            </p>
            <p className={`titan-terminal-state titan-terminal-state--${retailTone}`}>
              {t(`positioning.retailState.${retailPositioningLabel(read.retailZone)}`)}
            </p>
          </div>
          <p className="mt-3 text-[12px] leading-snug text-stone-500">{t("positioning.cards.retail.desc")}</p>
          <div className="mt-4">
            <RangeBar value={read.retailIndex} glow={read.commercialGlow} tone={retailTone === "bull" ? "bull" : retailTone === "bear" ? "bear" : "gold"} />
          </div>
          <div className="mt-3">
            <IndexTrajectoryChart
              values={read.retailSparkline}
              tone={retailTone === "bull" ? "bull" : retailTone === "bear" ? "bear" : "gold"}
              label={t("positioning.trajectory")}
            />
          </div>
          <footer className="mt-4 grid gap-2 border-t border-white/[0.06] pt-3 sm:grid-cols-2">
            <div>
              <p className="titan-terminal-kicker">{t("positioning.persistence")}</p>
              <p className="font-mono text-[11px] text-stone-300">
                {read.retailPersistenceWeeks > 0
                  ? t("positioning.persistenceWeeks").replace("{{count}}", String(read.retailPersistenceWeeks))
                  : t("positioning.persistenceNone")}
              </p>
            </div>
            <div>
              <p className="titan-terminal-kicker">{t("positioning.range26w")}</p>
              <p className="font-mono text-[10px] leading-relaxed text-stone-500">
                {fmtNet(read.retailRange26w.min)} → {fmtNet(read.retailRange26w.max)}
              </p>
            </div>
          </footer>
        </TerminalCard>

        <TerminalCard accent="blue" icon={<IconFlow />} title={t("positioning.cards.delta.title")}>
          <DeltaFlowTable rows={read.deltaFlow} t={t} />
          <p className="mt-4 text-[12px] leading-snug text-stone-500">{t("positioning.cards.delta.desc")}</p>
        </TerminalCard>
      </div>
    </div>
  );
}

function SignalEngine({ read, t }: { read: TitanPositioningRead; t: (k: string) => string }) {
  const revHeadline =
    read.reversal !== "none"
      ? t(`positioning.reversal.${read.reversal}`)
      : read.extremePositioning
        ? t("positioning.reversal.extremeNoCross")
        : t("positioning.reversal.none");

  const revSub =
    read.extremePositioning && read.reversal === "none"
      ? t("positioning.reversal.extremeSub")
      : t(`positioning.reversal.hint.${read.reversal}`);

  return (
    <div className="titan-terminal-section mt-8 md:mt-10">
      <h3 className="titan-terminal-section__label">{t("positioning.sections.signal")}</h3>
      <div className="titan-terminal-grid titan-terminal-grid--3 mt-4">
        <TerminalCard accent="gold" icon={<IconReversal />} title={t("positioning.cards.reversal.title")}>
          <p className="titan-terminal-headline">{revHeadline}</p>
          <p className="mt-2 text-sm text-titan-gold/85">{revSub}</p>
          <ul className="mt-5 space-y-2.5">
            <CheckItem checked={read.checklist.crossBelow75} label={t("positioning.checklist.crossBelow75")} />
            <CheckItem checked={read.checklist.crossAbove25} label={t("positioning.checklist.crossAbove25")} />
            <CheckItem checked={read.checklist.retailContrarian} label={t("positioning.checklist.retailContrarian")} />
            <CheckItem checked={read.checklist.divergenceOptional} label={t("positioning.checklist.divergenceOptional")} />
          </ul>
        </TerminalCard>

        <TerminalCard accent="purple" icon={<IconDivergence />} title={t("positioning.cards.divergence.title")}>
          <p className="titan-terminal-headline">{t(`positioning.divergence.headline.${read.divergence}`)}</p>
          <p className="mt-2 text-sm text-stone-400">{t(`positioning.divergence.hint.${read.divergence}`)}</p>
          <div className="mt-5 grid grid-cols-2 gap-2">
            <div className="titan-terminal-mini-stat">
              <p className="titan-terminal-kicker">{t("positioning.divergence.priceAction")}</p>
              <p className="mt-1 text-[11px] font-medium text-stone-300">
                {t(`positioning.divergence.price.${read.divergenceContext.priceLabel}`)}
              </p>
            </div>
            <div className="titan-terminal-mini-stat">
              <p className="titan-terminal-kicker">{t("positioning.divergence.commercialNet")}</p>
              <p className="mt-1 text-[11px] font-medium text-stone-300">
                {t(`positioning.divergence.net.${read.divergenceContext.commercialNetLabel}`)}
              </p>
            </div>
          </div>
        </TerminalCard>

        <TerminalCard accent="blue" icon={<IconRegime />} title={t("positioning.cards.regime.title")}>
          <p className="titan-terminal-headline">{t(`positioning.regime.${read.regime}`)}</p>
          <p className="mt-2 text-sm text-stone-400">{t(`positioning.regime.hint.${read.regime}`)}</p>
          <div className="titan-regime-segments mt-5" role="group" aria-label={t("positioning.cards.regime.title")}>
            {(["accumulation", "distribution", "range", "trend"] as const).map((r) => (
              <span key={r} className={`titan-regime-segments__btn ${read.regime === r ? "is-active" : ""}`}>
                {t(`positioning.regime.${r}`)}
              </span>
            ))}
          </div>
          <p className="mt-4 text-[11px] leading-snug text-stone-600">{t("positioning.regime.footer")}</p>
        </TerminalCard>
      </div>
    </div>
  );
}

export function TitanMarketEngine({ market: _market, data, loading }: TitanMarketEngineProps) {
  const { t } = useTitanI18n();
  const read = data ? evaluateTitanPositioning(data) : null;

  return (
    <section className="titan-market-engine titan-positioning-terminal relative px-5 py-6 md:px-7 md:py-10">
      <div className="titan-market-engine__backdrop pointer-events-none absolute inset-0" aria-hidden />
      <div className="titan-positioning-terminal__vignette pointer-events-none absolute inset-0" aria-hidden />

      <header className="relative mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-display text-[10px] font-semibold uppercase tracking-[0.38em] text-titan-gold/90">
            {t("positioning.eyebrow")}
          </p>
          <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-white md:text-[1.65rem]">
            {t("positioning.terminalTitle")}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone-500">{t("positioning.disclaimer")}</p>
        </div>
        {data?.reportDate ? (
          <p className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-stone-600">
            {t("positioning.lastUpdate")} {data.reportDate} ({weekLabel(data.reportDate)})
          </p>
        ) : null}
      </header>

      {loading ? (
        <div className="relative space-y-8">
          <div className="titan-terminal-grid titan-terminal-grid--3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="titan-terminal-card h-56 animate-pulse bg-white/[0.03]" />
            ))}
          </div>
          <div className="titan-terminal-grid titan-terminal-grid--3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="titan-terminal-card h-52 animate-pulse bg-white/[0.03]" />
            ))}
          </div>
        </div>
      ) : !read ? (
        <p className="relative text-sm text-stone-500">{t("positioning.unavailable")}</p>
      ) : (
        <div className="relative">
          <PositioningContext read={read} t={t} />
          <SignalEngine read={read} t={t} />
          <footer className="titan-terminal-footer mt-8 grid gap-4 border-t border-white/[0.06] pt-6 md:grid-cols-[1fr_auto_1fr] md:items-start">
            <div className="titan-terminal-note">
              <p className="titan-terminal-kicker text-titan-gold/80">{t("positioning.footer.important")}</p>
              <p className="mt-1 text-[12px] leading-snug text-stone-500">{t("positioning.footer.note")}</p>
            </div>
            <ul className="flex flex-wrap justify-center gap-4 text-[10px] uppercase tracking-wider text-stone-600">
              <li className="flex items-center gap-1.5">
                <span className="titan-legend-dot titan-legend-dot--comm" /> {t("positioning.legend.commercial")}
              </li>
              <li className="flex items-center gap-1.5">
                <span className="titan-legend-dot titan-legend-dot--retail" /> {t("positioning.legend.retail")}
              </li>
              <li className="flex items-center gap-1.5">
                <span className="titan-legend-dot titan-legend-dot--flow" /> {t("positioning.legend.flow")}
              </li>
            </ul>
            {data?.reportDate ? (
              <p className="text-right font-mono text-[10px] uppercase tracking-wider text-stone-600">
                {t("positioning.footer.currentWeek")} {weekLabel(data.reportDate)}
              </p>
            ) : null}
          </footer>
        </div>
      )}
    </section>
  );
}
