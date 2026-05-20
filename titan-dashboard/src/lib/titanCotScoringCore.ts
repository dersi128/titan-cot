/**
 * TITAN COT — unified deterministic BIAS engine (Legacy Futures only).
 * Rule-based only. No AI / no predictive narrative.
 *
 * Keep conceptual parity with API where applicable.
 */

export type CotVerdict =
  | "A+ EXTREME SHORT"
  | "A STRONG SHORT"
  | "B SHORT"
  | "WEAK SHORT"
  | "NEUTRAL"
  | "WEAK LONG"
  | "B LONG"
  | "A STRONG LONG"
  | "A+ EXTREME LONG";

export type CommercialBias = "bullish" | "bearish" | "neutral";
export type InstitutionalDivergence = "bullish" | "bearish" | "none";
export type RetailContrarian = "bullish" | "bearish" | "none";

export type CotHistoryPoint = {
  reportDate: string;
  commercialNet: number;
  nonCommercialNet: number;
  retailNet: number;
};

export type OpenInterestSnapshot = {
  weeklyChange?: number;
  index26w?: number;
};

export type TitanCotScoringInput = {
  commercials: {
    index26w: number;
    index52w: number;
    weeklyChange: number;
    delta4w: number;
    delta13w: number;
    bias: CommercialBias;
  };
  nonCommercials: {
    weeklyChange: number;
    divergence: InstitutionalDivergence;
  };
  retail: {
    index26w: number;
    index52w: number;
    contrarianSignal: RetailContrarian;
  };
  history?: CotHistoryPoint[];
  openInterest?: OpenInterestSnapshot;
};

export type BiasDriverId =
  | "commercialPositioning"
  | "commercialDeltaFlow"
  | "persistence"
  | "ncDivergence"
  | "retailCrowding";

export type TitanBiasDriverDetail = {
  id: BiasDriverId;
  name: string;
  importance: number;
  impact: string;
  points: number;
  explanation: string;
  trigger_conditions: string[];
  is_primary: boolean;
};

export type TitanMarketRegime =
  | "ACCUMULATION"
  | "DISTRIBUTION"
  | "TRENDING"
  | "ROTATION"
  | "EXHAUSTION"
  | "TRANSITION"
  | "NEUTRAL";

export type TitanCotScoringComponents = {
  commercialPositioning: number;
  commercialDeltaFlow: number;
  persistence: number;
  ncDivergence: number;
  retailCrowding: number;
};

export type TitanCotScoringResult = {
  /** Clamped total (−100…+100). */
  score: number;
  raw_score: number;
  verdict: CotVerdict;
  confidence: string;
  market_regime: TitanMarketRegime;
  /** One-sentence regime copy (EN — UI may i18n via regime id). */
  regime_explanation: string;
  /** @deprecated Use market_regime + regime_explanation */
  marketPhase: string;
  components: TitanCotScoringComponents;
  drivers: TitanBiasDriverDetail[];
  primary_driver_id: BiasDriverId;
  key_drivers_structural: StructuralBulletId[];
  key_drivers_execution: string[];
  persistence_weeks_for_badge: number;
  persistence_side: "bull" | "bear" | "none";
};

export type StructuralBulletId =
  | "commercials_heavy_short"
  | "commercials_heavy_long"
  | "extreme_territory"
  | "flow_negative"
  | "flow_positive"
  | "persistence_elevated"
  | "moderate_bias";

const IDX_HI = 80;
const IDX_LO = 20;
const BIAS_DISCLAIMER = "Bias only, not execution.";

export function calculateCotIndex(nets: number[], currentNet: number): number {
  if (nets.length === 0) return 50;
  const min = Math.min(...nets);
  const max = Math.max(...nets);
  if (max === min) return 50;
  return Math.round(((currentNet - min) / (max - min)) * 10000) / 100;
}

export function clampScore(score: number): number {
  if (!Number.isFinite(score)) return 0;
  return Math.max(-100, Math.min(100, Math.round(score)));
}

