/** Cloud workspaces live only in memory. Existing local journals are never overwritten. */
let memory: Map<string, string> | null = null
const readers = new Set<() => void>()
const writers = new Set<() => void>()

export function readPersisted(key: string): string | null {
  if (memory) return memory.get(key) ?? null
  if (typeof window === "undefined") return null
  return window.localStorage.getItem(key)
}
export function writePersisted(key: string, value: string) {
  if (memory) {
    if (memory.get(key) === value) return
    memory.set(key, value)
    writers.forEach((fn) => fn())
  } else if (typeof window !== "undefined") {
    window.localStorage.setItem(key, value)
  }
}
export function subscribePersisted(fn: () => void) {
  readers.add(fn)
  const onStorage = () => { if (!memory) fn() }
  if (typeof window !== "undefined") window.addEventListener("storage", onStorage)
  return () => {
    readers.delete(fn)
    if (typeof window !== "undefined") window.removeEventListener("storage", onStorage)
  }
}
export function installMemory(values: Record<string, string>) {
  memory = new Map(Object.entries(values))
  readers.forEach((fn) => fn())
}
export function clearMemory() {
  // Remain in isolated mode while signed out. Do not fall back to local data.
  installMemory({})
}
export function onMemoryWrite(fn: () => void) {
  writers.add(fn)
  return () => { writers.delete(fn) }
}
