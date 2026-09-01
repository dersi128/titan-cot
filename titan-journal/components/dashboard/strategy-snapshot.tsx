import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatSignedR, signedClassName } from "@/lib/format"
import { copy } from "@/lib/labels"
import { STRATEGY_SNAPSHOT } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

function SetupBlock({
  label,
  name,
  winRate,
  expectancyR,
}: {
  label: string
  name: string
  winRate: number
  expectancyR: number
}) {
  return (
    <div className="rounded-[10px] border border-white/[0.07] bg-black/20 px-3.5 py-3">
      <p className="text-[11px] font-medium tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1.5 text-[14px] font-medium text-foreground">{name}</p>
      <p className="mt-2 font-mono text-[12px] tabular-nums text-muted-foreground">
        {Math.round(winRate * 100)}% {copy.dashboard.winRateShort}
      </p>
      <p
        className={cn(
          "mt-0.5 font-mono text-[12px] tabular-nums",
          signedClassName(expectancyR)
        )}
      >
        {formatSignedR(expectancyR)} {copy.dashboard.expectancy}
      </p>
    </div>
  )
}

export function StrategySnapshot() {
  return (
    <Card>
      <CardHeader className="border-b border-white/[0.06] py-3">
        <CardTitle>{copy.dashboard.strategySnapshot}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 pt-4">
        <SetupBlock
          label={copy.dashboard.bestSetup}
          name={STRATEGY_SNAPSHOT.best.name}
          winRate={STRATEGY_SNAPSHOT.best.winRate}
          expectancyR={STRATEGY_SNAPSHOT.best.expectancyR}
        />
        <SetupBlock
          label={copy.dashboard.weakestSetup}
          name={STRATEGY_SNAPSHOT.weakest.name}
          winRate={STRATEGY_SNAPSHOT.weakest.winRate}
          expectancyR={STRATEGY_SNAPSHOT.weakest.expectancyR}
        />
      </CardContent>
    </Card>
  )
}
