import { useId, type CSSProperties, type ReactNode } from "react";
import type { CotDashboardData } from "../../types";
import type { InstitutionalMarket } from "../../config/institutionalMarkets";
import {
  evaluateTitanPositioning,
  retailPositioningLabel,
  type CommercialZoneId,
  type DeltaFlowRow,
  type TitanPositioningRead,
} from "../../lib/titanCommercialIndex";
import { useTitanI18n } from "../../i18n";
import { DeltaFlowHorizonChart } from "./DeltaFlowHorizonChart";

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

/** Map legacy 0–100 index (short→long) to symmetric −100…+100 with 0 = neutral mid-range. */
function indexToBipolar(index0to100: number): number {
  return 2 * clampIdx(index0to100) - 100;
}

function fmtBipolar(b: number): string {
  const r = Math.round(b);
  return r > 0 ? `+${r}` : `${r}`;
}

function bipolarY(b: number, padY: number, plotH: number): number {
  return padY + (1 - (b + 100) / 200) * plotH;
}

type TrajPt = { x: number; y: number; b: number };

function expandTrajectoryWithZeroCrossings(
  values: number[],
  padX: number,
  plotW: number,
  padY: number,
  plotH: number,
): TrajPt[] {
  const n = values.length;
  if (n < 2) return [];
  const bs = values.map((v) => indexToBipolar(v));
  const out: TrajPt[] = [];
  for (let i = 0; i < n; i++) {
    const x = padX + (i / (n - 1)) * plotW;
    const b = bs[i]!;
    out.push({ x, y: bipolarY(b, padY, plotH), b });
    if (i < n - 1) {
      const b2 = bs[i + 1]!;
      if ((b < 0 && b2 > 0) || (b > 0 && b2 < 0)) {
        const t = b / (b - b2);
        const x2 = padX + ((i + 1) / (n - 1)) * plotW;
        const xCross = x + t * (x2 - x);
        out.push({ x: xCross, y: bipolarY(0, padY, plotH), b: 0 });
      }
    }
  }
  return out;
}

function smoothLinePath(pts: TrajPt[]): string {
  return pts
    .map((p, i) => {
      if (i === 0) return `M ${p.x} ${p.y}`;
      const prev = pts[i - 1]!;
      const cx = (prev.x + p.x) / 2;
      return `Q ${cx} ${prev.y} ${p.x} ${p.y}`;
    })
    .join(" ");
}

function chunkTrajectoryBySign(expanded: TrajPt[]): TrajPt[][] {
  const chunks: TrajPt[][] = [];
  let buf: TrajPt[] = [];
  for (const p of expanded) {
    if (p.b === 0 && buf.length > 0) {
      buf.push(p);
      chunks.push(buf);
      buf = [p];
    } else {
      buf.push(p);
    }
  }
  if (buf.length) chunks.push(buf);
  return chunks;
}

