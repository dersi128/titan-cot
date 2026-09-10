/** Inset so a 12px centered marker stays just inside the scale end. */
const EDGE_INSET = "10px"

/**
 * Visual position of the Profit Factor marker on a 0–2 scale.
 * Loss (< 1) sits left in red, profit (> 1) sits right in green. KPI number is unchanged.
 */
export function pfScaleMarkerLeft(value: number): string {
  if (value === Infinity) return `calc(100% - ${EDGE_INSET})`
  if (!Number.isFinite(value)) return "50%"
  if (value <= 0) return EDGE_INSET
  if (value >= 2) return `calc(100% - ${EDGE_INSET})`
  const pct = Number(((value / 2) * 100).toFixed(4))
  return `${pct}%`
}

/**
 * Visual position of Average R on a −2…+2 scale.
 * Negative sits left, positive sits right. KPI number is unchanged.
 */
export function avgRScaleMarkerLeft(value: number): string {
  if (!Number.isFinite(value) || value === 0) return "50%"
  if (value <= -2) return EDGE_INSET
  if (value >= 2) return `calc(100% - ${EDGE_INSET})`
  const pct = Number((((value + 2) / 4) * 100).toFixed(4))
  return `${pct}%`
}

export function avgRScaleFill(value: number): number {
  if (!Number.isFinite(value) || value === 0) return 0
  return Math.min(50, (Math.abs(value) / 2) * 50)
}
