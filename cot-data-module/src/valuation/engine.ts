/**
 * TITAN valuation engine
 *
 * One score (−100..+100): positive = cheap / undervalued (mean-reversion long bias),
 * negative = rich / overvalued. Same language as COT, different inputs per asset class.
 *
 * FX: relative PPP (CPI) + real-rate differential + 10Y mean-reversion.
 * Metals: real price vs CPI + regression on CPI, real yields, USD.
 * Commodities: real price percentile + USD overlay.
 * Equities: detrended real price (log-linear trend) + Buffett (cap/GDP) when present.
 *
 * Without macro series the engine still runs on price statistics alone.
 */

import type {
  DatedValue,
  ValuationComponent,
  ValuationConfidence,
  ValuationHistoryPoint,
  ValuationInput,
  ValuationSnapshot,
  ValuationUniverseRow,
  ValuationVerdict,
} from "./types.js";
import {
  addYearsIso,
  clip,
  gapToScore,
  invertPercentileScore,
  invertZScore,
  lastPoint,
  lookupAsOf,
  mean,
  ols,
  olsMultiple,
  percentileRank,
  round1,
  round2,
  sliceOnOrBefore,
  toMonthlyLast,
  yearsFrom,
  yoyFromIndex,
  zScore,
} from "./stats.js";

const MIN_MONTHS = 24;
const PPP_LOOKBACK_YEARS = 10;
const RATE_BETA = 0.03;
const MODEL_MIN_R2 = 0.18;

function verdictFromScore(score: number): ValuationVerdict {
  if (score >= 60) return "EXTREME UNDERVALUED";
  if (score >= 35) return "UNDERVALUED";
  if (score >= 15) return "SLIGHTLY CHEAP";
  if (score > -15) return "FAIR";
  if (score > -35) return "SLIGHTLY RICH";
  if (score > -60) return "OVERVALUED";
  return "EXTREME OVERVALUED";
}

function confidenceFrom(components: ValuationComponent[], months: number): ValuationConfidence {
  const live = components.filter((c) => c.available);
  const hasMacro = live.some((c) => c.id !== "statistical" && c.id !== "trend");
  if (months >= 84 && hasMacro && live.length >= 2) return "HIGH";
  if (months >= 48 && live.length >= 1) return "MEDIUM";
  return "LOW";
}

function combine(parts: ValuationComponent[]): { score: number; used: ValuationComponent[] } {
  const live = parts.filter((p) => p.available && Number.isFinite(p.score) && p.weight > 0);
  const wsum = live.reduce((s, p) => s + p.weight, 0);
  if (wsum <= 0) {
    return { score: 0, used: parts };
  }
  const raw = live.reduce((s, p) => s + p.score * p.weight, 0) / wsum;
  return { score: Math.round(clip(raw, -100, 100)), used: parts };
}

function monthlyCpi(cpiByCcy: ValuationInput["cpiByCcy"], ccy: string | undefined, asOf: string): DatedValue[] {
  if (!ccy || !cpiByCcy?.[ccy]) return [];
  return sliceOnOrBefore(toMonthlyLast(cpiByCcy[ccy]!), asOf);
}

function monthlyPolicy(policyByCcy: ValuationInput["policyByCcy"], ccy: string | undefined, asOf: string): DatedValue[] {
  if (!ccy || !policyByCcy?.[ccy]) return [];
  return sliceOnOrBefore(toMonthlyLast(policyByCcy[ccy]!), asOf);
}

function realRateSeries(policy: DatedValue[], cpi: DatedValue[]): DatedValue[] {
  const yoy = yoyFromIndex(cpi);
  const out: DatedValue[] = [];
  for (const p of policy) {
    const inf = lookupAsOf(yoy, p.date);
    if (inf == null) continue;
    out.push({ date: p.date, value: p.value - inf });
  }
  return out;
}