export function scoreToCotVerdict(score: number): CotVerdict {
  const s = clampScore(score);
  if (s <= -85) return "A+ EXTREME SHORT";
  if (s <= -65) return "A STRONG SHORT";
  if (s <= -40) return "B SHORT";
  if (s <= -20) return "WEAK SHORT";
  if (s < 20) return "NEUTRAL";
  if (s < 40) return "WEAK LONG";
  if (s < 65) return "B LONG";
  if (s < 85) return "A STRONG LONG";
  return "A+ EXTREME LONG";
}

export function scoreToConfidence(score: number): string {
  const a = Math.abs(clampScore(score));
  if (a >= 85) return "EXTREME";
  if (a >= 65) return "HIGH";
  if (a >= 40) return "MEDIUM";
  if (a >= 20) return "LOW";
  return "NEUTRAL";
}

export function countCommercialExtremePersistence(
  history: CotHistoryPoint[] | undefined,
  side: "bull" | "bear",
): number {
  if (!history || history.length < 27) return 0;

  let streak = 0;
  for (let i = history.length - 1; i >= 26; i--) {
    const window = history.slice(i - 25, i + 1).map((h) => h.commercialNet);
    const idx = calculateCotIndex(window, window[window.length - 1]!);
    const inExtreme = side === "bull" ? idx > IDX_HI : idx < IDX_LO;
    if (inExtreme) streak += 1;
    else break;
  }
  return streak;
}

export function activeCommercialPersistenceStreak(
  commercials: TitanCotScoringInput["commercials"],
  history: CotHistoryPoint[] | undefined,
): { weeks: number; side: "bull" | "bear" | "none" } {
  const c = commercials;
  const bullStreak = countCommercialExtremePersistence(history, "bull");
  const bearStreak = countCommercialExtremePersistence(history, "bear");

  if (c.bias === "bullish" || (c.index26w > IDX_HI && c.index26w >= c.index52w - 10)) {
    return { weeks: bullStreak, side: "bull" };
  }
  if (c.bias === "bearish" || c.index26w < IDX_LO) {
    return { weeks: bearStreak, side: "bear" };
  }
  return { weeks: 0, side: "none" };
}

/** Week-over-week commercial net changes (aligned with report dates). */
export function commercialWeeklyDeltaSeries(
  history: CotHistoryPoint[] | undefined,
): { reportDate: string; delta: number }[] {
  if (!history || history.length < 2) return [];
  const out: { reportDate: string; delta: number }[] = [];
  for (let i = 1; i < history.length; i++) {
    const delta = history[i]!.commercialNet - history[i - 1]!.commercialNet;
    out.push({ reportDate: history[i]!.reportDate, delta });
  }
  return out;
}

function impactFromPoints(points: number, maxAbs: number): string {
  const a = Math.abs(points);
  const thr = maxAbs * 0.55;
  if (points < 0) {
    if (a >= thr) return "Strong Bearish";
    if (a > 0) return "Bearish";
    return "Neutral";
  }
  if (points > 0) {
    if (a >= thr) return "Strong Bullish";
    return "Bullish";
  }
  return "Neutral";
}

function driverCommercialPositioning(c: TitanCotScoringInput["commercials"]): Omit<TitanBiasDriverDetail, "is_primary"> {
  const idx = Math.max(0, Math.min(100, c.index26w));
  const raw = idx - 50;
  const points = Math.max(-50, Math.min(50, Math.round(raw)));
  const triggers: string[] = [`commercial_index_26w=${idx}`];
  if (idx < IDX_LO) triggers.push("commercial_index_below_20_bearish_extreme");
  if (idx > IDX_HI) triggers.push("commercial_index_above_80_bullish_extreme");
  return {
    id: "commercialPositioning",
    name: "Commercial Positioning",
    importance: 50,
    impact: impactFromPoints(points, 50),
    points,
    explanation:
      points <= -20
        ? "26W commercial index toward the short side of its range — supports bearish structural bias."
        : points >= 20
          ? "26W commercial index toward the long side — supports bullish structural bias."
          : "26W commercial index near mid-range — suggests limited directional positioning pressure.",
    trigger_conditions: triggers,
  };
}

