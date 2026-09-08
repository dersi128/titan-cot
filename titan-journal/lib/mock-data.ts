import { classifyMarket } from "@/lib/market-classification"
import { fieldValuesFromLegacy } from "@/lib/playbook-legacy"
import { TITAN_SWING_PLAYBOOK_ID } from "@/lib/playbooks"
import type {
  Account,
  Grade,
  Location,
  TouchCount,
  Trade,
  TradeDirection,
  TradeStatus,
  Trend,
  ZoneType,
} from "@/types/trade"

const R_PER_DOLLAR = 130

type Seed = {
  id: string
  date: string
  symbol: string
  direction: TradeDirection
  grade: Grade
  htfTrend: Trend
  tradeTrend: Trend
  location: Location
  resultR: number | null
  status: TradeStatus
  zoneType: ZoneType
  fresh: boolean
  touchCount: TouchCount
  account?: Account
  notes?: string
  cotScore?: number
}

function pricesFor(direction: TradeDirection, rrr = 2) {
  if (direction === "LONG") {
    return {
      entry: 1.0842,
      stopLoss: 1.0792,
      takeProfit: Number((1.0842 + 0.005 * rrr).toFixed(4)),
    }
  }

  return {
    entry: 0.6528,
    stopLoss: 0.6578,
    takeProfit: Number((0.6528 - 0.005 * rrr).toFixed(4)),
  }
}

function fromSeed(seed: Seed): Trade {
  const classification = classifyMarket(seed.symbol)
  const plannedRRR = 2
  const { entry, stopLoss, takeProfit } = pricesFor(seed.direction, plannedRRR)
  const resultR = seed.resultR
  const isShort = seed.direction === "SHORT"

  const trade: Trade = {
    id: seed.id,
    createdAt: `${seed.date}T08:30:00.000Z`,
    date: seed.date,
    symbol: classification.symbol || seed.symbol,
    assetClass: classification.assetClass,
    marketType: classification.marketType,
    cotEnabled: classification.cotEnabled,
    direction: seed.direction,
    strategy: "Demo",
    account: seed.account ?? "Personal",
    status: seed.status,
    htfTrend: seed.htfTrend,
    tradeTrend: seed.tradeTrend,
    location: seed.location,
    zoneType: seed.zoneType,
    zoneTimeframe: "Daily",
    original: seed.fresh,
    fresh: seed.fresh,
    touchCount: seed.touchCount,
    hq: seed.grade === "A+" || seed.grade === "A",
    impulse: seed.grade === "A+" ? "Strong" : seed.grade === "B" ? "Weak" : "Normal",
    mitigation: seed.fresh ? 8 : seed.touchCount === "2+" ? 31 : 18,
    cotBias: classification.cotEnabled ? (isShort ? "Bearish" : "Bullish") : null,
    cotScore: classification.cotEnabled
      ? seed.cotScore ?? (isShort ? -38 : 41)
      : null,
    commercialsBias: classification.cotEnabled
      ? isShort
        ? "Bearish"
        : "Bullish"
      : null,
    cotReportDate: classification.cotEnabled ? seed.date : null,
    seasonalityBias: "Neutral",
    seasonalWindow: false,
    grade: seed.grade,
    entry,
    stopLoss,
    takeProfit,
    riskPercent: 1,
    plannedRRR,
    resultR,
    pnl: resultR == null ? null : Math.round(resultR * R_PER_DOLLAR),
    notes: seed.notes ?? "",
    screenshot: null,
    playbookId: TITAN_SWING_PLAYBOOK_ID,
    fieldValues: [],
    review: null,
  }

  trade.fieldValues = fieldValuesFromLegacy(trade)
  return trade
}

function closed(seed: {
  id: string
  date: string
  symbol: string
  direction: TradeDirection
  resultR: number
  grade?: Grade
  account?: Account
  notes?: string
  cotScore?: number
}): Seed {
  const grade = seed.grade ?? "B+"
  const down = seed.direction === "SHORT"
  const fresh = grade === "A+" || grade === "A"

  return {
    id: seed.id,
    date: seed.date,
    symbol: seed.symbol,
    direction: seed.direction,
    grade,
    htfTrend: down ? "Downtrend" : "Uptrend",
    tradeTrend: down ? "Downtrend" : "Uptrend",
    location: down ? "Premium" : "Discount",
    resultR: seed.resultR,
    status: "CLOSED",
    zoneType: down ? "Supply" : "Demand",
    fresh,
    touchCount: fresh ? "0" : "1",
    account: seed.account,
    notes: seed.notes,
    cotScore: seed.cotScore,
  }
}

