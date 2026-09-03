import { describe, expect, it } from "vitest"

import { parseJournalBackup } from "@/lib/journal-backup"
import {
  DEFAULT_IMPORT_CONTEXT,
  parseBrokerDate,
  parseImportText,
  parseLocaleNumber,
} from "@/lib/trade-import"

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
  it("reads ISO, MT5 dots, and EU dates", () => {
    expect(parseBrokerDate("2026-09-01 14:22:00")).toBe("2026-09-01")
    expect(parseBrokerDate("2026.09.01 14:22")).toBe("2026-09-01")
    expect(parseBrokerDate("03.09.2026 11:00")).toBe("2026-09-03")
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
})
