import { describe, expect, it } from "vitest"
import { zipSync, zlibSync } from "fflate"

import { parseJournalBackup } from "@/lib/journal-backup"
import {
  DEFAULT_IMPORT_CONTEXT,
  parseBrokerDate,
  parseImportFile,
  parseImportText,
  parseLocaleNumber,
} from "@/lib/trade-import"

const encoder = new TextEncoder()

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
}

function buildCTraderXlsx(): Uint8Array {
  const strings = [
    "Symbol",
    "Opening Direction",
    "Closing Time",
    "Entry Price",
    "Stop Loss",
    "Take Profit",
    "Net USD",
    "EURUSD",
    "Buy",
    "2026-09-01 14:22:00",
    "GBPUSD",
    "Sell",
    "03.09.2026 11:00",
  ]
  const shared = `<?xml version="1.0" encoding="UTF-8"?><sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">${strings
    .map((value) => `<si><t>${xmlEscape(value)}</t></si>`)
    .join("")}</sst>`
  const sheet = `<?xml version="1.0" encoding="UTF-8"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>
    <row r="1">${["A","B","C","D","E","F","G"].map((col, i) => `<c r="${col}1" t="s"><v>${i}</v></c>`).join("")}</row>
    <row r="2">
      <c r="A2" t="s"><v>7</v></c><c r="B2" t="s"><v>8</v></c><c r="C2" t="s"><v>9</v></c>
      <c r="D2"><v>1.08420</v></c><c r="E2"><v>1.07920</v></c><c r="F2"><v>1.09420</v></c><c r="G2"><v>190</v></c>
    </row>
    <row r="3">
      <c r="A3" t="s"><v>10</v></c><c r="B3" t="s"><v>11</v></c><c r="C3" t="s"><v>12</v></c>
      <c r="D3"><v>1.27000</v></c><c r="E3"><v>1.27500</v></c><c r="F3"><v>1.26000</v></c><c r="G3"><v>1234.5</v></c>
    </row>
  </sheetData></worksheet>`
  return zipSync({
    "xl/sharedStrings.xml": encoder.encode(shared),
    "xl/worksheets/sheet1.xml": encoder.encode(sheet),
  })
}

function statementPdfContent(): string {
  const header = [
    "Ticket",
    "Open Time",
    "Type",
    "Size",
    "Item",
    "Price",
    "S / L",
    "T / P",
    "Close Time",
    "Price",
    "Commission",
    "Taxes",
    "Swap",
    "Profit",
  ]
  const row = [
    "11002",
    "2026.09.01 10:15:00",
    "buy",
    "1.00",
    "eurusd",
    "1.08420",
    "1.07920",
    "1.09420",
    "2026.09.01 14:22:00",
    "1.08610",
    "-10.00",
    "0.00",
    "0.00",
    "190.00",
  ]
  const cells = (values: string[]) =>
    values.map((value, index) => `${index === 0 ? "" : "40 0 Td "}(${value}) Tj`).join("\n")
  const content = `BT
/F1 10 Tf
50 700 Td
${cells(header)}
0 -16 Td
${cells(row)}
ET
`
  return content
}

function buildStatementPdf(flate = false): Uint8Array {
  const content = statementPdfContent()
  if (!flate) {
    const body = `%PDF-1.4
1 0 obj << /Length ${content.length} >>
stream
${content}
endstream
endobj
%%EOF
`
    return encoder.encode(body)
  }
  const compressed = zlibSync(encoder.encode(content))
  const head = encoder.encode(
    `%PDF-1.4\n1 0 obj << /Length ${compressed.length} /Filter /FlateDecode >>\nstream\n`
  )
  const tail = encoder.encode("\nendstream\nendobj\n%%EOF\n")
  const out = new Uint8Array(head.length + compressed.length + tail.length)
  out.set(head, 0)
  out.set(compressed, head.length)
  out.set(tail, head.length + compressed.length)
  return out
}

const CTRADER_CSV = `Symbol,Opening Direction,Opening Time (UTC+2),Closing Time (UTC+2),Entry Price,Closing Price,Stop Loss,Take Profit,Net USD,Commission,Swap,Comment
EURUSD,Buy,2026-09-01 10:15:00,2026-09-01 14:22:00,1.08420,1.08610,1.07920,1.09420,190.00,-10.00,0.00,breakout
GBPUSD,Sell,03.09.2026 09:00,03.09.2026 11:00,1.27000,1.26500,1.27500,1.26000,"1.234,50",0,0,
`

