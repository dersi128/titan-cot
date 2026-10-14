import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  calculateCotIndex,
  calculateRollingCotIndex,
  computeUnifiedCotScore,
  uniqueSortedNetHistory,
  type TitanCotScoringInput,
} from "./titanCotScoringCore";
import { cotBuySellHeadline, cotBuySellHoldArmedConflict, evaluateCotBuySell } from "./titanCotBuySell";
import { evaluateTitanCot } from "./titanCotScore";
import type { CotDashboardData, CotHistoryPoint } from "../types";
import { rebuildCotDashboardFromHistory } from "./cotAsOfSnapshot";
import {
  buildLegacyFuturesWhereClause,
  COT_MARKET_MAPPINGS,
  getCotMarketMapping,
} from "../../../cot-data-module/src/cotMarketMap";
import { commercialIndexBand } from "./titanCotIndexSettings";
import { heatmapToneFromComm26 } from "./titanHeatmapVisuals";

/** CFTC Legacy commercial nets as of 2026-10-06 (26 inclusive reports). Verification only. */
const AS_OF_2026_10_06 = {
  WTI: [-246935, -226711, -219654, -206150, -196134, -200409, -195473, -188109, -170726, -165339, -152606, -140148, -104622, -85088, -108601, -158822, -153775, -129637, -153087, -156246, -156005, -166185, -164858, -169889, -142618, -126458],
  NG: [170912, 150316, 151035, 153150, 159243, 174224, 190178, 173913, 175738, 162754, 161767, 153940, 149504, 165528, 159102, 179664, 187214, 180677, 188326, 187737, 193432, 201126, 206752, 203524, 213503, 219847],
  COPPER: [-64141, -69335, -72029, -72017, -87143, -85499, -83712, -88645, -83935, -84408, -80478, -73094, -73170, -73616, -82112, -76161, -86169, -91246, -90140, -95049, -92107, -104644, -84387, -100435, -94841, -77923],
  COTTON: [-81694, -95143, -93004, -114931, -117159, -103545, -96751, -93421, -81917, -84479, -90454, -83522, -95539, -105278, -102678, -100367, -105126, -113526, -119201, -133448, -141900, -133254, -125686, -112810, -104441, -103505],
  DOW: [395, -2847, -3153, -5162, -715, 5256, 2404, -991, -2915, -10786, -15699, -18169, -15075, -18736, -21604, -22701, -25579, -24810, -24022, -21170, -20847, -20580, -18938, -16312, -15828, -15347],
} as const;

function scoringInput(idx: number | null, history?: CotHistoryPoint[]): TitanCotScoringInput {
  const bias = idx !== null && idx > 80 ? "bullish" : idx !== null && idx < 20 ? "bearish" : "neutral";
  return {
    commercials: {
      index26w: idx,
      index52w: idx,
      weeklyChange: 0,
      delta4w: 0,
      delta13w: 0,
      bias,
    },
    nonCommercials: { weeklyChange: 0, divergence: "none" },
    retail: { index26w: 50, index52w: 50, contrarianSignal: "none" },
    history,
  };
}

function template(): CotDashboardData {
  return {
    market: "TEST",
    futuresSymbol: "CL1!",
    cftcMarketName: "WTI-PHYSICAL",
    symbol: "CL1!",
    reportDate: "2026-10-06",
    commercials: {
      net: 0,
      index26w: null,
      index52w: null,
      weeklyChange: 0,
      delta4w: 0,
      delta13w: 0,
      bias: "neutral",
    },
    nonCommercials: {
      net: 0,
      index26w: null,
      index52w: null,
      weeklyChange: 0,
      delta4w: 0,
      delta13w: 0,
      divergence: "none",
    },
    retail: {
      net: 0,
      index26w: null,
      index52w: null,
      weeklyChange: 0,
      delta4w: 0,
      delta13w: 0,
      contrarianSignal: "none",
    },
    cotScore: 0,
    cotVerdict: "NEUTRAL",
    plainEnglishExplanation: "",
    history: [],
  };
}

