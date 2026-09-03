import {
  assetClassFromAlias,
  assetClassFromCryptoPattern,
} from "@/lib/market-aliases"
import type {
  AssetClass,
  Bias,
  MarketClassification,
  MarketType,
} from "@/types/trade"

const FOREX_MAJORS = new Set([
  "EURUSD",
  "GBPUSD",
  "USDJPY",
  "USDCHF",
  "USDCAD",
  "AUDUSD",
  "NZDUSD",
])

const FOREX_CURRENCIES = new Set([
  "USD",
  "EUR",
  "GBP",
  "JPY",
  "CHF",
  "CAD",
  "AUD",
  "NZD",
  "SGD",
  "HKD",
  "SEK",
  "NOK",
  "DKK",
  "MXN",
  "TRY",
  "ZAR",
  "PLN",
  "CNH",
])

const UNKNOWN: Omit<MarketClassification, "symbol"> = {
  assetClass: "Unknown",
  marketType: "Unknown",
  cotEnabled: false,
}

export function normalizeSymbol(input: string): string {
  return input.toUpperCase().replaceAll(" ", "").replaceAll("/", "")
}

function classified(
  symbol: string,
  assetClass: AssetClass,
  marketType: MarketType = "Unknown",
  cotEnabled = false
): MarketClassification {
  return { symbol, assetClass, marketType, cotEnabled }
}

function isForexCurrency(code: string): boolean {
  return FOREX_CURRENCIES.has(code)
}

function classifyForexPair(symbol: string): MarketClassification | null {
  if (symbol.length !== 6) return null

  const base = symbol.slice(0, 3)
  const quote = symbol.slice(3, 6)
  if (base === quote) return null
  if (!isForexCurrency(base) || !isForexCurrency(quote)) return null

  if (FOREX_MAJORS.has(symbol)) {
    return classified(symbol, "Forex", "Major", true)
  }

  return classified(symbol, "Forex", "Cross", false)
}

export function classifyMarket(rawSymbol: string): MarketClassification {
  const symbol = normalizeSymbol(rawSymbol)
  if (!symbol) {
    return { symbol: "", ...UNKNOWN }
  }

  const aliased = assetClassFromAlias(symbol)
  if (aliased) {
    if (aliased === "Forex") {
      return classifyForexPair(symbol) ?? classified(symbol, "Forex")
    }
    return classified(symbol, aliased)
  }

  const crypto = assetClassFromCryptoPattern(symbol)
  if (crypto) return classified(symbol, crypto)

  const forex = classifyForexPair(symbol)
  if (forex) return forex

  // Share tickers are too many to alias. Anything that still looks like a
  // market symbol and is not a known FX / metal / index / crypto / commodity
  // is Stock.
  if (/[A-Z]/.test(symbol)) {
    return classified(symbol, "Stock")
  }

  return { symbol, ...UNKNOWN }
}

export function formatMarketLabel(classification: {
  assetClass: AssetClass
  marketType: MarketType
  symbol?: string
}): string {
  if (classification.assetClass === "Unknown" || !classification.symbol) {
    return classification.symbol ? "Unknown" : ""
  }

  if (classification.marketType === "Unknown") {
    return classification.assetClass
  }

  return `${classification.assetClass} · ${classification.marketType}`
}

export function shouldDisplayCot(
  classification: Pick<MarketClassification, "cotEnabled">
): boolean {
  return classification.cotEnabled
}

export function cotFieldsForClassification(
  classification: Pick<MarketClassification, "cotEnabled">,
  entered: {
    cotBias: Bias
    cotScore: number | null
    commercialsBias: Bias
  }
): {
  cotBias: Bias | null
  cotScore: number | null
  commercialsBias: Bias | null
} {
  if (!classification.cotEnabled) {
    return {
      cotBias: null,
      cotScore: null,
      commercialsBias: null,
    }
  }

  const score =
    entered.cotScore == null || !Number.isFinite(entered.cotScore)
      ? 0
      : Math.min(100, Math.max(-100, entered.cotScore))

  return {
    cotBias: entered.cotBias,
    cotScore: score,
    commercialsBias: entered.commercialsBias,
  }
}