function pppFairSeries(spot: DatedValue[], cpiBase: DatedValue[], cpiQuote: DatedValue[], asOf: string): DatedValue[] {
  const startFloor = addYearsIso(asOf, -PPP_LOOKBACK_YEARS);
  let baseSpot: DatedValue | null = null;
  let baseCpiB: number | null = null;
  let baseCpiQ: number | null = null;
  for (const s of spot) {
    if (s.date < startFloor) continue;
    const cb = lookupAsOf(cpiBase, s.date);
    const cq = lookupAsOf(cpiQuote, s.date);
    if (cb != null && cq != null && cb > 0 && cq > 0 && s.value > 0) {
      baseSpot = s;
      baseCpiB = cb;
      baseCpiQ = cq;
      break;
    }
  }
  if (!baseSpot || baseCpiB == null || baseCpiQ == null) return [];

  const out: DatedValue[] = [];
  for (const s of spot) {
    if (s.date < baseSpot.date) continue;
    const cb = lookupAsOf(cpiBase, s.date);
    const cq = lookupAsOf(cpiQuote, s.date);
    if (cb == null || cq == null || cb <= 0 || cq <= 0) continue;
    const fair = baseSpot.value * (cq / baseCpiQ) / (cb / baseCpiB);
    if (Number.isFinite(fair) && fair > 0) out.push({ date: s.date, value: fair });
  }
  return out;
}

function statisticalMeanRevert(price: DatedValue[]): { score: number; fair: number | null } {
  const values = price.map((p) => p.value);
  const last = values[values.length - 1];
  if (last == null) return { score: 0, fair: null };
  const avg = mean(values);
  const z = zScore(values, last);
  return { score: invertZScore(z, 2.2), fair: avg };
}

function trendFair(price: DatedValue[]): { score: number; fair: number | null } {
  if (price.length < MIN_MONTHS) return { score: 0, fair: null };
  const t0 = price[0]!.date;
  const xs: number[] = [];
  const ys: number[] = [];
  for (const p of price) {
    if (p.value <= 0) continue;
    xs.push(yearsFrom(t0, p.date));
    ys.push(Math.log(p.value));
  }
  const fit = ols(xs, ys);
  if (!fit || fit.r2 < 0.12) return statisticalMeanRevert(price);
  const tNow = yearsFrom(t0, price[price.length - 1]!.date);
  const fair = Math.exp(fit.intercept + fit.slope * tNow);
  const resid: number[] = [];
  for (let i = 0; i < xs.length; i++) {
    resid.push(ys[i]! - (fit.intercept + fit.slope * xs[i]!));
  }
  const lastResid = resid[resid.length - 1] ?? 0;
  return { score: invertZScore(zScore(resid, lastResid), 2.2), fair };
}

function realPriceSeries(price: DatedValue[], cpi: DatedValue[]): DatedValue[] {
  const out: DatedValue[] = [];
  for (const p of price) {
    const c = lookupAsOf(cpi, p.date);
    if (c == null || c <= 0 || p.value <= 0) continue;
    out.push({ date: p.date, value: p.value / c });
  }
  return out;
}

type Built = {
  snapshot: Omit<ValuationSnapshot, "history">;
  fairValue: number | null;
};

