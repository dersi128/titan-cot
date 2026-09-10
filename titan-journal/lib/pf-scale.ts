/** Inset so a 12px centered marker stays just inside the 0–2 track. */
const OVERFLOW_LEFT = "calc(100% - 10px)"

/**
 * Visual position of the Profit Factor marker on a 0–2 scale.
 * Does not change the main KPI number.
 */
export function pfScaleMarkerLeft(value: number): string {
  if (!Number.isFinite(value)) return "50%"
  if (value >= 2) return OVERFLOW_LEFT
  const capped = Math.max(0, Math.min(value, 2))
  return `${(capped / 2) * 100}%`
}
