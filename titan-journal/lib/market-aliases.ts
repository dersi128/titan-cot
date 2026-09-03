import type { AssetClass } from "@/types/trade"

function aliasKey(symbol: string): string {
  return symbol.toUpperCase().replaceAll(" ", "").replaceAll("/", "")
}

/**
 * Exact-symbol aliases for the main non-stock markets.
 * Unmatched tickers fall through to Stock in classifyMarket — do not list every share here.
 * Add broker variants (GOLD, USTEC, USOIL) in the matching class.
 */
export const ASSET_CLASS_ALIASES: Record<
  Exclude<AssetClass, "Unknown" | "Stock">,
  readonly string[]
> = {
  Forex: [],
  Commodity: [
    "COTTON",
    "COFFEE",
    "CORN",
    "WHEAT",
    "SOYBEAN",
    "SOYBEANS",
    "SUGAR",
    "COCOA",
    "OIL",
    "USOIL",
    "UKOIL",
    "WTI",
    "WTIUSD",
    "BRENT",
    "BRENTUSD",
    "NATGAS",
    "NGAS",
    "NATGASUSD",
  ],
  Metal: [
    "XAUUSD",
    "XAGUSD",
    "XPTUSD",
    "XPDUSD",
    "GOLD",
    "SILVER",
    "PLATINUM",
    "PALLADIUM",
    "COPPER",
    "XAU",
    "XAG",
    "XPT",
    "XPD",
    "XCUUSD",
    "COPPERUSD",
  ],
  Index: [
    "US30",
    "US500",
    "US100",
    "US2000",
    "NAS100",
    "SPX500",
    "SPX",
    "NDX",
    "DJI",
    "DOW",
    "USTEC",
    "NASDAQ",
    "GER40",
    "DE30",
    "DAX",
    "UK100",
    "FTSE",
    "FRA40",
    "CAC40",
    "ES35",
    "JP225",
    "JPN225",
    "AU200",
    "HK50",
    "WS30",
  ],
  Crypto: ["BTCUSD", "BTCUSDT", "ETHUSD", "ETHUSDT", "BTC", "ETH"],
}

/** Known crypto bases; combine with CRYPTO_QUOTES (BTCUSD, SOLUSDT, …). */
export const CRYPTO_BASES = [
  "BTC",
  "ETH",
  "SOL",
  "XRP",
  "BNB",
  "ADA",
  "DOGE",
  "LTC",
  "AVAX",
  "DOT",
  "LINK",
] as const
export const CRYPTO_QUOTES = ["USD", "USDT", "USDC"] as const

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
  const key = aliasKey(symbol)
  for (const quote of CRYPTO_QUOTES) {
    if (!key.endsWith(quote)) continue
    const base = key.slice(0, key.length - quote.length)
    if ((CRYPTO_BASES as readonly string[]).includes(base)) return "Crypto"
  }
  return null
}
