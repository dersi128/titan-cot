/* Generated from titan-dashboard/src/lib/cotVercelHandler.ts. Do not edit. */

// src/lib/cftcLegacyCodes.ts
var CFTC_LEGACY_CONTRACT_CODES = {
  "GC1!": "088691",
  "SI1!": "084691",
  "PL1!": "076651",
  "PA1!": "075651",
  "HG1!": "085692",
  "CL1!": "067651",
  "NG1!": "023651",
  "ZC1!": "002602",
  "ZS1!": "005602",
  "ZW1!": "001602",
  "KC1!": "083731",
  "CT1!": "033661",
  "CC1!": "073732",
  "SB1!": "080732",
  "LE1!": "057642",
  "HE1!": "054642",
  "NQ1!": "209742",
  "ES1!": "13874A",
  "YM1!": "124603",
  "RTY1!": "239742",
  "DX1!": "098662",
  "6J1!": "097741",
  "6E1!": "099741",
  "6B1!": "096742",
  "6A1!": "232741",
  "6C1!": "090741",
  "6S1!": "092741",
  "6N1!": "112741",
  "6M1!": "095741",
  "ZF1!": "044601",
  "ZN1!": "043602",
  "ZB1!": "020601",
  "RB1!": "111659",
  "HO1!": "022651",
  "ZM1!": "026603",
  "ZL1!": "007601",
  "ZR1!": "039601",
  "OJ1!": "040701",
  "GF1!": "061641",
  "BTC1!": "133741",
  "ETH1!": "146021",
  "VX1!": "1170E1"
};
function cftcLegacyCodeForSymbol(futuresSymbol) {
  return CFTC_LEGACY_CONTRACT_CODES[futuresSymbol];
}

