import { NextResponse } from "next/server"

import {
  applyCotAsOf,
  compactCotFromApi,
  cotApiBaseUrl,
  resolveCotLink,
} from "@/lib/cot-link"

export const dynamic = "force-dynamic"

const CACHE_TTL_MS = 15 * 60 * 1000
const FETCH_TIMEOUT_MS = 12_000

const cache = new Map<string, { at: number; payload: unknown }>()

export function resetCotCache() {
  cache.clear()
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const symbol = url.searchParams.get("symbol") ?? ""
  const asOf = url.searchParams.get("date") ?? ""
  const link = resolveCotLink(symbol)
  if (!link) {
    return NextResponse.json(
      { ok: false, error: "unsupported" },
      { status: 404 }
    )
  }

  const hit = cache.get(link.slug)
  let payload = hit && Date.now() - hit.at < CACHE_TTL_MS ? hit.payload : null

  if (payload == null) {
    try {
      const response = await fetch(
        `${cotApiBaseUrl()}/api/cot/${encodeURIComponent(link.slug)}`,
        {
          signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
          cache: "no-store",
        }
      )
      if (!response.ok) {
        return NextResponse.json(
          { ok: false, error: "unavailable" },
          { status: 502 }
        )
      }
      payload = await response.json()
      cache.set(link.slug, { at: Date.now(), payload })
    } catch {
      return NextResponse.json(
        { ok: false, error: "unavailable" },
        { status: 502 }
      )
    }
  }

  const compact = compactCotFromApi(symbol, link, applyCotAsOf(payload, asOf))
  if (!compact) {
    return NextResponse.json(
      { ok: false, error: "unavailable" },
      { status: 502 }
    )
  }

  return NextResponse.json(compact)
}
