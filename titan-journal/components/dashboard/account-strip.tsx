"use client"

import { formatUsd } from "@/lib/format"
import { useLabels } from "@/lib/use-labels"
import type { Account } from "@/types/trade"
import type { TradingMarket } from "@/types/playbook"

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-medium tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 truncate font-mono text-[13px] tabular-nums text-foreground">
        {value}
      </p>
    </div>
  )
}

export function AccountStrip({
  account,
  capital,
  equity,
  riskUsd,
  riskPercent,
  markets,
}: {
  account: Account
  capital: number
  equity: number
  riskUsd: number
  riskPercent: number
  markets: TradingMarket[]
}) {
  const { copy, ACCOUNT_LABELS, ASSET_CLASS_LABELS } = useLabels()
  const marketValue =
    markets.length > 0
      ? markets.map((market) => ASSET_CLASS_LABELS[market]).join(" · ")
      : "—"

  return (
    <section className="titan-glass grid shrink-0 gap-2 rounded-[10px] px-3 py-2 sm:grid-cols-2 lg:grid-cols-5">
      <Cell label={copy.shell.account} value={ACCOUNT_LABELS[account]} />
      <Cell label={copy.dashboard.startingCapital} value={formatUsd(capital)} />
      <Cell label={copy.dashboard.equityNow} value={formatUsd(equity)} />
      <Cell
        label={copy.dashboard.riskPerTrade}
        value={`${formatUsd(riskUsd)} · ${riskPercent}%`}
      />
      <Cell
        label={copy.dashboard.markets}
        value={marketValue}
      />
    </section>
  )
}
