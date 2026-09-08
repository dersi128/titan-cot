"use client"

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.min(1, Math.max(0, value))
}

export function ArcGauge({
  progress,
  size = 84,
}: {
  progress: number | null
  size?: number
}) {
  const p = progress == null ? 0 : clamp01(progress)
  const stroke = 9
  const pad = 10
  const r = (size - pad * 2) / 2
  const cx = size / 2
  const cy = pad + r
  const h = cy + pad
  const k = 0.5522847498 * r
  const leftToRight = [
    `M ${cx - r} ${cy}`,
    `C ${cx - r} ${cy - k} ${cx - k} ${cy - r} ${cx} ${cy - r}`,
    `S ${cx + r} ${cy - k} ${cx + r} ${cy}`,
  ].join(" ")
  const rightToLeft = [
    `M ${cx + r} ${cy}`,
    `C ${cx + r} ${cy - k} ${cx + k} ${cy - r} ${cx} ${cy - r}`,
    `S ${cx - r} ${cy - k} ${cx - r} ${cy}`,
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
        d={leftToRight}
        fill="none"
        stroke="currentColor"
        className="text-muted-foreground"
        strokeWidth={stroke}
        strokeLinecap="round"
        opacity={0.22}
        pathLength={100}
      />
      {progress != null && p > 0 ? (
        <path
          d={leftToRight}
          fill="none"
          stroke="var(--bull)"
          strokeWidth={stroke}
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray={`${p * 100} 100`}
          className="titan-gauge-bull"
        />
      ) : null}
      {progress != null && p < 1 ? (
        <path
          d={rightToLeft}
          fill="none"
          stroke="var(--bear)"
          strokeWidth={stroke}
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray={`${(1 - p) * 100} 100`}
          className="titan-gauge-bear"
        />
      ) : null}
    </svg>
  )
}

export function RingGauge({
  progress,
  size = 72,
}: {
  progress: number | null
  size?: number
}) {
  const p = progress == null ? 0 : clamp01(progress)
  const stroke = 8
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
        stroke="currentColor"
        className="text-muted-foreground"
        strokeWidth={stroke}
        opacity={0.22}
      />
      <g transform={`translate(${cx} ${cy})`}>
        {progress != null && p > 0 ? (
          <circle
            cx={0}
            cy={0}
            r={r}
            fill="none"
            stroke="var(--bull)"
            strokeWidth={stroke}
            strokeLinecap="round"
            pathLength={100}
            strokeDasharray={`${p * 100} 100`}
            transform="rotate(90)"
            className="titan-gauge-bull"
          />
        ) : null}
        {progress != null && p < 1 ? (
          <circle
            cx={0}
            cy={0}
            r={r}
            fill="none"
            stroke="var(--bear)"
            strokeWidth={stroke}
            strokeLinecap="round"
            pathLength={100}
            strokeDasharray={`${(1 - p) * 100} 100`}
            transform="scale(-1, 1) rotate(90)"
            className="titan-gauge-bear"
          />
        ) : null}
      </g>
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
      <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-bull/15 px-1.5 text-[10px] font-mono tabular-nums text-bull">
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
