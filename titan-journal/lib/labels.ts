import type { DateRange } from "@/lib/date-range"
import type { Language } from "@/types/playbook"
import type {
  Account,
  AssetClass,
  Bias,
  Impulse,
  Location,
  MarketType,
  TradeDirection,
  TradeStatus,
  Trend,
  ZoneTimeframe,
  ZoneType,
} from "@/types/trade"

export const LANGUAGE_SHORT: Record<Language, string> = {
  cs: "CZ",
  en: "EN",
}

export const copyEn = {
  brand: "TITAN Journal",
  openNav: "Open navigation",

  nav: {
    main: "Main",
    dashboard: "Dashboard",
    calendar: "Calendar",
    journal: "Journal",
    newTrade: "New Trade",
    analytics: "Analytics",
    playbook: "Playbook",
    profile: "Profile",
    settings: "Settings",
    hints: {
      dashboard: "Quick performance overview",
      calendar: "Trades in time",
      journal: "All trades",
      newTrade: "Add a trade",
      analytics: "Detailed statistics",
      playbook: "Strategies and setups",
      profile: "User account",
      settings: "Look and preferences",
    },
  },

  sidebar: {
    motto: "Discipline creates freedom.",
    account: "Account",
    appearance: "Appearance",
    collapse: "Collapse sidebar",
    expand: "Expand sidebar",
    trader: "Trader",
    themes: {
      light: "Light",
      dark: "Dark",
      gold: "Navy Gold",
      cyberpunk: "Cyberpunk",
    },
  },

  shell: {
    account: "Account",
    range: "Date range",
    settings: "Settings",
  },

  dashboard: {
    title: "Dashboard",
    description: "Capital, risk, and results for the selected account.",
    startingCapital: "Starting capital",
    equityNow: "Equity",
    riskPerTrade: "Risk / trade",
    markets: "Markets",
    netPnl: "Total PnL",
    totalR: "Total R",
    winRate: "Win Rate",
    profitFactor: "Profit Factor",
    averageR: "Avg R",
    totalTrades: "Trades",
    maxDrawdown: "Max Drawdown",
    hello: "Hi, {name}",
    overview: {
      "30D": "Here is your overview for the last 30 days.",
      "3M": "Here is your overview for the last 3 months.",
      "6M": "Here is your overview for the last 6 months.",
      YTD: "Here is your overview for this year.",
      ALL: "Here is your overview for all time.",
      CUSTOM: "Here is your overview for the selected dates.",
    },
    viewAllTrades: "View all trades",
    profitVsLoss: "Profit vs Loss",
    last7Days: "Last 7 days",
    thisMonth: "This month",
    vsLastMonth: "Vs. last month",
    better: "better",
    worse: "weaker",
    wins: "Win",
    losses: "Loss",
    motto: "Plan. Execute. Review. Repeat.",
    percent: "%",
    equityCurve: "Equity Curve",
    marketDistribution: "Market Distribution",
    marketDistributionEmpty: "No trades to distribute yet.",
    byTrades: "By Trades",
    byR: "R",
    byPnl: "By PnL",
    totalTradesLabel: "Total Trades",
    equity: "Equity",
    recentTrades: "Recent Trades",
    strategySnapshot: "Playbooks",
    bestSetup: "Best Playbook",
    weakestSetup: "Weakest Playbook",
    winRateShort: "WR",
    expectancy: "expectancy",
    symbol: "Symbol",
    direction: "Direction",
    grade: "Grade",
    result: "Result",
    r: "R",
    pnl: "PnL",
    performance: "Performance over time",
    performanceEmpty: "Not enough data to show performance over time.",
  },

  calendar: {
    title: "Calendar",
    description: "Daily profit and loss for the selected account.",
    previousMonth: "Previous month",
    nextMonth: "Next month",
    openTrade: "Open trade",
    openTrades: "Open trades",
    weekdays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  },

  journal: {
    title: "Journal",
    description: "Trades on the selected account. Click a row for the full record.",
    searchSymbol: "Search symbol",
    allPlaybooks: "All playbooks",
    allDirections: "All directions",
    allResults: "All results",
    empty: "No trades match these filters.",
    date: "Date",
    symbol: "Symbol",
    direction: "Direction",
    playbook: "Playbook",
    result: "Result",
    r: "R",
    pnl: "PnL",
    dateFrom: "From",
    dateTo: "To",
  },

  detail: {
    trade: "Trade",
    plan: "Plan",
    result: "Result",
    screenshot: "Screenshot",
    notes: "Notes",
    strategyContext: "Strategy Context",
    noNote: "No note.",
    noScreenshot: "No screenshot.",
    notFound: "Trade not found.",
    backToJournal: "Back to journal",
    entry: "Entry",
    stopLoss: "Stop loss",
    takeProfit: "Take profit",
    riskPercent: "Risk %",
    plannedRrr: "RRR",
    resultR: "R",
    pnl: "PnL",
    account: "Account",
    market: "Market",
    type: "Type",
    simpleReview: "Review",
    planFollowed: "Did I follow my plan?",
    wouldTakeAgain: "Would I take this trade again?",
    postTradeNote: "Post-trade note",
    saveReview: "Save review",
    reviewSaved: "Review saved",
    yes: "Yes",
    no: "No",
    edit: "Edit",
    delete: "Delete",
    cancel: "Cancel",
    deleteConfirm: "Delete this trade? This cannot be undone.",
    closeTrade: "Close trade",
    optional: "optional",
  },

  form: {
    title: "New Trade",
    editTitle: "Edit Trade",
    description: "Log the trade. Keep it fast.",
    editDescription: "Fix a mistake. Keep the record accurate.",
    symbol: "Symbol",
    direction: "Direction",
    entry: "Entry",
    stopLoss: "Stop loss",
    takeProfit: "Take profit",
    risk: "Risk",
    riskPercent: "Risk %",
    riskHint: "per 1R",
    plannedRrr: "RRR",
    playbook: "Playbook",
    account: "Account",
    screenshot: "Screenshot",
    note: "Note",
    date: "Date",
    save: "Save Trade",
    saveChanges: "Save changes",
    symbolRequired: "Enter a symbol.",
    planRequired: "Entry, stop loss and take profit are required.",
    advancedFields: "Playbook fields",
  },

  analytics: {
    title: "Analytics",
    description: "The numbers that matter for the selected account.",
    byPlaybook: "By Playbook",
    byDirection: "By Direction",
    bySymbol: "By Symbol",
    best: "Best Playbook",
    worst: "Worst Playbook",
    trades: "Trades",
    empty: "Close a few trades to see analytics.",
  },

  playbook: {
    title: "Playbook",
    description: "Your strategies. The form follows the playbook you pick.",
    new: "Create Playbook",
    name: "Name",
    descriptionLabel: "Description",
    fields: "Fields",
    fieldCount: "fields",
    addField: "Add field",
    fieldName: "Field name",
    fieldType: "Type",
    options: "Options",
    optionsHint: "One option per line.",
    icon: "Icon",
    color: "Color",
    save: "Save Playbook",
    archived: "Archived",
    archive: "Archive",
    restore: "Restore",
    empty: "No playbooks yet.",
    nameRequired: "Give the playbook a name.",
    moveUp: "Move up",
    moveDown: "Move down",
    removeField: "Remove",
    edit: "Edit",
    types: {
      select: "Select",
      yes_no: "Yes / No",
      number: "Number",
      text: "Text",
      multi_select: "Multi-select",
    },
  },

  settings: {
    title: "Settings",
    description: "Journal mode, appearance, and trading defaults.",
    journal: "Journal",
    journalMode: "Journal Mode",
    simple: "Simple",
    advanced: "Advanced",
    appearance: "Appearance",
    theme: "Theme",
    language: "Language",
    light: "Light",
    dark: "Dark",
    gold: "Navy Gold",
    cyberpunk: "Cyberpunk",
    density: "Interface Size",
    compact: "Compact",
    comfortable: "Comfortable",
    large: "Large",
    trading: "Trading",
    defaultAccount: "Default Account",
    defaultPlaybook: "Default Playbook",
    riskOnProfile: "Risk % is set on Profile.",
    backup: "Backup",
    backupHint:
      "The journal stays in this browser. Export a file, then import it on your phone or another computer.",
    exportJournal: "Export",
    importJournal: "Import",
    importReplace: "Import replaces the journal on this device.",
    importOk: "Journal imported.",
    importBad: "This file is not a TITAN Journal backup.",
  },

  profile: {
    title: "Profile",
    description: "Who you are, and how you size the book.",
    displayName: "Display name",
    traderType: "Trader type",
    bio: "Short bio",
    avatar: "Photo",
    avatarHint: "Square crop. JPG or PNG.",
    removeAvatar: "Remove",
    trading: "Trading",
    capital: "Starting capital",
    riskPercent: "Risk per trade",
    markets: "Markets I trade",
    save: "Save Profile",
  },

  comingSoon: "Not in this version.",
  saveState: {
    unsaved: "Unsaved changes",
    saved: "Saved",
  },
  notFound: {
    title: "Not found",
    description: "This page does not exist.",
    back: "Back to dashboard",
  },
  outcome: {
    win: "Win",
    loss: "Loss",
    be: "BE",
  },
}

