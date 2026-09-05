import { describe, expect, it } from "vitest"

import {
  emptyPlaybook,
  fallbackPlaybookId,
  withoutPlaybook,
} from "@/lib/playbooks"

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