describe("standard COT index window", () => {
  it("includes the current report so a new high is 100, not above 100", () => {
    const nets = Array.from({ length: 25 }, () => 10).concat([50]);
    assert.equal(calculateCotIndex(nets), 100);
    assert.equal(calculateRollingCotIndex(nets, 26), 100);
  });

  it("includes the current report so a new low is 0, not below 0", () => {
    const nets = Array.from({ length: 25 }, () => 10).concat([0]);
    assert.equal(calculateCotIndex(nets), 0);
  });

  it("returns null for short history or a flat window instead of 50", () => {
    assert.equal(calculateRollingCotIndex([1, 2, 3], 26), null);
    assert.equal(calculateCotIndex([8, 8, 8]), null);
    assert.equal(calculateCotIndex([]), null);
  });

  it("does not use future reports when scoring an earlier Friday", () => {
    const series = [
      ...Array.from({ length: 26 }, (_, i) => i),
      ...Array.from({ length: 10 }, (_, i) => -10 * (i + 1)),
    ];
    const asOfFirst26 = calculateRollingCotIndex(series, 26, 25);
    const latest = calculateRollingCotIndex(series, 26);
    assert.equal(asOfFirst26, 100);
    assert.equal(latest, 0);
    assert.notEqual(asOfFirst26, latest);
  });

  it("keeps one row per report date after sort", () => {
    const rows = uniqueSortedNetHistory([
      { reportDate: "2026-10-06", commercialNet: 2, nonCommercialNet: 0, retailNet: 0 },
      { reportDate: "2026-09-29T00:00:00.000", commercialNet: 1, nonCommercialNet: 0, retailNet: 0 },
      { reportDate: "2026-10-06", commercialNet: 9, nonCommercialNet: 0, retailNet: 0 },
    ]);
    assert.deepEqual(
      rows.map((r) => r.reportDate),
      ["2026-09-29", "2026-10-06"],
    );
    assert.equal(rows[1]!.commercialNet, 9);
  });
});

describe("CFTC Legacy contract codes", () => {
  it("maps WTI and Natural Gas to NYMEX physical codes, not ICE / Henry Hub", () => {
    const wti = getCotMarketMapping("CL1!");
    const ng = getCotMarketMapping("NG1!");
    assert.equal(wti?.cftcContractMarketCode, "067651");
    assert.equal(wti?.socrataContractMarketName, "WTI-PHYSICAL");
    assert.equal(ng?.cftcContractMarketCode, "023651");
    assert.equal(ng?.socrataContractMarketName, "NAT GAS NYME");
    assert.equal(buildLegacyFuturesWhereClause(wti!), "cftc_contract_market_code='067651'");
    assert.equal(buildLegacyFuturesWhereClause(ng!), "cftc_contract_market_code='023651'");
    assert.equal(
      COT_MARKET_MAPPINGS.every((m) => /^[0-9A-Z]{6}$/.test(m.cftcContractMarketCode)),
      true,
    );
    assert.equal(
      COT_MARKET_MAPPINGS.some((m) => m.cftcContractMarketCode === "067411" || m.cftcContractMarketCode === "03565B"),
      false,
    );
  });
});

describe("20/80 zone alignment", () => {
  it("treats 20/80 as TITAN extremes on the 0–100 index, matching heatmap tones", () => {
    assert.equal(commercialIndexBand(19), "extreme_low");
    assert.equal(commercialIndexBand(20), "bearish_extreme");
    assert.equal(commercialIndexBand(80), "bullish_extreme");
    assert.equal(commercialIndexBand(81), "extreme_high");
    assert.equal(heatmapToneFromComm26(19), "extreme_short");
    assert.equal(heatmapToneFromComm26(20), "strong_short");
    assert.equal(heatmapToneFromComm26(80), "strong_long");
    assert.equal(heatmapToneFromComm26(81), "extreme_long");
  });
});