export type Copy = typeof copyEn

export const copyCs: Copy = {
  brand: "TITAN Journal",
  openNav: "Otevřít navigaci",

  nav: {
    main: "Hlavní",
    dashboard: "Přehled",
    calendar: "Kalendář",
    journal: "Deník",
    newTrade: "Nový obchod",
    analytics: "Analýzy",
    playbook: "Playbook",
    profile: "Profil",
    settings: "Nastavení",
    hints: {
      dashboard: "Rychlý přehled výkonu",
      calendar: "Obchody v čase",
      journal: "Všechny obchody",
      newTrade: "Přidat obchod",
      analytics: "Detailní statistiky",
      playbook: "Strategie a setupy",
      profile: "Uživatelský účet",
      settings: "Vzhled a preference",
    },
  },

  sidebar: {
    motto: "Discipline creates freedom.",
    account: "Účet",
    appearance: "Vzhled",
    collapse: "Sbalit menu",
    expand: "Rozbalit menu",
    trader: "Trader",
    themes: {
      light: "Světlý",
      dark: "Tmavý",
      gold: "Modro-zlatý",
      cyberpunk: "Cyberpunk",
    },
  },

  shell: {
    account: "Účet",
    range: "Období",
    settings: "Nastavení",
  },

  dashboard: {
    title: "Přehled",
    description: "Kapitál, riziko a výsledky vybraného účtu.",
    startingCapital: "Počáteční kapitál",
    equityNow: "Equity",
    riskPerTrade: "Riziko / obchod",
    markets: "Trhy",
    netPnl: "Celkové PnL",
    totalR: "Celkové R",
    winRate: "Win Rate",
    profitFactor: "Profit Factor",
    averageR: "Avg R",
    totalTrades: "Obchody",
    maxDrawdown: "Max Drawdown",
    hello: "Ahoj, {name}",
    overview: {
      "30D": "Zde je tvůj přehled za posledních 30 dní.",
      "3M": "Zde je tvůj přehled za poslední 3 měsíce.",
      "6M": "Zde je tvůj přehled za posledních 6 měsíců.",
      YTD: "Zde je tvůj přehled od začátku roku.",
      ALL: "Zde je tvůj přehled za celé období.",
      CUSTOM: "Zde je tvůj přehled za vybrané období.",
    },
    viewAllTrades: "Zobrazit všechny obchody",
    profitVsLoss: "Zisk vs. ztráta",
    last7Days: "Posledních 7 dní",
    thisMonth: "Tento měsíc",
    vsLastMonth: "Proti minulému měsíci",
    better: "lepší výsledek",
    worse: "slabší výsledek",
    wins: "Zisk",
    losses: "Ztráta",
    motto: "Plan. Execute. Review. Repeat.",
    percent: "%",
    equityCurve: "Křivka equity",
    marketDistribution: "Rozložení trhů",
    marketDistributionEmpty: "Zatím žádné obchody k rozdělení.",
    byTrades: "Obchody",
    byR: "R",
    byPnl: "PnL",
    totalTradesLabel: "Obchody",
    equity: "Equity",
    recentTrades: "Poslední obchody",
    strategySnapshot: "Playbooky",
    bestSetup: "Nejlepší playbook",
    weakestSetup: "Nejslabší playbook",
    winRateShort: "WR",
    expectancy: "expectancy",
    symbol: "Symbol",
    direction: "Směr",
    grade: "Známka",
    result: "Výsledek",
    r: "R",
    pnl: "PnL",
    performance: "Výkon v čase",
    performanceEmpty: "Zatím není dostatek dat pro zobrazení výkonu v čase.",
  },

  calendar: {
    title: "Kalendář",
    description: "Denní zisk a ztráta vybraného účtu.",
    previousMonth: "Předchozí měsíc",
    nextMonth: "Další měsíc",
    openTrade: "Otevřít obchod",
    openTrades: "Otevřít obchody",
    weekdays: ["Po", "Út", "St", "Čt", "Pá", "So", "Ne"],
  },

  journal: {
    title: "Deník",
    description: "Obchody na vybraném účtu. Klikni na řádek pro celý záznam.",
    searchSymbol: "Hledat symbol",
    allPlaybooks: "Všechny playbooky",
    allDirections: "Všechny směry",
    allResults: "Všechny výsledky",
    empty: "Žádné obchody neodpovídají filtrům.",
    date: "Datum",
    symbol: "Symbol",
    direction: "Směr",
    playbook: "Playbook",
    result: "Výsledek",
    r: "R",
    pnl: "PnL",
    dateFrom: "Od",
    dateTo: "Do",
  },

  detail: {
    trade: "Obchod",
    plan: "Plán",
    result: "Výsledek",
    screenshot: "Screenshot",
    notes: "Poznámky",
    strategyContext: "Kontext strategie",
    noNote: "Žádná poznámka.",
    noScreenshot: "Žádný screenshot.",
    notFound: "Obchod nenalezen.",
    backToJournal: "Zpět do deníku",
    entry: "Entry",
    stopLoss: "Stop loss",
    takeProfit: "Take profit",
    riskPercent: "Riziko %",
    plannedRrr: "RRR",
    resultR: "R",
    pnl: "PnL",
    account: "Účet",
    market: "Trh",
    type: "Typ",
    simpleReview: "Review",
    planFollowed: "Dodržel jsem plán?",
    wouldTakeAgain: "Vzal bych tenhle obchod znovu?",
    postTradeNote: "Poznámka po obchodu",
    saveReview: "Uložit review",
    reviewSaved: "Review uloženo",
    yes: "Ano",
    no: "Ne",
    edit: "Upravit",
    delete: "Smazat",
    cancel: "Zrušit",
    deleteConfirm: "Smazat tento obchod? Tuto akci nelze vrátit.",
    closeTrade: "Uzavřít obchod",
    optional: "volitelné",
  },

  form: {
    title: "Nový obchod",
    editTitle: "Upravit obchod",
    description: "Zapiš obchod. Rychle a bez zbytečností.",
    editDescription: "Oprav chybu. Záznam ať sedí.",
    symbol: "Symbol",
    direction: "Směr",
    entry: "Entry",
    stopLoss: "Stop loss",
    takeProfit: "Take profit",
    risk: "Riziko",
    riskPercent: "Riziko %",
    riskHint: "na 1R",
    plannedRrr: "RRR",
    playbook: "Playbook",
    account: "Účet",
    screenshot: "Screenshot",
    note: "Poznámka",
    date: "Datum",
    save: "Uložit obchod",
    saveChanges: "Uložit změny",
    symbolRequired: "Zadej symbol.",
    planRequired: "Entry, stop loss a take profit jsou povinné.",
    advancedFields: "Pole playbooku",
  },

  analytics: {
    title: "Analýzy",
    description: "Čísla, na kterých u vybraného účtu záleží.",
    byPlaybook: "Podle playbooku",
    byDirection: "Podle směru",
    bySymbol: "Podle symbolu",
    best: "Nejlepší playbook",
    worst: "Nejhorší playbook",
    trades: "obchodů",
    empty: "Uzavři pár obchodů, aby se zobrazily analýzy.",
  },

  playbook: {
    title: "Playbook",
    description: "Tvoje strategie. Formulář se přizpůsobí vybranému playbooku.",
    new: "Nový playbook",
    name: "Název",
    descriptionLabel: "Popis",
    fields: "Pole",
    fieldCount: "polí",
    addField: "Přidat pole",
    fieldName: "Název pole",
    fieldType: "Typ",
    options: "Možnosti",
    optionsHint: "Jedna možnost na řádek.",
    icon: "Ikona",
    color: "Barva",
    save: "Uložit playbook",
    archived: "Archivováno",
    archive: "Archivovat",
    restore: "Obnovit",
    empty: "Zatím žádný playbook.",
    nameRequired: "Dej playbooku název.",
    moveUp: "Nahoru",
    moveDown: "Dolů",
    removeField: "Odebrat",
    edit: "Upravit",
    types: {
      select: "Výběr",
      yes_no: "Ano / Ne",
      number: "Číslo",
      text: "Text",
      multi_select: "Více možností",
    },
  },

  settings: {
    title: "Nastavení",
    description: "Režim deníku, vzhled a výchozí obchodování.",
    journal: "Deník",
    journalMode: "Režim deníku",
    simple: "Jednoduchý",
    advanced: "Pokročilý",
    appearance: "Vzhled",
    theme: "Motiv",
    language: "Jazyk",
    light: "Light",
    dark: "Dark",
    gold: "Navy Gold",
    cyberpunk: "Cyberpunk",
    density: "Velikost rozhraní",
    compact: "Kompaktní",
    comfortable: "Pohodlné",
    large: "Velké",
    trading: "Obchodování",
    defaultAccount: "Výchozí účet",
    defaultPlaybook: "Výchozí playbook",
    riskOnProfile: "Riziko % se nastavuje v Profilu.",
    backup: "Záloha",
    backupHint:
      "Deník zůstává v tomto prohlížeči. Exportuj soubor a na telefonu nebo jiném počítači ho naimportuj.",
    exportJournal: "Export",
    importJournal: "Import",
    importReplace: "Import nahradí deník na tomto zařízení.",
    importOk: "Deník je naimportovaný.",
    importBad: "Tento soubor není záloha TITAN Journal.",
  },

  profile: {
    title: "Profil",
    description: "Kdo jsi a jak sizinguješ knihu.",
    displayName: "Zobrazované jméno",
    traderType: "Typ tradéra",
    bio: "Krátké bio",
    avatar: "Foto",
    avatarHint: "Čtvercový ořez. JPG nebo PNG.",
    removeAvatar: "Odstranit",
    trading: "Obchodování",
    capital: "Počáteční kapitál",
    riskPercent: "Riziko na obchod",
    markets: "Trhy, které obchoduji",
    save: "Uložit profil",
  },

  comingSoon: "V této verzi není.",
  saveState: {
    unsaved: "Neuložené změny",
    saved: "Uloženo",
  },
  notFound: {
    title: "Nenalezeno",
    description: "Tato stránka neexistuje.",
    back: "Zpět na přehled",
  },
  outcome: {
    win: "Win",
    loss: "Loss",
    be: "BE",
  },
}

