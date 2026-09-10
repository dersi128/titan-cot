import { afterEach, describe, expect, it, vi } from "vitest"
import { stagingCloudConfig } from "./config"
import { clearMemory, installMemory, readPersisted, writePersisted } from "./persistence"
import { createLocalStorageRepository, TRADES_STORAGE_KEY } from "@/lib/storage"
import { MOCK_TRADES } from "@/lib/mock-data"

const env = { TITAN_SYNC_MODE: "staging", TITAN_STAGING_PROJECT_REF: "a".repeat(20), TITAN_STAGING_SUPABASE_URL: `https://${"a".repeat(20)}.supabase.co`, TITAN_STAGING_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_test" }
afterEach(() => { clearMemory(); vi.unstubAllGlobals() })
describe("staging privacy boundaries", () => {
  it("is off by default and refuses production", () => {
    expect(stagingCloudConfig({})).toBeNull()
    expect(() => stagingCloudConfig({ ...env, VERCEL_ENV: "production" })).toThrow()
    expect(stagingCloudConfig(env)?.publishableKey).toBe("sb_publishable_test")
  })
  it("rejects secret keys and a mismatched project", () => {
    expect(() => stagingCloudConfig({ ...env, TITAN_STAGING_SUPABASE_PUBLISHABLE_KEY: "sb_secret_test" })).toThrow()
    expect(() => stagingCloudConfig({ ...env, TITAN_STAGING_SUPABASE_URL: "https://other.supabase.co" })).toThrow()
  })
  it("does not overwrite or reveal the original local journal in cloud mode", () => {
    const setItem = vi.fn()
    vi.stubGlobal("window", { localStorage: { getItem: () => "private-local-data", setItem }, addEventListener() {}, removeEventListener() {} })
    installMemory({ test: "user-A" })
    expect(readPersisted("missing")).toBeNull()
    writePersisted("test", "changed")
    expect(readPersisted("test")).toBe("changed")
    expect(setItem).not.toHaveBeenCalled()
    clearMemory()
    expect(readPersisted("test")).toBeNull()
  })
  it("invalidates cached trades when switching accounts and signing out", () => {
    vi.stubGlobal("window", { localStorage: { getItem: () => null, setItem() {} }, addEventListener() {}, removeEventListener() {} })
    const repo = createLocalStorageRepository()
    installMemory({ [TRADES_STORAGE_KEY]: JSON.stringify([{ ...MOCK_TRADES[0], id: "A" }]) })
    expect(repo.getAll()[0].id).toBe("A")
    installMemory({ [TRADES_STORAGE_KEY]: JSON.stringify([{ ...MOCK_TRADES[0], id: "B" }]) })
    expect(repo.getAll().map((t) => t.id)).toEqual(["B"])
    clearMemory()
    expect(repo.getAll()).toEqual([])
  })
})
