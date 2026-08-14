import type { OhlcBar } from "../types";

/** U.S. presidential cycle phases (Seasonax-style). */
export type PresidentialCyclePhase = "election" | "post" | "midterm" | "pre";

export const PRESIDENTIAL_CYCLE_PHASES: readonly PresidentialCyclePhase[] = [
  "election",
  "post",
  "midterm",
  "pre",
] as const;

export const PRESIDENTIAL_CYCLE_LABELS: Record<PresidentialCyclePhase, string> = {
  election: "Elections",
  post: "Post Elections",
  midterm: "Midterm Elections",
  pre: "Pre Election",
};

/**
 * U.S. election years are divisible by 4 (2016, 2020, 2024…).
 * 0 election · 1 post · 2 midterm · 3 pre-election
 */
export function presidentialPhaseForYear(year: number): PresidentialCyclePhase {
  const mod = ((year % 4) + 4) % 4;
  if (mod === 0) return "election";
  if (mod === 1) return "post";
  if (mod === 2) return "midterm";
  return "pre";
}

export function isAllPresidentialPhases(
  phases: readonly PresidentialCyclePhase[] | null | undefined,
): boolean {
  if (!phases || phases.length === 0) return true;
  return PRESIDENTIAL_CYCLE_PHASES.every((p) => phases.includes(p));
}

export function normalizePresidentialPhases(
  phases: readonly PresidentialCyclePhase[] | null | undefined,
): PresidentialCyclePhase[] {
  if (!phases?.length || isAllPresidentialPhases(phases)) {
    return [...PRESIDENTIAL_CYCLE_PHASES];
  }
  const set = new Set(phases);
  return PRESIDENTIAL_CYCLE_PHASES.filter((p) => set.has(p));
}

export function presidentialPhasesCacheKey(
  phases: readonly PresidentialCyclePhase[] | null | undefined,
): string {
  if (isAllPresidentialPhases(phases)) return "all";
  return normalizePresidentialPhases(phases).join("+");
}

/** Keep OHLC bars whose calendar year matches selected presidential phases. */
export function filterBarsByPresidentialPhases(
  bars: OhlcBar[],
  phases: readonly PresidentialCyclePhase[] | null | undefined,
): OhlcBar[] {
  if (isAllPresidentialPhases(phases)) return bars;
  const allowed = new Set(normalizePresidentialPhases(phases));
  return bars.filter((bar) => {
    const year = Number(bar.date.slice(0, 4));
    if (!Number.isFinite(year)) return false;
    return allowed.has(presidentialPhaseForYear(year));
  });
}

export function parsePresidentialPhasesQuery(raw: unknown): PresidentialCyclePhase[] | null {
  if (typeof raw !== "string" || !raw.trim()) return null;
  const parts = raw
    .split(",")
    .map((p) => p.trim().toLowerCase())
    .filter(Boolean);
  if (!parts.length || parts.includes("all")) return null;
  const valid = new Set<string>(PRESIDENTIAL_CYCLE_PHASES);
  const out: PresidentialCyclePhase[] = [];
  for (const p of parts) {
    if (valid.has(p) && !out.includes(p as PresidentialCyclePhase)) {
      out.push(p as PresidentialCyclePhase);
    }
  }
  return out.length ? out : null;
}
