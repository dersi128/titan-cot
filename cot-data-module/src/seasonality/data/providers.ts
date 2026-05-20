import type { OhlcDataProvider, OhlcProviderId } from "./types.js";
import { mockOhlcProvider } from "./mockOhlcProvider.js";

const registry = new Map<OhlcProviderId, OhlcDataProvider>([["mock", mockOhlcProvider]]);

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
