import type { OhlcBar } from "../types";

export type OhlcProviderId = "mock" | "yahoo" | "twelvedata" | "polygon" | "csv" | "api";

export type OhlcFetchOptions = {
  /** Years of history (default 15). */
  years?: number;
};

export interface OhlcDataProvider {
  readonly id: OhlcProviderId;
  readonly label: string;
  fetchDailyOHLC(symbol: string, options?: OhlcFetchOptions): Promise<OhlcBar[]>;
}