function driverCommercialDeltaFlow(c: TitanCotScoringInput["commercials"]): Omit<TitanBiasDriverDetail, "is_primary"> {
  const w1 = c.weeklyChange;
  const w4 = c.delta4w;
  const w13 = c.delta13w;
  const allNeg = w1 < 0 && w4 < 0 && w13 < 0;
  const allPos = w1 > 0 && w4 > 0 && w13 > 0;
  let points = 0;
  const triggers: string[] = [`delta_1w=${w1}`, `delta_4w=${w4}`, `delta_13w=${w13}`];
  if (allNeg) {
    points = -20;
    triggers.push("all_horizons_negative_strong_bearish_flow");
  } else if (allPos) {
    points = 20;
    triggers.push("all_horizons_positive_strong_bullish_flow");
  } else {
    points = 0;
    triggers.push("mixed_flow_no_clean_direction");
  }
  return {
    id: "commercialDeltaFlow",
    name: "Commercial Delta Flow",
    importance: 20,
    impact: allNeg ? "Strong Bearish Flow" : allPos ? "Strong Bullish Flow" : "Mixed / Neutral Flow",
    points,
    explanation: allNeg
      ? "1W, 4W and 13W commercial net changes are all negative — indicates sustained distribution of net length / addition of net short."
      : allPos
        ? "All three horizons positive — indicates sustained accumulation of net long / reduction of net short."
        : "Flow is mixed across 1W / 4W / 13W — does not give a clean directional confirmation.",
    trigger_conditions: triggers,
  };
}

function driverPersistence(
  c: TitanCotScoringInput["commercials"],
  history: CotHistoryPoint[] | undefined,
): Omit<TitanBiasDriverDetail, "is_primary"> & { weeks: number; side: "bull" | "bear" | "none" } {
  const ap = activeCommercialPersistenceStreak(c, history);
  const w = ap.weeks;
  const sign = ap.side === "bull" ? 1 : ap.side === "bear" ? -1 : 0;
  let mag = 0;
  const triggers: string[] = [`persistence_weeks=${w}`, `persistence_side=${ap.side}`];
  if (ap.side !== "none" && w > 0) {
    if (w >= 10) {
      mag = 15;
      triggers.push("persistence_tier_high");
    } else if (w >= 5) {
      mag = 10;
      triggers.push("persistence_tier_mid");
    } else {
      mag = 5;
      triggers.push("persistence_tier_low");
    }
  }
  const points = sign * mag;
  return {
    id: "persistence",
    name: "Persistence",
    importance: 15,
    impact: impactFromPoints(points, 15),
    points,
    explanation:
      ap.side === "none" || w === 0
        ? "No multi-week streak in the commercial index extreme (rolling 26W percentile)."
        : ap.side === "bear"
          ? `${w} consecutive week(s) with commercial index in bearish extreme (<${IDX_LO}) — supports bearish persistence.`
          : `${w} consecutive week(s) with commercial index in bullish extreme (>${IDX_HI}) — supports bullish persistence.`,
    trigger_conditions: triggers,
    weeks: w,
    side: ap.side,
  };
}

function driverNcDivergence(
  c: TitanCotScoringInput["commercials"],
  nc: TitanCotScoringInput["nonCommercials"],
): Omit<TitanBiasDriverDetail, "is_primary"> {
  const commBear = c.index26w < 45;
  const commBull = c.index26w > 55;
  let points = 0;
  const triggers: string[] = [`nc_divergence=${nc.divergence}`, `commercial_index_26w=${c.index26w}`];
  if (commBear && nc.divergence === "bullish") {
    points = -10;
    triggers.push("commercial_bearish_nc_bullish_bearish_confirmation");
  } else if (commBull && nc.divergence === "bearish") {
    points = 10;
    triggers.push("commercial_bullish_nc_bearish_bullish_confirmation");
  } else {
    triggers.push("no_divergence_confirmation");
  }
  return {
    id: "ncDivergence",
    name: "Non-Commercial Divergence",
    importance: 10,
    impact: points === 0 ? "Neutral" : points < 0 ? "Bearish Divergence" : "Bullish Divergence",
    points,
    explanation:
      points < 0
        ? "Non-commercial weekly flow leans opposite to commercial bearish lean — historically aligns with bearish confirmation in this rule set."
        : points > 0
          ? "Non-commercial weekly flow leans opposite to commercial bullish lean — historically aligns with bullish confirmation in this rule set."
          : "No qualifying commercial vs non-commercial divergence pattern under deterministic rules.",
    trigger_conditions: triggers,
  };
}

