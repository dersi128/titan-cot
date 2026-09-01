import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DirectionBadge,
  StatusBadge,
} from "@/components/trades/trade-badges"
import { ResultR } from "@/components/trades/result-r"
import { formatMarketLabel } from "@/lib/market-classification"
import { formatRRR } from "@/lib/trade-calculations"
import { formatYesNo } from "@/lib/format"
import type { Trade } from "@/types/trade"

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm">{value}</dd>
    </div>
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <dl className="grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3">
          {children}
        </dl>
      </CardContent>
    </Card>
  )
}

export function TradeDetail({ trade }: { trade: Trade }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs text-muted-foreground">
            {formatMarketLabel(trade)}
          </p>
          <h1 className="mt-1 text-2xl font-medium tracking-tight">
            {trade.symbol}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <DirectionBadge direction={trade.direction} />
            <span className="text-sm text-muted-foreground">
              {trade.grade} Setup
            </span>
          </div>
        </div>
        <StatusBadge status={trade.status} />
      </div>

      <Section title="Trade Plan">
        <Field label="Entry" value={trade.entry} />
        <Field label="Stop Loss" value={trade.stopLoss} />
        <Field label="Take Profit" value={trade.takeProfit} />
        <Field label="Risk %" value={`${trade.riskPercent}%`} />
        <Field label="Planned RRR" value={formatRRR(trade.plannedRRR)} />
        <Field label="Result R" value={<ResultR value={trade.resultR} />} />
      </Section>

      <Section title="Market Context">
        <Field label="HTF Trend" value={trade.htfTrend} />
        <Field label="Trading TF Trend" value={trade.tradeTrend} />
        <Field label="Location" value={trade.location} />
      </Section>

      <Section title="Supply / Demand">
        <Field label="Zone Type" value={trade.zoneType} />
        <Field label="Timeframe" value={trade.zoneTimeframe} />
        <Field label="Original" value={formatYesNo(trade.original)} />
        <Field label="Fresh" value={formatYesNo(trade.fresh)} />
        <Field label="Touch Count" value={trade.touchCount} />
        <Field label="HQ" value={formatYesNo(trade.hq)} />
        <Field label="Impulse" value={trade.impulse} />
        <Field label="Mitigation %" value={`${trade.mitigation}%`} />
      </Section>

      <Section title="COT">
        <Field label="Bias" value={trade.cotBias} />
        <Field label="Score" value={trade.cotScore} />
      </Section>

      <Card>
        <CardHeader className="border-b">
          <CardTitle>Notes</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <p className="text-sm whitespace-pre-wrap text-muted-foreground">
            {trade.notes || "No pre-trade note."}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b">
          <CardTitle>Screenshots</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
            Chart screenshots will be added in a later phase.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