describe("CFTC 2026-10-06 control values", () => {
  it("matches WTI, Natural Gas, Copper, Cotton and Dow 26W indexes", () => {
    assert.equal(calculateCotIndex([...AS_OF_2026_10_06.WTI]), 74.44);
    assert.equal(calculateCotIndex([...AS_OF_2026_10_06.NG]), 100);
    assert.equal(calculateCotIndex([...AS_OF_2026_10_06.COPPER]), 65.97);
    assert.equal(calculateCotIndex([...AS_OF_2026_10_06.COTTON]), 63.77);
    assert.equal(calculateCotIndex([...AS_OF_2026_10_06.DOW]), 33.18);
  });
});

describe("main score vs reversal model", () => {
  it("scores unavailable commercial index as 0 points, not a fake 50", () => {
    const result = computeUnifiedCotScore(scoringInput(null));
    assert.equal(result.components.commercialPositioning, 0);
  });

  it("gives positive positioning points for a high commercial index", () => {
    const result = computeUnifiedCotScore(scoringInput(90));
    assert.equal(result.components.commercialPositioning, 40);
    assert.ok(result.score > 0);
  });

  it("gives negative positioning points for a low commercial index", () => {
    const result = computeUnifiedCotScore(scoringInput(10));
    assert.equal(result.components.commercialPositioning, -40);
    assert.ok(result.score < 0);
  });

  it("does not let ARMED SELL at index 100 flip commercial positioning negative", () => {
    const nets = Array.from({ length: 26 }, (_, i) => i);
    const pine = evaluateCotBuySell(nets);
    assert.equal(pine?.action, "TOUCH_100");
    assert.equal(pine?.armedSell, true);

    const history: CotHistoryPoint[] = nets.map((commercialNet, i) => ({
      reportDate: `2026-01-${String(i + 1).padStart(2, "0")}`,
      commercialNet,
      nonCommercialNet: 0,
      retailNet: 0,
    }));
    const result = computeUnifiedCotScore(scoringInput(100, history));
    assert.equal(result.components.commercialPositioning, 50);
    assert.ok(result.score > 0);
  });

  it("labels HOLD LONG together with opposite ARMED SELL", () => {
    const down = Array.from({ length: 26 }, (_, i) => 25 - i);
    const bought = evaluateCotBuySell([...down, 20]);
    assert.equal(bought?.action, "BUY");
    assert.equal(bought?.regime, 1);

    const upAfterBuy = [...down, 20, ...Array.from({ length: 30 }, (_, i) => 21 + i)];
    const conflict = evaluateCotBuySell(upAfterBuy);
    assert.ok(conflict);
    assert.equal(conflict.regime, 1);
    assert.equal(conflict.armedSell, true);
    assert.equal(cotBuySellHoldArmedConflict(conflict), true);
    assert.equal(cotBuySellHeadline(conflict), "HOLD LONG · ARMED SELL");
  });

  it("matches API scoring and dashboard rebuild from the same history", () => {
    const nets = [...AS_OF_2026_10_06.WTI];
    const history: CotHistoryPoint[] = nets.map((commercialNet, i) => ({
      reportDate: new Date(Date.UTC(2026, 3, 14) + i * 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      commercialNet,
      nonCommercialNet: -commercialNet,
      retailNet: 0,
    }));
    const idx = calculateCotIndex(nets);
    const api = computeUnifiedCotScore(scoringInput(idx, history));
    const snap = rebuildCotDashboardFromHistory(template(), history);
    assert.ok(snap);
    assert.equal(snap.commercials.index26w, idx);
    assert.equal(evaluateTitanCot(snap).score, api.score);
    assert.equal(evaluateTitanCot(snap).components.commercialPositioning, api.components.commercialPositioning);
  });
});