export const copy = copyEn

export const DIRECTION_LABELS_EN: Record<TradeDirection, string> = {
  LONG: "LONG",
  SHORT: "SHORT",
}

export const DIRECTION_LABELS_CS: Record<TradeDirection, string> = {
  LONG: "LONG",
  SHORT: "SHORT",
}

export const STATUS_LABELS_EN: Record<TradeStatus, string> = {
  IDEA: "IDEA",
  PLANNED: "PLANNED",
  ACTIVE: "ACTIVE",
  CLOSED: "CLOSED",
  REVIEWED: "REVIEWED",
  CANCELLED: "CANCELLED",
}

export const STATUS_LABELS_CS: Record<TradeStatus, string> = {
  IDEA: "NÁPAD",
  PLANNED: "PLÁN",
  ACTIVE: "OTEVŘENÝ",
  CLOSED: "UZAVŘENÝ",
  REVIEWED: "REVIEW",
  CANCELLED: "ZRUŠENO",
}

export const ACCOUNT_LABELS_EN: Record<Account, string> = {
  Personal: "Own capital",
  Funded: "Funded",
  Backtesting: "Backtesting",
}

export const ACCOUNT_LABELS_CS: Record<Account, string> = {
  Personal: "Vlastní kapitál",
  Funded: "Funded",
  Backtesting: "Backtesting",
}

