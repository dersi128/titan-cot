import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DirectionBadge,
  StatusBadge,
} from "@/components/trades/trade-badges"
import { ResultR } from "@/components/trades/result-r"
import { formatMarketLabel, shouldDisplayCot } from "@/lib/market-classification"
import { formatRRR } from "@/lib/trade-calculations"
import { formatYesNo } from "@/lib/format"
import {
  ASSET_CLASS_LABELS,
  BIAS_LABELS,
  copy,
  IMPULSE_LABELS,
  LOCATION_LABELS,
  MARKET_TYPE_LABELS,
  TREND_LABELS,
  ZONE_TIMEFRAME_LABELS,
  ZONE_TYPE_LABELS,
} from "@/lib/labels"
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
      <CardHeader className="border-b border-white/[0.06]">
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
          <h1 className="mt-1 text-[22px] font-semibold tracking-tight">
            {trade.symbol}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <DirectionBadge direction={trade.direction} />
            <span className="text-sm text-muted-foreground">
              {trade.grade} {copy.detail.setup}
            </span>
          </div>
        </div>
        <StatusBadge status={trade.status} />
      </div>

      <Section title={copy.detail.tradePlan}>
        <Field label={copy.detail.entry} value={trade.entry} />
        <Field label={copy.detail.stopLoss} value={trade.stopLoss} />
        <Field label={copy.detail.takeProfit} value={trade.takeProfit} />
        <Field label={copy.detail.riskPercent} value={`${trade.riskPercent} %`} />
        <Field label={copy.detail.plannedRrr} value={formatRRR(trade.plannedRRR)} />
        <Field label={copy.detail.resultR} value={<ResultR value={trade.resultR} />} />
      </Section>

      <Section title={copy.detail.marketContext}>
        <Field
          label={copy.detail.market}
          value={ASSET_CLASS_LABELS[trade.assetClass]}
        />
        <Field
          label={copy.detail.type}
          value={MARKET_TYPE_LABELS[trade.marketType]}
        />
        <Field label={copy.detail.htfTrend} value={TREND_LABELS[trade.htfTrend]} />
        <Field label={copy.detail.tradeTrend} value={TREND_LABELS[trade.tradeTrend]} />
        <Field label={copy.detail.location} value={LOCATION_LABELS[trade.location]} />
      </Section>

      <Section title={copy.detail.supplyDemand}>
        <Field label={copy.detail.zoneType} value={ZONE_TYPE_LABELS[trade.zoneType]} />
        <Field label={copy.detail.timeframe} value={ZONE_TIMEFRAME_LABELS[trade.zoneTimeframe]} />
        <Field label={copy.detail.original} value={formatYesNo(trade.original)} />
        <Field label={copy.detail.fresh} value={formatYesNo(trade.fresh)} />
        <Field label={copy.detail.touchCount} value={trade.touchCount} />
        <Field label={copy.detail.hq} value={formatYesNo(trade.hq)} />
        <Field label={copy.detail.impulse} value={IMPULSE_LABELS[trade.impulse]} />
        <Field label={copy.detail.mitigation} value={`${trade.mitigation} %`} />
      </Section>

      {shouldDisplayCot(trade) ? (
        <Section title={copy.detail.cot}>
          <Field
            label={copy.detail.bias}
            value={trade.cotBias ? BIAS_LABELS[trade.cotBias] : "—"}
          />
          <Field
            label={copy.detail.score}
            value={trade.cotScore == null ? "—" : trade.cotScore}
          />
          <Field
            label={copy.detail.commercials}
            value={
              trade.commercialsBias ? BIAS_LABELS[trade.commercialsBias] : "—"
            }
          />
        </Section>
      ) : trade.marketType === "Cross" ? (
        <Card>
          <CardHeader className="border-b border-white/[0.06]">
            <CardTitle>{copy.detail.cot}</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">
              {copy.detail.cotHiddenCross}
            </p>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader className="border-b border-white/[0.06]">
          <CardTitle>{copy.detail.notes}</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <p className="text-sm whitespace-pre-wrap text-muted-foreground">
            {trade.notes || copy.detail.noNote}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b border-white/[0.06]">
          <CardTitle>{copy.detail.screenshots}</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
            {copy.detail.screenshotsPlaceholder}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
