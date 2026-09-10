import type { SupabaseClient } from "@supabase/supabase-js"
import { validateDocument } from "./document"
import { SyncConflict, type CloudRow, type CloudTransport } from "./sync"

export function supabaseTransport(client: SupabaseClient, userId: string): CloudTransport {
  function decode(raw: unknown): CloudRow {
    const row = raw as CloudRow
    if (!row || !Number.isSafeInteger(row.revision) || row.revision < 1) throw new Error("Invalid revision")
    return { revision: row.revision, document: validateDocument(row.document) }
  }
  return {
    async load() {
      const { data, error } = await client.from("journal_sync_staging").select("revision,document").eq("user_id", userId).maybeSingle()
      if (error) throw new Error("Cloud read failed")
      return data ? decode(data) : null
    },
    async save(document, revision) {
      validateDocument(document)
      const { data, error } = await client.rpc("save_journal_staging", { expected_revision: revision, next_document: document })
      if (error?.code === "40001") throw new SyncConflict("Changed on another device")
      if (error) throw new Error("Cloud write failed")
      return decode(data)
    },
  }
}