function driverRetailCrowding(
  c: TitanCotScoringInput["commercials"],
  r: TitanCotScoringInput["retail"],
): Omit<TitanBiasDriverDetail, "is_primary"> {
  const dualShort = c.index26w < IDX_LO && c.index52w < IDX_LO;
  const dualLong = c.index26w > IDX_HI && c.index52w > IDX_HI;
  const s26Short = c.index26w < IDX_LO;
  const s26Long = c.index26w > IDX_HI;
  const retailLong = r.index26w > IDX_HI;
  const retailShort = r.index26w < IDX_LO;
  let points = 0;
  const triggers: string[] = [
    `commercial_26w=${c.index26w}`,
    `commercial_52w=${c.index52w}`,
    `retail_26w=${r.index26w}`,
    `contrarian_signal=${r.contrarianSignal}`,
  ];

  if (dualShort && retailLong) {
    points = -20;
    triggers.push("dual_horizon_comm_short_retail_long_contrarian_crowding");
  } else if (dualLong && retailShort) {
    points = 20;
    triggers.push("dual_horizon_comm_long_retail_short_contrarian_crowding");
  } else if (s26Short && retailLong) {
    points = -15;
    triggers.push("commercial_short_extreme_retail_long");
  } else if (s26Long && retailShort) {
    points = 15;
    triggers.push("commercial_long_extreme_retail_short");
  } else if (r.contrarianSignal === "bearish") {
    points = -8;
    triggers.push("api_contrarian_bearish");
  } else if (r.contrarianSignal === "bullish") {
    points = 8;
    triggers.push("api_contrarian_bullish");
  } else if (retailShort && c.bias === "bullish") {
    points = 5;
    triggers.push("retail_short_vs_commercial_bull_bias");
  } else if (retailLong && c.bias === "bearish") {
    points = -5;
    triggers.push("retail_long_vs_commercial_bear_bias");
  }

  return {
    id: "retailCrowding",
    name: "Retail Crowding",
    importance: 18,
    impact:
      points <= -12
        ? "Contrarian Bearish"
        : points >= 12
          ? "Contrarian Bullish"
          : points < 0
            ? "Bearish skew"
            : points > 0
              ? "Bullish skew"
              : "Neutral",
    points: Math.max(-20, Math.min(20, points)),
    explanation:
      Math.abs(points) >= 12
        ? "Retail positioning is crowded opposite to a commercial extreme — treated as contrarian anomaly factor (not primary execution)."
        : points === 0
          ? "No retail crowding anomaly triggered under rule thresholds."
          : "Mild retail vs commercial skew — contributes as a secondary bias hint only.",
    trigger_conditions: triggers,
  };
}

