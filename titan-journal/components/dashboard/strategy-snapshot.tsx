import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatPercent } from "@/lib/format"
import { copy } from "@/lib/labels"
import { STRATEGY_SNAPSHOT } from "@/lib/mock-data"

export function StrategySnapshot() {
  return (
    <Card>
      <CardHeader className="border-b border-white/[0.06]">
        <CardTitle>{copy.dashboard.strategySnapshot}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 pt-4 sm:grid-cols-2">
        <div className="rounded-xl border border-bull/20 bg-bull/[0.04] px-3 py-3">
          <p className="text-[11px] uppercase tracking-wider text-stone-500">
            {copy.dashboard.bestSetup}
          </p>
          <p className="mt-1 text-sm font-medium text-stone-100">
            {STRATEGY_SNAPSHOT.best.name}
          </p>
          <p className="mt-2 font-mono text-sm text-bull">
            {formatPercent(STRATEGY_SNAPSHOT.best.winRate)} {copy.dashboard.winRateShort}
          </p>
        </div>
        <div className="rounded-xl border border-bear/20 bg-bear/[0.04] px-3 py-3">
          <p className="text-[11px] uppercase tracking-wider text-stone-500">
            {copy.dashboard.weakestSetup}
          </p>
          <p className="mt-1 text-sm font-medium text-stone-100">
            {STRATEGY_SNAPSHOT.weakest.name}
          </p>
          <p className="mt-2 font-mono text-sm text-bear">
            {formatPercent(STRATEGY_SNAPSHOT.weakest.winRate)} {copy.dashboard.winRateShort}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
