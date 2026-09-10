export type CloudConfig = { url: string; publishableKey: string }

/** Explicit opt-in, refused on Vercel production. Never pass a secret key to React. */
export function stagingCloudConfig(env: Record<string, string | undefined>): CloudConfig | null {
  if (env.TITAN_SYNC_MODE !== "staging") return null
  if (env.VERCEL_ENV === "production") throw new Error("Staging sync cannot run in production")
  const ref = env.TITAN_STAGING_PROJECT_REF ?? ""
  const url = env.TITAN_STAGING_SUPABASE_URL ?? ""
  const publishableKey = env.TITAN_STAGING_SUPABASE_PUBLISHABLE_KEY ?? ""
  if (!/^[a-z0-9]{20}$/.test(ref) || url !== `https://${ref}.supabase.co` ||
      !publishableKey.startsWith("sb_publishable_")) {
    throw new Error("Invalid staging sync configuration. Use a separate test project and a publishable key.")
  }
  return { url, publishableKey }
}
