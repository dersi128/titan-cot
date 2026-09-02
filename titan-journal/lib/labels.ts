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

export const copy = {
  brand: "TITAN Journal",
  openNav: "Open navigation",

  nav: {
    dashboard: "Dashboard",
    journal: "Journal",
    newTrade: "New Trade",
    analytics: "Analytics",
    playbook: "Playbook",
    profile: "Profile",
    settings: "Settings",
  },

  shell: {
    account: "Account",
    range: "Date range",
    settings: "Settings",
  },

  dashboard: {
    title: "Dashboard",
    description: "Performance, recent trades, and the playbook that is working.",
    netPnl: "Net PnL",
    totalR: "Total R",
    winRate: "Win Rate",
    profitFactor: "Profit Factor",
    averageR: "Average R",
    totalTrades: "Trades",
    equityCurve: "Equity Curve",
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
  },

  journal: {
    title: "Journal",
    description: "Every logged trade. Click a row for the full record.",
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
  },

  form: {
    title: "New Trade",
    description: "Log the trade. Keep it fast.",
    symbol: "Symbol",
    direction: "Direction",
    entry: "Entry",
    stopLoss: "Stop loss",
    takeProfit: "Take profit",
    risk: "Risk",
    riskPercent: "Risk %",
    plannedRrr: "RRR",
    playbook: "Playbook",
    screenshot: "Screenshot",
    note: "Note",
    save: "Save Trade",
    symbolRequired: "Enter a symbol.",
    planRequired: "Entry, stop loss and take profit are required.",
    advancedFields: "Playbook fields",
  },

  analytics: {
    title: "Analytics",
    description: "The numbers that matter. No extra charts.",
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
    addField: "Add field",
    fieldName: "Field name",
    fieldType: "Type",
    options: "Options",
    optionsHint: "One option per line.",
    save: "Save Playbook",
    archived: "Archived",
    archive: "Archive",
    restore: "Restore",
    empty: "No playbooks yet.",
    nameRequired: "Give the playbook a name.",
    moveUp: "Move up",
    moveDown: "Move down",
    removeField: "Remove",
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
    light: "Light",
    slate: "Slate",
    dark: "Dark",
    density: "Interface Size",
    compact: "Compact",
    comfortable: "Comfortable",
    large: "Large",
    trading: "Trading",
    defaultAccount: "Default Account",
    defaultRisk: "Default Risk",
    defaultPlaybook: "Default Playbook",
  },

  profile: {
    title: "Profile",
    description: "Minimal identity for this journal.",
    displayName: "Display name",
    traderType: "Trader type",
    bio: "Short bio",
    avatar: "Avatar",
    avatarPlaceholder: "Avatar comes later.",
    save: "Save Profile",
  },

  comingSoon: "Not in this version.",
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
} as const

export const DIRECTION_LABELS: Record<TradeDirection, string> = {
  LONG: "LONG",
  SHORT: "SHORT",
}

export const STATUS_LABELS: Record<TradeStatus, string> = {
  IDEA: "IDEA",
  PLANNED: "PLANNED",
  ACTIVE: "ACTIVE",
  CLOSED: "CLOSED",
  REVIEWED: "REVIEWED",
  CANCELLED: "CANCELLED",
}

export const ACCOUNT_LABELS: Record<Account, string> = {
  Personal: "Personal",
  Challenge: "Challenge",
  Funded: "Funded",
}

export const TREND_LABELS: Record<Trend, string> = {
  "Strong Uptrend": "Strong Uptrend",
  Uptrend: "Uptrend",
  Correction: "Correction",
  Consolidation: "Consolidation",
  Transition: "Transition",
  Downtrend: "Downtrend",
  "Strong Downtrend": "Strong Downtrend",
}

export const LOCATION_LABELS: Record<Location, string> = {
  "Top Premium": "Top Premium",
  Premium: "Premium",
  Mid: "Mid",
  Discount: "Discount",
  "Top Discount": "Top Discount",
}

export const ZONE_TYPE_LABELS: Record<ZoneType, string> = {
  Supply: "Supply",
  Demand: "Demand",
}

export const ZONE_TIMEFRAME_LABELS: Record<ZoneTimeframe, string> = {
  Weekly: "Weekly",
  Daily: "Daily",
  "16H": "16H",
}

export const IMPULSE_LABELS: Record<Impulse, string> = {
  Strong: "Strong",
  Normal: "Normal",
  Weak: "Weak",
}

export const BIAS_LABELS: Record<Bias, string> = {
  Bullish: "Bullish",
  Neutral: "Neutral",
  Bearish: "Bearish",
}

export const ASSET_CLASS_LABELS: Record<AssetClass, string> = {
  Forex: "Forex",
  Stock: "Stock",
  Commodity: "Commodity",
  Index: "Index",
  Crypto: "Crypto",
  Unknown: "Unknown",
}

export const MARKET_TYPE_LABELS: Record<MarketType, string> = {
  Major: "Major",
  Cross: "Cross",
  Unknown: "Unknown",
}

export const YES_NO_LABELS = {
  YES: "Yes",
  NO: "No",
} as const