const MT5_CSV = `Time;Deal;Symbol;Type;Direction;Volume;Price;S/L;T/P;Profit
2026.09.01 10:15;11001;EURUSD;buy;in;1.00;1.08420;1.07920;1.09420;0.00
2026.09.01 14:22;11002;EURUSD;buy;out;1.00;1.08610;1.07920;1.09420;190.00
2026.09.01 14:30;11003;;balance;in;0;0;0;0;500.00
`

describe("parseLocaleNumber", () => {
  it("reads US and EU decimals", () => {
    expect(parseLocaleNumber("190.00")).toBe(190)
    expect(parseLocaleNumber("-10.00")).toBe(-10)
    expect(parseLocaleNumber("1.08420")).toBe(1.0842)
    expect(parseLocaleNumber("1.234,50")).toBe(1234.5)
    expect(parseLocaleNumber("190,00")).toBe(190)
  })
})

describe("parseBrokerDate", () => {
  it("reads ISO, MT5 dots, EU dates, and Excel serials", () => {
    expect(parseBrokerDate("2026-09-01 14:22:00")).toBe("2026-09-01")
    expect(parseBrokerDate("2026.09.01 14:22")).toBe("2026-09-01")
    expect(parseBrokerDate("03.09.2026 11:00")).toBe("2026-09-03")
    expect(parseBrokerDate("45901")).toBe("2025-09-01")
  })
})

