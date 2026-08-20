import type { DatedValue } from "./types";

export function clip(x: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, x));
}

export function round1(x: number): number {
  return Math.round(x * 10) / 10;
}

export function round2(x: number): number {
  return Math.round(x * 100) / 100;
}

export function sortByDate(xs: DatedValue[]): DatedValue[] {
  return xs
    .filter((p) => Number.isFinite(p.value) && p.date)
    .slice()
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
}

/** Last observation in each calendar month. */
export function toMonthlyLast(xs: DatedValue[]): DatedValue[] {
  const last = new Map<string, DatedValue>();
  for (const p of sortByDate(xs)) {
    last.set(p.date.slice(0, 7), p);
  }
  return [...last.values()].sort((a, b) => (a.date < b.date ? -1 : 1));
}

export function lastPoint(xs: DatedValue[] | undefined): DatedValue | null {
  if (!xs?.length) return null;
  return xs[xs.length - 1] ?? null;
}

export function sliceOnOrBefore(xs: DatedValue[], asOf: string): DatedValue[] {
  return xs.filter((p) => p.date <= asOf);
}

/** For each master date, take the latest `other` value on or before that date. */
export function lookupAsOf(other: DatedValue[], date: string): number | null {
  let found: number | null = null;
  for (const p of other) {
    if (p.date > date) break;
    found = p.value;
  }
  return found;
}

export function mean(xs: number[]): number {
  if (!xs.length) return NaN;
  let s = 0;
  for (const x of xs) s += x;
  return s / xs.length;
}

export function sampleStdev(xs: number[]): number {
  if (xs.length < 2) return 0;
  const m = mean(xs);
  let ss = 0;
  for (const x of xs) {
    const d = x - m;
    ss += d * d;
  }
  return Math.sqrt(ss / (xs.length - 1));
}

export function percentileRank(sample: number[], x: number): number {
  if (!sample.length) return 50;
  let le = 0;
  for (const v of sample) if (v <= x) le += 1;
  return (le / sample.length) * 100;
}

export function zScore(sample: number[], x: number): number {
  const s = sampleStdev(sample);
  if (s < 1e-12) return 0;
  return (x - mean(sample)) / s;
}

/** High percentile / z = expensive → negative Titan score (cheap is positive). */
export function invertPercentileScore(percentile: number): number {
  return clip((50 - percentile) * 2, -100, 100);
}

export function invertZScore(z: number, scale = 2.5): number {
  return clip((-z / scale) * 100, -100, 100);
}

/** +gapPct means spot above fair (rich). scalePct is the gap that maps to ±100. */
export function gapToScore(gapPct: number, scalePct: number): number {
  if (!Number.isFinite(gapPct) || scalePct <= 0) return 0;
  return clip((-gapPct / scalePct) * 100, -100, 100);
}

export function yoyFromIndex(monthly: DatedValue[]): DatedValue[] {
  const out: DatedValue[] = [];
  for (let i = 12; i < monthly.length; i++) {
    const prev = monthly[i - 12]!;
    const cur = monthly[i]!;
    if (prev.value > 0 && cur.value > 0) {
      out.push({ date: cur.date, value: (cur.value / prev.value - 1) * 100 });
    }
  }
  return out;
}

export function yearsFrom(startIso: string, dateIso: string): number {
  const a = Date.parse(`${startIso}T00:00:00Z`);
  const b = Date.parse(`${dateIso}T00:00:00Z`);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return 0;
  return (b - a) / (365.25 * 24 * 3600 * 1000);
}

export function addYearsIso(iso: string, years: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  if (!Number.isFinite(d.getTime())) return iso;
  d.setUTCFullYear(d.getUTCFullYear() + years);
  return d.toISOString().slice(0, 10);
}

export type OlsFit = {
  intercept: number;
  slope: number;
  r2: number;
};

export function ols(x: number[], y: number[]): OlsFit | null {
  const n = Math.min(x.length, y.length);
  if (n < 8) return null;
  let sx = 0;
  let sy = 0;
  let sxx = 0;
  let sxy = 0;
  for (let i = 0; i < n; i++) {
    const xi = x[i]!;
    const yi = y[i]!;
    sx += xi;
    sy += yi;
    sxx += xi * xi;
    sxy += xi * yi;
  }
  const denom = n * sxx - sx * sx;
  if (Math.abs(denom) < 1e-18) return null;
  const slope = (n * sxy - sx * sy) / denom;
  const intercept = (sy - slope * sx) / n;
  const yMean = sy / n;
  let ssTot = 0;
  let ssRes = 0;
  for (let i = 0; i < n; i++) {
    const yi = y[i]!;
    const pred = intercept + slope * x[i]!;
    const dt = yi - yMean;
    const dr = yi - pred;
    ssTot += dt * dt;
    ssRes += dr * dr;
  }
  const r2 = ssTot < 1e-18 ? 0 : 1 - ssRes / ssTot;
  return { intercept, slope, r2 };
}

export function olsMultiple(X: number[][], y: number[]): { beta: number[]; r2: number } | null {
  const n = y.length;
  if (!X.length || X.length !== n) return null;
  const k = X[0]?.length ?? 0;
  if (k < 1 || n < k + 6) return null;

  const A: number[][] = Array.from({ length: k }, () => Array<number>(k).fill(0));
  const b: number[] = Array<number>(k).fill(0);
  for (let i = 0; i < n; i++) {
    const row = X[i]!;
    const yi = y[i]!;
    for (let c = 0; c < k; c++) {
      b[c]! += row[c]! * yi;
      for (let r = 0; r < k; r++) {
        A[r]![c]! += row[r]! * row[c]!;
      }
    }
  }

  const beta = solveLinearSystem(A, b);
  if (!beta) return null;

  const yMean = mean(y);
  let ssTot = 0;
  let ssRes = 0;
  for (let i = 0; i < n; i++) {
    const row = X[i]!;
    let pred = 0;
    for (let c = 0; c < k; c++) pred += beta[c]! * row[c]!;
    const yi = y[i]!;
    ssTot += (yi - yMean) ** 2;
    ssRes += (yi - pred) ** 2;
  }
  const r2 = ssTot < 1e-18 ? 0 : 1 - ssRes / ssTot;
  if (!Number.isFinite(r2)) return null;
  return { beta, r2 };
}

function solveLinearSystem(Ain: number[][], bin: number[]): number[] | null {
  const n = bin.length;
  const M = Ain.map((row, i) => [...row, bin[i]!]);
  for (let col = 0; col < n; col++) {
    let pivot = col;
    let best = Math.abs(M[col]![col]!);
    for (let r = col + 1; r < n; r++) {
      const v = Math.abs(M[r]![col]!);
      if (v > best) {
        best = v;
        pivot = r;
      }
    }
    if (best < 1e-12) return null;
    if (pivot !== col) {
      const tmp = M[col]!;
      M[col] = M[pivot]!;
      M[pivot] = tmp;
    }
    const div = M[col]![col]!;
    for (let c = col; c <= n; c++) M[col]![c]! /= div;
    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const f = M[r]![col]!;
      for (let c = col; c <= n; c++) M[r]![c]! -= f * M[col]![c]!;
    }
  }
  return M.map((row) => row[n]!);
}
