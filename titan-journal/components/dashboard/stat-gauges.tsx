"use client"

import { pfScaleMarkerLeft } from "@/lib/pf-scale"
import { useLabels } from "@/lib/use-labels"
import { cn } from "@/lib/utils"

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.min(1, Math.max(0, value))
}

function outcomeMix(
  wins?: number,
  be?: number,
  losses?: number
): { win: number; be: number; loss: number } | null {
  if (wins == null || be == null || losses == null) return null
  const total = wins + be + losses
  if (total <= 0) return null
  return {
    win: (wins / total) * 100,
    be: (be / total) * 100,
    loss: (losses / total) * 100,
  }
}

export function ArcGauge({
  progress,
  wins,
  be,
  losses,
  size = 84,
}: {
  progress?: number | null
  wins?: number
  be?: number
  losses?: number
  size?: number
}) {
  const mix = outcomeMix(wins, be, losses)
  const p = progress == null ? 0 : clamp01(progress)
  const winPct = mix ? mix.win : p * 100
  const bePct = mix ? mix.be : 0
  const lossPct = mix ? mix.loss : (1 - p) * 100
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
  const show = mix != null || progress != null

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
      {show && winPct > 0 ? (
        <path
          d={leftToRight}
          fill="none"
          stroke="var(--bull)"
          strokeWidth={stroke}
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray={`${winPct} 100`}
        />
      ) : null}
      {show && bePct > 0 ? (
        <path
          d={leftToRight}
          fill="none"
          stroke="var(--chart-4)"
          strokeWidth={stroke}
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray={`${bePct} 100`}
          strokeDashoffset={-winPct}
        />
      ) : null}
      {show && lossPct > 0 ? (
        <path
          d={rightToLeft}
          fill="none"
          stroke="var(--bear)"
          strokeWidth={stroke}
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray={`${lossPct} 100`}
        />
      ) : null}
    </svg>
  )
}

export function RingGauge({
  progress,
  wins,
  be,
  losses,
  size = 72,
}: {
  progress?: number | null
  wins?: number
  be?: number
  losses?: number
  size?: number
}) {
  const mix = outcomeMix(wins, be, losses)
  const p = progress == null ? 0 : clamp01(progress)
  const winPct = mix ? mix.win : p * 100
  const bePct = mix ? mix.be : 0
  const lossPct = mix ? mix.loss : (1 - p) * 100
  const stroke = 8
  const cx = size / 2
  const cy = size / 2
  const r = (size - stroke) / 2 - 1
  const show = mix != null || progress != null

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
        {show && winPct > 0 ? (
          <circle
            cx={0}
            cy={0}
            r={r}
            fill="none"
            stroke="var(--bull)"
            strokeWidth={stroke}
            strokeLinecap="round"
            pathLength={100}
            strokeDasharray={`${winPct} 100`}
            transform="rotate(90)"
          />
        ) : null}
        {show && bePct > 0 ? (
          <circle
            cx={0}
            cy={0}
            r={r}
            fill="none"
            stroke="var(--chart-4)"
            strokeWidth={stroke}
            strokeLinecap="round"
            pathLength={100}
            strokeDasharray={`${bePct} 100`}
            strokeDashoffset={-winPct}
            transform="rotate(90)"
          />
        ) : null}
        {show && lossPct > 0 ? (
          <circle
            cx={0}
            cy={0}
            r={r}
            fill="none"
            stroke="var(--bear)"
            strokeWidth={stroke}
            strokeLinecap="round"
            pathLength={100}
            strokeDasharray={`${lossPct} 100`}
            transform="scale(-1, 1) rotate(90)"
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
      <span className="h-full bg-bull" style={{ width: `${winPct}%` }} />
      <span className="h-full bg-bear" style={{ width: `${lossPct}%` }} />
    </div>
  )
}

export function FactorScale({ value }: { value: number | null }) {
  const { language } = useLabels()
  const n = value != null && Number.isFinite(value) ? value : null
  const over = n != null && n >= 1
  const one = language === "en" ? "1.0" : "1,0"

  return (
    <div className="w-full" aria-hidden>
      <div className="relative h-2">
        <div className="flex h-full overflow-hidden rounded-sm border border-foreground/40">
          <span className="h-full w-1/2 bg-bear/75" />
          <span className="h-full w-1/2 bg-bull/75" />
        </div>
        <span className="absolute -top-0.5 -bottom-0.5 left-1/2 z-10 w-0.5 -translate-x-1/2 bg-foreground" />
        {n != null ? (
          <span
            className={cn(
              "absolute top-1/2 z-20 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-[0_0_0_1.5px_var(--elevated),0_0_0_2.5px_var(--foreground)]",
              over ? "bg-bull" : "bg-bear"
            )}
            style={{ left: pfScaleMarkerLeft(n) }}
          />
        ) : null}
      </div>
      <div className="relative mt-1 h-4 text-[9px] font-semibold tabular-nums text-foreground">
        <span className="absolute left-1/2 -translate-x-1/2">{one}</span>
        <span className="absolute right-0">2+</span>
      </div>
    </div>
  )
}

export function ZeroBar({ value }: { value: number | null }) {
  const n = value != null && Number.isFinite(value) ? value : null
  const span = n == null || n === 0 ? 0 : Math.min(50, (Math.abs(n) / 2) * 50)
  const left =
    n == null || n === 0 ? "50%" : n > 0 ? `calc(50% - ${span}%)` : `calc(50% + ${span}%)`

  return (
    <div className="w-full" aria-hidden>
      <div className="relative h-2">
        <div className="relative h-full overflow-hidden rounded-sm border border-foreground/40 bg-muted">
          {n != null && n > 0 ? (
            <span
              className="absolute inset-y-0 bg-bull"
              style={{ right: "50%", width: `max(0.375rem, ${span}%)` }}
            />
          ) : null}
          {n != null && n < 0 ? (
            <span
              className="absolute inset-y-0 left-1/2 bg-bear"
              style={{ width: `max(0.375rem, ${span}%)` }}
            />
          ) : null}
        </div>
        <span className="absolute -top-0.5 -bottom-0.5 left-1/2 z-10 w-0.5 -translate-x-1/2 bg-foreground" />
        {n != null ? (
          <span
            className={cn(
              "absolute top-1/2 z-20 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-[0_0_0_1.5px_var(--elevated),0_0_0_2.5px_var(--foreground)]",
              n > 0 ? "bg-bull" : n < 0 ? "bg-bear" : "bg-foreground"
            )}
            style={{ left }}
          />
        ) : null}
      </div>
      <p className="mt-1 text-center text-[9px] font-semibold tabular-nums text-foreground">
        0
      </p>
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
    <div className="flex items-center gap-1.5">
      <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-bull/15 px-1.5 text-[10px] font-mono tabular-nums text-bull">
        {wins}
      </span>
      <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--chart-4)_22%,transparent)] px-1.5 text-[10px] font-mono tabular-nums text-[color:var(--chart-4)]">
        {be}
      </span>
      <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-bear/15 px-1.5 text-[10px] font-mono tabular-nums text-bear">
        {losses}
      </span>
    </div>
  )
}
