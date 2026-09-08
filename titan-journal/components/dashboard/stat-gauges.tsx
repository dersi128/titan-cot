import { cn } from "@/lib/utils"

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.min(1, Math.max(0, value))
}

export function ArcGauge({
  progress,
  color = "var(--bull)",
  caption,
  size = 78,
}: {
  progress: number | null
  color?: string
  caption?: string
  size?: number
}) {
  const p = progress == null ? 0 : clamp01(progress)
  const w = size
  const h = Math.round(size * 0.62)
  const stroke = 7
  const r = size * 0.36
  const cx = w / 2
  const cy = h - stroke
  const d = `M ${cx - r} ${cy} A ${r} ${r} 0 0 0 ${cx + r} ${cy}`

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      className="shrink-0"
      aria-hidden
    >
      <path
        d={d}
        fill="none"
        stroke="color-mix(in srgb, var(--muted-foreground) 28%, transparent)"
        strokeWidth={stroke}
        strokeLinecap="round"
        pathLength={100}
      />
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        pathLength={100}
        strokeDasharray={`${p * 100} 100`}
        className="titan-gauge-fill"
        style={{ color }}
      />
      {caption ? (
        <text
          x={cx}
          y={cy - 4}
          textAnchor="middle"
          className="fill-foreground font-mono"
          fontSize="10"
        >
          {caption}
        </text>
      ) : null}
    </svg>
  )
}

export function RingGauge({
  progress,
  color = "var(--bull)",
  caption,
  size = 72,
}: {
  progress: number | null
  color?: string
  caption?: string
  size?: number
}) {
  const p = progress == null ? 0 : clamp01(progress)
  const stroke = 7
  const cx = size / 2
  const cy = size / 2
  const r = (size - stroke) / 2 - 1

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="shrink-0"
      aria-hidden
    >
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="color-mix(in srgb, var(--muted-foreground) 28%, transparent)"
        strokeWidth={stroke}
      />
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        pathLength={100}
        strokeDasharray={`${p * 100} 100`}
        transform={`rotate(-90 ${cx} ${cy})`}
        className="titan-gauge-fill"
        style={{ color }}
      />
      {caption ? (
        <text
          x={cx}
          y={cy + 4}
          textAnchor="middle"
          className="fill-foreground font-mono"
          fontSize="11"
        >
          {caption}
        </text>
      ) : null}
    </svg>
  )
}

export function SplitBar({
  profit,
  loss,
}: {
  profit: number
  loss: number
}) {
  const total = Math.abs(profit) + Math.abs(loss)
  const winPct = total > 0 ? (Math.abs(profit) / total) * 100 : 50
  const lossPct = total > 0 ? (Math.abs(loss) / total) * 100 : 50

  return (
    <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted/80">
      <span
        className="h-full bg-bull text-bull titan-gauge-fill"
        style={{ width: `${winPct}%` }}
      />
      <span
        className="h-full bg-bear text-bear titan-gauge-fill"
        style={{ width: `${lossPct}%` }}
      />
    </div>
  )
}

export function OutcomeDots({
  wins,
  be,
  losses,
}: {
  wins: number
  be: number
  losses: number
}) {
  return (
    <div className="mt-2 flex items-center gap-1.5">
      <span
        className={cn(
          "inline-flex min-w-5 items-center justify-center rounded-full bg-bull/15 px-1.5 text-[10px] font-mono tabular-nums text-bull"
        )}
      >
        {wins}
      </span>
      <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-[10px] font-mono tabular-nums text-muted-foreground">
        {be}
      </span>
      <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-bear/15 px-1.5 text-[10px] font-mono tabular-nums text-bear">
        {losses}
      </span>
    </div>
  )
}