const FEATURED: Seed[] = [
  {
    id: "trd-001",
    date: "2026-08-28",
    symbol: "AUDUSD",
    direction: "SHORT",
    grade: "A",
    htfTrend: "Strong Downtrend",
    tradeTrend: "Strong Downtrend",
    location: "Premium",
    resultR: 2,
    status: "CLOSED",
    zoneType: "Supply",
    fresh: true,
    touchCount: "0",
    notes: "Short z prémia ze supply v silném HTF downtrendu. Plán 2R, držen do cíle.",
    cotScore: -52,
  },
  {
    id: "trd-002",
    date: "2026-08-26",
    symbol: "EURUSD",
    direction: "LONG",
    grade: "A+",
    htfTrend: "Uptrend",
    tradeTrend: "Uptrend",
    location: "Discount",
    resultR: -1,
    status: "CLOSED",
    zoneType: "Demand",
    fresh: true,
    touchCount: "0",
    notes: "A+ čerstvá demand v diskontu. Lokace seděla, invalidace přišla dřív.",
    cotScore: 61,
  },
  {
    id: "trd-003",
    date: "2026-08-22",
    symbol: "EURAUD",
    direction: "SHORT",
    grade: "B+",
    htfTrend: "Downtrend",
    tradeTrend: "Downtrend",
    location: "Premium",
    resultR: 2,
    status: "CLOSED",
    zoneType: "Supply",
    fresh: false,
    touchCount: "1",
    notes: "Křížový pár short z prémia. COT zapsán do procesu, ne jako filtr.",
    cotScore: -14,
  },
]

