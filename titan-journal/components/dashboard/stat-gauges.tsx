import { cn } from "@/lib/utils"

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.min(1, Math.max(0, value))
}

export function ArcGauge({
  progress,
  color = "var(--bull)",
  caption,
  size = 84,
}: {
  progress: number | null
  color?: string
  caption?: string
  size?: number
}) {
  const p = progress == null ? 0 : clamp01(progress)
  const stroke = 8
  const pad = 10
  const r = (size - pad * 2) / 2
  const cx = size / 2
  const cy = pad + r
  const h = cy + pad
  const k = 0.5522847498 * r
  const d = [
    `M ${cx - r} ${cy}`,
    `C ${cx - r} ${cy - k} ${cx - k} ${cy - r} ${cx} ${cy - r}`,
    `S ${cx + r} ${cy - k} ${cx + r} ${cy}`,
  ].join(" ")

  return (
    <svg
      width={size}
      height={h}
      viewBox={`0 0 ${size} ${h}`}
      overflow="visible"
      className="shrink-0 overflow-visible"
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
          y={cy - 6}
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
      overflow="visible"
      className="shrink-0 overflow-visible"
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
