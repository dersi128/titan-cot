import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { CotDashboardData, CotHistoryPoint } from "../types";
import {
  evaluateInstitutionalDivergence,
  evaluatePositioningMarketRegime,
  resolveMarketRegime,
  weeksInExtremeZone,
} from "./titanCommercialIndex";
import {
  computeInstitutionalConviction,
  regimeConfirmsBias,
} from "./titanConviction";
import {
  calculateRollingCotIndex,
  computeUnifiedCotScore,
  type TitanCotScoringInput,
} from "./titanCotScoringCore";
import { evaluateTitanCot } from "./titanCotScore";
import {
  breadthFromCounts,
  breadthLeanFromId,
  buildDmeOverview,
  computeMacroAlignment,
  DME_FX_MARKETS,
} from "./titanDmeOverview";

function scoringInput(idx: number | null = 50, w1 = 0, ncw1 = 0): TitanCotScoringInput {
  const bias = idx !== null && idx > 80 ? "bullish" : idx !== null && idx < 20 ? "bearish" : "neutral";
  return {
    commercials: {
      index26w: idx,
      index52w: idx,
      weeklyChange: w1,
      delta4w: w1,
      delta13w: w1,
      bias,
    },
    nonCommercials: {
      weeklyChange: ncw1,
      divergence: w1 > 0 && ncw1 < 0 ? "bullish" : w1 < 0 && ncw1 > 0 ? "bearish" : "none",
    },
    retail: {
      index26w: 50,
      index52w: 50,
      contrarianSignal: "none",
    },
    history: [],
  };
}

function dashboardFromInput(input: TitanCotScoringInput): CotDashboardData {
  const c = input.commercials;
  const nc = input.nonCommercials;
  const r = input.retail;
  return {
    market: "TEST",
    futuresSymbol: "GC1!",
    cftcMarketName: "TEST",
    symbol: "GC1!",
    reportDate: "2024-01-05",
    commercials: {
      net: 0,
      index26w: c.index26w,
      index52w: c.index52w,
      weeklyChange: c.weeklyChange,
      delta4w: c.delta4w,
      delta13w: c.delta13w,
      bias: c.bias,
    },
    nonCommercials: {
      net: 0,
      index26w: 50,
      index52w: 50,
      weeklyChange: nc.weeklyChange,
      delta4w: nc.weeklyChange,
      delta13w: nc.weeklyChange,
      divergence: nc.divergence,
    },
    retail: {
      net: 0,
      index26w: r.index26w,
      index52w: r.index52w,
      weeklyChange: 0,
      delta4w: 0,
      delta13w: 0,
      contrarianSignal: r.contrarianSignal,
    },
    cotScore: 0,
    cotVerdict: "NEUTRAL",
    plainEnglishExplanation: "",
    history: input.history ?? [],
  };
}

function historyFromNets(nets: number[]): CotHistoryPoint[] {
  return nets.map((commercialNet, i) => ({
    reportDate: new Date(Date.UTC(2020, 0, 3) + i * 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10),
    commercialNet,
    nonCommercialNet: -commercialNet,
    retailNet: 0,
  }));
}

describe("COT opravy — scoring", () => {
  it("bullish NC divergence at low index contributes +10", () => {
    assert.equal(computeUnifiedCotScore(scoringInput(30, 10, -10)).components.ncDivergence, 10);
  });

  it("bearish NC divergence at high index contributes -10", () => {
    assert.equal(computeUnifiedCotScore(scoringInput(70, -10, 10)).components.ncDivergence, -10);
  });

  it("aligned-side flow is not counted as reversal divergence", () => {
    assert.equal(computeUnifiedCotScore(scoringInput(70, 10, -10)).components.ncDivergence, 0);
  });
});

describe("COT opravy — FX breadth", () => {
  it("neutral FX does not imply FX support", () => {
    assert.equal(breadthFromCounts(0, 0, 7), "mixed");
  });

  it("neutral FX does not add bearish macro contribution", () => {
    assert.equal(
      computeMacroAlignment({
        usdPositioning: "neutral",
        breadthLean: breadthLeanFromId(breadthFromCounts(0, 0, 7)),
        ratesLean: "flat",
      }).id,
      "none",
    );
  });

  it("classifies FX majority, USD majority, tie, and missing", () => {
    assert.equal(breadthFromCounts(0, 5, 7), "wide_fx");
    assert.equal(breadthFromCounts(5, 0, 7), "wide_usd");
    assert.equal(breadthFromCounts(4, 0, 7), "narrow_usd");
    assert.equal(breadthFromCounts(1, 1, 2), "mixed");
    assert.equal(breadthFromCounts(0, 0, 0), "mixed");
  });

  it("DME overview keeps neutral FX as mixed breadth", () => {
    const base = dashboardFromInput(scoringInput(50, 0, 0));
    const bundle: Record<string, CotDashboardData> = {};
    for (const market of DME_FX_MARKETS) {
      bundle[market.symbol] = {
        ...base,
        market: market.id,
        futuresSymbol: market.symbol,
        symbol: market.symbol,
      };
    }
    const overview = buildDmeOverview(bundle);
    assert.equal(overview.fxBreadth, "mixed");
    assert.equal(overview.usdFavoringCount, 0);
    assert.equal(overview.fxLiveCount, DME_FX_MARKETS.length);
  });
});

