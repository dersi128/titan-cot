/**
 * Clerk Frontend API proxy for Production on *.vercel.app.
 * Browser → /__clerk/* → rewrite → /api/clerk-proxy/*
 * Forwards to frontend-api.clerk.dev with required Clerk proxy headers.
 */
export const config = { runtime: "edge" };

const FAPI_ORIGIN = "https://frontend-api.clerk.dev";
const PROXY_URL = "https://titan-cot.vercel.app/__clerk";

function clientIp(req: Request): string {
  const vercel = req.headers.get("x-vercel-forwarded-for");
  if (vercel) return vercel.split(",")[0]!.trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return "0.0.0.0";
}

function upstreamPath(pathname: string): string {
  const markers = ["/api/clerk-proxy/", "/__clerk/"];
  for (const marker of markers) {
    const i = pathname.indexOf(marker);
    if (i >= 0) return pathname.slice(i + marker.length);
  }
  if (pathname.endsWith("/api/clerk-proxy") || pathname.endsWith("/__clerk")) return "";
  return pathname.replace(/^\//, "");
}

export default async function handler(req: Request): Promise<Response> {
  const secret = process.env.CLERK_SECRET_KEY?.trim();
  if (!secret) {
    return new Response("CLERK_SECRET_KEY is not configured on Vercel", { status: 500 });
  }

  const incoming = new URL(req.url);
  const path = upstreamPath(incoming.pathname);
  const target = `${FAPI_ORIGIN}/${path}${incoming.search}`;

  const headers = new Headers(req.headers);
  headers.delete("host");
  headers.delete("connection");
  headers.set("Clerk-Proxy-Url", PROXY_URL);
  headers.set("Clerk-Secret-Key", secret);
  headers.set("X-Forwarded-For", clientIp(req));

  const init: RequestInit = {
    method: req.method,
    headers,
    redirect: "manual",
  };

  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = req.body;
    Object.assign(init, { duplex: "half" });
  }

  const upstream = await fetch(target, init);
  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: new Headers(upstream.headers),
  });
}