/** Index path: −100 bottom (short), 0 center, +100 top (long); line red when ≤0, green when ≥0. */
function BipolarIndexTrajectoryChart({ values, label }: { values: number[]; label: string }) {
  const uid = useId().replace(/:/g, "");

  if (values.length < 2) return null;

  const w = 320;
  const h = 52;
  const padX = 6;
  const padY = 5;
  const plotW = w - padX * 2;
  const plotH = h - padY * 2;

  const expanded = expandTrajectoryWithZeroCrossings(values, padX, plotW, padY, plotH);
  const chunks = chunkTrajectoryBySign(expanded).filter((c) => c.length >= 2);
  const yMid = bipolarY(0, padY, plotH);
  const yBandHi = bipolarY(50, padY, plotH);
  const yBandLo = bipolarY(-50, padY, plotH);
  const last = expanded[expanded.length - 1]!;

  return (
    <div className="titan-index-trajectory titan-index-trajectory--bipolar">
      <p className="titan-index-trajectory__label">{label}</p>
      <svg viewBox={`0 0 ${w} ${h}`} className="titan-index-trajectory__svg" preserveAspectRatio="none" aria-hidden>
        <defs>
          <linearGradient id={`titan-traj-neg-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(255, 95, 115, 0.35)" />
            <stop offset="100%" stopColor="rgba(255, 95, 115, 0)" />
          </linearGradient>
          <linearGradient id={`titan-traj-pos-${uid}`} x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="rgba(0, 208, 132, 0)" />
            <stop offset="100%" stopColor="rgba(0, 208, 132, 0.32)" />
          </linearGradient>
        </defs>
        <line x1={padX} y1={yMid} x2={w - padX} y2={yMid} className="titan-index-trajectory__guide titan-index-trajectory__guide--zero" />
        <line x1={padX} y1={yBandHi} x2={w - padX} y2={yBandHi} className="titan-index-trajectory__guide" />
        <line x1={padX} y1={yBandLo} x2={w - padX} y2={yBandLo} className="titan-index-trajectory__guide" />
        {chunks.map((chunk, idx) => {
          const signs = chunk.map((pt) => pt.b).filter((b) => b !== 0);
          if (signs.length === 0) return null;
          const neg = signs[0]! < 0;
          if (!signs.every((s) => (neg ? s < 0 : s > 0))) return null;
          const d = smoothLinePath(chunk);
          const first = chunk[0]!;
          const end = chunk[chunk.length - 1]!;
          const areaD = `${d} L ${end.x} ${yMid} L ${first.x} ${yMid} Z`;
          return (
            <g key={idx}>
              <path
                d={areaD}
                fill={neg ? `url(#titan-traj-neg-${uid})` : `url(#titan-traj-pos-${uid})`}
                className="titan-index-trajectory__area-bipolar"
              />
              <path d={d} fill="none" className={neg ? "titan-index-trajectory__line--neg" : "titan-index-trajectory__line--pos"} />
            </g>
          );
        })}
        <circle
          cx={last.x}
          cy={last.y}
          r="3.2"
          className={
            last.b < 0
              ? "titan-index-trajectory__dot-bipolar titan-index-trajectory__dot-bipolar--neg"
              : last.b > 0
                ? "titan-index-trajectory__dot-bipolar titan-index-trajectory__dot-bipolar--pos"
                : "titan-index-trajectory__dot-bipolar titan-index-trajectory__dot-bipolar--mid"
          }
        />
        <circle
          cx={last.x}
          cy={last.y}
          r="6"
          className={
            last.b < 0
              ? "titan-index-trajectory__dot-halo-bipolar titan-index-trajectory__dot-halo-bipolar--neg"
              : last.b > 0
                ? "titan-index-trajectory__dot-halo-bipolar titan-index-trajectory__dot-halo-bipolar--pos"
                : "titan-index-trajectory__dot-halo-bipolar"
          }
        />
      </svg>
    </div>
  );
}