function computeMarketRegime(
  input: TitanCotScoringInput,
  clamped: number,
  components: TitanCotScoringComponents,
  persistWeeks: number,
  flowBear: boolean,
  flowBull: boolean,
  flowMixed: boolean,
): { regime: TitanMarketRegime; explanation: string } {
  const c = input.commercials;
  const r = input.retail;
  const nc = input.nonCommercials;
  const commBearExt = c.index26w < IDX_LO;
  const commBullExt = c.index26w > IDX_HI;
  const retailLong = r.index26w > IDX_HI;
  const retailCrowdedLong = r.index26w > 60;
  const retailShort = r.index26w < IDX_LO;
  const retailCrowdedShort = r.index26w < 40;

  if (
    commBearExt &&
    persistWeeks >= 8 &&
    flowBear &&
    (retailLong || retailCrowdedLong)
  ) {
    return { regime: "DISTRIBUTION", explanation: "Institutional selling pressure remains dominant." };
  }
  if (
    commBullExt &&
    persistWeeks >= 8 &&
    flowBull &&
    (retailShort || retailCrowdedShort)
  ) {
    return { regime: "ACCUMULATION", explanation: "Institutional accumulation remains dominant." };
  }

  const w1 = c.weeklyChange;
  const d4 = c.delta4w;
  const extremeNow = commBearExt || commBullExt;
  const flowWeakVsBear = commBearExt && !flowBear && (w1 > 0 || d4 > 0);
  const flowWeakVsBull = commBullExt && !flowBull && (w1 < 0 || d4 < 0);
  const divActive = nc.divergence !== "none";

  if (extremeNow && persistWeeks >= 6 && flowMixed && (flowWeakVsBear || flowWeakVsBull || divActive)) {
    return { regime: "EXHAUSTION", explanation: "Extreme positioning remains, but flow is weakening." };
  }

  if ((w1 > 0 && d4 < 0) || (w1 < 0 && d4 > 0)) {
    if (persistWeeks < 6 || Math.abs(clamped) < 50) {
      return { regime: "TRANSITION", explanation: "Positioning is shifting and previous bias is weakening." };
    }
  }

  if (Math.abs(clamped) >= 40 && !flowMixed && ((clamped < 0 && flowBear) || (clamped > 0 && flowBull))) {
    const conflict =
      Math.sign(components.commercialPositioning) !== Math.sign(components.commercialDeltaFlow) &&
      Math.abs(components.commercialDeltaFlow) >= 10;
    if (!conflict) {
      return { regime: "TRENDING", explanation: "Positioning and flow remain directionally aligned." };
    }
  }

  if (flowMixed && Math.abs(clamped) < 35 && persistWeeks < 5) {
    return { regime: "ROTATION", explanation: "Positioning is mixed and lacks clear directional pressure." };
  }

  if (clamped >= -19 && clamped <= 19) {
    return { regime: "NEUTRAL", explanation: "No clear institutional positioning bias." };
  }

  if (Math.abs(clamped) < 40 && flowMixed) {
    return { regime: "ROTATION", explanation: "Positioning is mixed and lacks clear directional pressure." };
  }

  return { regime: "NEUTRAL", explanation: "No clear institutional positioning bias." };
}

function buildKeyDrivers(
  c: TitanCotScoringInput["commercials"],
  persistWeeks: number,
  components: TitanCotScoringComponents,
  _clamped: number,
  _retailPoints: number,
): { structural: StructuralBulletId[]; execution: string[] } {
  const structural: StructuralBulletId[] = [];
  if (c.index26w < 35) structural.push("commercials_heavy_short");
  if (c.index26w > 65) structural.push("commercials_heavy_long");
  if (c.index26w < IDX_LO || c.index26w > IDX_HI) {
    structural.push("extreme_territory");
  }
  if (components.commercialDeltaFlow < -10) structural.push("flow_negative");
  if (components.commercialDeltaFlow > 10) structural.push("flow_positive");
  if (persistWeeks >= 5) structural.push("persistence_elevated");
  if (structural.length === 0) {
    structural.push("moderate_bias");
  }

  const execution: string[] = [];
  return { structural, execution };
}