// src/lib/cotMarketMap.ts
var COT_MARKET_MAPPINGS = [
  { futuresSymbol: "GC1!", displayName: "GOLD", apiSlug: "gold" },
  { futuresSymbol: "SI1!", displayName: "SILVER", apiSlug: "silver" },
  { futuresSymbol: "PL1!", displayName: "PLATINUM", apiSlug: "platinum" },
  { futuresSymbol: "PA1!", displayName: "PALLADIUM", apiSlug: "palladium" },
  { futuresSymbol: "HG1!", displayName: "COPPER-GRADE #1", apiSlug: "copper" },
  { futuresSymbol: "CL1!", displayName: "CRUDE OIL, LIGHT SWEET", apiSlug: "crude-oil" },
  { futuresSymbol: "NG1!", displayName: "NATURAL GAS", apiSlug: "natural-gas" },
  { futuresSymbol: "ZC1!", displayName: "CORN", apiSlug: "corn" },
  { futuresSymbol: "ZS1!", displayName: "SOYBEANS", apiSlug: "soybeans" },
  { futuresSymbol: "ZW1!", displayName: "WHEAT SRW (CBOT)", apiSlug: "wheat-srw" },
  { futuresSymbol: "KC1!", displayName: "COFFEE C", apiSlug: "coffee" },
  { futuresSymbol: "CT1!", displayName: "COTTON NO. 2", apiSlug: "cotton" },
  { futuresSymbol: "CC1!", displayName: "COCOA", apiSlug: "cocoa" },
  { futuresSymbol: "SB1!", displayName: "SUGAR NO. 11", apiSlug: "sugar" },
  { futuresSymbol: "LE1!", displayName: "LIVE CATTLE", apiSlug: "live-cattle" },
  { futuresSymbol: "HE1!", displayName: "LEAN HOGS", apiSlug: "lean-hogs" },
  {
    futuresSymbol: "NQ1!",
    displayName: "E-MINI NASDAQ-100",
    apiSlug: "nasdaq",
    aliases: ["nq", "nq1", "nq1!", "nas100", "nas-100", "nasdaq100", "ndx"]
  },
  {
    futuresSymbol: "ES1!",
    displayName: "E-MINI S&P 500",
    apiSlug: "sp500",
    aliases: ["es", "es1", "es1!", "sp-500", "s&p500"]
  },
  { futuresSymbol: "YM1!", displayName: "E-MINI DOW ($5)", apiSlug: "e-mini-dow" },
  { futuresSymbol: "RTY1!", displayName: "E-MINI RUSSELL 2000", apiSlug: "russell-2000" },
  { futuresSymbol: "DX1!", displayName: "U.S. DOLLAR INDEX", apiSlug: "usd-index" },
  { futuresSymbol: "6J1!", displayName: "JAPANESE YEN", apiSlug: "japanese-yen" },
  { futuresSymbol: "6E1!", displayName: "EURO FX", apiSlug: "euro-fx" },
  { futuresSymbol: "6B1!", displayName: "BRITISH POUND", apiSlug: "british-pound" },
  { futuresSymbol: "6A1!", displayName: "AUSTRALIAN DOLLAR", apiSlug: "australian-dollar" },
  { futuresSymbol: "6C1!", displayName: "CANADIAN DOLLAR", apiSlug: "canadian-dollar" },
  { futuresSymbol: "6S1!", displayName: "SWISS FRANC", apiSlug: "swiss-franc" },
  {
    futuresSymbol: "6N1!",
    displayName: "NEW ZEALAND DOLLAR",
    apiSlug: "new-zealand-dollar",
    aliases: ["nzd", "6n", "6n1", "6n1!"]
  },
  {
    futuresSymbol: "6M1!",
    displayName: "MEXICAN PESO",
    apiSlug: "mexican-peso",
    aliases: ["mxn", "6m", "6m1", "6m1!", "peso"]
  },
  {
    futuresSymbol: "ZF1!",
    displayName: "UST 5Y NOTE",
    apiSlug: "ust-5y",
    aliases: ["5y", "zf", "zf1", "zf1!", "us5y", "fv"]
  },
  {
    futuresSymbol: "ZN1!",
    displayName: "UST 10Y NOTE",
    apiSlug: "ust-10y",
    aliases: ["10y", "zn", "zn1", "zn1!", "us10y", "ty"]
  },
  {
    futuresSymbol: "ZB1!",
    displayName: "UST BOND",
    apiSlug: "ust-30y",
    aliases: ["30y", "zb", "zb1", "zb1!", "us30y", "us-bond", "t-bond"]
  },
  {
    futuresSymbol: "RB1!",
    displayName: "GASOLINE RBOB",
    apiSlug: "gasoline",
    aliases: ["rb", "rb1", "rb1!", "rbob"]
  },
  {
    futuresSymbol: "HO1!",
    displayName: "NY HARBOR ULSD",
    apiSlug: "heating-oil",
    aliases: ["ho", "ho1", "ho1!", "ulsd", "heatingoil"]
  },
  {
    futuresSymbol: "ZM1!",
    displayName: "SOYBEAN MEAL",
    apiSlug: "soybean-meal",
    aliases: ["zm", "zm1", "zm1!", "meal", "soymeal"]
  },
  {
    futuresSymbol: "ZL1!",
    displayName: "SOYBEAN OIL",
    apiSlug: "soybean-oil",
    aliases: ["zl", "zl1", "zl1!", "soyoil", "boil"]
  },
  {
    futuresSymbol: "ZR1!",
    displayName: "ROUGH RICE",
    apiSlug: "rough-rice",
    aliases: ["zr", "zr1", "zr1!", "rice"]
  },
  {
    futuresSymbol: "OJ1!",
    displayName: "FRZN CONCENTRATED ORANGE JUICE",
    apiSlug: "orange-juice",
    aliases: ["oj", "oj1", "oj1!", "fcoj"]
  },
  {
    futuresSymbol: "GF1!",
    displayName: "FEEDER CATTLE",
    apiSlug: "feeder-cattle",
    aliases: ["gf", "gf1", "gf1!", "feeder"]
  },
  {
    futuresSymbol: "BTC1!",
    displayName: "BITCOIN",
    apiSlug: "bitcoin",
    aliases: ["btc", "btc1", "btc1!"]
  },
  {
    futuresSymbol: "ETH1!",
    displayName: "ETHER CASH SETTLED",
    apiSlug: "ether",
    aliases: ["eth", "eth1", "eth1!", "ethereum"]
  },
  {
    futuresSymbol: "VX1!",
    displayName: "VIX FUTURES",
    apiSlug: "vix",
    aliases: ["vx", "vx1", "vx1!", "vix-futures"]
  }
];
function getCotMarketMapping(symbolOrSlug) {
  const raw = decodeURIComponent(symbolOrSlug).trim();
  const upper = raw.toUpperCase();
  const slug = raw.toLowerCase();
  return COT_MARKET_MAPPINGS.find((mapping) => {
    if (mapping.futuresSymbol.toUpperCase() === upper) return true;
    if (mapping.apiSlug.toLowerCase() === slug) return true;
    if (mapping.aliases?.some((a) => a.toLowerCase() === slug)) return true;
    if (mapping.displayName.toUpperCase() === upper) return true;
    return false;
  });
}

