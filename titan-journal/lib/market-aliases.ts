import type { AssetClass } from "@/types/trade"

function aliasKey(symbol: string): string {
  return symbol.toUpperCase().replaceAll(" ", "").replaceAll("/", "")
}

/**
 * Exact-symbol aliases per asset class. Add broker variants here later
 * (GOLD → Metal, USTEC → Index) without touching Dashboard UI.
 * Forex pairs stay on the 6-letter currency-leg rules unless listed here.
 */
export const ASSET_CLASS_ALIASES: Record<
  Exclude<AssetClass, "Unknown">,
  readonly string[]
> = {
  Forex: [],
  Stock: ["AAPL", "NVDA", "GOOGL", "GOOG", "TSLA", "TESLA"],
  Commodity: ["COTTON", "COFFEE", "CORN", "WHEAT", "SOYBEAN"],
  Metal: ["XAUUSD", "XAGUSD", "GOLD", "SILVER", "XAU", "XAG"],
  Index: [
    "US30",
    "NAS100",
    "SPX500",
    "GER40",
    "UK100",
    "USTEC",
    "NASDAQ",
  ],
  Crypto: ["BTCUSD", "BTCUSDT", "ETHUSD", "ETHUSDT", "BTC", "ETH"],
}

/** Known crypto bases; combine with CRYPTO_QUOTES to classify BTCUSD, ETHUSDT, etc. */
export const CRYPTO_BASES = ["BTC", "ETH"] as const
export const CRYPTO_QUOTES = ["USD", "USDT"] as const

function buildAliasIndex(): Map<string, AssetClass> {
  const index = new Map<string, AssetClass>()
  for (const [assetClass, aliases] of Object.entries(ASSET_CLASS_ALIASES)) {
    for (const alias of aliases) {
      index.set(aliasKey(alias), assetClass as AssetClass)
    }
  }
  return index
}

const ALIAS_INDEX = buildAliasIndex()

export function assetClassFromAlias(symbol: string): AssetClass | null {
  return ALIAS_INDEX.get(aliasKey(symbol)) ?? null
}

export function assetClassFromCryptoPattern(symbol: string): AssetClass | null {
  for (const quote of CRYPTO_QUOTES) {
    if (!symbol.endsWith(quote)) continue
    const base = symbol.slice(0, symbol.length - quote.length)
    if ((CRYPTO_BASES as readonly string[]).includes(base)) return "Crypto"
  }
  return null
}
