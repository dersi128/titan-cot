import type { Bias, TradeDirection } from "@/types/trade"

export type CotLink = {
  slug: string
  futuresSymbol: string
  label: string
  invert: boolean
}

export type CotLiveSnapshot = {
  ok: true
  symbol: string
  slug: string
  futuresSymbol: string
  market: string
  reportDate: string
  invert: boolean
  commercialsBias: Bias
  pairBias: Bias
  cotScore: number
  futuresScore: number
  verdict: string
}

export type CotLiveResponse =
  | CotLiveSnapshot
  | { ok: false; error: "unsupported" | "unavailable" }

export type CotAlignment = "aligned" | "against" | "neutral"

const LINKS: Record<string, CotLink> = {
  EURUSD: {
    slug: "euro-fx",
    futuresSymbol: "6E1!",
    label: "Euro FX",
    invert: false,
  },
  GBPUSD: {
    slug: "british-pound",
    futuresSymbol: "6B1!",
    label: "British Pound",
    invert: false,
  },
  AUDUSD: {
    slug: "australian-dollar",
    futuresSymbol: "6A1!",
    label: "Australian Dollar",
    invert: false,
  },
  NZDUSD: {
    slug: "new-zealand-dollar",
    futuresSymbol: "6N1!",
    label: "New Zealand Dollar",
    invert: false,
  },
  USDJPY: {
    slug: "japanese-yen",
    futuresSymbol: "6J1!",
    label: "Japanese Yen",
    invert: true,
  },
  USDCAD: {
    slug: "canadian-dollar",
    futuresSymbol: "6C1!",
    label: "Canadian Dollar",
    invert: true,
  },
  USDCHF: {
    slug: "swiss-franc",
    futuresSymbol: "6S1!",
    label: "Swiss Franc",
    invert: true,
  },
  XAUUSD: { slug: "gold", futuresSymbol: "GC1!", label: "Gold", invert: false },
  XAGUSD: {
    slug: "silver",
    futuresSymbol: "SI1!",
    label: "Silver",
    invert: false,
  },
  XPTUSD: {
    slug: "platinum",
    futuresSymbol: "PL1!",
    label: "Platinum",
    invert: false,
  },
  XPDUSD: {
    slug: "palladium",
    futuresSymbol: "PA1!",
    label: "Palladium",
    invert: false,
  },
  COPPER: {
    slug: "copper",
    futuresSymbol: "HG1!",
    label: "Copper",
    invert: false,
  },
  NAS100: {
    slug: "nasdaq",
    futuresSymbol: "NQ1!",
    label: "Nasdaq-100",
    invert: false,
  },
  US500: {
    slug: "sp500",
    futuresSymbol: "ES1!",
    label: "S&P 500",
    invert: false,
  },
  US30: {
    slug: "e-mini-dow",
    futuresSymbol: "YM1!",
    label: "Dow",
    invert: false,
  },
  US2000: {
    slug: "russell-2000",
    futuresSymbol: "RTY1!",
    label: "Russell 2000",
    invert: false,
  },
  USOIL: {
    slug: "crude-oil",
    futuresSymbol: "CL1!",
    label: "Crude Oil",
    invert: false,
  },
  NATGAS: {
    slug: "natural-gas",
    futuresSymbol: "NG1!",
    label: "Natural Gas",
    invert: false,
  },
  WHEAT: {
    slug: "wheat-srw",
    futuresSymbol: "ZW1!",
    label: "Wheat",
    invert: false,
  },
  CORN: { slug: "corn", futuresSymbol: "ZC1!", label: "Corn", invert: false },
  SOYBEANS: {
    slug: "soybeans",
    futuresSymbol: "ZS1!",
    label: "Soybeans",
    invert: false,
  },
  COCOA: { slug: "cocoa", futuresSymbol: "CC1!", label: "Cocoa", invert: false },
  SUGAR: { slug: "sugar", futuresSymbol: "SB1!", label: "Sugar", invert: false },
  COFFEE: {
    slug: "coffee",
    futuresSymbol: "KC1!",
    label: "Coffee",
    invert: false,
  },
  COTTON: {
    slug: "cotton",
    futuresSymbol: "CT1!",
    label: "Cotton",
    invert: false,
  },
}