describe("parseImportText", () => {
  it("restores a TITAN Journal JSON backup", () => {
    const backup = {
      app: "titan-journal",
      version: 1,
      exportedAt: "2026-09-03T11:16:17.786Z",
      trades: [
        {
          id: "a1c509d1-1195-4aec-be5b-b2f3fcb9ac58",
          createdAt: "2026-09-03T06:20:31.797Z",
          date: "2026-09-03",
          symbol: "WIX+",
          direction: "LONG",
          strategy: "Swing",
          account: "Personal",
          status: "PLANNED",
          entry: 88,
          stopLoss: 777,
          takeProfit: 868,
          riskPercent: 1,
          notes: "",
        },
      ],
      profile: { displayName: "Dersisvan" },
      preferences: { language: "cs" },
      playbooks: [],
    }

    const parsed = parseImportText(JSON.stringify(backup), DEFAULT_IMPORT_CONTEXT)
    expect(parsed.kind).toBe("backup")
    if (parsed.kind !== "backup") return
    expect(parsed.backup.trades).toHaveLength(1)
    expect(parsed.backup.trades[0]?.symbol).toBe("WIX+")
    expect(parseJournalBackup(backup)?.trades[0]?.symbol).toBe("WIX+")
  })

  it("adds closed trades from an IC Markets cTrader CSV", () => {
    const parsed = parseImportText(CTRADER_CSV, DEFAULT_IMPORT_CONTEXT)
    expect(parsed.kind).toBe("broker")
    if (parsed.kind !== "broker") return
    expect(parsed.trades).toHaveLength(2)
    expect(parsed.trades[0]).toMatchObject({
      symbol: "EURUSD",
      direction: "LONG",
      date: "2026-09-01",
      entry: 1.0842,
      stopLoss: 1.0792,
      takeProfit: 1.0942,
      pnl: 190,
      status: "CLOSED",
      account: "Personal",
    })
    expect(parsed.trades[0]?.resultR).toBe(1.9)
    expect(parsed.trades[1]).toMatchObject({
      symbol: "GBPUSD",
      direction: "SHORT",
      date: "2026-09-03",
      pnl: 1234.5,
    })
  })

  it("keeps MT5 close deals and skips balance plus opening deals", () => {
    const parsed = parseImportText(MT5_CSV, DEFAULT_IMPORT_CONTEXT)
    expect(parsed.kind).toBe("broker")
    if (parsed.kind !== "broker") return
    expect(parsed.trades).toHaveLength(1)
    expect(parsed.skipped).toBe(2)
    expect(parsed.trades[0]).toMatchObject({
      symbol: "EURUSD",
      direction: "LONG",
      date: "2026-09-01",
      pnl: 190,
      notes: "#11002",
    })
  })

  it("rejects junk", () => {
    expect(parseImportText("hello", DEFAULT_IMPORT_CONTEXT).kind).toBe("invalid")
    expect(parseImportText("{", DEFAULT_IMPORT_CONTEXT).kind).toBe("invalid")
  })

  it("reads closed trades from an MT4/IC Markets HTML statement", () => {
    const html = `<!DOCTYPE html><html><body>
      <table><tr><td>Account</td><td>12345</td></tr></table>
      <table>
        <tr><td colspan="14">Closed Transactions:</td></tr>
        <tr>
          <th>Ticket</th><th>Open Time</th><th>Type</th><th>Size</th><th>Item</th>
          <th>Price</th><th>S / L</th><th>T / P</th><th>Close Time</th><th>Price</th>
          <th>Commission</th><th>Taxes</th><th>Swap</th><th>Profit</th>
        </tr>
        <tr>
          <td>11002</td><td>2026.09.01 10:15:00</td><td>buy</td><td>1.00</td><td>eurusd</td>
          <td>1.08420</td><td>1.07920</td><td>1.09420</td><td>2026.09.01 14:22:00</td><td>1.08610</td>
          <td>-10.00</td><td>0.00</td><td>0.00</td><td>190.00</td>
        </tr>
        <tr>
          <td>11003</td><td>2026.09.03 09:00:00</td><td>sell</td><td>0.50</td><td>gbpusd</td>
          <td>1.27000</td><td>1.27500</td><td>1.26000</td><td>2026.09.03 11:00:00</td><td>1.26500</td>
          <td>0.00</td><td>0.00</td><td>0.00</td><td>1.234,50</td>
        </tr>
        <tr><td colspan="14">Open Trades:</td></tr>
        <tr>
          <td>999</td><td>2026.09.03 12:00:00</td><td>buy</td><td>1.00</td><td>usdchf</td>
          <td>0.80000</td><td>0.79000</td><td>0.82000</td><td></td><td></td>
          <td>0</td><td>0</td><td>0</td><td>0</td>
        </tr>
      </table>
    </body></html>`

    const parsed = parseImportText(html, DEFAULT_IMPORT_CONTEXT, "statement.htm")
    expect(parsed.kind).toBe("broker")
    if (parsed.kind !== "broker") return
    expect(parsed.trades).toHaveLength(2)
    expect(parsed.trades[0]).toMatchObject({
      symbol: "EURUSD",
      direction: "LONG",
      date: "2026-09-01",
      pnl: 180,
      status: "CLOSED",
    })
    expect(parsed.trades[1]).toMatchObject({
      symbol: "GBPUSD",
      direction: "SHORT",
      date: "2026-09-03",
      pnl: 1234.5,
    })
  })

  it("reads closed trades from an Excel workbook", () => {
    const parsed = parseImportFile(buildCTraderXlsx(), DEFAULT_IMPORT_CONTEXT, "report.xlsx")
    expect(parsed.kind).toBe("broker")
    if (parsed.kind !== "broker") return
    expect(parsed.trades).toHaveLength(2)
    expect(parsed.trades[0]).toMatchObject({
      symbol: "EURUSD",
      direction: "LONG",
      date: "2026-09-01",
      pnl: 190,
    })
    expect(parsed.trades[1]).toMatchObject({
      symbol: "GBPUSD",
      direction: "SHORT",
      date: "2026-09-03",
    })
  })

  it("reads closed trades from a PDF statement", () => {
    const parsed = parseImportFile(buildStatementPdf(), DEFAULT_IMPORT_CONTEXT, "statement.pdf")
    expect(parsed.kind).toBe("broker")
    if (parsed.kind !== "broker") return
    expect(parsed.trades).toHaveLength(1)
    expect(parsed.trades[0]).toMatchObject({
      symbol: "EURUSD",
      direction: "LONG",
      date: "2026-09-01",
      pnl: 180,
    })
  })

  it("reads closed trades from a compressed PDF statement", () => {
    const parsed = parseImportFile(
      buildStatementPdf(true),
      DEFAULT_IMPORT_CONTEXT,
      "statement.pdf"
    )
    expect(parsed.kind).toBe("broker")
    if (parsed.kind !== "broker") return
    expect(parsed.trades[0]).toMatchObject({
      symbol: "EURUSD",
      date: "2026-09-01",
      pnl: 180,
    })
  })

  it("asks to save old Excel .xls as xlsx", () => {
    const bytes = Uint8Array.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1])
    expect(parseImportFile(bytes, DEFAULT_IMPORT_CONTEXT, "report.xls").kind).toBe("xls")
  })
})
