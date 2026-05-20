import type { ReactNode } from "react";

export function TitanPanel({
  children,
  className = "",
  delayMs = 0,
}: {
  children: ReactNode;
  className?: string;
  delayMs?: number;
}) {
  return (
    <section
      className={`titan-glass animate-fade-up rounded-2xl ${className}`}
      style={delayMs ? { animationDelay: `${delayMs}ms` } : undefined}
    >
      {children}
    </section>
  );
}

export function TitanPanelHeader({
  eyebrow,
  title,
  description,
  aside,
}: {
  eyebrow: string;
  title?: string;
  description?: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-3 border-b border-titan-line/80 px-5 py-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <p className="font-display text-[11px] font-semibold uppercase tracking-[0.22em] text-[#e8c547]">
          {eyebrow}
        </p>
        {title ? (
          <h2 className="mt-1 font-display text-lg font-semibold tracking-tight text-stone-100">{title}</h2>
        ) : null}
        {description ? <p className="mt-1 text-sm leading-relaxed text-stone-400">{description}</p> : null}
      </div>
      {aside ? <aside className="shrink-0">{aside}</aside> : null}
    </header>
  );
}

export function TitanBadge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "gold" | "bull" | "bear" | "neutral" | "warn";
}) {
  const toneClass =
    tone === "gold"
      ? "border-titan-gold/35 bg-titan-gold/10 text-titan-goldBright"
      : tone === "bull"
        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
        : tone === "bear"
          ? "border-rose-500/30 bg-rose-500/10 text-rose-300"
          : tone === "warn"
            ? "border-amber-500/30 bg-amber-500/10 text-amber-200"
            : "border-titan-line bg-titan-elevated/60 text-stone-400";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${toneClass}`}
    >
      {children}
    </span>
  );
}

export function TitanMetricCard({
  label,
  value,
  sub,
  index,
}: {
  label: string;
  value: string;
  sub?: string;
  index?: number;
}) {
  const barPct =
    index !== undefined && Number.isFinite(index) ? Math.max(0, Math.min(100, index)) : null;

  let barColor = "bg-stone-600";
  if (barPct !== null) {
    if (barPct > 80) barColor = "bg-emerald-500";
    else if (barPct > 60) barColor = "bg-emerald-600/70";
    else if (barPct < 20) barColor = "bg-rose-500";
    else if (barPct < 40) barColor = "bg-rose-600/70";
    else barColor = "bg-stone-500";
  }

  return (
    <article className="group rounded-xl border border-titan-line/80 bg-titan-elevated/30 p-4 transition-all duration-300 hover:border-titan-gold/20 hover:bg-titan-elevated/50">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">{label}</p>
      <p className="mt-2 font-mono text-xl font-medium tabular-nums text-stone-50">{value}</p>
      {barPct !== null ? (
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-titan-black/60">
          <span
            className={`block h-full rounded-full transition-all duration-500 ${barColor}`}
            style={{ width: `${barPct}%` }}
          />
        </div>
      ) : null}
      {sub ? <p className="mt-2 text-[11px] leading-snug text-stone-500">{sub}</p> : null}
    </article>
  );
}

export function TitanScoreGauge({ score }: { score: number }) {
  const clamped = Math.max(-100, Math.min(100, score));
  const pct = (clamped + 100) / 200;
  const circumference = 2 * Math.PI * 42;
  const offset = circumference * (1 - pct);
  const stroke = clamped >= 40 ? "#34d399" : clamped <= -40 ? "#fb7185" : "#a8a29e";

  return (
    <figure className="relative m-0 h-[108px] w-[108px] shrink-0">
      <svg viewBox="0 0 96 96" className="h-full w-full -rotate-90" aria-hidden>
        <circle cx="48" cy="48" r="42" fill="none" stroke="#1c1c22" strokeWidth="6" />
        <circle
          cx="48"
          cy="48"
          r="42"
          fill="none"
          stroke={stroke}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <figcaption className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-2xl font-semibold tabular-nums text-stone-50">{clamped}</span>
        <span className="text-[9px] uppercase tracking-widest text-stone-500">Score</span>
      </figcaption>
    </figure>
  );
}

export function TitanScoreBar({ score }: { score: number }) {
  const clamped = Math.max(-100, Math.min(100, score));
  const half = Math.abs(clamped) / 2;

  return (
    <div className="relative h-1.5 w-full rounded-full bg-titan-black/50">
      <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-titan-line/80" />
      {clamped >= 0 ? (
        <span
          className="absolute left-1/2 top-0 h-full rounded-r-full bg-emerald-500/80 transition-all duration-500"
          style={{ width: `${half}%` }}
        />
      ) : (
        <span
          className="absolute right-1/2 top-0 h-full rounded-l-full bg-rose-500/80 transition-all duration-500"
          style={{ width: `${half}%` }}
        />
      )}
    </div>
  );
}

export function TitanLivePill({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-300/90">
      <span className="relative flex h-2 w-2" aria-hidden>
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
      </span>
      {label}
    </span>
  );
}