const MORE_CLOSED: Seed[] = [
  closed({ id: "trd-004", date: "2026-09-04", symbol: "EURUSD", direction: "LONG", resultR: -1, grade: "B" }),
  closed({ id: "trd-005", date: "2026-09-02", symbol: "NVDA", direction: "LONG", resultR: 2, grade: "A" }),
  closed({ id: "trd-006", date: "2026-09-01", symbol: "XAUUSD", direction: "SHORT", resultR: 1.5, grade: "A+" }),
  closed({ id: "trd-007", date: "2026-08-20", symbol: "AAPL", direction: "LONG", resultR: 1, grade: "B+" }),
  closed({ id: "trd-008", date: "2026-08-18", symbol: "BTCUSD", direction: "LONG", resultR: -1.5, grade: "B" }),
  closed({ id: "trd-009", date: "2026-08-14", symbol: "US30", direction: "SHORT", resultR: 2, grade: "A" }),
  closed({ id: "trd-010", date: "2026-08-11", symbol: "GBPUSD", direction: "LONG", resultR: -1, grade: "B+" }),
  closed({ id: "trd-011", date: "2026-08-07", symbol: "COFFEE", direction: "LONG", resultR: 3, grade: "A+" }),
  closed({ id: "trd-012", date: "2026-08-04", symbol: "XAGUSD", direction: "SHORT", resultR: -1, grade: "B" }),
  closed({ id: "trd-013", date: "2026-07-29", symbol: "ETHUSD", direction: "LONG", resultR: 2, grade: "A" }),
  closed({ id: "trd-014", date: "2026-07-24", symbol: "TSLA", direction: "LONG", resultR: -1, grade: "B" }),
  closed({ id: "trd-015", date: "2026-07-21", symbol: "EURUSD", direction: "SHORT", resultR: 0, grade: "B+" }),
  closed({ id: "trd-016", date: "2026-07-16", symbol: "NAS100", direction: "LONG", resultR: 1.5, grade: "A" }),
  closed({ id: "trd-017", date: "2026-07-10", symbol: "GOLD", direction: "SHORT", resultR: -1, grade: "B" }),
  closed({ id: "trd-018", date: "2026-07-06", symbol: "AUDUSD", direction: "LONG", resultR: 2, grade: "A+" }),
  closed({ id: "trd-019", date: "2026-07-02", symbol: "WHEAT", direction: "LONG", resultR: -0.5, grade: "B+" }),
  closed({ id: "trd-020", date: "2026-06-26", symbol: "AAPL", direction: "SHORT", resultR: 2, grade: "A" }),
  closed({ id: "trd-021", date: "2026-06-20", symbol: "GBPUSD", direction: "LONG", resultR: -1, grade: "B" }),
  closed({ id: "trd-022", date: "2026-06-17", symbol: "XAUUSD", direction: "LONG", resultR: 2.5, grade: "A+" }),
  closed({ id: "trd-023", date: "2026-06-11", symbol: "CORN", direction: "LONG", resultR: -1, grade: "B+" }),
  closed({ id: "trd-024", date: "2026-06-08", symbol: "US30", direction: "LONG", resultR: 1, grade: "A" }),
  closed({ id: "trd-025", date: "2026-06-03", symbol: "BTCUSD", direction: "SHORT", resultR: -1.5, grade: "B" }),
  closed({ id: "trd-026", date: "2026-05-27", symbol: "EURUSD", direction: "LONG", resultR: -1, grade: "B" }),
  closed({ id: "trd-027", date: "2026-05-22", symbol: "NVDA", direction: "LONG", resultR: -1.5, grade: "B" }),
  closed({ id: "trd-028", date: "2026-05-19", symbol: "AUDUSD", direction: "SHORT", resultR: 2, grade: "A" }),
  closed({ id: "trd-029", date: "2026-05-13", symbol: "XAUUSD", direction: "LONG", resultR: -1, grade: "B+" }),
  closed({ id: "trd-030", date: "2026-05-08", symbol: "SPX500", direction: "LONG", resultR: -1, grade: "B" }),
  closed({ id: "trd-031", date: "2026-05-04", symbol: "GBPUSD", direction: "SHORT", resultR: 1, grade: "A" }),
  closed({ id: "trd-032", date: "2026-04-27", symbol: "TSLA", direction: "LONG", resultR: 3, grade: "A+" }),
  closed({ id: "trd-033", date: "2026-04-21", symbol: "EURUSD", direction: "LONG", resultR: -1, grade: "B" }),
  closed({ id: "trd-034", date: "2026-04-16", symbol: "XAUUSD", direction: "SHORT", resultR: 2, grade: "A" }),
  closed({ id: "trd-035", date: "2026-04-10", symbol: "AAPL", direction: "LONG", resultR: 1.5, grade: "A" }),
  closed({ id: "trd-036", date: "2026-04-06", symbol: "BTCUSD", direction: "LONG", resultR: -1, grade: "B+" }),
  closed({ id: "trd-037", date: "2026-04-02", symbol: "GBPUSD", direction: "LONG", resultR: 2, grade: "A+" }),
  closed({ id: "trd-038", date: "2026-03-27", symbol: "US30", direction: "LONG", resultR: -1, grade: "B" }),
  closed({ id: "trd-039", date: "2026-03-23", symbol: "GOLD", direction: "SHORT", resultR: 2, grade: "A" }),
  closed({ id: "trd-040", date: "2026-03-17", symbol: "EURUSD", direction: "LONG", resultR: 1, grade: "B+" }),
  closed({ id: "trd-041", date: "2026-03-11", symbol: "NVDA", direction: "LONG", resultR: -1, grade: "B" }),
  closed({ id: "trd-042", date: "2026-03-05", symbol: "AUDUSD", direction: "SHORT", resultR: 2, grade: "A" }),
  closed({ id: "trd-043", date: "2026-03-02", symbol: "COFFEE", direction: "LONG", resultR: -1, grade: "B+" }),
  closed({ id: "trd-044", date: "2026-08-15", symbol: "EURUSD", direction: "LONG", resultR: 2, grade: "A", account: "Funded" }),
  closed({ id: "trd-045", date: "2026-07-08", symbol: "GBPUSD", direction: "SHORT", resultR: -1, grade: "B", account: "Funded" }),
  closed({ id: "trd-046", date: "2026-06-14", symbol: "XAUUSD", direction: "LONG", resultR: 1.5, grade: "A", account: "Funded" }),
  closed({ id: "trd-047", date: "2026-05-18", symbol: "AAPL", direction: "LONG", resultR: -1, grade: "B+", account: "Funded" }),
  closed({ id: "trd-048", date: "2026-04-09", symbol: "US30", direction: "SHORT", resultR: 2, grade: "A", account: "Funded" }),
  closed({ id: "trd-049", date: "2026-03-20", symbol: "BTCUSD", direction: "LONG", resultR: -1, grade: "B", account: "Funded" }),
  closed({ id: "trd-050", date: "2026-08-09", symbol: "NAS100", direction: "LONG", resultR: 3, grade: "A+", account: "Backtesting" }),
  closed({ id: "trd-051", date: "2026-06-22", symbol: "EURUSD", direction: "SHORT", resultR: -1, grade: "B", account: "Backtesting" }),
  closed({ id: "trd-052", date: "2026-04-30", symbol: "GOLD", direction: "LONG", resultR: 2, grade: "A", account: "Backtesting" }),
  closed({ id: "trd-053", date: "2026-03-12", symbol: "AUDUSD", direction: "LONG", resultR: -1.5, grade: "B+", account: "Backtesting" }),
]

