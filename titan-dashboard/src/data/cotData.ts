import type { CotDashboardData } from "../types";

const DEFAULT_API = "http://localhost:3000";
const RENDER_API = "https://titan-cot.onrender.com";

/** Set in Vercel: VITE_COT_API_URL=https://titan-cot.onrender.com (no trailing slash) */
export function getCotApiBase(): string {
  const fromEnv = import.meta.env.VITE_COT_API_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  if (import.meta.env.PROD && typeof window !== "undefined") {
    return window.location.origin;
  }
  return DEFAULT_API;
}

export function describeCotApiTarget(): string {
  const base = getCotApiBase();
  if (base === DEFAULT_API) return "localhost:3000 (spusť cot-data-module)";
  if (base === RENDER_API || base.includes("onrender.com")) return base;
  if (typeof window !== "undefined" && base === window.location.origin) {
    return `${base} → proxy na Render`;
  }
  return base;
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

  return {
    status: "connected",
    data: (await response.json()) as CotDashboardData,
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

  return {
    bundle: payload.bundle ?? {},
    errors: payload.errors ?? {},
  };
}
