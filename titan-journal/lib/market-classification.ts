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
])

const UNKNOWN: Omit<MarketClassification, "symbol"> = {
  assetClass: "Unknown",
  marketType: "Unknown",
  cotEnabled: false,
}

export function normalizeSymbol(input: string): string {
  return input.toUpperCase().replaceAll(" ", "").replaceAll("/", "")
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
    return {
      symbol,
      assetClass: "Forex",
      marketType: "Major",
      cotEnabled: true,
    }
  }

  return {
    symbol,
    assetClass: "Forex",
    marketType: "Cross",
    cotEnabled: false,
  }
}

export function classifyMarket(rawSymbol: string): MarketClassification {
  const symbol = normalizeSymbol(rawSymbol)
  if (!symbol) {
    return { symbol: "", ...UNKNOWN }
  }

  return classifyForexPair(symbol) ?? { symbol, ...UNKNOWN }
}

export function formatMarketLabel(classification: {
  assetClass: AssetClass
  marketType: MarketType
  symbol?: string
}): string {
  if (classification.assetClass === "Unknown" || !classification.symbol) {
    return classification.symbol ? "Unknown" : ""
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