/** 0 = center (−100…+100); red fill left of center, green right; keeps same COT index math, new UI scale. */
function BipolarRangeBar({ index0to100, glow }: { index0to100: number; glow: number }) {
  const b = indexToBipolar(index0to100);
  const markerPct = 50 + (b / 100) * 50;
  const glowAlpha = Math.min(1, glow / 100);

  return (
    <div
      className="titan-engine-meter titan-engine-meter--bipolar"
      style={{ "--zone-glow": glowAlpha } as CSSProperties}
    >
      <div className="titan-engine-meter__track titan-engine-meter__track--bipolar relative h-2">
        <span className="titan-engine-meter__mid" aria-hidden />
        {b < 0 ? (
          <span
            className="titan-engine-meter__fill titan-engine-meter__fill--neg-bipolar absolute bottom-0 top-0 rounded-full"
            style={{ left: `${markerPct}%`, width: `${50 - markerPct}%` }}
          />
        ) : null}
        {b > 0 ? (
          <span
            className="titan-engine-meter__fill titan-engine-meter__fill--pos-bipolar absolute bottom-0 top-0 rounded-full"
            style={{ left: "50%", width: `${markerPct - 50}%` }}
          />
        ) : null}
        <span className="titan-engine-meter__marker" style={{ left: `${markerPct}%` }} aria-hidden />
      </div>
      <div className="mt-1.5 flex justify-between font-mono text-[9px] text-stone-600">
        <span>−100</span>
        <span>0</span>
        <span>+100</span>
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

function DeltaFlowTable({ rows, t }: { rows: DeltaFlowRow[]; t: (k: string) => string }) {
  return (
    <table className="titan-delta-table w-full text-left">
      <thead>
        <tr>
          <th>{t("positioning.delta.timeframe")}</th>
          <th>{t("positioning.delta.delta")}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.label}>
            <td className="font-mono text-stone-400">{row.label}</td>
            <td className={`font-mono tabular-nums ${row.delta < 0 ? "text-[#c99494]" : row.delta > 0 ? "text-[#6eb692]" : "text-stone-500"}`}>
              {fmtDelta(row.delta)}
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

function commercialZoneExtreme(zone: CommercialZoneId): boolean {
  return zone === "extreme_short" || zone === "extreme_long";
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
  sectionLabel,
}: {
  read: TitanPositioningRead;
  t: (k: string) => string;
  sectionLabel?: string;
}) {
  const commTone = zoneAccent(read.commercialZone);
  const retailTone = zoneAccent(read.retailZone);

  return (
    <div className={`titan-terminal-section ${sectionLabel ? "mt-0" : "mt-4"}`}>
      <h3 className="titan-terminal-section__label">{sectionLabel ?? t("positioning.sections.context")}</h3>
      <div className="titan-terminal-grid titan-terminal-grid--3 mt-4">
        <TerminalCard accent={commTone === "bear" ? "red" : commTone === "bull" ? "green" : "gold"} icon={<IconBuilding />} title={t("positioning.cards.commercial.title")}>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-stone-500">{t("positioning.cards.commercial.subtitle")}</p>
          <div className="mt-3">
            <p className="titan-terminal-metric">{fmtBipolar(indexToBipolar(read.commercialIndex))}</p>
            <p className={`titan-terminal-state titan-terminal-state--${commTone}`}>{t(commercialStateKey(read.commercialZone))}</p>
          </div>
          <p className="mt-2 text-[10px] leading-relaxed text-stone-500">{t("positioning.cards.commercial.scaleHelper")}</p>
          <div className="mt-4">
            <BipolarRangeBar index0to100={read.commercialIndex} glow={read.commercialGlow} />
          </div>
          <div className="mt-3">
            <BipolarIndexTrajectoryChart values={read.commercialSparkline} label={t("positioning.trajectory")} />
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
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-stone-500">{t("positioning.cards.retail.subtitle")}</p>
          <div className="mt-3">
            <p className="titan-terminal-metric">{fmtBipolar(indexToBipolar(read.retailIndex))}</p>
            <p className={`titan-terminal-state titan-terminal-state--${retailTone}`}>
              {t(`positioning.retailState.${retailPositioningLabel(read.retailZone)}`)}
            </p>
          </div>
          <p className="mt-2 text-[10px] leading-relaxed text-stone-500">{t("positioning.cards.retail.scaleHelper")}</p>
          <p className="mt-1 text-[10px] text-stone-600">{t("positioning.cards.retail.crowdNote")}</p>
          <div className="mt-4">
            <BipolarRangeBar index0to100={read.retailIndex} glow={read.commercialGlow} />
          </div>
          <div className="mt-3">
            <BipolarIndexTrajectoryChart values={read.retailSparkline} label={t("positioning.trajectory")} />
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
          <DeltaFlowHorizonChart rows={read.deltaFlow} t={t} />
          <div className="mt-4">
            <DeltaFlowTable rows={read.deltaFlow} t={t} />
          </div>
          <p className="mt-4 text-[12px] leading-snug text-stone-500">{t("positioning.cards.delta.desc")}</p>
        </TerminalCard>
      </div>
    </div>
  );
}

function SignalEngine({ read, t }: { read: TitanPositioningRead; t: (k: string) => string }) {
  const commExtreme = commercialZoneExtreme(read.commercialZone);
  const noFlowCross = !read.smTurnDown && !read.smTurnUp;

  let revHeadline = t("positioning.reversal.panelNoConfirm");
  let revSub = t("positioning.reversal.panelDescNeutral");

  if (read.reversal === "confirmed_top" || read.reversal === "confirmed_bottom") {
    revHeadline = t(`positioning.reversal.${read.reversal}`);
    revSub = t("positioning.reversal.panelDescConfirmed");
  } else if (read.reversal === "potential_top" || read.reversal === "potential_bottom") {
    revSub = t("positioning.reversal.panelDescPotential");
  } else if (read.extremePositioning) {
    revSub = t("positioning.reversal.panelDescExtremeActive");
  }

  return (
    <div className="titan-terminal-section-signal">
      <h3 className="titan-terminal-section__label titan-terminal-section-signal__label">{t("detail.sectionStructure")}</h3>
      <div className="titan-terminal-grid titan-terminal-grid--3 mt-3">
        <TerminalCard accent="gold" icon={<IconReversal />} title={t("positioning.cards.reversal.title")} className="titan-terminal-card--secondary">
          <p className="titan-terminal-headline">{revHeadline}</p>
          <p className="mt-2 text-sm text-titan-gold/85">{revSub}</p>
          <ul className="mt-5 space-y-2.5">
            <CheckItem checked={commExtreme} label={t("positioning.checklist.commercialExtreme")} />
            <CheckItem checked={read.checklist.retailContrarian} label={t("positioning.checklist.retailCrowd")} />
            <CheckItem checked={noFlowCross} label={t("positioning.checklist.noFlowCross")} />
          </ul>
        </TerminalCard>

        <TerminalCard accent="purple" icon={<IconDivergence />} title={t("positioning.cards.divergence.title")} className="titan-terminal-card--secondary">
          <p className="titan-terminal-headline">{t(`positioning.divergence.headline.${read.divergence}`)}</p>
          <p className="mt-2 text-sm text-stone-400">{t(`positioning.divergence.hint.${read.divergence}`)}</p>
          <div className="mt-5 grid grid-cols-2 gap-2">
            <div className="titan-terminal-mini-stat">
              <p className="titan-terminal-kicker">{t("positioning.divergence.structureContext")}</p>
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

        <TerminalCard accent="blue" icon={<IconRegime />} title={t("positioning.cards.regime.title")} className="titan-terminal-card--secondary">
          <p className="titan-terminal-headline">{t(`positioning.regime.${read.regime}`)}</p>
          <p className="mt-2 text-sm text-stone-400">{t(`positioning.regime.hint.${read.regime}`)}</p>
          <div className="titan-regime-segments mt-5" role="group" aria-label={t("positioning.cards.regime.title")}>
            {(
              [
                "accumulation",
                "distribution",
                "trending",
                "rotation",
                "exhaustion",
                "transition",
                "neutral",
              ] as const
            ).map((r) => (
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

export function TitanPositioningCore({ market: _market, data, loading }: TitanMarketEngineProps) {
  const { t } = useTitanI18n();
  const read = data ? evaluateTitanPositioning(data) : null;

  return (
    <section className="titan-market-engine titan-positioning-terminal relative border-b border-white/[0.06] px-5 py-6 md:px-7 md:py-8">
      <div className="titan-market-engine__backdrop pointer-events-none absolute inset-0" aria-hidden />
      <div className="titan-positioning-terminal__vignette pointer-events-none absolute inset-0" aria-hidden />

      {loading ? (
        <div className="relative mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="titan-terminal-card h-56 animate-pulse bg-white/[0.03]" />
          ))}
        </div>
      ) : !read ? (
        <p className="relative mt-4 text-sm text-stone-500">{t("positioning.unavailable")}</p>
      ) : (
        <div className="relative">
          <PositioningContext read={read} t={t} sectionLabel={t("detail.sectionCorePositioning")} />
        </div>
      )}
    </section>
  );
}

export function TitanPositioningSignal({ market: _market, data, loading }: TitanMarketEngineProps) {
  const { t } = useTitanI18n();
  const read = data ? evaluateTitanPositioning(data) : null;

  return (
    <section className="titan-market-engine titan-positioning-terminal relative border-b border-white/[0.06] px-5 py-5 md:px-7 md:py-6">
      <div className="titan-market-engine__backdrop pointer-events-none absolute inset-0 opacity-50" aria-hidden />

      {loading ? (
        <div className="relative mt-2 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="titan-terminal-card h-44 animate-pulse bg-white/[0.02]" />
          ))}
        </div>
      ) : !read ? null : (
        <div className="relative">
          <SignalEngine read={read} t={t} />
        </div>
      )}
    </section>
  );
}

export function TitanMarketEngine({ market, data, loading }: TitanMarketEngineProps) {
  return (
    <>
      <TitanPositioningCore market={market} data={data} loading={loading} />
      <TitanPositioningSignal market={market} data={data} loading={loading} />
    </>
  );
}
