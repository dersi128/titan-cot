import { describe, expect, it, vi } from "vitest"
import { JournalSync, SyncConflict, type CloudRow, type CloudTransport } from "./sync"
import type { JournalBackup } from "@/lib/journal-backup"

const document = { app: "titan-journal", version: 1 } as JournalBackup
const row = (revision: number): CloudRow => ({ revision, document })
function setup(transport: CloudTransport) {
  const apply = vi.fn(), status = vi.fn()
  const sync = new JournalSync(transport, 1, () => document, apply, status)
  return { sync, apply, status }
}
describe("private staging synchronization", () => {
  it("never writes just because a device connects", async () => {
    const transport = { load: vi.fn().mockResolvedValue(row(1)), save: vi.fn() }
    const { sync } = setup(transport)
    await sync.flush(); await sync.poll()
    expect(transport.save).not.toHaveBeenCalled()
  })
  it("retains edits made while a save is in flight", async () => {
    let finish!: (row: CloudRow) => void
    const transport = { load: vi.fn(), save: vi.fn().mockImplementationOnce(() => new Promise<CloudRow>((resolve) => { finish = resolve })).mockResolvedValueOnce(row(3)) }
    const { sync, status } = setup(transport)
    sync.changed(); const pending = sync.flush(); sync.changed()
    finish(row(2)); await pending
    expect(sync.dirty).toBe(true)
    expect(status).toHaveBeenLastCalledWith("pending")
    await sync.flush()
    expect(transport.save).toHaveBeenLastCalledWith(document, 2)
    expect(sync.dirty).toBe(false)
  })
  it("preserves local work on conflict and stops retrying writes", async () => {
    const transport = { load: vi.fn(), save: vi.fn().mockRejectedValue(new SyncConflict()) }
    const { sync, status, apply } = setup(transport)
    sync.changed(); await sync.flush(); await sync.flush(); await sync.poll()
    expect(sync.dirty).toBe(true)
    expect(status).toHaveBeenLastCalledWith("conflict")
    expect(apply).not.toHaveBeenCalled()
    expect(transport.save).toHaveBeenCalledTimes(1)
    expect(transport.load).not.toHaveBeenCalled()
  })
  it("does not overwrite an edit made while a remote read is pending", async () => {
    let finish!: (row: CloudRow) => void
    const { sync, apply, status } = setup({ load: () => new Promise((resolve) => { finish = resolve }), save: vi.fn() })
    const pending = sync.poll(); sync.changed(); finish(row(2)); await pending
    expect(apply).not.toHaveBeenCalled()
    expect(status).toHaveBeenLastCalledWith("conflict")
  })
  it("ignores late responses after logout / account switch", async () => {
    let finish!: (row: CloudRow) => void
    const { sync, apply } = setup({ load: () => new Promise((resolve) => { finish = resolve }), save: vi.fn() })
    const pending = sync.poll(); sync.stop(); finish(row(5)); await pending
    expect(apply).not.toHaveBeenCalled()
  })
  it("keeps offline changes and reports failure instead of saved", async () => {
    const { sync, status } = setup({ load: vi.fn(), save: vi.fn().mockRejectedValue(new Error("offline")) })
    sync.changed(); await sync.flush()
    expect(sync.dirty).toBe(true)
    expect(status).toHaveBeenLastCalledWith("error")
  })
  it("loads remote updates when there is no local work", async () => {
    const { sync, apply } = setup({ load: vi.fn().mockResolvedValue(row(2)), save: vi.fn() })
    await sync.poll()
    expect(apply).toHaveBeenCalledWith(document)
  })
})
