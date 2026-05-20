import type { OhlcDataProvider, OhlcProviderId } from "./types";
import { mockOhlcProvider } from "./mockOhlcProvider";

const registry = new Map<OhlcProviderId, OhlcDataProvider>([["mock", mockOhlcProvider]]);

/** Register a live data provider (Yahoo, TwelveData, Polygon, CSV, API). */
export function registerOhlcProvider(provider: OhlcDataProvider): void {
  registry.set(provider.id, provider);
}

export function getOhlcProvider(id: OhlcProviderId = "mock"): OhlcDataProvider {
  const p = registry.get(id);
  if (!p) {
    throw new Error(`OHLC provider not registered: ${id}`);
  }
  return p;
}

export function listOhlcProviders(): OhlcDataProvider[] {
  return Array.from(registry.values());
}
