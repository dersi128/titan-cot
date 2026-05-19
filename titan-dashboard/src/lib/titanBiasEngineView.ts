import type { CotDashboardData } from "../types";
import {
  countCommercialExtremePersistence,
  type TitanCotScoringResult,
} from "./titanCotScoringCore";
import { evaluateTitanPositioning } from "./titanCommercialIndex";

export type BiasDriverId =
  | "commercialPositioning"
  | "commercialFlow"
  | "persistence"
  | "ncDivergence"
  | "retailContrarian"
  | "openInterest";

export type ImpactTone = "strong_bear" | "bear" | "neutral" | "bull" | "strong_bull" | "contrarian_bear" | "contrarian_bull";

export type BiasDriverRow = {
  id: BiasDriverId;
  weightPct: number;
  score: number;
  maxAbs: number;
  impact: ImpactTone;
};

export type TitanBiasEngineView = {
  score: number;
  verdict: string;
  primaryDriverId: BiasDriverId;
  persistenceWeeks: number;
  drivers: BiasDriverRow[];
  keyDrivers: string[];
};

const DRIVER_WEIGHTS: Record<BiasDriverId, number> = {
  commercialPositioning: 50,
  commercialFlow: 20,
  persistence: 15,
  ncDivergence: 10,
  retailContrarian: 5,
  openInterest: 0,
};

const DRIVER_MAX: Record<BiasDriverId, number> = {
  commercialPositioning: 50,
  commercialFlow: 20,
  persistence: 15,
  ncDivergence: 10,
  retailContrarian: 6,
  openInterest: 7,
};

function impactForDriver(id: BiasDriverId, score: number): ImpactTone {
  if (score === 0) return "neutral";

  if (id === "retailContrarian") {
    if (score < 0) return "contrarian_bear";
    if (score > 0) return "contrarian_bull";
    return "neutral";
  }

  const abs = Math.abs(score);
  const strong = id === "commercialPositioning" ? abs >= 30 : id === "persistence" ? abs >= 10 : abs >= 8;

  if (score < 0) return strong ? "strong_bear" : "bear";
  return strong ? "strong_bull" : "bull";
}

function primaryDriver(components: TitanCotScoringResult["components"]): BiasDriverId {
  const candidates: BiasDriverId[] = [
    "commercialPositioning",
    "commercialFlow",
    "persistence",
    "ncDivergence",
    "retailContrarian",
  ];
  let best: BiasDriverId = "commercialPositioning";
  let bestAbs = 0;
  for (const id of candidates) {
    const abs = Math.abs(components[id]);
    if (abs > bestAbs) {
      bestAbs = abs;
      best = id;
    }
  }
  return best;
}

function buildKeyDrivers(data: CotDashboardData, scoring: TitanCotScoringResult, persistenceWeeks: number): string[] {
  const bullets: string[] = [];
  const c = data.commercials;
  const r = data.retail;
  const positioning = evaluateTitanPositioning(data);

  if (c.bias === "bearish" || c.index26w < 20) {
    bullets.push("commercials_heavy_short");
  } else if (c.bias === "bullish" || c.index26w > 80) {
    bullets.push("commercials_heavy_long");
  } else {
    bullets.push("commercials_mixed");
  }

  if (persistenceWeeks >= 4) {
    bullets.push(c.bias === "bullish" ? "persistence_bull" : "persistence_bear");
  }

  const flowNeg = c.weeklyChange < 0 && c.delta4w < 0 && c.delta13w < 0;
  const flowPos = c.weeklyChange > 0 && c.delta4w > 0 && c.delta13w > 0;
  if (flowNeg) bullets.push("flow_negative");
  else if (flowPos) bullets.push("flow_positive");
  else bullets.push("flow_mixed");

  if (r.contrarianSignal !== "none" || (c.bias === "bearish" && r.index26w > 80) || (c.bias === "bullish" && r.index26w < 20)) {
    bullets.push("retail_contrarian");
  }

  if (
    positioning.reversal === "none" ||
    positioning.reversal === "potential_top" ||
    positioning.reversal === "potential_bottom"
  ) {
    bullets.push("no_reversal");
  } else {
    bullets.push("reversal_confirmed");
  }

  return bullets;
}

export function buildTitanBiasEngineView(
  data: CotDashboardData,
  scoring: TitanCotScoringResult,
  score: number,
  verdict: string,
): TitanBiasEngineView {
  const { components } = scoring;
  const persistenceWeeks = Math.max(
    countCommercialExtremePersistence(data.history, "bull"),
    countCommercialExtremePersistence(data.history, "bear"),
  );

  const driverIds: BiasDriverId[] = [
    "commercialPositioning",
    "commercialFlow",
    "persistence",
    "ncDivergence",
    "retailContrarian",
  ];

  if (components.openInterest !== 0) {
    driverIds.push("openInterest");
  }

  const drivers: BiasDriverRow[] = driverIds.map((id) => ({
    id,
    weightPct: DRIVER_WEIGHTS[id],
    score: components[id],
    maxAbs: DRIVER_MAX[id],
    impact: impactForDriver(id, components[id]),
  }));

  return {
    score,
    verdict,
    primaryDriverId: primaryDriver(components),
    persistenceWeeks,
    drivers,
    keyDrivers: buildKeyDrivers(data, scoring, persistenceWeeks),
  };
}

export function driverBarSegments(score: number, maxAbs: number): number {
  if (maxAbs <= 0 || score === 0) return 0;
  return Math.max(1, Math.min(10, Math.round((Math.abs(score) / maxAbs) * 10)));
}
