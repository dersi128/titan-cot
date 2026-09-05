import { describe, expect, it } from "vitest"

import {
  emptyPlaybook,
  fallbackPlaybookId,
  fieldValueKeys,
  withoutPlaybook,
} from "@/lib/playbooks"
import type { PlaybookField } from "@/types/playbook"

describe("playbook delete helpers", () => {
  it("removes a playbook by id", () => {
    const keep = emptyPlaybook({ id: "pb-keep", name: "Keep" })
    const gone = emptyPlaybook({ id: "pb-gone", name: "Gone" })
    expect(withoutPlaybook([keep, gone], "pb-gone")).toEqual([keep])
  })

  it("falls back to the first active playbook when the default is gone", () => {
    const archived = emptyPlaybook({
      id: "pb-old",
      name: "Old",
      status: "archived",
    })
    const live = emptyPlaybook({ id: "pb-live", name: "Live" })
    expect(fallbackPlaybookId([archived, live], "pb-gone")).toBe("pb-live")
    expect(fallbackPlaybookId([archived, live], "pb-live")).toBe("pb-live")
    expect(fallbackPlaybookId([], "pb-gone")).toBe("")
  })
})

describe("field value keys", () => {
  const select: PlaybookField = {
    id: "s",
    name: "Setup",
    type: "select",
    options: ["Breakout"],
    order: 0,
  }
  const yesNo: PlaybookField = {
    id: "y",
    name: "HQ",
    type: "yes_no",
    options: [],
    order: 0,
  }
  const text: PlaybookField = {
    id: "t",
    name: "Note",
    type: "text",
    options: [],
    order: 0,
  }

  it("keeps select and yes/no keys, skips text and empty values", () => {
    expect(fieldValueKeys(select, "Breakout")).toEqual(["Breakout"])
    expect(fieldValueKeys(yesNo, true)).toEqual(["Yes"])
    expect(fieldValueKeys(yesNo, "No")).toEqual(["No"])
    expect(fieldValueKeys(text, "hello")).toEqual([])
    expect(fieldValueKeys(select, null)).toEqual([])
  })
})
