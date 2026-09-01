import type {
  Account,
  Bias,
  Impulse,
  Location,
  PairClass,
  TradeDirection,
  TradeStatus,
  Trend,
  ZoneTimeframe,
  ZoneType,
} from "@/types/trade"

export const copy = {
  brand: "Deník",
  phase: "Fáze 1 · Základ",
  openNav: "Otevřít navigaci",

  nav: {
    dashboard: "Přehled",
    journal: "Deník",
    newTrade: "Nový obchod",
    analytics: "Analýza",
    strategy: "Strategie",
  },

  dashboard: {
    title: "Přehled",
    description: "Výkonnost z obchodů v deníku.",
    netPnl: "Čistý PnL",
    totalR: "Celkové R",
    winRate: "Úspěšnost",
    profitFactor: "Profit factor",
    averageR: "Průměrné R",
    totalTrades: "Počet obchodů",
    equityCurve: "Equity křivka",
    equity: "Equity",
    recentTrades: "Poslední obchody",
    strategySnapshot: "Strategie",
    bestSetup: "Nejlepší setup",
    weakestSetup: "Nejslabší setup",
    winRateShort: "WR",
  },

  journal: {
    title: "Deník",
    description: "Všechny zapsané obchody. Řádek otevře plán a kontext.",
    searchSymbol: "Hledat symbol",
    allStrategies: "Všechny strategie",
    allGrades: "Všechny známky",
    allDirections: "Všechny směry",
    allStatuses: "Všechny stavy",
    empty: "Žádné obchody neodpovídají filtrům.",
    date: "Datum",
    symbol: "Symbol",
    direction: "Směr",
    strategy: "Strategie",
    grade: "Známka",
    trend: "Trend",
    location: "Lokace",
    result: "Výsledek",
    r: "R",
    status: "Stav",
  },

  detail: {
    setup: "setup",
    tradePlan: "Plán obchodu",
    marketContext: "Tržní kontext",
    supplyDemand: "Supply / Demand",
    cot: "COT",
    notes: "Poznámky",
    screenshots: "Screenshoty",
    noNote: "Bez poznámky před vstupem.",
    screenshotsPlaceholder: "Screenshoty grafů přijdou v další fázi.",
    notFound: "Obchod se nenašel.",
    backToJournal: "Zpět do deníku",
    entry: "Vstup",
    stopLoss: "Stop loss",
    takeProfit: "Take profit",
    riskPercent: "Risk %",
    plannedRrr: "Plánované RRR",
    resultR: "Výsledné R",
    htfTrend: "HTF trend",
    tradeTrend: "Trend obchodního TF",
    location: "Lokace",
    zoneType: "Typ zóny",
    timeframe: "Timeframe",
    original: "Originál",
    fresh: "Čerstvá",
    touchCount: "Počet touchů",
    hq: "HQ",
    impulse: "Impulse",
    mitigation: "Mitigace %",
    bias: "Bias",
    score: "Skóre",
  },

  form: {
    title: "Nový obchod",
    description: "Nejdřív kontext, potom čísla — proč ten obchod existuje.",
    basic: "Základ obchodu",
    context: "Tržní kontext",
    supplyDemand: "Supply / Demand",
    cot: "COT",
    seasonality: "Seasonalita",
    plan: "Plán obchodu",
    grade: "Známka",
    notes: "Poznámky",
    symbol: "Symbol",
    symbolHint: "AUDUSD → Forex · major",
    symbolIncomplete: "Zadej 6písmenný FX pár",
    direction: "Směr",
    strategy: "Strategie",
    account: "Účet",
    status: "Stav",
    date: "Datum",
    htfTrend: "HTF trend",
    tradeTrend: "Trend obchodního TF",
    location: "Lokace",
    zoneType: "Typ zóny",
    zoneTimeframe: "Timeframe zóny",
    original: "Originál",
    fresh: "Čerstvá",
    touchCount: "Počet touchů",
    hq: "HQ",
    impulse: "Impulse",
    mitigation: "Mitigace",
    zoneInvalidHint:
      "Zóna neplatná — mitigace je nad 25 %. Uložení to neblokuje.",
    zoneInvalidTitle: "Zóna neplatná",
    zoneInvalidBody:
      "Mitigace je nad 25 %. Je to jen varování — obchod jde uložit.",
    cotBias: "COT bias",
    cotScore: "COT skóre",
    cotHint: "Zatím ručně. Později napojíme TITAN COT API.",
    seasonalityBias: "Bias",
    seasonalWindow: "Uvnitř seasonal okna",
    entry: "Vstup",
    stopLoss: "Stop loss",
    takeProfit: "Take profit",
    riskPercent: "Risk %",
    risk: "Risk",
    plannedRrr: "Plánované RRR",
    gradeHint: "Automatické známkování přidáme později.",
    why: "Proč tenhle obchod beru?",
    save: "Uložit obchod",
    cannotSave: "Zatím nejde uložit",
    symbolRequired: "Zadej symbol.",
    planRequired: "Vstup, stop loss a take profit jsou povinné.",
  },

  analytics: {
    title: "Analýza",
    description: "Analýza strategie tu bude v další fázi.",
    cardTitle: "Analýza strategie",
    body: "Později tady uvidíš, které podmínky, setupy a pravidla dávají nejlepší výsledky.",
  },

  strategy: {
    title: "Strategie",
    description: "Pravidla a definice setupů tu budou v další fázi.",
    cardTitle: "Pravidla strategie",
    body: "Později tady budou definice TITAN Swing setupů, známkování a playbook pro automatické skóre.",
  },

  comingSoon: "Tato sekce je zatím placeholder pro další fázi.",
  notFound: {
    title: "Nenalezeno",
    description: "Tahle stránka neexistuje.",
    back: "Zpět na přehled",
  },
  outcome: {
    win: "Zisk",
    loss: "Ztráta",
    be: "BE",
  },
} as const

