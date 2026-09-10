"use client"

import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js"
import { useEffect, useRef, useState, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { CloudConfig } from "@/lib/cloud/config"
import { applyDocument, captureDocument, emptyDocument, localDocument } from "@/lib/cloud/document"
import { clearMemory, onMemoryWrite } from "@/lib/cloud/persistence"
import { JournalSync, type CloudRow, type SyncStatus } from "@/lib/cloud/sync"
import { supabaseTransport } from "@/lib/cloud/transport"

const labels: Record<SyncStatus, string> = {
  saved: "Uloženo v testovacím účtu", pending: "Čeká na uložení", saving: "Ukládám…",
  error: "Synchronizace se nezdařila. Nezavírej tuto stránku; neuložené změny si exportuj.",
  conflict: "Deník se změnil na jiném zařízení. Exportuj zdejší změny, potom načti aktuální verzi.",
}

export function CloudGate({ config, children }: { config: CloudConfig | null; children: React.ReactNode }) {
  if (!config) return children
  return <StagingGate config={config}>{children}</StagingGate>
}

function StagingGate({ config, children }: { config: CloudConfig; children: React.ReactNode }) {
  const client = useRef<SupabaseClient | null>(null)
  const engine = useRef<JournalSync | null>(null)
  const activeUser = useRef<string | null>(null)
  const generation = useRef(0)
  const [hasDocument, setHasDocument] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [phase, setPhase] = useState<"login" | "loading" | "new" | "ready" | "failed">("login")
  const [status, setStatus] = useState<SyncStatus>("saved")
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState("")

  function start(row: CloudRow, currentUser: User) {
    engine.current?.stop()
    applyDocument(row.document)
    setHasDocument(true)
    engine.current = new JournalSync(supabaseTransport(client.current!, currentUser.id), row.revision,
      captureDocument, applyDocument, setStatus)
    setStatus("saved")
    setPhase("ready")
  }

  useEffect(() => {
    clearMemory()
    const invalidate = () => { generation.current++ }
    // No auth tokens in localStorage, URLs or cookies; refresh requires signing in again.
    const sb = createClient(config.url, config.publishableKey, {
      auth: { persistSession: false, autoRefreshToken: true, detectSessionInUrl: false },
    })
    client.current = sb
    const { data: { subscription } } = sb.auth.onAuthStateChange((_event, session) => {
      const current = session?.user ?? null
      if (current?.id && current.id === activeUser.current) return
      const ticket = ++generation.current
      activeUser.current = current?.id ?? null
      engine.current?.stop()
      engine.current = null
      clearMemory()
      setHasDocument(false)
      setUser(current)
      if (!current) { setPhase("login"); setCode(""); setSent(false); return }
      setPhase("loading")
      // Do not call asynchronous Supabase auth APIs inside the auth callback.
      void Promise.resolve().then(async () => {
        try {
          const row = await supabaseTransport(sb, current.id).load()
          if (ticket !== generation.current) return
          if (row) start(row, current)
          else setPhase("new")
        } catch {
          if (ticket === generation.current) setPhase("failed")
        }
      })
    })
    const removeWriter = onMemoryWrite(() => engine.current?.changed())
    const saveTimer = window.setInterval(() => { void engine.current?.flush() }, 1500)
    const readTimer = window.setInterval(() => { void engine.current?.poll() }, 15000)
    const onFocus = () => { void engine.current?.poll() }
    const onUnload = (event: BeforeUnloadEvent) => {
      if (engine.current?.dirty) { event.preventDefault(); event.returnValue = "" }
    }
    window.addEventListener("focus", onFocus)
    window.addEventListener("beforeunload", onUnload)
    return () => {
      invalidate()
      activeUser.current = null
      engine.current?.stop()
      engine.current = null
      removeWriter()
      window.clearInterval(saveTimer)
      window.clearInterval(readTimer)
      window.removeEventListener("focus", onFocus)
      window.removeEventListener("beforeunload", onUnload)
      subscription.unsubscribe()
      sb.auth.stopAutoRefresh()
      clearMemory()
      client.current = null
    }
  }, [config.url, config.publishableKey])

  async function authenticate(event: FormEvent) {
    event.preventDefault()
    if (!client.current || busy) return
    setBusy(true); setMessage("")
    try {
      if (sent) {
        const { error } = await client.current.auth.verifyOtp({ email: email.trim(), token: code.trim(), type: "email" })
        if (error) throw error
        setCode("")
      } else {
        const { error } = await client.current.auth.signInWithOtp({ email: email.trim(), options: { shouldCreateUser: false } })
        if (error) throw error
        setSent(true)
        setMessage("Pokud máš testovací účet, zkontroluj e-mail s kódem.")
      }
    } catch { setMessage("Přihlášení se nezdařilo. Ověř e-mail, kód a přístup do testovacího účtu.") }
    finally { setBusy(false) }
  }

  async function initialize(importLocal: boolean) {
    if (!user || !client.current || busy) return
    if (importLocal && !window.confirm("Odeslat kopii lokálního deníku do tohoto testovacího účtu? Původní deník zůstane zachovaný. Použij pouze testovací data.")) return
    const ticket = generation.current
    setBusy(true); setMessage("")
    try {
      const doc = importLocal ? localDocument() : emptyDocument()
      const row = await supabaseTransport(client.current, user.id).save(doc, 0)
      if (ticket === generation.current) start(row, user)
    } catch { setMessage("Deník se nepodařilo založit. Může už existovat na jiném zařízení nebo překračovat testovací limit 4 MB. Načti aktuální verzi.") }
    finally { setBusy(false) }
  }

  function exportCopy() {
    const blob = new Blob([JSON.stringify(captureDocument(), null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url; link.download = "titan-journal-test-backup.json"; link.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  async function reloadCloud() {
    if (!user || !client.current || busy) return
    if (engine.current?.dirty && !window.confirm("Načtení zahodí zdejší neuložené změny. Máš jejich export a chceš pokračovat?")) return
    setBusy(true)
    // Freeze pending operations while loading the authoritative copy.
    engine.current?.stop()
    setPhase("loading")
    const ticket = ++generation.current
    try {
      const row = await supabaseTransport(client.current, user.id).load()
      if (ticket !== generation.current) return
      if (row) start(row, user)
      else { engine.current = null; clearMemory(); setHasDocument(false); setPhase("new") }
    } catch { if (ticket === generation.current) setPhase("failed") }
    finally { setBusy(false) }
  }

  async function signOut() {
    if (!client.current || busy) return
    if (engine.current?.dirty && !window.confirm("Odhlášení odstraní neuložené změny z paměti. Nejdřív je můžeš exportovat. Přesto se odhlásit?")) return
    setBusy(true)
    engine.current?.stop()
    ++generation.current
    clearMemory()
    setHasDocument(false)
    setPhase("login"); setUser(null); activeUser.current = null; setEmail(""); setCode(""); setSent(false); setMessage("")
    await client.current.auth.signOut({ scope: "local" })
    engine.current = null
    setBusy(false)
  }

  if (phase === "ready") return <>
    <div className="relative z-50 flex flex-wrap items-center justify-center gap-3 border-b bg-background p-3 text-xs" role="status" aria-live="polite">
      <strong>TEST · {user?.email}</strong><span>{labels[status]}</span>
      <Button size="sm" variant="outline" onClick={exportCopy}>Export kopie</Button>
      {status === "error" && <Button size="sm" variant="outline" onClick={() => { void engine.current?.flush(); void engine.current?.poll() }}>Zkusit znovu</Button>}
      {(status === "conflict" || status === "error") && <Button size="sm" variant="outline" disabled={busy} onClick={reloadCloud}>Načíst aktuální verzi</Button>}
      <Button size="sm" variant="outline" disabled={busy} onClick={signOut}>Odhlásit</Button>
    </div>
    {/* Read-only after conflict; preserve the local version for export. */}
    <div inert={status === "conflict" || busy}>{children}</div>
  </>

  return <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-5 p-6">
    <p className="text-xs font-semibold uppercase tracking-widest">TITAN Journal · soukromý test</p>
    <h1 className="text-2xl font-semibold">Deník na PC i mobilu</h1>
    <p className="text-sm text-muted-foreground">Používej pouze testovací data. Původní lokální deník se nemění. Po obnovení stránky se znovu přihlásíš.</p>
    {phase === "login" && <form onSubmit={authenticate} className="space-y-4">
      <label className="block text-sm">E-mail testovacího účtu<Input required type="email" autoComplete="email" value={email} disabled={sent || busy} onChange={(e) => setEmail(e.target.value)} /></label>
      {sent && <label className="block text-sm">Kód z e-mailu<Input required inputMode="numeric" autoComplete="one-time-code" value={code} disabled={busy} onChange={(e) => setCode(e.target.value)} /></label>}
      <Button disabled={busy} type="submit">{busy ? "Čekej…" : sent ? "Přihlásit" : "Poslat přihlašovací kód"}</Button>
      {sent && <Button type="button" variant="outline" disabled={busy} onClick={() => { setSent(false); setCode(""); setMessage("") }}>Změnit e-mail / nový kód</Button>}
    </form>}
    {phase === "loading" && <p role="status">Načítám tvůj testovací deník…</p>}
    {phase === "new" && <div className="space-y-3">
      <p>Účet zatím nemá cloudový deník.</p>
      <Button disabled={busy} onClick={() => initialize(false)}>Založit prázdný testovací deník</Button>
      <Button disabled={busy} variant="outline" onClick={() => initialize(true)}>Přenést kopii lokálního deníku</Button>
      <Button disabled={busy} variant="outline" onClick={reloadCloud}>Načíst aktuální verzi</Button>
    </div>}
    {phase === "failed" && <div className="space-y-3">
      <p role="alert">Cloud se nepodařilo načíst. Lokální data nebyla přepsána.</p>
      <Button disabled={busy} onClick={reloadCloud}>Zkusit znovu</Button>
      {hasDocument && <Button variant="outline" onClick={exportCopy}>Export kopie z paměti</Button>}
    </div>}
    {user && <Button disabled={busy} variant="outline" onClick={signOut}>Odhlásit</Button>}
    {message && <p role="status" className="text-sm">{message}</p>}
  </main>
}
