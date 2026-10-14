import {
  listBranchCotMappings,
  loadBranchCotBundle,
  loadBranchCotDashboard,
  RENDER_COT_ORIGIN,
} from "./cotPreviewBackend";
import { COT_MARKET_MAPPINGS, getCotMarketMapping } from "./cotMarketMap";

export const config = { runtime: "nodejs", maxDuration: 60 };

const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
};

function vercelEnv(): string | undefined {
  return (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env?.VERCEL_ENV;
}

function isVercelProduction(): boolean {
  return vercelEnv() === "production";
}

function json(status: number, body: unknown, backend: "branch-preview" | "render"): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...JSON_HEADERS, "x-titan-cot-backend": backend },
  });
}

function cotPath(pathname: string): string {
  const marker = "/api/cot/";
  const i = pathname.indexOf(marker);
  if (i >= 0) return decodeURIComponent(pathname.slice(i + marker.length));
  if (pathname.endsWith("/api/cot")) return "";
  return pathname.replace(/^\//, "");
}

async function proxyProduction(request: Request): Promise<Response> {
  const incoming = new URL(request.url);
  const target = `${RENDER_COT_ORIGIN}${incoming.pathname}${incoming.search}`;
  const upstream = await fetch(target, {
    method: request.method,
    headers: { accept: "application/json" },
    cache: "no-store",
  });
  const body = await upstream.arrayBuffer();
  const headers = new Headers(JSON_HEADERS);
  const contentType = upstream.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);
  headers.set("x-titan-cot-backend", "render");
  return new Response(body, { status: upstream.status, headers });
}

async function handlePreview(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const path = cotPath(url.pathname);
  const head = path.split("/")[0] ?? "";

  if (head === "mappings") {
    return json(200, { mappings: listBranchCotMappings() }, "branch-preview");
  }

  if (head === "bundle") {
    const raw = url.searchParams.get("symbols");
    const symbols =
      raw && raw.length > 0 ? raw.split(",").map((s) => s.trim()) : COT_MARKET_MAPPINGS.map((m) => m.futuresSymbol);
    return json(200, await loadBranchCotBundle(symbols), "branch-preview");
  }

  if (head === "gold") {
    return json(200, await loadBranchCotDashboard("GC1!"), "branch-preview");
  }

  if (!head) {
    return json(404, { error: "Missing COT symbol." }, "branch-preview");
  }

  const mapping = getCotMarketMapping(head);
  if (!mapping) {
    return json(
      404,
      {
        status: "unsupported",
        error: "No COT mapping exists for this futures market.",
        mappings: listBranchCotMappings(),
      },
      "branch-preview",
    );
  }

  return json(200, await loadBranchCotDashboard(mapping.futuresSymbol), "branch-preview");
}

async function handleCotRequest(request: Request): Promise<Response> {
  try {
    if (isVercelProduction()) return await proxyProduction(request);
    return await handlePreview(request);
  } catch (error) {
    const message = error instanceof Error ? error.message : "COT preview backend failed.";
    return json(500, { error: message }, "branch-preview");
  }
}

type NodeReq = {
  url?: string;
  method?: string;
  headers: Record<string, string | string[] | undefined>;
};

type NodeRes = {
  statusCode: number;
  setHeader: (name: string, value: string) => void;
  end: (body?: unknown) => void;
};

function isNodeResponse(value: unknown): value is NodeRes {
  return Boolean(value && typeof value === "object" && typeof (value as NodeRes).end === "function");
}

function requestFromNode(req: NodeReq): Request {
  const host = String(req.headers.host ?? "localhost");
  const proto = String(req.headers["x-forwarded-proto"] ?? "https");
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (typeof value === "string") headers.set(key, value);
    else if (Array.isArray(value)) headers.set(key, value.join(", "));
  }
  return new Request(`${proto}://${host}${req.url ?? "/"}`, {
    method: req.method ?? "GET",
    headers,
  });
}

async function writeNodeResponse(res: NodeRes, response: Response): Promise<void> {
  res.statusCode = response.status;
  response.headers.forEach((value, key) => res.setHeader(key, value));
  res.end(await response.text());
}

/** Web handler (fetch / GET). */
export async function GET(request: Request): Promise<Response> {
  return handleCotRequest(request);
}

/**
 * Vercel Node functions call `export default (req, res)`.
 * A returned `Response` is ignored, so preview hung until the 60s timeout.
 */
export default async function handler(req: Request | NodeReq, res?: NodeRes): Promise<Response | void> {
  if (isNodeResponse(res)) {
    await writeNodeResponse(res, await handleCotRequest(requestFromNode(req as NodeReq)));
    return;
  }
  return handleCotRequest(req as Request);
}