export function computeUnifiedCotScore(input: TitanCotScoringInput): TitanCotScoringResult {
  const c = input.commercials;
  const r = input.retail;
  const nc = input.nonCommercials;

  const d1 = driverCommercialPositioning(c);
  const d2 = driverCommercialDeltaFlow(c);
  const d3full = driverPersistence(c, input.history);
  const { weeks: persistWeeks, side: persistenceSide, ...d3rest } = d3full;
  const d3: Omit<TitanBiasDriverDetail, "is_primary"> = d3rest;
  const d4 = driverNcDivergence(c, nc);
  const d5full = driverRetailCrowding(c, r);
  const d5 = { ...d5full, points: Math.max(-20, Math.min(20, d5full.points)) };

  const components: TitanCotScoringComponents = {
    commercialPositioning: d1.points,
    commercialDeltaFlow: d2.points,
    persistence: d3.points,
    ncDivergence: d4.points,
    retailCrowding: d5.points,
  };

  const raw_score =
    components.commercialPositioning +
    components.commercialDeltaFlow +
    components.persistence +
    components.ncDivergence +
    components.retailCrowding;

  const score = clampScore(raw_score);
  const verdict = scoreToCotVerdict(score);
  const confidence = scoreToConfidence(score);

  const w1 = c.weeklyChange;
  const d4w = c.delta4w;
  const d13 = c.delta13w;
  const flowBear = w1 < 0 && d4w < 0 && d13 < 0;
  const flowBull = w1 > 0 && d4w > 0 && d13 > 0;
  const flowMixed = !flowBear && !flowBull;

  const { regime, explanation } = computeMarketRegime(input, score, components, persistWeeks, flowBear, flowBull, flowMixed);
  const { structural, execution } = buildKeyDrivers(c, persistWeeks, components, score, d5.points);

  const partials: Omit<TitanBiasDriverDetail, "is_primary">[] = [d1, d2, d3, d4, d5];
  const primaryIdx = partials.reduce(
    (best, cur, i, arr) => (Math.abs(cur.points) > Math.abs(arr[best]!.points) ? i : best),
    0,
  );
  const drivers: TitanBiasDriverDetail[] = partials.map((p, i) => ({
    ...p,
    is_primary: i === primaryIdx,
  }));

  return {
    score,
    raw_score,
    verdict,
    confidence,
    market_regime: regime,
    regime_explanation: explanation,
    marketPhase: explanation,
    components,
    drivers,
    primary_driver_id: drivers[primaryIdx]!.id,
    key_drivers_structural: structural,
    key_drivers_execution: execution,
    persistence_weeks_for_badge: persistWeeks,
    persistence_side: persistenceSide,
  };
}

export function buildPlainEnglishExplanation(input: {
  marketLabel: string;
  futuresSymbol: string;
  reportDate: string;
  commercialBias: CommercialBias;
  retailContrarian: RetailContrarian;
  nonCommercialDivergence: InstitutionalDivergence;
  result: TitanCotScoringResult;
}): string {
  const { result } = input;
  return (
    `${input.marketLabel} (${input.futuresSymbol}), CFTC Legacy Futures, report ${input.reportDate}. ` +
    `Deterministic COT bias only — not an execution signal. ` +
    `${result.regime_explanation} ` +
    `TITAN score ${result.score} (raw ${result.raw_score}) → ${result.verdict}. ${BIAS_DISCLAIMER}`
  );
}

export function buildInstitutionalNarrative(input: {
  market: string;
  futuresSymbol: string;
  reportDate: string;
  data: TitanCotScoringInput;
  result: TitanCotScoringResult;
}): string {
  const { result } = input;
  return (
    `${input.market} (${input.futuresSymbol}) — CFTC Legacy Futures, ${input.reportDate}. ` +
    `Market regime: ${result.market_regime}. ${result.regime_explanation} ` +
    `Score ${result.score} (raw ${result.raw_score}), confidence ${result.confidence}, verdict ${result.verdict}. ` +
    `${BIAS_DISCLAIMER}`
  );
}

export function normalizeLegacyVerdict(verdict: string): CotVerdict {
  const map: Record<string, CotVerdict> = {
    "A+ INSTITUTIONAL LONG": "A+ EXTREME LONG",
    "A+ LONG": "A+ EXTREME LONG",
    "A+ LONG BIAS": "A+ EXTREME LONG",
    "B LONG": "B LONG",
    "A+ INSTITUTIONAL SHORT": "A+ EXTREME SHORT",
    "A+ SHORT": "A+ EXTREME SHORT",
    "A+ SHORT BIAS": "A+ EXTREME SHORT",
    "B SHORT": "B SHORT",
    "WEAK LONG": "WEAK LONG",
    "WEAK SHORT": "WEAK SHORT",
    "NEUTRAL": "NEUTRAL",
  };
  return (map[verdict] as CotVerdict | undefined) ?? (verdict as CotVerdict);
}
