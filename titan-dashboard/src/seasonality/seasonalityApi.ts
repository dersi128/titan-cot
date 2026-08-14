import { getCotApiBase, describeCotApiTarget } from "../data/cotData";
import type { SeasonalityComparison } from "./services/seasonalityService";
import type { SeasonalityResult } from "./types";
import type { YearsLookback } from "./yearsLookback";
import {
  isAllPresidentialPhases,
  type PresidentialCyclePhase,
} from "./utils/presidentialCycle";

/**
 * Default: server seasonality API (Yahoo OHLC on Render).
 * Set VITE_USE_SEASONALITY_API=false to compute in-browser via /api/yahoo.
 */
export function shouldUseSeasonalityApi(): boolean {
  const flag = import.meta.env.VITE_USE_SEASONALITY_API?.trim().toLowerCase();
  if (flag === "false" || flag === "0") return false;
  if (flag === "true" || flag === "1") return true;
  return true;
}

export function getSeasonalityApiBase(): string {
  const dedicated = import.meta.env.VITE_SEASONALITY_API_URL?.trim();
  if (dedicated) return dedicated.replace(/\/$/, "");
  return getCotApiBase();
}

export function describeSeasonalityApiTarget(): string {
  return describeCotApiTarget();
}

type BundleResponse = {
  symbol: string;
  cached?: boolean;
  comparison: SeasonalityComparison;
};

type SingleResponse = {
  symbol: string;
  lookback: YearsLookback;
  result: SeasonalityResult;
};

function cyclesQuery(phases?: PresidentialCyclePhase[] | null): string {
  if (!phases || isAllPresidentialPhases(phases)) return "";
  return `?cycles=${encodeURIComponent(phases.join(","))}`;
}

export async function fetchSeasonalityComparisonFromApi(
  symbol: string,
  phases?: PresidentialCyclePhase[] | null,
): Promise<SeasonalityComparison> {
  const base = getSeasonalityApiBase();
  const response = await fetch(
    `${base}/api/seasonality/${encodeURIComponent(symbol)}/bundle${cyclesQuery(phases)}`,
  );

  if (!response.ok) {
    throw new Error(
      `Seasonality API ${describeSeasonalityApiTarget()} → ${response.status}. Check VITE_COT_API_URL or cot-data-module on Render.`,
    );
  }

  const payload = (await response.json()) as BundleResponse;
  return payload.comparison;
}

export async function fetchSeasonalityAnalysisFromApi(
  symbol: string,
  lookback: YearsLookback,
  phases?: PresidentialCyclePhase[] | null,
): Promise<SeasonalityResult> {
  const base = getSeasonalityApiBase();
  const q = lookback === "ALL" ? "ALL" : String(lookback);
  const cycle = cyclesQuery(phases);
  const join = cycle ? "&" : "?";
  const response = await fetch(
    `${base}/api/seasonality/${encodeURIComponent(symbol)}${cycle}${join}lookback=${encodeURIComponent(q)}`,
  );

  if (!response.ok) {
    throw new Error(`Seasonality API ${describeSeasonalityApiTarget()} → ${response.status}`);
  }

  const payload = (await response.json()) as SingleResponse;
  return payload.result;
}
