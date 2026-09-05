import { dollarsPerR } from "@/lib/account-scope"
import { parseJournalBackup, type JournalBackup } from "@/lib/journal-backup"
import { classifyMarket, cotFieldsForClassification } from "@/lib/market-classification"
import { isPdfBytes, pdfToRows } from "@/lib/pdf-import"
import { TITAN_SWING_PLAYBOOK_ID } from "@/lib/playbooks"
import { calculatePlannedRRR } from "@/lib/trade-calculations"
import { isXlsxZip, xlsxSheetsToRows } from "@/lib/xlsx-import"
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
  | { kind: "xls" }
  | { kind: "invalid" }

export const IMPORT_FILE_ACCEPT =
  ".json,.csv,.txt,.htm,.html,.xlsx,.xls,.pdf,application/json,text/csv,text/html,application/pdf,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

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

  const slash = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/)
  if (slash) {
    const monthFirst = /\b(AM|PM)\b/i.test(value) || Number(slash[2]) > 12
    if (monthFirst) {
      return `${slash[3]}-${slash[1].padStart(2, "0")}-${slash[2].padStart(2, "0")}`
    }
  }

  const eu = value.match(/^(\d{1,2})[.\/](\d{1,2})[.\/](\d{4})/)
  if (eu) {
    return `${eu[3]}-${eu[2].padStart(2, "0")}-${eu[1].padStart(2, "0")}`
  }

  const serial = Number(value.replace(",", "."))
  if (Number.isFinite(serial) && serial >= 20000 && serial < 80000) {
    const ms = Date.UTC(1899, 11, 30) + Math.floor(serial) * 86_400_000
    return new Date(ms).toISOString().slice(0, 10)
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

export function isOleExcel(bytes: Uint8Array, fileName = ""): boolean {
  if (/\.xlsx$/i.test(fileName)) return false
  if (/\.xls$/i.test(fileName)) return true
  return (
    bytes.length >= 4 &&
    bytes[0] === 0xd0 &&
    bytes[1] === 0xcf &&
    bytes[2] === 0x11 &&
    bytes[3] === 0xe0
  )
}

export function isSpreadsheetBytes(bytes: Uint8Array, fileName = ""): boolean {
  return isXlsxZip(bytes) || isOleExcel(bytes, fileName) || /\.xlsx?$/i.test(fileName)
}

export function decodeImportBytes(bytes: Uint8Array): string {
  if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xfe) {
    return new TextDecoder("utf-16le").decode(bytes)
  }
  if (bytes.length >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff) {
    return new TextDecoder("utf-16be").decode(bytes)
  }
  return new TextDecoder("utf-8").decode(bytes)
}

function looksLikeHtml(raw: string): boolean {
  const head = raw.slice(0, 4000).toLowerCase()
  return (
    head.includes("<!doctype html") ||
    head.includes("<html") ||
    /<table[\s>]/i.test(head) ||
    /<tr[\s>]/i.test(head)
  )
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) =>
      String.fromCharCode(Number.parseInt(hex, 16))
    )
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
}

function cellText(html: string): string {
  return decodeHtmlEntities(
    html
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  )
}

function extractHtmlRows(html: string): string[][] {
  const rows: string[][] = []
  const rowRe = /<tr\b[^>]*>([\s\S]*?)<\/tr>/gi
  let match: RegExpExecArray | null
  while ((match = rowRe.exec(html))) {
    const inner = match[1]
    if (/<tr\b/i.test(inner)) continue
    const cells = [...inner.matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/gi)].map(
      (cell) => cellText(cell[1])
    )
    if (cells.some((cell) => cell.length > 0)) rows.push(cells)
  }
  return rows
}

function isHtmlSectionBreak(cells: string[]): boolean {
  const filled = cells.filter(Boolean)
  if (filled.length > 3) return false
  const joined = filled.join(" ").toLowerCase()
  return /open trades|working orders|pending orders|summary|deposit\/withdrawal|closed transactions/.test(
    joined
  )
}

