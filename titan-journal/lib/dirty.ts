function normalize(value: unknown): unknown {
  if (value === undefined) return null
  if (Array.isArray(value)) return value.map(normalize)
  if (value && typeof value === "object") {
    const row = value as Record<string, unknown>
    const next: Record<string, unknown> = {}
    for (const key of Object.keys(row).sort()) {
      next[key] = normalize(row[key])
    }
    return next
  }
  return value
}

export function stableStringify(value: unknown): string {
  return JSON.stringify(normalize(value))
}

export function isDirty(draft: unknown, saved: unknown): boolean {
  return stableStringify(draft) !== stableStringify(saved)
}
