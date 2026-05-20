import type { ReactNode } from "react";
import type { MarketRegimeId } from "../../../lib/titanCommercialIndex";
import { CONVICTION_MAX } from "../../../lib/titanConviction";
import { scoreHeatClass } from "../../../lib/titanCotScore";
import type { WatchlistEntry } from "../../../lib/titanHomeOverview";
import type { FlowDirection } from "../../../lib/titanHomeMock";
import { FLOW_MAP_CLASSES, type FlowMapClassId } from "../../../lib/titanHomeMock";
import type { InstitutionalMarket } from "../../../config/institutionalMarkets";
import type { ScannerRowModel } from "../GlobalCotScanner";

export function GlassCard({
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

export function MiniCurve({
  points,
  tone,
  tall,
}: {
  points: readonly number[];
  tone: "bull" | "bear" | "neutral";
  tall?: boolean;
}) {
  const w = 200;
  const h = tall ? 56 : 36;
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
    <svg viewBox={`0 0 ${w} ${h}`} className={`titan-cmd-curve w-full ${tall ? "h-14" : "h-9"}`} aria-hidden>
      <polyline fill="none" stroke={stroke} strokeWidth="1.5" points={coords.join(" ")} />
    </svg>
  );
}

export function ConvictionMini({ level }: { level: number }) {
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

export function WatchlistPanel({
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

export function regimePillClass(regime: MarketRegimeId): string {
  if (regime === "accumulation" || regime === "trending") return "titan-regime-pill--bull";
  if (regime === "distribution") return "titan-regime-pill--bear";
  if (regime === "exhaustion" || regime === "transition") return "titan-regime-pill--warn";
  return "titan-regime-pill--neutral";
}

export function flowToneClass(dir: FlowDirection): string {
  if (dir === "inflow") return "text-emerald-400/90";
  if (dir === "outflow") return "text-rose-400/90";
  return "text-stone-400";
}

export function buildFlowMapFromRows(rows: ScannerRowModel[]): Record<
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
