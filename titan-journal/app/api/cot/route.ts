import { NextResponse } from "next/server"

import {
  compactCotFromApi,
  cotApiBaseUrl,
  resolveCotLink,
} from "@/lib/cot-link"

export const dynamic = "force-dynamic"

const CACHE_TTL_MS = 15 * 60 * 1000
const FETCH_TIMEOUT_MS = 12_000

const cache = new Map<string, { at: number; body: unknown }>()

export async function GET(request: Request) {
  const symbol = new URL(request.url).searchParams.get("symbol") ?? ""
  const link = resolveCotLink(symbol)
  if (!link) {
    return NextResponse.json(
      { ok: false, error: "unsupported" },
      { status: 404 }
    )
  }

  const hit = cache.get(link.slug)
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) {
    return NextResponse.json(hit.body)
  }

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

    const payload: unknown = await response.json()
    const compact = compactCotFromApi(symbol, link, payload)
    if (!compact) {
      return NextResponse.json(
        { ok: false, error: "unavailable" },
        { status: 502 }
      )
    }

    cache.set(link.slug, { at: Date.now(), body: compact })
    return NextResponse.json(compact)
  } catch {
    return NextResponse.json(
      { ok: false, error: "unavailable" },
      { status: 502 }
    )
  }
}
