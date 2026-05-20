import { getCotApiBase, describeCotApiTarget } from "../data/cotData";
import type { SeasonalityComparison } from "./services/seasonalityService";
import type { SeasonalityResult } from "./types";
import type { YearsLookback } from "./yearsLookback";

/** Use TITAN API for seasonality (same host as COT by default). Set VITE_USE_SEASONALITY_API=false for local-only mock. */
export function shouldUseSeasonalityApi(): boolean {
  const flag = import.meta.env.VITE_USE_SEASONALITY_API?.trim().toLowerCase();
  if (flag === "false" || flag === "0") return false;
  if (flag === "true" || flag === "1") return true;
  return import.meta.env.PROD;
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

export async function fetchSeasonalityComparisonFromApi(
  symbol: string,
): Promise<SeasonalityComparison> {
  const base = getSeasonalityApiBase();
  const response = await fetch(`${base}/api/seasonality/${encodeURIComponent(symbol)}/bundle`);

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
): Promise<SeasonalityResult> {
  const base = getSeasonalityApiBase();
  const q = lookback === "ALL" ? "ALL" : String(lookback);
  const response = await fetch(
    `${base}/api/seasonality/${encodeURIComponent(symbol)}?lookback=${encodeURIComponent(q)}`,
  );

  if (!response.ok) {
    throw new Error(`Seasonality API ${describeSeasonalityApiTarget()} → ${response.status}`);
  }

  const payload = (await response.json()) as SingleResponse;
  return payload.result;
}