export const TREND_LABELS_EN: Record<Trend, string> = {
  "Strong Uptrend": "Strong Uptrend",
  Uptrend: "Uptrend",
  Correction: "Correction",
  Consolidation: "Consolidation",
  Transition: "Transition",
  Downtrend: "Downtrend",
  "Strong Downtrend": "Strong Downtrend",
}

export const TREND_LABELS_CS: Record<Trend, string> = {
  "Strong Uptrend": "Silný uptrend",
  Uptrend: "Uptrend",
  Correction: "Korekce",
  Consolidation: "Konsolidace",
  Transition: "Přechod",
  Downtrend: "Downtrend",
  "Strong Downtrend": "Silný downtrend",
}

export const LOCATION_LABELS_EN: Record<Location, string> = {
  "Top Premium": "Top Premium",
  Premium: "Premium",
  Mid: "Mid",
  Discount: "Discount",
  "Top Discount": "Top Discount",
}

export const LOCATION_LABELS_CS: Record<Location, string> = LOCATION_LABELS_EN

export const ZONE_TYPE_LABELS_EN: Record<ZoneType, string> = {
  Supply: "Supply",
  Demand: "Demand",
}

export const ZONE_TYPE_LABELS_CS: Record<ZoneType, string> = ZONE_TYPE_LABELS_EN

