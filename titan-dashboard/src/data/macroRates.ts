import { getCotApiBase } from "./cotData";

export type FredSeriesPoint = {
  date: string;
  value: number;
};

export type FredSeriesSnapshot = {
  seriesId: string;
  label: string;
  unit: "%";
  latest: FredSeriesPoint | null;
  previous: FredSeriesPoint | null;
  change: number | null;
  change1w?: number | null;
  change1m?: number | null;
  change1y: number | null;
  spark: number[];
  history: FredSeriesPoint[];
};

export type MacroRatesResponse = {
  status: "ok" | "unconfigured" | "error";
  source: "fred";
  updatedAt: string | null;
  message?: string;
  fedFunds: FredSeriesSnapshot | null;
  yield2y: FredSeriesSnapshot | null;
  yield5y?: FredSeriesSnapshot | null;
  yield10y?: FredSeriesSnapshot | null;
};

export async function loadMacroRates(): Promise<MacroRatesResponse> {
  const response = await fetch(`${getCotApiBase()}/api/macro/rates`);
  if (!response.ok) {
    throw new Error(`Macro rates HTTP ${response.status}`);
  }
  return (await response.json()) as MacroRatesResponse;
}
