import { dollarsPerR } from "@/lib/account-scope"
import { parseJournalBackup, type JournalBackup } from "@/lib/journal-backup"
import { classifyMarket, cotFieldsForClassification } from "@/lib/market-classification"
import { TITAN_SWING_PLAYBOOK_ID } from "@/lib/playbooks"
import { calculatePlannedRRR } from "@/lib/trade-calculations"
import {
  DEFAULT_STRATEGY,
  type Account,
  type NewTradeInput,
  type Trade,
  type TradeDirection,
} from "@/types/trade"

export type ImportContext = {
  account: Account
  riskPercent: number
  capital: number
  playbookId: string
  playbookName: string
}

export type ParsedImport =
  | { kind: "backup"; backup: JournalBackup }
  | { kind: "broker"; trades: NewTradeInput[]; skipped: number }
  | { kind: "invalid" }

const SKIP_TYPES = new Set([
  "balance",
  "credit",
  "deposit",
  "withdrawal",
  "withdraw",
  "charge",
  "bonus",
  "commission",
])

function stripBom(text: string): string {
  return text.replace(/^\uFEFF/, "")
}

function normalizeHeader(value: string): string {
  return value
    .toLowerCase()
    .replace(/\(.*?\)/g, " ")
    .replace(/[_/]+/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ")
}

function splitCsvLine(line: string, delimiter: string): string[] {
  const cells: string[] = []
  let current = ""
  let quoted = false
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i]
    if (char === '"') {
      if (quoted && line[i + 1] === '"') {
        current += '"'
        i += 1
      } else {
        quoted = !quoted
      }
      continue
    }
    if (char === delimiter && !quoted) {
      cells.push(current.trim())
      current = ""
      continue
    }
    current += char
  }
  cells.push(current.trim())
  return cells
}

function detectDelimiter(headerLine: string): string {
  const commas = (headerLine.match(/,/g) ?? []).length
  const semis = (headerLine.match(/;/g) ?? []).length
  const tabs = (headerLine.match(/\t/g) ?? []).length
  if (tabs > commas && tabs > semis) return "\t"
  return semis > commas ? ";" : ","
}

export function parseLocaleNumber(raw: string | undefined): number | null {
  if (raw == null) return null
  let value = raw.trim()
  if (!value) return null
  value = value.replace(/[$€£\s]/g, "").replace(/^[+]/, "")
  if (!value) return null

  const negative = value.startsWith("-") || /^\(.*\)$/.test(value)
  value = value.replace(/^-/, "").replace(/^\(/, "").replace(/\)$/, "")

  const lastComma = value.lastIndexOf(",")
  const lastDot = value.lastIndexOf(".")
  if (lastComma >= 0 && lastDot >= 0) {
    if (lastComma > lastDot) {
      value = value.replace(/\./g, "").replace(",", ".")
    } else {
      value = value.replace(/,/g, "")
    }
  } else if (lastComma >= 0) {
    const decimals = value.length - lastComma - 1
    value = decimals === 3 && !value.includes(".") ? value.replace(",", "") : value.replace(",", ".")
  }

  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return null
  return negative ? -parsed : parsed
}