function buildAt(input: ValuationInput, asOf: string, priceMonthly: DatedValue[]): Built | null {
  const price = sliceOnOrBefore(priceMonthly, asOf);
  if (price.length < MIN_MONTHS) return null;
  const last = lastPoint(price);
  if (!last) return null;

  const { market } = input;
  const components: ValuationComponent[] = [];
  const inputsUsed: string[] = [`price:${price.length}m`];
  let fairValue: number | null;

  const usdCpi = monthlyCpi(input.cpiByCcy, "USD", asOf);
  const usdPolicy = monthlyPolicy(input.policyByCcy, "USD", asOf);
  const usdRealYield = input.usdRealYield?.length
    ? sliceOnOrBefore(toMonthlyLast(input.usdRealYield), asOf)
    : realRateSeries(usdPolicy, usdCpi);
  const usdIndex = input.usdIndex?.length ? sliceOnOrBefore(toMonthlyLast(input.usdIndex), asOf) : [];

  if (market.model === "fx" && market.baseCcy && market.quoteCcy) {
    const stat = statisticalMeanRevert(price);
    components.push({
      id: "statistical",
      score: stat.score,
      weight: 0.3,
      available: true,
      label: "10Y mean reversion",
    });

    const cpiBase = monthlyCpi(input.cpiByCcy, market.baseCcy, asOf);
    const cpiQuote = monthlyCpi(input.cpiByCcy, market.quoteCcy, asOf);
    const ppp = pppFairSeries(price, cpiBase, cpiQuote, asOf);
    const pppNow = lastPoint(ppp);
    if (pppNow && pppNow.value > 0) {
      inputsUsed.push(`cpi:${market.baseCcy}`, `cpi:${market.quoteCcy}`);
      let fxFair = pppNow.value;
      const polBase = monthlyPolicy(input.policyByCcy, market.baseCcy, asOf);
      const polQuote = monthlyPolicy(input.policyByCcy, market.quoteCcy, asOf);
      const rrBase = realRateSeries(polBase, cpiBase);
      const rrQuote = realRateSeries(polQuote, cpiQuote);
      const diffs: number[] = [];
      for (const p of price) {
        const rb = lookupAsOf(rrBase, p.date);
        const rq = lookupAsOf(rrQuote, p.date);
        if (rb == null || rq == null) continue;
        diffs.push(rb - rq);
      }
      const rbNow = lookupAsOf(rrBase, asOf);
      const rqNow = lookupAsOf(rrQuote, asOf);
      if (rbNow != null && rqNow != null && diffs.length >= 24) {
        const diffNow = rbNow - rqNow;
        const adj = Math.exp(RATE_BETA * (diffNow - mean(diffs)));
        fxFair *= adj;
        components.push({
          id: "rateDiff",
          score: gapToScore(((last.value / fxFair) - 1) * 100, 18),
          weight: 0.25,
          available: true,
          label: "Real-rate differential",
        });
        inputsUsed.push(`policy:${market.baseCcy}`, `policy:${market.quoteCcy}`);
      }
      const gapPct = ((last.value - fxFair) / fxFair) * 100;
      components.push({
        id: "ppp",
        score: gapToScore(gapPct, 18),
        weight: 0.45,
        available: true,
        label: "Relative PPP",
      });
      fairValue = fxFair;
    } else {
      fairValue = stat.fair;
      components.push({ id: "ppp", score: 0, weight: 0.45, available: false, label: "Relative PPP" });
      components.push({ id: "rateDiff", score: 0, weight: 0.25, available: false, label: "Real-rate differential" });
    }
  } else if (market.model === "usd_index") {
    const stat = statisticalMeanRevert(price);
    components.push({
      id: "statistical",
      score: stat.score,
      weight: 0.55,
      available: true,
      label: "10Y mean reversion",
    });
    fairValue = stat.fair;
    if (usdRealYield.length >= 24) {
      inputsUsed.push("usdRealYield");
      const xs: number[] = [];
      const ys: number[] = [];
      for (const p of price) {
        const r = lookupAsOf(usdRealYield, p.date);
        if (r == null || p.value <= 0) continue;
        xs.push(r);
        ys.push(Math.log(p.value));
      }
      const fit = ols(xs, ys);
      const rNow = lookupAsOf(usdRealYield, asOf);
      if (fit && fit.r2 >= MODEL_MIN_R2 && rNow != null) {
        const modelFair = Math.exp(fit.intercept + fit.slope * rNow);
        const gapPct = ((last.value - modelFair) / modelFair) * 100;
        components.push({
          id: "macroModel",
          score: gapToScore(gapPct, 12),
          weight: 0.45,
          available: true,
          label: "USD vs real yields",
        });
        fairValue = modelFair;
      } else {
        components.push({ id: "macroModel", score: 0, weight: 0.45, available: false, label: "USD vs real yields" });
      }
    } else {
      components.push({ id: "macroModel", score: 0, weight: 0.45, available: false, label: "USD vs real yields" });
    }
  } else if (market.model === "metal" || market.model === "commodity") {
    const trend = trendFair(price);
    components.push({
      id: "trend",
      score: trend.score,
      weight: market.model === "metal" ? 0.2 : 0.25,
      available: true,
      label: "Detrended log-price",
    });
    fairValue = trend.fair;

    if (usdCpi.length >= 24) {
      inputsUsed.push("cpi:USD");
      const real = realPriceSeries(price, usdCpi);
      const realVals = real.map((p) => p.value);
      const realNow = lastPoint(real);
      if (realNow && realVals.length >= MIN_MONTHS) {
        const pct = percentileRank(realVals, realNow.value);
        const cpiNow = lookupAsOf(usdCpi, asOf);
        const meanReal = mean(realVals);
        components.push({
          id: "realPrice",
          score: invertPercentileScore(pct),
          weight: market.model === "metal" ? 0.4 : 0.5,
          available: true,
          label: "Real price vs CPI",
        });
        if (cpiNow && cpiNow > 0) fairValue = meanReal * cpiNow;
      } else {
        components.push({ id: "realPrice", score: 0, weight: 0.4, available: false, label: "Real price vs CPI" });
      }
    } else {
      components.push({ id: "realPrice", score: 0, weight: 0.4, available: false, label: "Real price vs CPI" });
    }

    const useRates = market.model === "metal" && usdRealYield.length >= 24;
    const useUsd = usdIndex.length >= 24;
    const X: number[][] = [];
    const y: number[] = [];
    for (const p of price) {
      if (p.value <= 0) continue;
      const cpi = lookupAsOf(usdCpi, p.date);
      if (cpi == null || cpi <= 0) continue;
      const row = [1, Math.log(cpi)];
      if (useRates) {
        const rr = lookupAsOf(usdRealYield, p.date);
        if (rr == null) continue;
        row.push(rr);
      }
      if (useUsd) {
        const usd = lookupAsOf(usdIndex, p.date);
        if (usd == null || usd <= 0) continue;
        row.push(Math.log(usd));
      }
      if (row.length < 3) continue;
      X.push(row);
      y.push(Math.log(p.value));
    }
    const fit = olsMultiple(X, y);
    const cpiNow = lookupAsOf(usdCpi, asOf);
    const rrNow = lookupAsOf(usdRealYield, asOf);
    const usdNow = lookupAsOf(usdIndex, asOf);
    const nowRow = cpiNow && cpiNow > 0 ? [1, Math.log(cpiNow)] : null;
    if (nowRow && useRates && rrNow != null) nowRow.push(rrNow);
    if (nowRow && useUsd && usdNow != null && usdNow > 0) nowRow.push(Math.log(usdNow));
    if (fit && fit.r2 >= MODEL_MIN_R2 && nowRow && nowRow.length === fit.beta.length) {
      let pred = 0;
      for (let i = 0; i < fit.beta.length; i++) pred += fit.beta[i]! * nowRow[i]!;
      const modelFair = Math.exp(pred);
      const gapPct = ((last.value - modelFair) / modelFair) * 100;
      components.push({
        id: "macroModel",
        score: gapToScore(gapPct, market.model === "metal" ? 22 : 35),
        weight: 0.25,
        available: true,
        label: market.model === "metal" ? "CPI + real yield + USD" : "CPI + USD",
      });
      inputsUsed.push("macroModel");
      fairValue = modelFair;
    } else {
      components.push({ id: "macroModel", score: 0, weight: 0.25, available: false, label: "Macro model" });
    }

    if (usdIndex.length >= 24 && last.value > 0) {
      const usdNow = lookupAsOf(usdIndex, asOf);
      if (usdNow != null) {
        inputsUsed.push("usdIndex");
        const usdZ = zScore(usdIndex.map((p) => p.value), usdNow);
        const pxZ = zScore(price.map((p) => p.value), last.value);
        // Strong USD should pressure dollar commodities; if price is also rich, extra overvalued.
        const combo = (pxZ + usdZ) / 2;
        components.push({
          id: "usd",
          score: invertZScore(combo, 2.2),
          weight: 0.15,
          available: true,
          label: "USD overlay",
        });
      } else {
        components.push({ id: "usd", score: 0, weight: 0.15, available: false, label: "USD overlay" });
      }
    } else {
      components.push({ id: "usd", score: 0, weight: 0.15, available: false, label: "USD overlay" });
    }
  } else {
    const trend = trendFair(price);
    components.push({
      id: "trend",
      score: trend.score,
      weight: 0.5,
      available: true,
      label: "Detrended log-price",
    });
    fairValue = trend.fair;

    if (usdCpi.length >= 36) {
      inputsUsed.push("cpi:USD");
      const real = realPriceSeries(price, usdCpi);
      const realTrend = trendFair(real);
      const cpiNow = lookupAsOf(usdCpi, asOf);
      if (realTrend.fair && cpiNow && cpiNow > 0) {
        components.push({
          id: "realPrice",
          score: realTrend.score,
          weight: 0.25,
          available: true,
          label: "Real price trend",
        });
        fairValue = realTrend.fair * cpiNow;
      } else {
        components.push({ id: "realPrice", score: 0, weight: 0.25, available: false, label: "Real price trend" });
      }
    } else {
      components.push({ id: "realPrice", score: 0, weight: 0.25, available: false, label: "Real price trend" });
    }

    const buffett = input.equityBuffett?.length ? sliceOnOrBefore(toMonthlyLast(input.equityBuffett), asOf) : [];
    const bNow = lastPoint(buffett);
    if (bNow && buffett.length >= 24) {
      inputsUsed.push("buffett");
      const pct = percentileRank(buffett.map((p) => p.value), bNow.value);
      components.push({
        id: "buffett",
        score: invertPercentileScore(pct),
        weight: 0.25,
        available: true,
        label: "Market cap / GDP",
      });
    } else {
      components.push({ id: "buffett", score: 0, weight: 0.25, available: false, label: "Market cap / GDP" });
    }
  }

  const { score, used } = combine(components);
  if (fairValue != null && (!Number.isFinite(fairValue) || fairValue <= 0)) fairValue = null;
  const gapPct =
    fairValue && fairValue > 0 ? round1(((last.value - fairValue) / fairValue) * 100) : null;

  return {
    fairValue,
    snapshot: {
      marketId: market.id,
      label: market.label,
      subtitle: market.subtitle,
      assetClass: market.assetClass,
      model: market.model,
      asOf: last.date,
      price: last.value,
      fairValue: fairValue != null ? round2(fairValue) : null,
      gapPct,
      score,
      verdict: verdictFromScore(score),
      confidence: confidenceFrom(used, price.length),
      components: used.map((c) => ({ ...c, score: Math.round(clip(c.score, -100, 100)) })),
      inputsUsed,
    },
  };
}

