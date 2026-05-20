import type { OhlcBar } from "../types.js";

export type OhlcProviderId = "mock" | "yahoo" | "twelvedata" | "polygon" | "csv" | "api";

export type OhlcFetchOptions = {
  years?: number;
};

export interface OhlcDataProvider {
  readonly id: OhlcProviderId;
  readonly label: string;
  fetchDailyOHLC(symbol: string, options?: OhlcFetchOptions): Promise<OhlcBar[]>;
}
