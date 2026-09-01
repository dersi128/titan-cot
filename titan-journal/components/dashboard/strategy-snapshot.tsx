import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatPercent } from "@/lib/format"
import { STRATEGY_SNAPSHOT } from "@/lib/mock-data"

export function StrategySnapshot() {
  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>Strategy Snapshot</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 pt-4 sm:grid-cols-2">
        <div className="rounded-lg border border-border px-3 py-3">
          <p className="text-xs text-muted-foreground">Best Setup</p>
          <p className="mt-1 font-medium">{STRATEGY_SNAPSHOT.best.name}</p>
          <p className="mt-2 font-mono text-sm text-bull">
            {formatPercent(STRATEGY_SNAPSHOT.best.winRate)} WR
          </p>
        </div>
        <div className="rounded-lg border border-border px-3 py-3">
          <p className="text-xs text-muted-foreground">Weakest Setup</p>
          <p className="mt-1 font-medium">{STRATEGY_SNAPSHOT.weakest.name}</p>
          <p className="mt-2 font-mono text-sm text-bear">
            {formatPercent(STRATEGY_SNAPSHOT.weakest.winRate)} WR
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
