import type { CotDashboardData } from "../types";
import { normalizeCotDashboardData } from "../lib/titanCotScore";

const DEFAULT_API = "";
const RENDER_API = "https://titan-cot.onrender.com";

/**
 * API base for COT / seasonality / macro.
 * Browser always uses same-origin (`/api/...`) so Vite/Vercel proxy → Render.
 * That avoids CORS failures when VITE_COT_API_URL points at onrender.com.
 * Absolute URL is only for local cot-data-module (localhost) or non-browser tooling.
 */
export function getCotApiBase(): string {
  const fromEnv = import.meta.env.VITE_COT_API_URL?.trim().replace(/\/$/, "") ?? "";

  if (fromEnv && /localhost|127\.0\.0\.1/i.test(fromEnv)) {
    return fromEnv;
  }

  if (typeof window !== "undefined") {
    return "";
  }

  if (fromEnv) return fromEnv;
  return DEFAULT_API;
}

export function describeCotApiTarget(): string {
  const fromEnv = import.meta.env.VITE_COT_API_URL?.trim().replace(/\/$/, "") ?? "";
  if (fromEnv && /localhost|127\.0\.0\.1/i.test(fromEnv)) {
    return fromEnv;
  }
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") {
      return "Vite proxy → titan-cot.onrender.com";
    }
    return `${window.location.origin} → proxy na Render`;
  }
  if (fromEnv) return fromEnv;
  return RENDER_API;
}

export type CotUnavailableResponse = {
  status: "unsupported" | "mapped_not_connected";
  futuresSymbol?: string;
  displayName?: string;
  message?: string;
  error?: string;
};

export type CotLoadResult =
  | { status: "connected"; data: CotDashboardData }
  | {
      status: "unsupported" | "mapped_not_connected";
      data: null;
      message: string;
      displayName?: string;
    };

export async function loadCotDataForMarket(futuresSymbol: string): Promise<CotLoadResult> {
  const response = await fetch(
    `${getCotApiBase()}/api/cot/${encodeURIComponent(futuresSymbol)}`,
  );

  if (response.status === 404 || response.status === 501) {
    const payload = (await response.json()) as CotUnavailableResponse;
    return {
      status: payload.status,
      data: null,
      message: payload.message ?? payload.error ?? "COT data not connected yet for this market.",
      displayName: payload.displayName,
    };
  }

  if (!response.ok) {
    throw new Error(`Failed to load COT data: ${response.status}`);
  }

  const raw = (await response.json()) as CotDashboardData;
  return {
    status: "connected",
    data: normalizeCotDashboardData(raw),
  };
}

/** Preferred for production: one HTTP call + server-side cache. */
export async function loadAllMappedCotData(
  mappings: readonly { futuresSymbol: string }[],
): Promise<{
  bundle: Record<string, CotDashboardData>;
  errors: Record<string, string>;
}> {
  const symbols = mappings.map((m) => m.futuresSymbol).join(",");
  const response = await fetch(
    `${getCotApiBase()}/api/cot/bundle?symbols=${encodeURIComponent(symbols)}`,
  );

  if (!response.ok) {
    throw new Error(
      `COT API ${describeCotApiTarget()} → ${response.status}. Zkontroluj VITE_COT_API_URL=https://titan-cot.onrender.com nebo redeploy s vercel.json proxy.`,
    );
  }

  const payload = (await response.json()) as {
    bundle: Record<string, CotDashboardData>;
    errors: Record<string, string>;
  };

  const bundle: Record<string, CotDashboardData> = {};
  for (const [sym, row] of Object.entries(payload.bundle ?? {})) {
    try {
      bundle[sym] = normalizeCotDashboardData(row);
    } catch {
      bundle[sym] = row;
    }
  }

  return {
    bundle,
    errors: payload.errors ?? {},
  };
}