const OPEN: Seed[] = [
  {
    id: "trd-054",
    date: "2026-09-05",
    symbol: "GBPUSD",
    direction: "LONG",
    grade: "A",
    htfTrend: "Uptrend",
    tradeTrend: "Correction",
    location: "Discount",
    resultR: null,
    status: "ACTIVE",
    zoneType: "Demand",
    fresh: true,
    touchCount: "0",
    notes: "Aktivní long z diskontu. Čekám na HTF pokračování.",
  },
  {
    id: "trd-055",
    date: "2026-08-27",
    symbol: "USDJPY",
    direction: "SHORT",
    grade: "B+",
    htfTrend: "Downtrend",
    tradeTrend: "Downtrend",
    location: "Premium",
    resultR: null,
    status: "ACTIVE",
    zoneType: "Supply",
    fresh: false,
    touchCount: "1",
  },
  {
    id: "trd-056",
    date: "2026-09-06",
    symbol: "EURUSD",
    direction: "LONG",
    grade: "A+",
    htfTrend: "Uptrend",
    tradeTrend: "Uptrend",
    location: "Discount",
    resultR: null,
    status: "PLANNED",
    zoneType: "Demand",
    fresh: true,
    touchCount: "0",
    notes: "Plánovaný long. Čekám na Daily close zpátky do zóny.",
  },
  {
    id: "trd-057",
    date: "2026-08-12",
    symbol: "GBPCAD",
    direction: "LONG",
    grade: "B+",
    htfTrend: "Correction",
    tradeTrend: "Consolidation",
    location: "Discount",
    resultR: null,
    status: "IDEA",
    zoneType: "Demand",
    fresh: false,
    touchCount: "1",
    notes: "Zatím jen nápad. Než plánovat, potřebuje jasnější HTF impulse.",
  },
]

export const MOCK_TRADES: Trade[] = [...FEATURED, ...MORE_CLOSED, ...OPEN].map(fromSeed)

const MOCK_TRADE_IDS = new Set(MOCK_TRADES.map((trade) => trade.id))

export function isSampleJournal(trades: Trade[]): boolean {
  return trades.length > 0 && trades.every((trade) => MOCK_TRADE_IDS.has(trade.id))
}

export function withoutSampleTrades(trades: Trade[]): Trade[] {
  return trades.filter((trade) => !MOCK_TRADE_IDS.has(trade.id))
}

export const STRATEGY_SNAPSHOT = {
  best: {
    name: "A+ Fresh Demand",
    winRate: 0.64,
    expectancyR: 0.91,
  },
  weakest: {
    name: "Tested Supply",
    winRate: 0.29,
    expectancyR: -0.24,
  },
} as const

export function sortTrades(trades: Trade[]): Trade[] {
  return trades
    .slice()
    .sort(
      (a, b) =>
        b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt)
    )
}