// src/lib/titanCotScoringCore.ts
var IDX_HI = 80;
var IDX_LO = 20;
var BIAS_DISCLAIMER = "Bias only, not execution.";
function isFiniteCotIndex(value) {
  return value !== null && value !== void 0 && Number.isFinite(value);
}
function calculateCotIndex(windowIncludingCurrent) {
  if (windowIncludingCurrent.length === 0) return null;
  if (windowIncludingCurrent.some((net) => !Number.isFinite(net))) return null;
  const current = windowIncludingCurrent[windowIncludingCurrent.length - 1];
  const min = Math.min(...windowIncludingCurrent);
  const max = Math.max(...windowIncludingCurrent);
  if (max === min) return null;
  return Math.round((current - min) / (max - min) * 1e4) / 100;
}
function calculateRollingCotIndex(series, lookback, endIndex = series.length - 1) {
  if (!Number.isInteger(lookback) || lookback < 1) return null;
  if (endIndex < lookback - 1 || endIndex >= series.length) return null;
  return calculateCotIndex(series.slice(endIndex - lookback + 1, endIndex + 1));
}
function uniqueSortedNetHistory(rows) {
  const cleaned = rows.map((row) => {
    const reportDate = String(row.reportDate ?? "").slice(0, 10);
    return { row, reportDate };
  }).filter(({ reportDate }) => reportDate.length >= 10).sort((a, b) => a.reportDate.localeCompare(b.reportDate));
  const byDate = /* @__PURE__ */ new Map();
  for (const { row, reportDate } of cleaned) {
    byDate.set(reportDate, { ...row, reportDate });
  }
  return [...byDate.values()];
}
function clampScore(score) {
  if (!Number.isFinite(score)) return 0;
  return Math.max(-100, Math.min(100, Math.round(score)));
}
function scoreToCotVerdict(score) {
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
function scoreToConfidence(score) {
  const a = Math.abs(clampScore(score));
  if (a >= 85) return "EXTREME";
  if (a >= 65) return "HIGH";
  if (a >= 40) return "MEDIUM";
  if (a >= 20) return "LOW";
  return "NEUTRAL";
}
function countCommercialExtremePersistence(history, side) {
  if (!history || history.length < 26) return 0;
  const nets = history.map((h) => h.commercialNet);
  let streak = 0;
  for (let i = nets.length - 1; i >= 25; i--) {
    const idx = calculateRollingCotIndex(nets, 26, i);
    if (!isFiniteCotIndex(idx)) break;
    const inExtreme = side === "bull" ? idx > IDX_HI : idx < IDX_LO;
    if (inExtreme) streak += 1;
    else break;
  }
  return streak;
}
function activeCommercialPersistenceStreak(commercials, history) {
  const idx = commercials.index26w;
  const bullStreak = countCommercialExtremePersistence(history, "bull");
  const bearStreak = countCommercialExtremePersistence(history, "bear");
  if (isFiniteCotIndex(idx) && idx > IDX_HI) {
    return { weeks: bullStreak, side: "bull" };
  }
  if (isFiniteCotIndex(idx) && idx < IDX_LO) {
    return { weeks: bearStreak, side: "bear" };
  }
  return { weeks: 0, side: "none" };
}
function impactFromPoints(points, maxAbs) {
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
function driverCommercialPositioning(c) {
  const raw = c.index26w;
  if (!isFiniteCotIndex(raw)) {
    return {
      id: "commercialPositioning",
      name: "Commercial Positioning",
      importance: 50,
      impact: "Neutral",
      points: 0,
      explanation: "Commercial 26W index unavailable (not enough reports or a flat window) \u2014 no positioning points.",
      trigger_conditions: ["commercial_index_26w=unavailable"]
    };
  }
  const idx = Math.max(0, Math.min(100, raw));
  const points = Math.max(-50, Math.min(50, Math.round(idx - 50)));
  const triggers = [`commercial_index_26w=${idx}`];
  if (idx < IDX_LO) triggers.push("commercial_index_below_20_bearish_extreme");
  if (idx > IDX_HI) triggers.push("commercial_index_above_80_bullish_extreme");
  const explanation = points <= -20 ? "26W commercial index toward the short side of its range \u2014 supports bearish structural bias." : points >= 20 ? "26W commercial index toward the long side \u2014 supports bullish structural bias." : "26W commercial index near mid-range \u2014 suggests limited directional positioning pressure.";
  return {
    id: "commercialPositioning",
    name: "Commercial Positioning",
    importance: 50,
    impact: impactFromPoints(points, 50),
    points,
    explanation,
    trigger_conditions: triggers
  };
}
function driverCommercialDeltaFlow(c) {
  const w1 = c.weeklyChange;
  const w4 = c.delta4w;
  const w13 = c.delta13w;
  const allNeg = w1 < 0 && w4 < 0 && w13 < 0;
  const allPos = w1 > 0 && w4 > 0 && w13 > 0;
  let points = 0;
  const triggers = [`delta_1w=${w1}`, `delta_4w=${w4}`, `delta_13w=${w13}`];
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
    explanation: allNeg ? "1W, 4W and 13W commercial net changes are all negative \u2014 indicates sustained distribution of net length / addition of net short." : allPos ? "All three horizons positive \u2014 indicates sustained accumulation of net long / reduction of net short." : "Flow is mixed across 1W / 4W / 13W \u2014 does not give a clean directional confirmation.",
    trigger_conditions: triggers
  };
}
function driverPersistence(c, history) {
  const ap = activeCommercialPersistenceStreak(c, history);
  const w = ap.weeks;
  const sign = ap.side === "bull" ? 1 : ap.side === "bear" ? -1 : 0;
  let mag = 0;
  const triggers = [`persistence_weeks=${w}`, `persistence_side=${ap.side}`];
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
    explanation: ap.side === "none" || w === 0 ? "No multi-week streak in the commercial index extreme (rolling 26W min-max index)." : ap.side === "bear" ? `${w} consecutive week(s) with commercial index in bearish extreme (<${IDX_LO}) \u2014 supports bearish persistence.` : `${w} consecutive week(s) with commercial index in bullish extreme (>${IDX_HI}) \u2014 supports bullish persistence.`,
    trigger_conditions: triggers,
    weeks: w,
    side: ap.side
  };
}
function driverNcDivergence(c, nc) {
  const idx = c.index26w;
  const commBear = isFiniteCotIndex(idx) && idx < 45;
  const commBull = isFiniteCotIndex(idx) && idx > 55;
  let points = 0;
  const triggers = [`nc_divergence=${nc.divergence}`, `commercial_index_26w=${idx}`];
  if (commBear && nc.divergence === "bullish") {
    points = 10;
    triggers.push("bullish_flow_divergence_against_low_commercial_index");
  } else if (commBull && nc.divergence === "bearish") {
    points = -10;
    triggers.push("bearish_flow_divergence_against_high_commercial_index");
  } else {
    triggers.push("no_divergence_confirmation");
  }
  return {
    id: "ncDivergence",
    name: "Non-Commercial Divergence",
    importance: 10,
    impact: points === 0 ? "Neutral" : points < 0 ? "Bearish Divergence" : "Bullish Divergence",
    points,
    explanation: points < 0 ? "Commercial net decreases while non-commercial net increases against a high commercial index \u2014 bearish flow divergence." : points > 0 ? "Commercial net increases while non-commercial net decreases against a low commercial index \u2014 bullish flow divergence." : "No qualifying commercial vs non-commercial divergence pattern under deterministic rules.",
    trigger_conditions: triggers
  };
}
function driverRetailCrowding(c, r) {
  const c26 = c.index26w;
  const c52 = c.index52w;
  const r26 = r.index26w;
  const dualShort = isFiniteCotIndex(c26) && isFiniteCotIndex(c52) && c26 < IDX_LO && c52 < IDX_LO;
  const dualLong = isFiniteCotIndex(c26) && isFiniteCotIndex(c52) && c26 > IDX_HI && c52 > IDX_HI;
  const s26Short = isFiniteCotIndex(c26) && c26 < IDX_LO;
  const s26Long = isFiniteCotIndex(c26) && c26 > IDX_HI;
  const retailLong = isFiniteCotIndex(r26) && r26 > IDX_HI;
  const retailShort = isFiniteCotIndex(r26) && r26 < IDX_LO;
  let points = 0;
  const triggers = [
    `commercial_26w=${c.index26w}`,
    `commercial_52w=${c.index52w}`,
    `retail_26w=${r.index26w}`,
    `contrarian_signal=${r.contrarianSignal}`
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
    impact: points <= -12 ? "Contrarian Bearish" : points >= 12 ? "Contrarian Bullish" : points < 0 ? "Bearish skew" : points > 0 ? "Bullish skew" : "Neutral",
    points: Math.max(-20, Math.min(20, points)),
    explanation: Math.abs(points) >= 12 ? "Retail positioning is crowded opposite to a commercial extreme \u2014 treated as contrarian anomaly factor (not primary execution)." : points === 0 ? "No retail crowding anomaly triggered under rule thresholds." : "Mild retail vs commercial skew \u2014 contributes as a secondary bias hint only.",
    trigger_conditions: triggers
  };
}
function computeMarketRegime(input, clamped, components, persistWeeks, flowBear, flowBull, flowMixed) {
  const c = input.commercials;
  const r = input.retail;
  const nc = input.nonCommercials;
  const c26 = c.index26w;
  const r26 = r.index26w;
  const commBearExt = isFiniteCotIndex(c26) && c26 < IDX_LO;
  const commBullExt = isFiniteCotIndex(c26) && c26 > IDX_HI;
  const retailLong = isFiniteCotIndex(r26) && r26 > IDX_HI;
  const retailCrowdedLong = isFiniteCotIndex(r26) && r26 > 60;
  const retailShort = isFiniteCotIndex(r26) && r26 < IDX_LO;
  const retailCrowdedShort = isFiniteCotIndex(r26) && r26 < 40;
  if (commBearExt && persistWeeks >= 8 && flowBear && (retailLong || retailCrowdedLong)) {
    return { regime: "DISTRIBUTION", explanation: "Institutional selling pressure remains dominant." };
  }
  if (commBullExt && persistWeeks >= 8 && flowBull && (retailShort || retailCrowdedShort)) {
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
  if (w1 > 0 && d4 < 0 || w1 < 0 && d4 > 0) {
    if (persistWeeks < 6 || Math.abs(clamped) < 50) {
      return { regime: "TRANSITION", explanation: "Positioning is shifting and previous bias is weakening." };
    }
  }
  if (Math.abs(clamped) >= 40 && !flowMixed && (clamped < 0 && flowBear || clamped > 0 && flowBull)) {
    const conflict = Math.sign(components.commercialPositioning) !== Math.sign(components.commercialDeltaFlow) && Math.abs(components.commercialDeltaFlow) >= 10;
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
function buildKeyDrivers(c, persistWeeks, components, _clamped, _retailPoints) {
  const structural = [];
  const c26 = c.index26w;
  if (isFiniteCotIndex(c26) && c26 < 35) structural.push("commercials_heavy_short");
  if (isFiniteCotIndex(c26) && c26 > 65) structural.push("commercials_heavy_long");
  if (isFiniteCotIndex(c26) && (c26 < IDX_LO || c26 > IDX_HI)) {
    structural.push("extreme_territory");
  }
  if (components.commercialDeltaFlow < -10) structural.push("flow_negative");
  if (components.commercialDeltaFlow > 10) structural.push("flow_positive");
  if (persistWeeks >= 5) structural.push("persistence_elevated");
  if (structural.length === 0) {
    structural.push("moderate_bias");
  }
  const execution = [];
  return { structural, execution };
}
function computeUnifiedCotScore(input) {
  const c = input.commercials;
  const r = input.retail;
  const nc = input.nonCommercials;
  const d1 = driverCommercialPositioning(c);
  const d2 = driverCommercialDeltaFlow(c);
  const d3full = driverPersistence(c, input.history);
  const { weeks: persistWeeks, side: persistenceSide, ...d3rest } = d3full;
  const d3 = d3rest;
  const d4 = driverNcDivergence(c, nc);
  const d5full = driverRetailCrowding(c, r);
  const d5 = { ...d5full, points: Math.max(-20, Math.min(20, d5full.points)) };
  const components = {
    commercialPositioning: d1.points,
    commercialDeltaFlow: d2.points,
    persistence: d3.points,
    ncDivergence: d4.points,
    retailCrowding: d5.points
  };
  const raw_score = components.commercialPositioning + components.commercialDeltaFlow + components.persistence + components.ncDivergence + components.retailCrowding;
  const score = clampScore(raw_score);
  const verdict = scoreToCotVerdict(score);
  const confidence = scoreToConfidence(score);
  const w1 = c.weeklyChange;
  const d4w = c.delta4w;
  const d13 = c.delta13w;
  const flowBear = w1 < 0 && d4w < 0 && d13 < 0;
  const flowBull = w1 > 0 && d4w > 0 && d13 > 0;
  const flowMixed = !flowBear && !flowBull;
  const { regime, explanation } = computeMarketRegime(
    input,
    score,
    components,
    persistWeeks,
    flowBear,
    flowBull,
    flowMixed
  );
  const { structural, execution } = buildKeyDrivers(c, persistWeeks, components, score, d5.points);
  const partials = [d1, d2, d3, d4, d5];
  const primaryIdx = partials.reduce(
    (best, cur, i, arr) => Math.abs(cur.points) > Math.abs(arr[best].points) ? i : best,
    0
  );
  const drivers = partials.map((p, i) => ({
    ...p,
    is_primary: i === primaryIdx
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
    primary_driver_id: drivers[primaryIdx].id,
    key_drivers_structural: structural,
    key_drivers_execution: execution,
    persistence_weeks_for_badge: persistWeeks,
    persistence_side: persistenceSide
  };
}
function buildPlainEnglishExplanation(input) {
  const { result } = input;
  return `${input.marketLabel} (${input.futuresSymbol}), CFTC Legacy Futures, report ${input.reportDate}. Deterministic COT bias only \u2014 not an execution signal. ${result.regime_explanation} TITAN score ${result.score} (raw ${result.raw_score}) \u2192 ${result.verdict}. ${BIAS_DISCLAIMER}`;
}

// src/lib/cotAsOfSnapshot.ts
function normalizeReportDate(value) {
  return value.slice(0, 10);
}
function sortHistoryAsc(history) {
  return uniqueSortedNetHistory(
    history.map((point) => ({
      reportDate: normalizeReportDate(point.reportDate),
      commercialNet: Number(point.commercialNet),
      nonCommercialNet: Number(point.nonCommercialNet),
      retailNet: Number(point.retailNet)
    }))
  );
}
function lagDelta(history, key, lagWeeks) {
  if (history.length <= lagWeeks) return 0;
  return history[history.length - 1][key] - history[history.length - 1 - lagWeeks][key];
}
function getCommercialBias(index26w) {
  if (!isFiniteCotIndex(index26w)) return "neutral";
  if (index26w > IDX_HI) return "bullish";
  if (index26w < IDX_LO) return "bearish";
  return "neutral";
}
function getInstitutionalDivergence(commercialWeeklyChange, nonCommercialWeeklyChange) {
  if (commercialWeeklyChange > 0 && nonCommercialWeeklyChange < 0) return "bullish";
  if (commercialWeeklyChange < 0 && nonCommercialWeeklyChange > 0) return "bearish";
  return "none";
}
function getRetailContrarianSignal(commercialBias, retailIndex26w) {
  if (!isFiniteCotIndex(retailIndex26w)) return "none";
  if (commercialBias === "bullish" && retailIndex26w < IDX_LO) return "bullish";
  if (commercialBias === "bearish" && retailIndex26w > IDX_HI) return "bearish";
  return "none";
}
function groupSnapshot(history, key) {
  const latest = history[history.length - 1];
  const nets = history.map((point) => point[key]);
  return {
    net: latest[key],
    index26w: calculateRollingCotIndex(nets, 26),
    index52w: calculateRollingCotIndex(nets, 52),
    weeklyChange: lagDelta(history, key, 1),
    delta4w: lagDelta(history, key, 4),
    delta13w: lagDelta(history, key, 13)
  };
}
function rebuildCotDashboardFromHistory(template, history) {
  const series = sortHistoryAsc(history);
  if (series.length === 0) return null;
  const latest = series[series.length - 1];
  const commercials = groupSnapshot(series, "commercialNet");
  const nonCommercials = groupSnapshot(series, "nonCommercialNet");
  const retail = groupSnapshot(series, "retailNet");
  const commercialBias = getCommercialBias(commercials.index26w);
  const nonCommercialDivergence = getInstitutionalDivergence(
    commercials.weeklyChange,
    nonCommercials.weeklyChange
  );
  const retailSignal = getRetailContrarianSignal(commercialBias, retail.index26w);
  const scoring = computeUnifiedCotScore({
    commercials: {
      index26w: commercials.index26w,
      index52w: commercials.index52w,
      weeklyChange: commercials.weeklyChange,
      delta4w: commercials.delta4w,
      delta13w: commercials.delta13w,
      bias: commercialBias
    },
    nonCommercials: {
      weeklyChange: nonCommercials.weeklyChange,
      divergence: nonCommercialDivergence
    },
    retail: {
      index26w: retail.index26w,
      index52w: retail.index52w,
      contrarianSignal: retailSignal
    },
    history: series
  });
  const plainEnglishExplanation = buildPlainEnglishExplanation({
    marketLabel: template.market,
    futuresSymbol: template.futuresSymbol,
    reportDate: latest.reportDate,
    commercialBias,
    retailContrarian: retailSignal,
    nonCommercialDivergence,
    result: scoring
  });
  return {
    market: template.market,
    futuresSymbol: template.futuresSymbol,
    cftcMarketName: template.cftcMarketName,
    symbol: template.symbol,
    reportDate: latest.reportDate,
    commercials: {
      ...commercials,
      bias: commercialBias
    },
    nonCommercials: {
      ...nonCommercials,
      divergence: nonCommercialDivergence
    },
    retail: {
      ...retail,
      contrarianSignal: retailSignal
    },
    cotScore: scoring.score,
    cotVerdict: scoring.verdict,
    marketPhase: scoring.market_regime,
    plainEnglishExplanation,
    scoreComponents: scoring.components,
    history: series
  };
}

// src/lib/cotPreviewBackend.ts
var CFTC_LEGACY_FUTURES_ONLY_URL = "https://publicreporting.cftc.gov/resource/6dca-aqww.json";
var DEFAULT_HISTORY_WEEKS = 300;
var CONCURRENCY = 4;
var CACHE_TTL_MS = 15 * 60 * 1e3;
var CACHE_VERSION = "inclusive-0-100-v3";
var CFTC_FIELDS = [
  "report_date_as_yyyy_mm_dd",
  "cftc_contract_market_code",
  "contract_market_name",
  "commodity_name",
  "comm_positions_long_all",
  "comm_positions_short_all",
  "noncomm_positions_long_all",
  "noncomm_positions_short_all",
  "nonrept_positions_long_all",
  "nonrept_positions_short_all"
];
function cacheStore() {
  const g = globalThis;
  if (!g.__titanCotInclusive) g.__titanCotInclusive = /* @__PURE__ */ new Map();
  return g.__titanCotInclusive;
}
function cacheKey(symbol) {
  return `${CACHE_VERSION}:${symbol.toUpperCase()}`;
}
function parsePosition(value) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) throw new Error(`Invalid COT position value: ${value}`);
  return parsed;
}
function toHistoryPoint(row) {
  return {
    reportDate: String(row.report_date_as_yyyy_mm_dd ?? "").slice(0, 10),
    commercialNet: parsePosition(row.comm_positions_long_all) - parsePosition(row.comm_positions_short_all),
    nonCommercialNet: parsePosition(row.noncomm_positions_long_all) - parsePosition(row.noncomm_positions_short_all),
    retailNet: parsePosition(row.nonrept_positions_long_all) - parsePosition(row.nonrept_positions_short_all)
  };
}
async function fetchLegacyHistory(code, weeks) {
  const url = new URL(CFTC_LEGACY_FUTURES_ONLY_URL);
  url.searchParams.set("$select", CFTC_FIELDS.join(","));
  url.searchParams.set("$where", `cftc_contract_market_code='${code.replace(/'/g, "''")}'`);
  url.searchParams.set("$order", "report_date_as_yyyy_mm_dd DESC");
  url.searchParams.set("$limit", String(Math.max(weeks * 6, 400)));
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`CFTC Socrata request failed: ${response.status} ${response.statusText}`);
  }
  const payload = await response.json();
  if (!Array.isArray(payload)) throw new Error("CFTC Socrata returned a non-array response.");
  const matched = payload.filter(
    (row) => String(row.cftc_contract_market_code ?? "").trim() === code
  );
  const sliced = matched.slice(0, weeks);
  const history = sliced.map(toHistoryPoint).filter((point) => point.reportDate.length >= 10).reverse();
  const contractName = sliced[0]?.contract_market_name?.trim() || "";
  return { history, contractName };
}
function emptyTemplate(mapping, cftcMarketName) {
  return {
    market: mapping.displayName,
    futuresSymbol: mapping.futuresSymbol,
    cftcMarketName,
    symbol: mapping.futuresSymbol,
    reportDate: "",
    commercials: {
      net: 0,
      index26w: null,
      index52w: null,
      weeklyChange: 0,
      delta4w: 0,
      delta13w: 0,
      bias: "neutral"
    },
    nonCommercials: {
      net: 0,
      index26w: null,
      index52w: null,
      weeklyChange: 0,
      delta4w: 0,
      delta13w: 0,
      divergence: "none"
    },
    retail: {
      net: 0,
      index26w: null,
      index52w: null,
      weeklyChange: 0,
      delta4w: 0,
      delta13w: 0,
      contrarianSignal: "none"
    },
    cotScore: 0,
    cotVerdict: "NEUTRAL",
    plainEnglishExplanation: "",
    history: []
  };
}
async function loadBranchCotDashboard(symbolOrSlug) {
  const mapping = getCotMarketMapping(symbolOrSlug);
  if (!mapping) throw new Error(`No COT market mapping found for ${symbolOrSlug}.`);
  const code = cftcLegacyCodeForSymbol(mapping.futuresSymbol);
  if (!code) throw new Error(`No CFTC Legacy code for ${mapping.futuresSymbol}.`);
  const key = cacheKey(mapping.futuresSymbol);
  const hit = cacheStore().get(key);
  if (hit && hit.expiresAt > Date.now()) return hit.data;
  const { history, contractName } = await fetchLegacyHistory(code, DEFAULT_HISTORY_WEEKS);
  const rebuilt = rebuildCotDashboardFromHistory(emptyTemplate(mapping, contractName || mapping.displayName), history);
  if (!rebuilt) throw new Error(`No CFTC Legacy Futures Only rows found for ${mapping.displayName}.`);
  const data = { ...rebuilt, cftcContractMarketCode: code };
  cacheStore().set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
  return data;
}
async function loadBranchCotBundle(symbols) {
  const unique = [...new Set(symbols.map((s) => s.trim()).filter(Boolean))];
  const bundle = {};
  const errors = {};
  for (let i = 0; i < unique.length; i += CONCURRENCY) {
    const chunk = unique.slice(i, i + CONCURRENCY);
    const results = await Promise.all(
      chunk.map(async (sym) => {
        try {
          const data = await loadBranchCotDashboard(sym);
          return { symbol: data.futuresSymbol, ok: true, data };
        } catch (error) {
          const mapping = getCotMarketMapping(sym);
          return {
            symbol: mapping?.futuresSymbol ?? sym,
            ok: false,
            message: error instanceof Error ? error.message : "Failed to load COT data"
          };
        }
      })
    );
    for (const result of results) {
      if (result.ok) bundle[result.symbol] = result.data;
      else errors[result.symbol] = result.message;
    }
  }
  return { bundle, errors };
}
function listBranchCotMappings() {
  return COT_MARKET_MAPPINGS.map((mapping) => ({
    futuresSymbol: mapping.futuresSymbol,
    displayName: mapping.displayName,
    apiSlug: mapping.apiSlug,
    aliases: mapping.aliases,
    cftcContractMarketCode: CFTC_LEGACY_CONTRACT_CODES[mapping.futuresSymbol]
  }));
}
var RENDER_COT_ORIGIN = "https://titan-cot.onrender.com";

// src/lib/cotVercelHandler.ts
var config = { runtime: "nodejs", maxDuration: 60 };
var JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store"
};
function vercelEnv() {
  return globalThis.process?.env?.VERCEL_ENV;
}
function isVercelProduction() {
  return vercelEnv() === "production";
}
function json(status, body, backend) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...JSON_HEADERS, "x-titan-cot-backend": backend }
  });
}
function cotPath(pathname) {
  const marker = "/api/cot/";
  const i = pathname.indexOf(marker);
  if (i >= 0) return decodeURIComponent(pathname.slice(i + marker.length));
  if (pathname.endsWith("/api/cot")) return "";
  return pathname.replace(/^\//, "");
}
async function proxyProduction(request) {
  const incoming = new URL(request.url);
  const target = `${RENDER_COT_ORIGIN}${incoming.pathname}${incoming.search}`;
  const upstream = await fetch(target, {
    method: request.method,
    headers: { accept: "application/json" },
    cache: "no-store"
  });
  const body = await upstream.arrayBuffer();
  const headers = new Headers(JSON_HEADERS);
  const contentType = upstream.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);
  headers.set("x-titan-cot-backend", "render");
  return new Response(body, { status: upstream.status, headers });
}
async function handlePreview(request) {
  const url = new URL(request.url);
  const path = cotPath(url.pathname);
  const head = path.split("/")[0] ?? "";
  if (head === "mappings") {
    return json(200, { mappings: listBranchCotMappings() }, "branch-preview");
  }
  if (head === "bundle") {
    const raw = url.searchParams.get("symbols");
    const symbols = raw && raw.length > 0 ? raw.split(",").map((s) => s.trim()) : COT_MARKET_MAPPINGS.map((m) => m.futuresSymbol);
    return json(200, await loadBranchCotBundle(symbols), "branch-preview");
  }
  if (head === "gold") {
    return json(200, await loadBranchCotDashboard("GC1!"), "branch-preview");
  }
  if (!head) {
    return json(404, { error: "Missing COT symbol." }, "branch-preview");
  }
  const mapping = getCotMarketMapping(head);
  if (!mapping) {
    return json(
      404,
      {
        status: "unsupported",
        error: "No COT mapping exists for this futures market.",
        mappings: listBranchCotMappings()
      },
      "branch-preview"
    );
  }
  return json(200, await loadBranchCotDashboard(mapping.futuresSymbol), "branch-preview");
}
async function handleCotRequest(request) {
  try {
    if (isVercelProduction()) return await proxyProduction(request);
    return await handlePreview(request);
  } catch (error) {
    const message = error instanceof Error ? error.message : "COT preview backend failed.";
    return json(500, { error: message }, "branch-preview");
  }
}
function isNodeResponse(value) {
  return Boolean(value && typeof value === "object" && typeof value.end === "function");
}
function requestFromNode(req) {
  const host = String(req.headers.host ?? "localhost");
  const proto = String(req.headers["x-forwarded-proto"] ?? "https");
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (typeof value === "string") headers.set(key, value);
    else if (Array.isArray(value)) headers.set(key, value.join(", "));
  }
  return new Request(`${proto}://${host}${req.url ?? "/"}`, {
    method: req.method ?? "GET",
    headers
  });
}
async function writeNodeResponse(res, response) {
  res.statusCode = response.status;
  response.headers.forEach((value, key) => res.setHeader(key, value));
  res.end(await response.text());
}
async function GET(request) {
  return handleCotRequest(request);
}
async function handler(req, res) {
  if (isNodeResponse(res)) {
    await writeNodeResponse(res, await handleCotRequest(requestFromNode(req)));
    return;
  }
  return handleCotRequest(req);
}
export {
  GET,
  config,
  handler as default
};
