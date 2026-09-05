import {
  PLAYBOOK_FIELD_TYPES,
  type Playbook,
  type PlaybookField,
  type PlaybookFieldType,
  type TradeFieldValue,
} from "@/types/playbook"

export const TITAN_SWING_PLAYBOOK_ID = "pb-titan-swing"
export const DEMO_PLAYBOOK_ID = TITAN_SWING_PLAYBOOK_ID
export const DEMO_PLAYBOOK_NAME = "Demo"
export const SWING_PLAYBOOK_NAME = DEMO_PLAYBOOK_NAME
export const LEGACY_SWING_PLAYBOOK_NAME = "TITAN Swing"
const LEGACY_DEMO_NAMES = new Set(["TITAN Swing", "Swing"])

export function normalizePlaybookName(id: string, name: string): string {
  if (id === TITAN_SWING_PLAYBOOK_ID && LEGACY_DEMO_NAMES.has(name.trim())) {
    return DEMO_PLAYBOOK_NAME
  }
  return name
}

export function normalizeStrategyName(name: string): string {
  return LEGACY_DEMO_NAMES.has(name.trim()) ? DEMO_PLAYBOOK_NAME : name
}

export const PLAYBOOK_COLORS = [
  "#5ba8ff",
  "#2f9e6a",
  "#e85d6c",
  "#c9a227",
  "#9b7bff",
] as const

export const TITAN_FIELD_IDS = {
  trend: "titan-trend",
  location: "titan-location",
  zone: "titan-zone",
  grade: "titan-grade",
  cot: "titan-cot",
} as const

function field(
  id: string,
  name: string,
  type: PlaybookFieldType,
  options: readonly string[],
  order: number
): PlaybookField {
  return { id, name, type, options: [...options], order }
}

export function createDemoPlaybook(): Playbook {
  return {
    id: DEMO_PLAYBOOK_ID,
    name: DEMO_PLAYBOOK_NAME,
    description: "Example only. Add your own fields, or create a new playbook.",
    color: "#5ba8ff",
    icon: null,
    status: "active",
    createdAt: "2026-01-01T00:00:00.000Z",
    fields: [
      field("demo-setup", "Setup", "select", ["Breakout", "Pullback"], 0),
      field("demo-session", "Session", "select", ["London", "NY"], 1),
    ],
  }
}

export const createTitanSwingPlaybook = createDemoPlaybook

export function isLegacyTitanFactory(playbook: Playbook): boolean {
  return (
    playbook.id === TITAN_SWING_PLAYBOOK_ID &&
    playbook.fields.some((item) => item.id === TITAN_FIELD_IDS.trend)
  )
}

export function emptyPlaybook(partial?: Partial<Playbook>): Playbook {
  return {
    id: crypto.randomUUID(),
    name: "",
    description: "",
    color: null,
    icon: null,
    status: "active",
    fields: [],
    createdAt: new Date().toISOString(),
    ...partial,
  }
}

export function emptyField(order: number): PlaybookField {
  return {
    id: crypto.randomUUID(),
    name: "",
    type: "select",
    options: [],
    order,
  }
}

export function isPlaybookFieldType(value: unknown): value is PlaybookFieldType {
  return (
    typeof value === "string" &&
    (PLAYBOOK_FIELD_TYPES as readonly string[]).includes(value)
  )
}

export function sortedFields(playbook: Playbook): PlaybookField[] {
  return playbook.fields.slice().sort((a, b) => a.order - b.order)
}

export function moveField(
  fields: PlaybookField[],
  fieldId: string,
  direction: -1 | 1
): PlaybookField[] {
  const ordered = fields.slice().sort((a, b) => a.order - b.order)
  const index = ordered.findIndex((field) => field.id === fieldId)
  const next = index + direction
  if (index < 0 || next < 0 || next >= ordered.length) return ordered
  const copy = ordered.slice()
  const [item] = copy.splice(index, 1)
  copy.splice(next, 0, item)
  return copy.map((field, order) => ({ ...field, order }))
}

export function fieldValueMap(
  values: TradeFieldValue[] | undefined
): Record<string, TradeFieldValue["value"]> {
  const map: Record<string, TradeFieldValue["value"]> = {}
  for (const row of values ?? []) {
    map[row.fieldId] = row.value
  }
  return map
}

export function upsertFieldValue(
  values: TradeFieldValue[],
  fieldId: string,
  value: TradeFieldValue["value"]
): TradeFieldValue[] {
  const next = values.filter((row) => row.fieldId !== fieldId)
  next.push({ fieldId, value })
  return next
}

export function formatFieldValue(
  field: PlaybookField,
  value: TradeFieldValue["value"],
  yesNo: { YES: string; NO: string } = { YES: "Yes", NO: "No" }
): string {
  if (value == null || value === "") return ""
  if (field.type === "yes_no") {
    return value === true || value === "Yes" ? yesNo.YES : yesNo.NO
  }
  if (Array.isArray(value)) return value.join(", ")
  return String(value)
}

export function playbookHasValues(
  playbook: Playbook | undefined,
  values: TradeFieldValue[] | undefined
): boolean {
  if (!playbook || !values?.length) return false
  const ids = new Set(playbook.fields.map((field) => field.id))
  return values.some((row) => {
    if (!ids.has(row.fieldId)) return false
    if (row.value == null || row.value === "") return false
    if (Array.isArray(row.value) && row.value.length === 0) return false
    return true
  })
}

export function activePlaybooks(playbooks: Playbook[]): Playbook[] {
  return playbooks.filter((playbook) => playbook.status === "active")
}