describe("COT opravy — persistence 80/20", () => {
  it("resets across opposite sides and treats 80 as not extreme", () => {
    assert.equal(weeksInExtremeZone([125, -25, 130]), 1);
    assert.equal(weeksInExtremeZone([85, 90, 95]), 3);
    assert.equal(weeksInExtremeZone([85, 80, 90]), 1);
    assert.equal(weeksInExtremeZone([15, 10, 5]), 3);
    assert.equal(weeksInExtremeZone([]), 0);
  });
});

describe("COT opravy — near max/min with negative nets", () => {
  it("accepts a nearby high on negative nets as bearish structure", () => {
    const nets = Array.from({ length: 27 }, (_, i) => -200 + i);
    nets.push(-174.5);
    const data = dashboardFromInput(scoringInput(90, -10, 10));
    data.nonCommercials.index26w = 70;
    data.history = historyFromNets(nets);
    assert.equal(evaluateInstitutionalDivergence(data), "bearish");
  });

  it("accepts a nearby low on negative nets as bullish structure", () => {
    const nets = Array.from({ length: 27 }, (_, i) => -i);
    nets.push(-25.5);
    const data = dashboardFromInput(scoringInput(10, 10, -10));
    data.nonCommercials.index26w = 30;
    data.history = historyFromNets(nets);
    assert.equal(evaluateInstitutionalDivergence(data), "bullish");
  });

  it("translated positive ranges yield the same divergence sides", () => {
    const high = dashboardFromInput(scoringInput(90, -10, 10));
    high.nonCommercials.index26w = 70;
    high.history = historyFromNets([...Array.from({ length: 27 }, (_, i) => 800 + i), 825.5]);
    const low = dashboardFromInput(scoringInput(10, 10, -10));
    low.nonCommercials.index26w = 30;
    low.history = historyFromNets([...Array.from({ length: 27 }, (_, i) => 900 - i), 874.5]);
    assert.equal(evaluateInstitutionalDivergence(high), "bearish");
    assert.equal(evaluateInstitutionalDivergence(low), "bullish");
  });
});

describe("COT opravy — API/UI parity", () => {
  it("matches regime and persistence across rising, falling, and flat histories", () => {
    for (const sign of [-1, 0, 1] as const) {
      const h = historyFromNets(Array.from({ length: 65 }, (_, i) => i * sign));
      const idx = calculateRollingCotIndex(
        h.map((x) => x.commercialNet),
        26,
      );
      const input = scoringInput(idx, sign, -sign);
      input.commercials.delta4w = 4 * sign;
      input.commercials.delta13w = 13 * sign;
      input.history = h;
      const api = computeUnifiedCotScore(input);
      const data = dashboardFromInput(input);
      assert.equal(
        evaluatePositioningMarketRegime(data, "neutral", "neutral", 0, "aligned"),
        api.market_regime.toLowerCase(),
      );
      assert.equal(resolveMarketRegime(data), api.market_regime.toLowerCase());
      assert.equal(evaluateTitanCot(data).market_regime.toLowerCase(), api.market_regime.toLowerCase());
      const indices = h
        .map((_, i) => calculateRollingCotIndex(h.map((y) => y.commercialNet), 26, i))
        .filter((n): n is number => n !== null);
      assert.equal(api.persistence_weeks_for_badge, weeksInExtremeZone(indices));
    }
  });
});

describe("COT opravy — conviction", () => {
  it("treats long/short trending symmetrically", () => {
    assert.equal(regimeConfirmsBias(50, "trending"), true);
    assert.equal(regimeConfirmsBias(-50, "trending"), true);
    assert.equal(regimeConfirmsBias(-50, "exhaustion"), false);
    assert.equal(regimeConfirmsBias(50, "exhaustion"), false);
  });

  it("neutral conviction is zero", () => {
    const data = dashboardFromInput(scoringInput());
    for (const score of [-19, 0, 19]) {
      assert.equal(computeInstitutionalConviction(data, score).level, 0);
    }
  });

  it("directionally aligned conviction is stronger on the positioning side", () => {
    const longHist = historyFromNets(Array.from({ length: 30 }, (_, i) => i));
    const longInput = scoringInput(100, 1, -1);
    longInput.history = longHist;
    const longData = dashboardFromInput(longInput);
    assert.ok(computeInstitutionalConviction(longData, 50).level >= 3);

    const shortHist = historyFromNets(Array.from({ length: 30 }, (_, i) => 30 - i));
    const shortInput = scoringInput(0, -1, 1);
    shortInput.history = shortHist;
    const shortData = dashboardFromInput(shortInput);
    assert.ok(computeInstitutionalConviction(shortData, -50).level >= 3);
  });

  it("opposite extreme/persistence do not confirm long", () => {
    const hist = historyFromNets(Array.from({ length: 65 }, (_, i) => i));
    const input = scoringInput(90, -1, 1);
    input.history = hist;
    const data = dashboardFromInput(input);
    const alignedLong = computeInstitutionalConviction(data, 50).level;
    const oppositeShort = computeInstitutionalConviction(data, -50).level;
    assert.ok(oppositeShort < alignedLong);
    assert.ok(oppositeShort <= 3);
  });
});
