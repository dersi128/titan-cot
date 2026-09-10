import type { JournalBackup } from "@/lib/journal-backup"

export type CloudRow = { revision: number; document: JournalBackup }
export type SyncStatus = "saved" | "pending" | "saving" | "error" | "conflict"
export interface CloudTransport {
  load(): Promise<CloudRow | null>
  save(document: JournalBackup, revision: number): Promise<CloudRow>
}
export class SyncConflict extends Error {}

/** Whole-document staging sync with optimistic locking; never silently overwrites another device. */
export class JournalSync {
  private revision: number
  private changes = 0
  private acknowledged = 0
  private busy = false
  private stopped = false
  private conflict = false
  constructor(private transport: CloudTransport, revision: number,
    private capture: () => JournalBackup, private apply: (doc: JournalBackup) => void,
    private status: (status: SyncStatus) => void) { this.revision = revision }
  get dirty() { return this.changes !== this.acknowledged }
  stop() { this.stopped = true }
  changed() { if (!this.stopped) { this.changes++; this.status(this.conflict ? "conflict" : "pending") } }
  async flush() {
    if (this.stopped || this.busy || this.conflict || !this.dirty) return
    this.busy = true
    const sent = this.changes
    this.status("saving")
    try {
      const row = await this.transport.save(this.capture(), this.revision)
      if (this.stopped) return
      this.revision = row.revision
      this.acknowledged = sent
      this.status(this.dirty ? "pending" : "saved")
    } catch (error) {
      if (this.stopped) return
      this.conflict = error instanceof SyncConflict
      this.status(this.conflict ? "conflict" : "error")
    } finally { this.busy = false }
  }
  async poll() {
    if (this.stopped || this.busy || this.dirty || this.conflict) return
    this.busy = true
    try {
      const row = await this.transport.load()
      if (this.stopped) return
      if (!row) throw new Error("Cloud journal missing")
      if (row.revision !== this.revision) {
        if (this.dirty) { this.conflict = true; this.status("conflict"); return }
        this.apply(row.document)
        this.revision = row.revision
      }
      this.status(this.dirty ? "pending" : "saved")
    } catch { if (!this.stopped) this.status("error") }
    finally { this.busy = false }
  }
}