function tableFromHtmlRows(
  rows: string[][]
): { headers: string[]; rows: string[][] } | null {
  let best: { headers: string[]; rows: string[][]; score: number } | null = null
  for (let i = 0; i < rows.length; i += 1) {
    const headers = rows[i].map(normalizeHeader)
    if (!headerLooksLikeTrades(headers)) continue
    const body: string[][] = []
    for (const cells of rows.slice(i + 1)) {
      if (isHtmlSectionBreak(cells)) break
      if (headerLooksLikeTrades(cells.map(normalizeHeader))) break
      body.push(cells)
    }
    const score = headers.length + body.length
    if (!best || score > best.score) best = { headers, rows: body, score }
  }
  return best ? { headers: best.headers, rows: best.rows } : null
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
    cotReportDate: null,
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

function parseMt5DealType(
  raw: string | undefined
): { inOut: "in" | "out"; direction: TradeDirection } | null {
  if (!raw) return null
  const value = raw.trim().toLowerCase()
  const isIn = /\bin\b/.test(value)
  const isOut = /\bout\b/.test(value)
  const isBuy = /\bbuy\b/.test(value)
  const isSell = /\bsell\b/.test(value)
  if (!isBuy && !isSell) return null
  if (isIn) return { inOut: "in", direction: isBuy ? "LONG" : "SHORT" }
  if (isOut) return { inOut: "out", direction: isSell ? "LONG" : "SHORT" }
  return null
}

function isMt5PositionHistory(headers: string[]): boolean {
  return (
    headers.includes("transaction type") &&
    headers.includes("symbol") &&
    (headers.includes("position") || headers.includes("date time"))
  )
}

function parseMt5PositionHistory(
  headers: string[],
  rows: string[][],
  context: ImportContext
): { trades: NewTradeInput[]; skipped: number } {
  type Deal = {
    symbol: string
    position: string
    closed: boolean
    date: string
    inOut: "in" | "out"
    direction: TradeDirection
    price: number
    pnl: number
  }

  const deals: Deal[] = []
  let skipped = 0

  for (const cells of rows) {
    const row = rowToObject(headers, cells)
    const symbol = pick(row, ["symbol", "item", "pair", "instrument", "market"])?.trim()
    const position = pick(row, ["position", "position id", "deal"])?.trim() ?? ""
    const deal = parseMt5DealType(pick(row, ["transaction type", "type"]))
    const date = parseBrokerDate(
      pick(row, ["date time", "closing time", "close time", "open time", "time", "date"])
    )
    const price = parseLocaleNumber(
      pick(row, ["open price", "price", "entry price", "closing price", "close price"])
    )
    const pnl = parseLocaleNumber(pick(row, ["profit", "net usd", "net", "pnl", "p l"])) ?? 0
    const closed = pick(row, ["position status", "status"])?.trim().toLowerCase() === "closed"

    if (!symbol || !deal || !date || price == null) {
      skipped += 1
      continue
    }

    deals.push({
      symbol,
      position: position || `${symbol}|${date}|${price}`,
      closed,
      date,
      inOut: deal.inOut,
      direction: deal.direction,
      price,
      pnl,
    })
  }

  const groups = new Map<string, Deal[]>()
  for (const deal of deals) {
    const list = groups.get(deal.position) ?? []
    list.push(deal)
    groups.set(deal.position, list)
  }

  const trades: NewTradeInput[] = []
  for (const [position, group] of groups) {
    const ins = group.filter((deal) => deal.inOut === "in")
    const outs = group.filter((deal) => deal.inOut === "out")
    const closed = group.some((deal) => deal.closed)
    if (outs.length === 0 || (ins.length === 0 && !closed)) {
      skipped += group.length
      continue
    }

    const open = ins[0] ?? outs[0]
    const close = outs[outs.length - 1] ?? open
    const pnl = group.reduce((sum, deal) => sum + deal.pnl, 0)
    trades.push(
      tradeFromBrokerFill(
        {
          date: close.date,
          symbol: open.symbol,
          direction: open.direction,
          entry: open.price,
          stopLoss: null,
          takeProfit: close.price,
          pnl,
          resultR: null,
          notes: position ? `#${position}` : "",
        },
        context
      )
    )
  }

  return { trades, skipped }
}

function parseBrokerRows(
  headers: string[],
  rows: string[][],
  context: ImportContext
): { trades: NewTradeInput[]; skipped: number } {
  if (isMt5PositionHistory(headers)) {
    return parseMt5PositionHistory(headers, rows, context)
  }

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
    const taxes = parseLocaleNumber(pick(row, ["taxes", "tax"])) ?? 0
    const pnl = net ?? (profit != null ? profit + commission + swap + taxes : null)
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

function brokerResult(
  table: { headers: string[]; rows: string[][] } | null,
  context: ImportContext
): ParsedImport {
  if (!table) return { kind: "invalid" }
  const { trades, skipped } = parseBrokerRows(table.headers, table.rows, context)
  if (trades.length === 0 && skipped === 0) return { kind: "invalid" }
  return { kind: "broker", trades, skipped }
}

function brokerResultFromRows(rows: string[][], context: ImportContext): ParsedImport {
  const split = rows.map((cells) => {
    if (cells.length !== 1) return cells
    const value = cells[0] ?? ""
    if (value.includes("\t")) return value.split("\t").map((cell) => cell.trim())
    if (/\s{2,}/.test(value)) return value.split(/\s{2,}/).map((cell) => cell.trim())
    return cells
  })
  const html = tableFromHtmlRows(split)
  if (html) return brokerResult(html, context)
  const csv = split
    .map((cells) =>
      cells.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")
    )
    .join("\n")
  return brokerResult(parseCsvTables(csv), context)
}

function parseXlsxBytes(bytes: Uint8Array, context: ImportContext): ParsedImport {
  try {
    const sheets = xlsxSheetsToRows(bytes)
    let best: Extract<ParsedImport, { kind: "broker" }> | null = null
    for (const rows of sheets) {
      const parsed = brokerResultFromRows(rows, context)
      if (parsed.kind !== "broker") continue
      if (!best || parsed.trades.length > best.trades.length) best = parsed
    }
    return best ?? { kind: "invalid" }
  } catch {
    return { kind: "invalid" }
  }
}

export function parseImportText(
  text: string,
  context: ImportContext,
  fileName = ""
): ParsedImport {
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

  if (looksLikeHtml(raw) || /\.html?$/i.test(fileName)) {
    return brokerResult(tableFromHtmlRows(extractHtmlRows(raw)), context)
  }

  return brokerResult(parseCsvTables(raw), context)
}

export function parseImportFile(
  bytes: Uint8Array,
  context: ImportContext,
  fileName = ""
): ParsedImport {
  if (isPdfBytes(bytes, fileName)) {
    return brokerResultFromRows(pdfToRows(bytes), context)
  }
  if (isOleExcel(bytes, fileName)) return { kind: "xls" }
  if (isXlsxZip(bytes) || /\.xlsx$/i.test(fileName)) {
    return parseXlsxBytes(bytes, context)
  }
  return parseImportText(decodeImportBytes(bytes), context, fileName)
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