export function computeValuation(input: ValuationInput): ValuationSnapshot {
  const asOf = input.asOf ?? lastPoint(sortMaybe(input.price))?.date;
  if (!asOf) {
    throw new Error(`No price history for ${input.market.id}`);
  }
  const priceMonthly = toMonthlyLast(sliceOnOrBefore(input.price, asOf));
  const built = buildAt(input, asOf, priceMonthly);
  if (!built) {
    throw new Error(`Insufficient history for ${input.market.id} (need ≥${MIN_MONTHS} months)`);
  }

  const history: ValuationHistoryPoint[] = [];
  if (input.withHistory) {
    const start = Math.max(MIN_MONTHS, priceMonthly.length - 120);
    for (let i = start; i < priceMonthly.length; i++) {
      const pointAsOf = priceMonthly[i]!.date;
      const step = buildAt(input, pointAsOf, priceMonthly);
      if (!step) continue;
      history.push({
        date: pointAsOf,
        price: step.snapshot.price,
        fairValue: step.snapshot.fairValue,
        score: step.snapshot.score,
      });
    }
  }

  return { ...built.snapshot, history };
}

function sortMaybe(xs: DatedValue[]): DatedValue[] {
  return xs.slice().sort((a, b) => (a.date < b.date ? -1 : 1));
}

export function toUniverseRow(snap: ValuationSnapshot): ValuationUniverseRow {
  return {
    marketId: snap.marketId,
    label: snap.label,
    assetClass: snap.assetClass,
    asOf: snap.asOf,
    price: snap.price,
    fairValue: snap.fairValue,
    gapPct: snap.gapPct,
    score: snap.score,
    verdict: snap.verdict,
    confidence: snap.confidence,
  };
}

export { verdictFromScore };
