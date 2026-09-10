/** Inset so a 12px centered marker stays just inside the profit end. */
const OVERFLOW_LEFT = "10px"

/**
 * Visual position of the Profit Factor marker on a 0–2 scale.
 * Profit (≥ 1) sits left, loss (< 1) sits right. Main KPI number is unchanged.
 */
export function pfScaleMarkerLeft(value: number): string {
  if (!Number.isFinite(value)) return "50%"
  if (value >= 2) return OVERFLOW_LEFT
  const capped = Math.max(0, Math.min(value, 2))
  const pct = Number((((2 - capped) / 2) * 100).toFixed(4))
  return `${pct}%`
}
