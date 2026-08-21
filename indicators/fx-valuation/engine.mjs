/**
 * FX Valuation — standalone math (mirrors FX_Valuation.pine).
 * Score: + = BASE expensive vs QUOTE, − = BASE cheap vs QUOTE.
 */

export const USD_AS_QUOTE = new Set(["EUR", "GBP", "AUD", "NZD"]);

export const YIELD_COUNTRY = {
  USD: "US",
  EUR: "DE",
  GBP: "GB",
  JPY: "JP",
  AUD: "AU",
  NZD: "NZ",
  CAD: "CA",
  CHF: "CH",
  NOK: "NO",
  SEK: "SE",
  DKK: "DK",
  MXN: "MX",
  ZAR: "ZA",
  SGD: "SG",
  PLN: "PL",
  CZK: "CZ",
  HUF: "HU",
  TRY: "TR",
  CNH: "CN",
  CNY: "CN",
  KRW: "KR",
  INR: "IN",
  HKD: "HK",
};

export function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

/** Inclusive percentile rank of the last value in a window (0–100). */
export function percentRankInclusive(window) {
  if (!Array.isArray(window) || window.length === 0) return null;
  const current = window[window.length - 1];
  if (!Number.isFinite(current)) return null;
  let count = 0;
  let n = 0;
  for (const v of window) {
    if (!Number.isFinite(v)) continue;
    n += 1;
    if (v <= current) count += 1;
  }
  if (n === 0) return null;
  return (100 * count) / n;
}

export function percentileToScore(pct) {
  if (pct == null || !Number.isFinite(pct)) return null;
  return clamp(2 * pct - 100, -100, 100);
}

export function residualValuation(priceScore, rateScore) {
  if (priceScore == null || !Number.isFinite(priceScore)) return null;
  if (rateScore == null || !Number.isFinite(rateScore)) {
    return { score: clamp(priceScore, -100, 100), mode: "price" };
  }
  return { score: clamp(priceScore - rateScore, -100, 100), mode: "residual" };
}

export function yieldTicker(ccy, tenor = "10Y", prefix = "TVC") {
  const code = YIELD_COUNTRY[ccy];
  if (!code) return null;
  return `${prefix}:${code}${tenor}`;
}

export function usdLegSymbol(prefix, ccy) {
  if (!ccy || ccy === "USD") return null;
  if (USD_AS_QUOTE.has(ccy)) return `${prefix}:${ccy}USD`;
  return `${prefix}:USD${ccy}`;
}

export function isUsdMajor(base, quote) {
  return base === "USD" || quote === "USD";
}

export function isCross(base, quote) {
  return Boolean(base && quote && base !== "USD" && quote !== "USD");
}

/**
 * Pair score is "base expensive vs quote".
 * Convert to "ccy expensive vs USD" using the USD leg of that currency.
 */
export function currencyVsUsdFromLeg(ccy, legBase, legQuote, legScore) {
  if (ccy === "USD") return 0;
  if (legScore == null || !Number.isFinite(legScore)) return null;
  if (legBase === ccy && legQuote === "USD") return clamp(legScore, -100, 100);
  if (legBase === "USD" && legQuote === ccy) return clamp(-legScore, -100, 100);
  return null;
}

/** Both legs as "ccy expensive vs USD". Implied: BASE expensive vs QUOTE. */
export function impliedCrossFromUsdLegs(baseVsUsd, quoteVsUsd) {
  if (baseVsUsd == null || quoteVsUsd == null) return null;
  if (!Number.isFinite(baseVsUsd) || !Number.isFinite(quoteVsUsd)) return null;
  return clamp(baseVsUsd - quoteVsUsd, -100, 100);
}

export function classifyValuation(score, rich = 40, extreme = 70) {
  if (score == null || !Number.isFinite(score)) return "NA";
  if (score >= extreme) return "EXTREME_EXPENSIVE";
  if (score >= rich) return "EXPENSIVE";
  if (score <= -extreme) return "EXTREME_CHEAP";
  if (score <= -rich) return "CHEAP";
  return "FAIR";
}

export function classifyLabelCs(cls, base, quote) {
  const vs = `${base} vs ${quote}`;
  switch (cls) {
    case "EXTREME_EXPENSIVE":
      return `${base} extra drahé (${vs})`;
    case "EXPENSIVE":
      return `${base} drahé (${vs})`;
    case "EXTREME_CHEAP":
      return `${base} extra levné (${vs})`;
    case "CHEAP":
      return `${base} levné (${vs})`;
    case "FAIR":
      return `${base} fér (${vs})`;
    default:
      return "N/A";
  }
}

export function scoreFromLogPrice(logPrices) {
  return percentileToScore(percentRankInclusive(logPrices));
}

export function scoreFromYieldDiff(diffs) {
  return percentileToScore(percentRankInclusive(diffs));
}

export function valuePair({ logPrices, yieldDiffs }) {
  const priceScore = scoreFromLogPrice(logPrices);
  const rateScore =
    yieldDiffs == null ? null : scoreFromYieldDiff(yieldDiffs);
  const rv = residualValuation(priceScore, rateScore);
  if (!rv) return { priceScore, rateScore, score: null, mode: null };
  return { priceScore, rateScore, ...rv };
}
