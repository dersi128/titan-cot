import { computeValuation } from "../src/valuation/engine.ts";
import { invertPercentileScore, ols, percentileRank, toMonthlyLast, yearsFrom } from "../src/valuation/stats.ts";
import type { DatedValue, ValuationMarket } from "../src/valuation/types.ts";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

function almost(a: number, b: number, eps = 1e-6): boolean {
  return Math.abs(a - b) <= eps;
}

function monthly(start: string, values: number[]): DatedValue[] {
  const [y0, m0] = start.split("-").map(Number);
  return values.map((value, i) => {
    const d = new Date(Date.UTC(y0!, m0! - 1 + i, 15));
    return { date: d.toISOString().slice(0, 10), value };
  });
}

const fxEur: ValuationMarket = {
  id: "EUR",
  label: "EURUSD",
  subtitle: "Euro",
  assetClass: "forex",
  model: "fx",
  yahooSymbol: "EUR",
  baseCcy: "EUR",
  quoteCcy: "USD",
};

const gold: ValuationMarket = {
  id: "GOLD",
  label: "GOLD",
  subtitle: "Gold",
  assetClass: "metal",
  model: "metal",
  yahooSymbol: "GOLD",
};

const spx: ValuationMarket = {
  id: "SPX",
  label: "S&P 500",
  subtitle: "S&P 500",
  assetClass: "equity",
  model: "equity",
  yahooSymbol: "SPX",
};

function testStats() {
  const p = percentileRank([1, 2, 3, 4, 5], 5);
  assert(p === 100, `percentile high got ${p}`);
  assert(percentileRank([1, 2, 3, 4, 5], 1) === 20, "percentile low");
  assert(invertPercentileScore(100) === -100, "expensive percentile");
  assert(invertPercentileScore(0) === 100, "cheap percentile");
  const monthly = toMonthlyLast([
    { date: "2020-01-03", value: 1 },
    { date: "2020-01-31", value: 2 },
    { date: "2020-02-10", value: 3 },
  ]);
  assert(monthly.length === 2 && monthly[0]!.value === 2 && monthly[1]!.value === 3, "monthly last");
  const fit = ols([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  assert(fit && almost(fit.slope, 1, 1e-8) && almost(fit.intercept, 0, 1e-8), "ols identity");
}

function testStationaryCheapRich() {
  const base = Array.from({ length: 60 }, () => 100);
  const rich = computeValuation({
    market: gold,
    price: monthly("2018-01", [...base, 160]),
  });
  const cheap = computeValuation({
    market: gold,
    price: monthly("2018-01", [...base, 55]),
  });
  assert(rich.score < -20, `rich gold score ${rich.score}`);
  assert(cheap.score > 20, `cheap gold score ${cheap.score}`);
  assert(rich.verdict.includes("OVERVALUED") || rich.verdict.includes("RICH"), rich.verdict);
  assert(cheap.verdict.includes("UNDERVALUED") || cheap.verdict.includes("CHEAP"), cheap.verdict);
}

function testPppUndervaluedEuro() {
  const n = 84;
  const spot = monthly("2018-01", Array.from({ length: n }, () => 1.1));
  const cpiEu = monthly("2018-01", Array.from({ length: n }, () => 100));
  const cpiUs = monthly(
    "2018-01",
    Array.from({ length: n }, (_, i) => 100 + (i / (n - 1)) * 25),
  );
  const snap = computeValuation({
    market: fxEur,
    price: spot,
    cpiByCcy: { EUR: cpiEu, USD: cpiUs },
  });
  assert(snap.fairValue != null && snap.fairValue > 1.2, `PPP fair ${snap.fairValue}`);
  assert(snap.score > 15, `EUR should be cheap vs PPP, score=${snap.score} gap=${snap.gapPct}`);
  assert(snap.components.some((c) => c.id === "ppp" && c.available), "PPP component missing");
}

function testEquityTrendNotPunished() {
  const n = 120;
  const dates = monthly("2015-01", Array.from({ length: n }, () => 1));
  const t0 = dates[0]!.date;
  const onTrend = dates.map((d) => ({
    date: d.date,
    value: 100 * Math.exp(0.08 * yearsFrom(t0, d.date)),
  }));
  const snap = computeValuation({ market: spx, price: onTrend });
  assert(Math.abs(snap.score) < 15, `on-trend equity should be near FAIR, score=${snap.score}`);
  assert(snap.verdict === "FAIR" || snap.verdict === "SLIGHTLY CHEAP" || snap.verdict === "SLIGHTLY RICH", snap.verdict);

  const rich = onTrend.map((p, i) =>
    i === n - 1 ? { ...p, value: p.value * 1.45 } : p,
  );
  const richSnap = computeValuation({ market: spx, price: rich });
  assert(richSnap.score < -25, `equity 45% above trend should be rich, score=${richSnap.score}`);
}

function testHistory() {
  const price = monthly(
    "2016-01",
    Array.from({ length: 80 }, (_, i) => 1800 + i),
  );
  const snap = computeValuation({ market: gold, price, withHistory: true });
  assert(snap.history.length > 10, `history ${snap.history.length}`);
  assert(snap.history[snap.history.length - 1]!.date === snap.asOf, "history ends at asOf");
}

testStats();
testStationaryCheapRich();
testPppUndervaluedEuro();
testEquityTrendNotPunished();
testHistory();
console.log("valuation engine tests: ok");
