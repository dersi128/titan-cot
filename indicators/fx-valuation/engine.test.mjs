import assert from "node:assert/strict";
import test from "node:test";
import {
  classifyLabelCs,
  classifyValuation,
  currencyVsUsdFromLeg,
  impliedCrossFromUsdLegs,
  isCross,
  isUsdMajor,
  percentRankInclusive,
  percentileToScore,
  residualValuation,
  usdLegSymbol,
  valuePair,
  yieldTicker,
} from "./engine.mjs";

test("percentile 0/50/100 map to −100/0/+100", () => {
  assert.equal(percentileToScore(0), -100);
  assert.equal(percentileToScore(50), 0);
  assert.equal(percentileToScore(100), 100);
});

test("percentRankInclusive: new high is 100, new low is ~0", () => {
  assert.equal(percentRankInclusive([1, 2, 3, 4, 10]), 100);
  const low = percentRankInclusive([10, 9, 8, 7, 1]);
  assert.ok(low > 0 && low <= 20);
});

test("residual: rich price + rich rates → ~fair", () => {
  const r = residualValuation(60, 60);
  assert.equal(r.mode, "residual");
  assert.equal(r.score, 0);
});

test("residual: rich price without rate support → expensive", () => {
  const r = residualValuation(60, 0);
  assert.equal(r.score, 60);
});

test("residual: cheap price with rate disadvantage → extra cheap", () => {
  const r = residualValuation(-50, 20);
  assert.equal(r.score, -70);
});

test("missing rates fall back to price-only", () => {
  const r = residualValuation(-40, null);
  assert.equal(r.mode, "price");
  assert.equal(r.score, -40);
});

test("USD majors vs crosses", () => {
  assert.equal(isUsdMajor("EUR", "USD"), true);
  assert.equal(isUsdMajor("USD", "JPY"), true);
  assert.equal(isCross("EUR", "JPY"), true);
  assert.equal(isCross("EUR", "USD"), false);
});

test("USD leg tickers: XXXUSD vs USDXXX", () => {
  assert.equal(usdLegSymbol("OANDA", "EUR"), "OANDA:EURUSD");
  assert.equal(usdLegSymbol("OANDA", "JPY"), "OANDA:USDJPY");
  assert.equal(usdLegSymbol("FX", "GBP"), "FX:GBPUSD");
  assert.equal(usdLegSymbol("FX", "CAD"), "FX:USDCAD");
  assert.equal(usdLegSymbol("FX", "CZK"), "FX:USDCZK");
  assert.equal(usdLegSymbol("FX", "USD"), null);
});

test("yield tickers for G10 + CZK", () => {
  assert.equal(yieldTicker("USD", "10Y"), "TVC:US10Y");
  assert.equal(yieldTicker("EUR", "02Y"), "TVC:DE02Y");
  assert.equal(yieldTicker("JPY"), "TVC:JP10Y");
  assert.equal(yieldTicker("CZK"), "TVC:CZ10Y");
  assert.equal(yieldTicker("XXX"), null);
});

test("EURUSD score is EUR vs USD; USDJPY inverts to JPY vs USD", () => {
  assert.equal(currencyVsUsdFromLeg("EUR", "EUR", "USD", 40), 40);
  assert.equal(currencyVsUsdFromLeg("JPY", "USD", "JPY", 40), -40);
  assert.equal(currencyVsUsdFromLeg("USD", "USD", "JPY", 40), 0);
});

test("implied EURJPY = EUR vs USD − JPY vs USD", () => {
  // EUR rich vs USD (+40), JPY cheap vs USD (−20) → EUR extra rich vs JPY
  assert.equal(impliedCrossFromUsdLegs(40, -20), 60);
  // both equally rich vs USD → cross fair
  assert.equal(impliedCrossFromUsdLegs(30, 30), 0);
});

test("valuePair residual on synthetic series", () => {
  const logPrices = [1, 1.01, 1.02, 1.03, 1.2];
  const yieldDiffs = [0, 0.01, 0.02, 0.03, 0.2];
  const out = valuePair({ logPrices, yieldDiffs });
  assert.equal(out.mode, "residual");
  assert.ok(Math.abs(out.score) < 5, `expected ~fair, got ${out.score}`);
});

test("residual clamps to ±100", () => {
  assert.equal(residualValuation(90, -90).score, 100);
  assert.equal(residualValuation(-90, 90).score, -100);
});

test("classify bands", () => {
  assert.equal(classifyValuation(80), "EXTREME_EXPENSIVE");
  assert.equal(classifyValuation(45), "EXPENSIVE");
  assert.equal(classifyValuation(0), "FAIR");
  assert.equal(classifyValuation(-45), "CHEAP");
  assert.equal(classifyValuation(-80), "EXTREME_CHEAP");
  assert.match(classifyLabelCs("CHEAP", "EUR", "JPY"), /EUR levné/);
});