export function parseBrokerDate(raw: string | undefined): string | null {
  if (!raw) return null
  const value = raw.trim()
  if (!value) return null

  const iso = value.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`

  const dotted = value.match(/^(\d{4})\.(\d{2})\.(\d{2})/)
  if (dotted) return `${dotted[1]}-${dotted[2]}-${dotted[3]}`

  const eu = value.match(/^(\d{1,2})[.\/](\d{1,2})[.\/](\d{4})/)
  if (eu) {
    return `${eu[3]}-${eu[2].padStart(2, "0")}-${eu[1].padStart(2, "0")}`
  }

  return null
}

function pick(
  row: Record<string, string>,
  names: readonly string[]
): string | undefined {
  for (const name of names) {
    const value = row[name]
    if (value) return value
  }
  return undefined
}

function parseDirection(raw: string | undefined): TradeDirection | null {
  if (!raw) return null
  const value = raw.trim().toLowerCase()
  if (
    value === "buy" ||
    value === "long" ||
    value === "koupit" ||
    value === "nákup" ||
    value === "nakup"
  ) {
    return "LONG"
  }
  if (
    value === "sell" ||
    value === "short" ||
    value === "prodat" ||
    value === "prodej"
  ) {
    return "SHORT"
  }
  return null
}

function isSkippedType(raw: string | undefined): boolean {
  if (!raw) return false
  return SKIP_TYPES.has(raw.trim().toLowerCase())
}

function headerLooksLikeTrades(headers: string[]): boolean {
  const hasSymbol = headers.some((h) =>
    ["symbol", "item", "pair", "instrument", "market"].includes(h)
  )
  const hasSide = headers.some((h) =>
    ["direction", "opening direction", "type", "side"].includes(h)
  )
  const hasPnl = headers.some((h) =>
    ["profit", "net", "net usd", "net profit", "pnl", "p l", "gross"].includes(h)
  )
  return hasSymbol && (hasSide || hasPnl)
}

function parseCsvTables(text: string): { headers: string[]; rows: string[][] } | null {
  const lines = stripBom(text)
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter((line) => line.trim() && !line.trim().startsWith("#"))
  if (lines.length < 2) return null

  let best: { headers: string[]; rows: string[][]; score: number } | null = null
  for (let i = 0; i < Math.min(lines.length - 1, 40); i += 1) {
    const delimiter = detectDelimiter(lines[i])
    const headers = splitCsvLine(lines[i], delimiter).map(normalizeHeader)
    if (!headerLooksLikeTrades(headers)) continue
    const rows = lines
      .slice(i + 1)
      .map((line) => splitCsvLine(line, delimiter))
      .filter((cells) => cells.some((cell) => cell.length > 0))
    const score = headers.length + rows.length
    if (!best || score > best.score) best = { headers, rows, score }
  }
  return best ? { headers: best.headers, rows: best.rows } : null
}

export function tradeFromBrokerFill(
  input: {
    date: string
    symbol: string
    direction: TradeDirection
    entry: number
    stopLoss: number | null
    takeProfit: number | null
    pnl: number | null
    resultR: number | null
    notes: string
  },
  context: ImportContext
): NewTradeInput {
  const classification = classifyMarket(input.symbol)
  const cot = cotFieldsForClassification(classification, {
    cotBias: "Neutral",
    cotScore: 0,
    commercialsBias: "Neutral",
  })
  const entry = input.entry
  const stopLoss = input.stopLoss ?? entry
  const takeProfit = input.takeProfit ?? entry
  const plannedRRR = calculatePlannedRRR({
    direction: input.direction,
    entry,
    stopLoss,
    takeProfit,
  })
  const riskUsd = dollarsPerR(context.capital, context.riskPercent)
  const pnl = input.pnl
  const resultR =
    input.resultR ??
    (pnl != null && riskUsd > 0 ? Math.round((pnl / riskUsd) * 100) / 100 : null)
  const closed = resultR != null || pnl != null

  return {
    date: input.date,
    symbol: classification.symbol || input.symbol,
    assetClass: classification.assetClass,
    marketType: classification.marketType,
    cotEnabled: classification.cotEnabled,
    direction: input.direction,
    strategy: context.playbookName || DEFAULT_STRATEGY,
    playbookId: context.playbookId || TITAN_SWING_PLAYBOOK_ID,
    account: context.account,
    status: closed ? "CLOSED" : "PLANNED",
    htfTrend: "Uptrend",
    tradeTrend: "Uptrend",
    location: "Discount",
    zoneType: "Demand",
    zoneTimeframe: "Daily",
    original: true,
    fresh: true,
    touchCount: "0",
    hq: false,
    impulse: "Normal",
    mitigation: 0,
    cotBias: cot.cotBias,
    cotScore: cot.cotScore,
    commercialsBias: cot.commercialsBias,
    seasonalityBias: "Neutral",
    seasonalWindow: false,
    grade: "B",
    entry,
    stopLoss,
    takeProfit,
    riskPercent: context.riskPercent,
    plannedRRR,
    resultR: closed ? (resultR ?? 0) : null,
    pnl: closed ? (pnl ?? 0) : null,
    notes: input.notes,
    screenshot: null,
    fieldValues: [],
    review: null,
  }
}

function rowToObject(headers: string[], cells: string[]): Record<string, string> {
  const row: Record<string, string> = {}
  headers.forEach((header, index) => {
    if (!header) return
    const value = cells[index] ?? ""
    if (!row[header]) row[header] = value
  })
  return row
}

function parseBrokerRows(
  headers: string[],
  rows: string[][],
  context: ImportContext
): { trades: NewTradeInput[]; skipped: number } {
  const trades: NewTradeInput[] = []
  let skipped = 0

  for (const cells of rows) {
    const row = rowToObject(headers, cells)
    const type = pick(row, ["type", "deal type"])
    const dealDirection = pick(row, ["direction"])?.trim().toLowerCase()
    if (isSkippedType(type) || dealDirection === "in") {
      skipped += 1
      continue
    }

    const symbol = pick(row, ["symbol", "item", "pair", "instrument", "market"])?.trim()
    const direction = parseDirection(
      pick(row, ["opening direction", "side", "type", "direction"])
    )
    const date = parseBrokerDate(
      pick(row, [
        "closing time",
        "close time",
        "closing deal time",
        "open time",
        "opening time",
        "time",
        "date",
      ])
    )
    const entry =
      parseLocaleNumber(
        pick(row, ["entry price", "open price", "opening price", "price"])
      ) ?? parseLocaleNumber(pick(row, ["closing price", "close price"]))
    const stopLoss = parseLocaleNumber(
      pick(row, ["stop loss", "s l", "sl", "stoploss"])
    )
    const takeProfit = parseLocaleNumber(
      pick(row, ["take profit", "t p", "tp", "takeprofit"])
    )
    const net = parseLocaleNumber(
      pick(row, ["net usd", "net", "net profit", "net pnl"])
    )
    const profit = parseLocaleNumber(
      pick(row, ["profit", "pnl", "p l", "gross", "gross usd", "gross profit"])
    )
    const commission = parseLocaleNumber(pick(row, ["commission"])) ?? 0
    const swap = parseLocaleNumber(pick(row, ["swap"])) ?? 0
    const pnl = net ?? (profit != null ? profit + commission + swap : null)
    const resultR = parseLocaleNumber(pick(row, ["result r", "r", "rr"]))
    const ticket = pick(row, [
      "deal",
      "ticket",
      "id",
      "order id",
      "position id",
      "closing deal id",
    ])
    const comment = pick(row, ["comment", "label"])

    if (!symbol || !direction || !date || entry == null || (pnl == null && resultR == null)) {
      skipped += 1
      continue
    }

    const notes = [ticket ? `#${ticket}` : "", comment ?? ""]
      .filter(Boolean)
      .join(" · ")

    trades.push(
      tradeFromBrokerFill(
        {
          date,
          symbol,
          direction,
          entry,
          stopLoss,
          takeProfit,
          pnl,
          resultR,
          notes,
        },
        context
      )
    )
  }

  return { trades, skipped }
}

export function parseImportText(text: string, context: ImportContext): ParsedImport {
  const raw = stripBom(text).trim()
  if (!raw) return { kind: "invalid" }

  if (raw.startsWith("{") || raw.startsWith("[")) {
    try {
      const backup = parseJournalBackup(JSON.parse(raw))
      if (backup) return { kind: "backup", backup }
    } catch {
      return { kind: "invalid" }
    }
    return { kind: "invalid" }
  }

  const table = parseCsvTables(raw)
  if (!table) return { kind: "invalid" }
  const { trades, skipped } = parseBrokerRows(table.headers, table.rows, context)
  if (trades.length === 0 && skipped === 0) return { kind: "invalid" }
  return { kind: "broker", trades, skipped }
}

export const DEFAULT_IMPORT_CONTEXT: ImportContext = {
  account: "Personal",
  riskPercent: 1,
  capital: 10_000,
  playbookId: TITAN_SWING_PLAYBOOK_ID,
  playbookName: "Swing",
}

export function materializeImportedTrades(
  inputs: NewTradeInput[],
  now = new Date()
): Trade[] {
  return inputs.map((input) => ({
    ...input,
    id: crypto.randomUUID(),
    createdAt: now.toISOString(),
    review: input.review ?? null,
  }))
}