const ALIASES: Record<string, string> = {
  GOLD: "XAUUSD",
  XAU: "XAUUSD",
  SILVER: "XAGUSD",
  XAG: "XAGUSD",
  PLATINUM: "XPTUSD",
  XPT: "XPTUSD",
  PALLADIUM: "XPDUSD",
  XPD: "XPDUSD",
  XCUUSD: "COPPER",
  COPPERUSD: "COPPER",
  US100: "NAS100",
  USTEC: "NAS100",
  NDX: "NAS100",
  NASDAQ: "NAS100",
  SPX500: "US500",
  SPX: "US500",
  DOW: "US30",
  DJI: "US30",
  WS30: "US30",
  WTI: "USOIL",
  WTIUSD: "USOIL",
  OIL: "USOIL",
  NGAS: "NATGAS",
  NATGASUSD: "NATGAS",
  SOYBEAN: "SOYBEANS",
}

function key(input: string): string {
  return input.toUpperCase().replaceAll(" ", "").replaceAll("/", "")
}

export function resolveCotLink(rawSymbol: string): CotLink | null {
  const symbol = key(rawSymbol)
  if (!symbol) return null
  const canonical = ALIASES[symbol] ?? symbol
  return LINKS[canonical] ?? null
}

export function hasCotLink(rawSymbol: string): boolean {
  return resolveCotLink(rawSymbol) != null
}

export function invertBias(bias: Bias): Bias {
  if (bias === "Bullish") return "Bearish"
  if (bias === "Bearish") return "Bullish"
  return "Neutral"
}

export function clampCotScore(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.min(100, Math.max(-100, Math.round(value)))
}

export function pairOrientedScore(futuresScore: number, invert: boolean): number {
  return clampCotScore(invert ? -futuresScore : futuresScore)
}

export function journalBiasFromApi(value: unknown): Bias {
  if (value === "bullish" || value === "Bullish") return "Bullish"
  if (value === "bearish" || value === "Bearish") return "Bearish"
  return "Neutral"
}

export function biasFromScore(score: number): Bias {
  if (score > 0) return "Bullish"
  if (score < 0) return "Bearish"
  return "Neutral"
}

export function cotAlignment(
  direction: TradeDirection,
  pairBias: Bias | null | undefined
): CotAlignment {
  if (pairBias == null || pairBias === "Neutral") return "neutral"
  if (direction === "LONG") return pairBias === "Bullish" ? "aligned" : "against"
  return pairBias === "Bearish" ? "aligned" : "against"
}

export function formatCotScore(score: number | null | undefined): string {
  if (score == null || !Number.isFinite(score)) return "—"
  const rounded = Math.round(score)
  if (rounded > 0) return `+${rounded}`
  return String(rounded)
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null
  return value as Record<string, unknown>
}

function isoDay(value: string): string {
  return value.slice(0, 10)
}

function historyPoints(row: Record<string, unknown>): {
  reportDate: string
  commercialNet: number
}[] {
  if (!Array.isArray(row.history)) return []
  return row.history
    .map((point) => {
      const item = asRecord(point)
      if (!item) return null
      const reportDate =
        typeof item.reportDate === "string" ? isoDay(item.reportDate) : ""
      const commercialNet =
        typeof item.commercialNet === "number" && Number.isFinite(item.commercialNet)
          ? item.commercialNet
          : null
      if (!reportDate || commercialNet == null) return null
      return { reportDate, commercialNet }
    })
    .filter((point): point is { reportDate: string; commercialNet: number } => point != null)
    .sort((a, b) => a.reportDate.localeCompare(b.reportDate))
}

function cotIndexAgainstPrior(series: number[], lookback: number): number {
  if (series.length < lookback + 1) return 50
  const current = series[series.length - 1]!
  const prior = series.slice(-(lookback + 1), -1)
  const min = Math.min(...prior)
  const max = Math.max(...prior)
  if (max === min) return 50
  return Math.round(((current - min) / (max - min)) * 10000) / 100
}

export function applyCotAsOf(payload: unknown, asOf: string): unknown {
  const row = asRecord(payload)
  const want = isoDay(asOf)
  if (!row || !/^\d{4}-\d{2}-\d{2}$/.test(want)) return payload

  const latest = typeof row.reportDate === "string" ? isoDay(row.reportDate) : ""
  const points = historyPoints(row)
  if (points.length === 0) return payload

  const sliced = points.filter((point) => point.reportDate <= want)
  if (sliced.length === 0) return payload
  const picked = sliced[sliced.length - 1]!
  if (picked.reportDate === latest) return payload

  const index26w = cotIndexAgainstPrior(
    sliced.map((point) => point.commercialNet),
    26
  )
  const bias =
    index26w > 80 ? "bullish" : index26w < 20 ? "bearish" : "neutral"
  const prevCommercials = asRecord(row.commercials) ?? {}

  return {
    ...row,
    reportDate: picked.reportDate,
    commercials: { ...prevCommercials, bias, index26w },
    cotScore: clampCotScore((index26w - 50) * 2),
  }
}