export const DIRECTION_LABELS: Record<TradeDirection, string> = {
  LONG: "LONG",
  SHORT: "SHORT",
}

export const STATUS_LABELS: Record<TradeStatus, string> = {
  IDEA: "NÁPAD",
  PLANNED: "PLÁN",
  ACTIVE: "AKTIVNÍ",
  CLOSED: "UZAVŘENÝ",
  CANCELLED: "ZRUŠENÝ",
}

export const ACCOUNT_LABELS: Record<Account, string> = {
  Personal: "Osobní",
  Challenge: "Challenge",
  Funded: "Funded",
}

export const TREND_LABELS: Record<Trend, string> = {
  "Strong Uptrend": "Silný uptrend",
  Uptrend: "Uptrend",
  Correction: "Korekce",
  Consolidation: "Konsolidace",
  Transition: "Přechod",
  Downtrend: "Downtrend",
  "Strong Downtrend": "Silný downtrend",
}

export const LOCATION_LABELS: Record<Location, string> = {
  "Top Premium": "Horní prémium",
  Premium: "Prémium",
  Mid: "Střed",
  Discount: "Diskont",
  "Top Discount": "Dolní diskont",
}

export const ZONE_TYPE_LABELS: Record<ZoneType, string> = {
  Supply: "Supply",
  Demand: "Demand",
}

export const ZONE_TIMEFRAME_LABELS: Record<ZoneTimeframe, string> = {
  Weekly: "Týdenní",
  Daily: "Denní",
  "16H": "16H",
}

export const IMPULSE_LABELS: Record<Impulse, string> = {
  Strong: "Silný",
  Normal: "Normální",
  Weak: "Slabý",
}

export const BIAS_LABELS: Record<Bias, string> = {
  Bullish: "Býčí",
  Neutral: "Neutrální",
  Bearish: "Medvědí",
}

export const PAIR_CLASS_LABELS: Record<PairClass, string> = {
  Major: "major",
  Cross: "křížový",
  Exotic: "exotický",
  Unknown: "neznámý",
}

export const YES_NO_LABELS = {
  YES: "ANO",
  NO: "NE",
} as const
