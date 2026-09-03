import { ASSET_CLASS_LABELS } from "@/lib/labels"
import type { AssetClass, Trade } from "@/types/trade"

export const DISTRIBUTION_METRICS = ["trades", "r", "pnl"] as const
export type DistributionMetric = (typeof DISTRIBUTION_METRICS)[number]

export const ASSET_CLASS_COLOR_VARS: Record<AssetClass, string> = {
  Forex: "var(--asset-forex)",
  Stock: "var(--asset-stock)",
  Commodity: "var(--asset-commodity)",
  Metal: "var(--asset-metal)",
  Index: "var(--asset-index)",
  Crypto: "var(--asset-crypto)",
  Unknown: "var(--asset-unknown)",
}

export type AssetClassSlice = {
  assetClass: AssetClass
  label: string
  color: string
  trades: number
  totalR: number
  netPnl: number
  value: number
  slice: number
  share: number
}

export type MarketDistribution = {
  slices: AssetClassSlice[]
  totalTrades: number
  totalValue: number
}

function metricValue(
  bucket: { trades: number; totalR: number; netPnl: number },
  metric: DistributionMetric
): number {
  if (metric === "trades") return bucket.trades
  if (metric === "r") return bucket.totalR
  return bucket.netPnl
}

export function marketDistribution(
  trades: Trade[],
  metric: DistributionMetric
): MarketDistribution {
  const buckets = new Map<
    AssetClass,
    { trades: number; totalR: number; netPnl: number }
  >()

  for (const trade of trades) {
    if (trade.status === "CANCELLED") continue
    const key = trade.assetClass
    const bucket = buckets.get(key) ?? { trades: 0, totalR: 0, netPnl: 0 }
    bucket.trades += 1
    if (trade.resultR != null && Number.isFinite(trade.resultR)) {
      bucket.totalR += trade.resultR
    }
    if (trade.pnl != null && Number.isFinite(trade.pnl)) {
      bucket.netPnl += trade.pnl
    }
    buckets.set(key, bucket)
  }

  const raw = [...buckets.entries()].map(([assetClass, bucket]) => {
    const value = metricValue(bucket, metric)
    return {
      assetClass,
      label: ASSET_CLASS_LABELS[assetClass],
      color: ASSET_CLASS_COLOR_VARS[assetClass],
      trades: bucket.trades,
      totalR: bucket.totalR,
      netPnl: bucket.netPnl,
      value,
      slice: Math.abs(value),
    }
  })

  const totalSlice = raw.reduce((sum, row) => sum + row.slice, 0)
  const slices = raw
    .filter((row) => row.slice > 0)
    .map((row) => ({
      ...row,
      share: totalSlice > 0 ? row.slice / totalSlice : 0,
    }))
    .sort((a, b) => b.slice - a.slice || a.label.localeCompare(b.label))

  return {
    slices,
    totalTrades: trades.filter((trade) => trade.status !== "CANCELLED").length,
    totalValue: raw.reduce((sum, row) => sum + row.value, 0),
  }
}