export function snapshotFromTrade(
  trade: {
    symbol: string
    cotEnabled: boolean
    cotBias?: Bias | null
    commercialsBias?: Bias | null
    cotScore?: number | null
    cotReportDate?: string | null
  }
): CotLiveSnapshot | null {
  if (!trade.cotEnabled) return null
  const link = resolveCotLink(trade.symbol)
  if (!link) return null
  const pairBias = trade.cotBias ?? "Neutral"
  const commercialsBias = trade.commercialsBias ?? pairBias
  const cotScore = trade.cotScore ?? 0
  return {
    ok: true,
    symbol: key(trade.symbol),
    slug: link.slug,
    futuresSymbol: link.futuresSymbol,
    market: link.label,
    reportDate: trade.cotReportDate ?? "",
    invert: link.invert,
    commercialsBias,
    pairBias,
    cotScore,
    futuresScore: link.invert ? clampCotScore(-cotScore) : clampCotScore(cotScore),
    verdict: "",
  }
}

export function compactCotFromApi(
  symbol: string,
  link: CotLink,
  data: unknown
): CotLiveSnapshot | null {
  const row = asRecord(data)
  if (!row) return null

  const commercials = asRecord(row.commercials)
  const futuresScore =
    typeof row.cotScore === "number" && Number.isFinite(row.cotScore)
      ? row.cotScore
      : null
  if (futuresScore == null) return null

  const commercialsBias = commercials
    ? journalBiasFromApi(commercials.bias)
    : biasFromScore(futuresScore)
  const cotScore = pairOrientedScore(futuresScore, link.invert)
  const pairBias = link.invert ? invertBias(commercialsBias) : commercialsBias
  const reportDate = typeof row.reportDate === "string" ? row.reportDate : ""
  const verdict = typeof row.cotVerdict === "string" ? row.cotVerdict : ""
  const market =
    typeof row.market === "string" && row.market.trim()
      ? row.market
      : link.label

  return {
    ok: true,
    symbol: key(symbol) || symbol,
    slug: link.slug,
    futuresSymbol: link.futuresSymbol,
    market,
    reportDate,
    invert: link.invert,
    commercialsBias,
    pairBias,
    cotScore,
    futuresScore: clampCotScore(futuresScore),
    verdict,
  }
}

export function resolveSavedCot(input: {
  cotEnabled: boolean
  editing: boolean
  override?: { cotBias?: Bias; commercialsBias?: Bias }
  live: Pick<
    CotLiveSnapshot,
    "pairBias" | "commercialsBias" | "cotScore" | "reportDate"
  > | null
  stored?: {
    cotBias?: Bias | null
    commercialsBias?: Bias | null
    cotScore?: number | null
    cotReportDate?: string | null
  }
}): {
  cotBias: Bias | null
  commercialsBias: Bias | null
  cotScore: number | null
  cotReportDate: string | null
} {
  if (!input.cotEnabled) {
    return {
      cotBias: null,
      commercialsBias: null,
      cotScore: null,
      cotReportDate: null,
    }
  }

  const reportDate = (value: string | null | undefined) =>
    value && /^\d{4}-\d{2}-\d{2}/.test(value) ? value.slice(0, 10) : null

  const overrideBias = input.override?.cotBias
  if (overrideBias) {
    return {
      cotBias: overrideBias,
      commercialsBias: input.override?.commercialsBias ?? overrideBias,
      cotScore: input.live?.cotScore ?? input.stored?.cotScore ?? 0,
      cotReportDate:
        reportDate(input.live?.reportDate) ??
        reportDate(input.stored?.cotReportDate),
    }
  }

  if (!input.editing && input.live) {
    return {
      cotBias: input.live.pairBias,
      commercialsBias: input.live.commercialsBias,
      cotScore: input.live.cotScore,
      cotReportDate: reportDate(input.live.reportDate),
    }
  }

  return {
    cotBias: input.stored?.cotBias ?? input.live?.pairBias ?? "Neutral",
    commercialsBias:
      input.stored?.commercialsBias ?? input.live?.commercialsBias ?? "Neutral",
    cotScore: input.stored?.cotScore ?? input.live?.cotScore ?? 0,
    cotReportDate:
      reportDate(input.stored?.cotReportDate) ?? reportDate(input.live?.reportDate),
  }
}

export const DEFAULT_COT_API_URL = "https://titan-cot.onrender.com"

export function cotApiBaseUrl(): string {
  const raw = process.env.COT_API_URL?.trim() || DEFAULT_COT_API_URL
  return raw.replace(/\/$/, "")
}