export const ZONE_TIMEFRAME_LABELS_EN: Record<ZoneTimeframe, string> = {
  Weekly: "Weekly",
  Daily: "Daily",
  "16H": "16H",
}

export const ZONE_TIMEFRAME_LABELS_CS: Record<ZoneTimeframe, string> = {
  Weekly: "Týdenní",
  Daily: "Denní",
  "16H": "16H",
}

export const IMPULSE_LABELS_EN: Record<Impulse, string> = {
  Strong: "Strong",
  Normal: "Normal",
  Weak: "Weak",
}

export const IMPULSE_LABELS_CS: Record<Impulse, string> = {
  Strong: "Silný",
  Normal: "Normální",
  Weak: "Slabý",
}

export const BIAS_LABELS_EN: Record<Bias, string> = {
  Bullish: "Bullish",
  Neutral: "Neutral",
  Bearish: "Bearish",
}

export const BIAS_LABELS_CS: Record<Bias, string> = BIAS_LABELS_EN

export const ASSET_CLASS_LABELS_EN: Record<AssetClass, string> = {
  Forex: "Forex",
  Stock: "Stocks",
  Commodity: "Commodities",
  Metal: "Metals",
  Index: "Indices",
  Crypto: "Crypto",
  Unknown: "Unknown",
}

