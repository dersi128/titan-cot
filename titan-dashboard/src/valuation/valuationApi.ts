import { getCotApiBase, describeCotApiTarget } from "../data/cotData";
import type { ValuationSnapshot, ValuationUniverseRow } from "./types";

export function getValuationApiBase(): string {
  return getCotApiBase();
}

export function describeValuationApiTarget(): string {
  return describeCotApiTarget();
}

type DetailResponse = {
  snapshot: ValuationSnapshot;
  fredStatus?: string;
};

type BundleResponse = {
  rows: ValuationUniverseRow[];
  fredStatus?: string;
  updatedAt?: string;
  errors?: Record<string, string>;
};

export async function fetchValuationDetail(id: string): Promise<ValuationSnapshot> {
  const response = await fetch(
    `${getValuationApiBase()}/api/valuation/${encodeURIComponent(id)}`,
  );
  if (!response.ok) {
    throw new Error(`Valuation API ${describeValuationApiTarget()} → ${response.status}`);
  }
  const payload = (await response.json()) as DetailResponse;
  if (!payload?.snapshot) throw new Error("Valuation API returned an empty snapshot.");
  return payload.snapshot;
}

export async function fetchValuationUniverse(): Promise<ValuationUniverseRow[]> {
  const response = await fetch(`${getValuationApiBase()}/api/valuation/bundle`);
  if (!response.ok) {
    throw new Error(`Valuation API ${describeValuationApiTarget()} → ${response.status}`);
  }
  const payload = (await response.json()) as BundleResponse;
  if (!Array.isArray(payload?.rows)) throw new Error("Valuation API returned no universe rows.");
  return payload.rows;
}
