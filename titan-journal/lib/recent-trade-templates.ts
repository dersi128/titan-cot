import type { Account, Trade, TradeDirection } from "@/types/trade"

export type TradeTemplate = {
  key: string
  symbol: string
  direction: TradeDirection
  playbookId: string
  account: Account
  riskPercent: number
}

export function recentTradeTemplates(
  trades: Trade[],
  limit = 6,
  activePlaybookIds?: ReadonlySet<string>
): TradeTemplate[] {
  const sorted = trades
    .filter((trade) => trade.symbol.trim() !== "")
    .slice()
    .sort(
      (a, b) =>
        b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt)
    )

  const seen = new Set<string>()
  const templates: TradeTemplate[] = []

  for (const trade of sorted) {
    if (activePlaybookIds && !activePlaybookIds.has(trade.playbookId)) continue
    const key = `${trade.symbol}|${trade.direction}|${trade.playbookId}`
    if (seen.has(key)) continue
    seen.add(key)
    templates.push({
      key,
      symbol: trade.symbol,
      direction: trade.direction,
      playbookId: trade.playbookId,
      account: trade.account,
      riskPercent: trade.riskPercent,
    })
    if (templates.length >= limit) break
  }

  return templates
}
