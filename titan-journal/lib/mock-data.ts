import { classifyMarket } from "@/lib/market-classification"
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

  return {
    id: seed.id,
    createdAt: `${seed.date}T08:30:00.000Z`,
    date: seed.date,
    symbol: classification.symbol || seed.symbol,
    marketType: classification.marketType,
    pairClass: classification.pairClass,
    direction: seed.direction,
    strategy: "TITAN Swing",
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
    cotBias: isShort ? "Bearish" : "Bullish",
    cotScore: seed.cotScore ?? (isShort ? -38 : 41),
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
    notes: "Short from premium supply in a strong HTF downtrend. Plan was 2R; held to target.",
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
    notes: "A+ fresh demand in discount. Location was correct; invalidation hit first.",
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
    notes: "Cross pair short from premium. COT recorded for process, not used as a filter.",
    cotScore: -14,
  },
]

const SYMBOLS = [
  "EURUSD",
  "GBPUSD",
  "USDJPY",
  "AUDUSD",
  "USDCAD",
  "NZDUSD",
  "USDCHF",
  "EURAUD",
  "GBPNZD",
  "AUDNZD",
  "EURGBP",
  "GBPCAD",
] as const

const GRADES: Grade[] = ["A+", "A", "B+", "B"]
const TRENDS_UP: Trend[] = ["Strong Uptrend", "Uptrend"]
const TRENDS_DOWN: Trend[] = ["Strong Downtrend", "Downtrend"]
const ACCOUNTS: Account[] = ["Personal", "Challenge", "Funded"]

// Remaining closed R results chosen so dashboard stats sit near the Phase 1 examples.
const CLOSED_R = [
  2, -1, 2, 3, -1, 2, -1, 1, 2, -1.5, 2, -1, 3, -1, 2, 2, -0.5, -1, 2, 1, 3, -1,
  2, -1.5, 2, -1, 1, 2, -1, 2, -0.5, 3, -1, 2, -1, 2, 1,
]

function dateBefore(days: number): string {
  const date = new Date(Date.UTC(2026, 7, 28))
  date.setUTCDate(date.getUTCDate() - days)
  return date.toISOString().slice(0, 10)
}

function buildRest(): Seed[] {
  const rest: Seed[] = []

  CLOSED_R.forEach((resultR, index) => {
    const symbol = SYMBOLS[index % SYMBOLS.length]
    const direction: TradeDirection = index % 3 === 0 ? "SHORT" : "LONG"
    const down = direction === "SHORT"
    const grade = GRADES[index % GRADES.length]
    const fresh = grade === "A+" || grade === "A"
    const tested = index % 7 === 0

    rest.push({
      id: `trd-${String(index + 4).padStart(3, "0")}`,
      date: dateBefore(index + 4),
      symbol,
      direction,
      grade,
      htfTrend: down ? TRENDS_DOWN[index % 2] : TRENDS_UP[index % 2],
      tradeTrend: down ? "Downtrend" : "Uptrend",
      location: down ? (index % 2 === 0 ? "Premium" : "Top Premium") : index % 2 === 0 ? "Discount" : "Top Discount",
      resultR,
      status: "CLOSED",
      zoneType: down ? "Supply" : "Demand",
      fresh: fresh && !tested,
      touchCount: tested ? "2+" : fresh ? "0" : "1",
      account: ACCOUNTS[index % ACCOUNTS.length],
    })
  })

  const open: Seed[] = [
    {
      id: "trd-041",
      date: "2026-08-29",
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
      notes: "Active long from discount. Waiting for HTF continuation.",
    },
    {
      id: "trd-042",
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
      id: "trd-043",
      date: "2026-08-25",
      symbol: "NZDUSD",
      direction: "LONG",
      grade: "A+",
      htfTrend: "Strong Uptrend",
      tradeTrend: "Uptrend",
      location: "Top Discount",
      resultR: null,
      status: "ACTIVE",
      zoneType: "Demand",
      fresh: true,
      touchCount: "0",
    },
    {
      id: "trd-044",
      date: "2026-08-21",
      symbol: "USDCAD",
      direction: "SHORT",
      grade: "A",
      htfTrend: "Downtrend",
      tradeTrend: "Transition",
      location: "Premium",
      resultR: null,
      status: "ACTIVE",
      zoneType: "Supply",
      fresh: true,
      touchCount: "0",
    },
    {
      id: "trd-045",
      date: "2026-08-30",
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
      notes: "Planned long. Waiting for Daily close back inside the zone.",
    },
    {
      id: "trd-046",
      date: "2026-08-19",
      symbol: "AUDNZD",
      direction: "SHORT",
      grade: "B",
      htfTrend: "Consolidation",
      tradeTrend: "Downtrend",
      location: "Mid",
      resultR: null,
      status: "PLANNED",
      zoneType: "Supply",
      fresh: false,
      touchCount: "2+",
    },
    {
      id: "trd-047",
      date: "2026-08-18",
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
      notes: "Idea only. Needs a clearer HTF impulse before planning.",
    },
  ]

  return [...rest, ...open]
}

export const MOCK_TRADES: Trade[] = [...FEATURED, ...buildRest()].map(fromSeed)

export const STRATEGY_SNAPSHOT = {
  best: {
    name: "A+ Fresh Demand",
    winRate: 0.64,
  },
  weakest: {
    name: "Tested Supply",
    winRate: 0.29,
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
