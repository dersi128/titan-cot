import { FEATURE_FLAGS } from "@/lib/feature-flags"
import type { MarketClassification, PairClass } from "@/types/trade"

const FOREX_MAJORS = new Set([
  "AUDUSD",
  "EURUSD",
  "GBPUSD",
  "USDJPY",
  "USDCHF",
  "USDCAD",
  "NZDUSD",
])

const FOREX_CURRENCIES = new Set([
  "USD",
  "EUR",
  "GBP",
  "JPY",
  "AUD",
  "NZD",
  "CAD",
  "CHF",
])

export function normalizeSymbol(input: string): string {
  return input.replace(/[^A-Za-z]/g, "").toUpperCase()
}

function pairClassForForex(symbol: string): PairClass {
  if (FOREX_MAJORS.has(symbol)) return "Major"

  const base = symbol.slice(0, 3)
  const quote = symbol.slice(3, 6)
  if (FOREX_CURRENCIES.has(base) && FOREX_CURRENCIES.has(quote)) {
    return "Cross"
  }

  return "Exotic"
}

export function classifyMarket(rawSymbol: string): MarketClassification {
  const symbol = normalizeSymbol(rawSymbol)

  if (symbol.length === 6) {
    return {
      symbol,
      marketType: "Forex",
      pairClass: pairClassForForex(symbol),
    }
  }

  return {
    symbol,
    marketType: "Unknown",
    pairClass: "Unknown",
  }
}

export function formatMarketLabel(classification: MarketClassification): string {
  if (classification.marketType === "Unknown" || !classification.symbol) {
    return "Unknown market"
  }

  return `${classification.marketType} · ${classification.pairClass}`
}

/**
 * COT is currently shown for every market. Later, set
 * `FEATURE_FLAGS.hideCotForCrossPairs` to hide it on Cross pairs.
 */
export function shouldDisplayCot(
  classification: MarketClassification
): boolean {
  if (
    FEATURE_FLAGS.hideCotForCrossPairs &&
    classification.pairClass === "Cross"
  ) {
    return false
  }

  return true
}