export const ASSET_CLASS_LABELS_CS: Record<AssetClass, string> = {
  Forex: "Forex",
  Stock: "Akcie",
  Commodity: "Komodity",
  Metal: "Kovy",
  Index: "Indexy",
  Crypto: "Krypto",
  Unknown: "Neznámé",
}

export const MARKET_TYPE_LABELS_EN: Record<MarketType, string> = {
  Major: "Major",
  Cross: "Cross",
  Unknown: "Unknown",
}

export const MARKET_TYPE_LABELS_CS: Record<MarketType, string> = {
  Major: "Major",
  Cross: "Cross",
  Unknown: "Neznámé",
}

export const YES_NO_LABELS_EN = {
  YES: "Yes",
  NO: "No",
}

export const YES_NO_LABELS_CS = {
  YES: "Ano",
  NO: "Ne",
}

export const DATE_RANGE_LABELS_EN: Record<DateRange, string> = {
  "30D": "30D",
  "3M": "3M",
  "6M": "6M",
  YTD: "YTD",
  ALL: "All",
  CUSTOM: "Custom",
}

export const DATE_RANGE_LABELS_CS: Record<DateRange, string> = {
  "30D": "30D",
  "3M": "3M",
  "6M": "6M",
  YTD: "YTD",
  ALL: "Vše",
  CUSTOM: "Vlastní",
}

