import type { OhlcBar } from "../types";
import type { OhlcDataProvider, OhlcFetchOptions } from "./types";
import { resolveYahooTicker } from "./yahooSymbols";

type YahooChartResponse = {
  chart?: {
    result?: Array<{
      timestamp?: number[];
      indicators?: {
        quote?: Array<{
          open?: (number | null)[];
          high?: (number | null)[];
          low?: (number | null)[];
          close?: (number | null)[];
        }>;
      };
    }>;
    error?: { description?: string };
  };
};

/** Vercel/vite proxy path → Yahoo (see vercel.json + vite.config). */
function yahooChartUrl(ticker: string, years: number): string {
  const encoded = encodeURIComponent(ticker);
  const range = years >= 20 ? "max" : `${Math.min(20, Math.max(5, years))}y`;
  return `/api/yahoo/v8/finance/chart/${encoded}?interval=1d&range=${range}`;
}

function formatUnixDay(ts: number): string {
  return new Date(ts * 1000).toISOString().slice(0, 10);
}

export async function fetchYahooDailyOHLC(symbol: string, years = 20): Promise<OhlcBar[]> {
  const ticker = resolveYahooTicker(symbol);
  const response = await fetch(yahooChartUrl(ticker, years));

  if (!response.ok) {
    throw new Error(`Yahoo Finance ${ticker} → HTTP ${response.status}`);
  }

  const json = (await response.json()) as YahooChartResponse;
  const result = json.chart?.result?.[0];
  if (!result?.timestamp?.length) {
    const err = json.chart?.error?.description ?? "No chart data";
    throw new Error(`Yahoo Finance ${ticker}: ${err}`);
  }

  const q = result.indicators?.quote?.[0];
  if (!q) throw new Error(`Yahoo Finance ${ticker}: missing quote`);

  const bars: OhlcBar[] = [];
  for (let i = 0; i < result.timestamp.length; i++) {
    const open = q.open?.[i];
    const high = q.high?.[i];
    const low = q.low?.[i];
    const close = q.close?.[i];
    if (open == null || high == null || low == null || close == null) continue;
    if (close <= 0) continue;
    bars.push({
      date: formatUnixDay(result.timestamp[i]),
      open,
      high,
      low,
      close,
    });
  }

  if (bars.length < 252) {
    throw new Error(`Yahoo Finance ${ticker}: insufficient bars (${bars.length})`);
  }

  return bars;
}

export const yahooOhlcProvider: OhlcDataProvider = {
  id: "yahoo",
  label: "Yahoo Finance (free delayed daily)",
  async fetchDailyOHLC(symbol: string, options?: OhlcFetchOptions): Promise<OhlcBar[]> {
    const years = options?.years ?? 20;
    return fetchYahooDailyOHLC(symbol, years);
  },
};