export type Labels = {
  language: Language
  copy: Copy
  DIRECTION_LABELS: Record<TradeDirection, string>
  STATUS_LABELS: Record<TradeStatus, string>
  ACCOUNT_LABELS: Record<Account, string>
  TREND_LABELS: Record<Trend, string>
  LOCATION_LABELS: Record<Location, string>
  ZONE_TYPE_LABELS: Record<ZoneType, string>
  ZONE_TIMEFRAME_LABELS: Record<ZoneTimeframe, string>
  IMPULSE_LABELS: Record<Impulse, string>
  BIAS_LABELS: Record<Bias, string>
  ASSET_CLASS_LABELS: Record<AssetClass, string>
  MARKET_TYPE_LABELS: Record<MarketType, string>
  YES_NO_LABELS: { YES: string; NO: string }
  DATE_RANGE_LABELS: Record<DateRange, string>
}

const PACKS: Record<Language, Omit<Labels, "language">> = {
  en: {
    copy: copyEn,
    DIRECTION_LABELS: DIRECTION_LABELS_EN,
    STATUS_LABELS: STATUS_LABELS_EN,
    ACCOUNT_LABELS: ACCOUNT_LABELS_EN,
    TREND_LABELS: TREND_LABELS_EN,
    LOCATION_LABELS: LOCATION_LABELS_EN,
    ZONE_TYPE_LABELS: ZONE_TYPE_LABELS_EN,
    ZONE_TIMEFRAME_LABELS: ZONE_TIMEFRAME_LABELS_EN,
    IMPULSE_LABELS: IMPULSE_LABELS_EN,
    BIAS_LABELS: BIAS_LABELS_EN,
    ASSET_CLASS_LABELS: ASSET_CLASS_LABELS_EN,
    MARKET_TYPE_LABELS: MARKET_TYPE_LABELS_EN,
    YES_NO_LABELS: YES_NO_LABELS_EN,
    DATE_RANGE_LABELS: DATE_RANGE_LABELS_EN,
  },
  cs: {
    copy: copyCs,
    DIRECTION_LABELS: DIRECTION_LABELS_CS,
    STATUS_LABELS: STATUS_LABELS_CS,
    ACCOUNT_LABELS: ACCOUNT_LABELS_CS,
    TREND_LABELS: TREND_LABELS_CS,
    LOCATION_LABELS: LOCATION_LABELS_CS,
    ZONE_TYPE_LABELS: ZONE_TYPE_LABELS_CS,
    ZONE_TIMEFRAME_LABELS: ZONE_TIMEFRAME_LABELS_CS,
    IMPULSE_LABELS: IMPULSE_LABELS_CS,
    BIAS_LABELS: BIAS_LABELS_CS,
    ASSET_CLASS_LABELS: ASSET_CLASS_LABELS_CS,
    MARKET_TYPE_LABELS: MARKET_TYPE_LABELS_CS,
    YES_NO_LABELS: YES_NO_LABELS_CS,
    DATE_RANGE_LABELS: DATE_RANGE_LABELS_CS,
  },
}

export function labelsFor(language: Language): Labels {
  return { language, ...PACKS[language] }
}

export const DIRECTION_LABELS = DIRECTION_LABELS_EN
export const STATUS_LABELS = STATUS_LABELS_EN
export const ACCOUNT_LABELS = ACCOUNT_LABELS_EN
export const TREND_LABELS = TREND_LABELS_EN
export const LOCATION_LABELS = LOCATION_LABELS_EN
export const ZONE_TYPE_LABELS = ZONE_TYPE_LABELS_EN
export const ZONE_TIMEFRAME_LABELS = ZONE_TIMEFRAME_LABELS_EN
export const IMPULSE_LABELS = IMPULSE_LABELS_EN
export const BIAS_LABELS = BIAS_LABELS_EN
export const ASSET_CLASS_LABELS = ASSET_CLASS_LABELS_EN
export const MARKET_TYPE_LABELS = MARKET_TYPE_LABELS_EN
export const YES_NO_LABELS = YES_NO_LABELS_EN
export const DATE_RANGE_LABELS = DATE_RANGE_LABELS_EN
