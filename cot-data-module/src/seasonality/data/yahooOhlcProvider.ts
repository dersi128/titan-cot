import type { OhlcBar } from "../types.js";
import type { OhlcDataProvider, OhlcFetchOptions } from "./types.js";
import { resolveYahooTicker } from "./yahooSymbols.js";

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

const YAHOO_UA =
  "Mozilla/5.0 (compatible; TitanCot/1.0; +https://titan-cot.vercel.app)";

function yahooChartUrl(ticker: string, years: number): string {
  const encoded = encodeURIComponent(ticker);
  // Avoid range=max — Yahoo downsamples to monthly and breaks seasonality.
  const capped = Math.min(20, Math.max(5, Math.round(years)));
  const range = `${capped}y`;
  return `https://query1.finance.yahoo.com/v8/finance/chart/${encoded}?interval=1d&range=${range}`;
}

function formatUnixDay(ts: number): string {
  return new Date(ts * 1000).toISOString().slice(0, 10);
}

export async function fetchYahooDailyOHLC(symbol: string, years = 20): Promise<OhlcBar[]> {
  const ticker = resolveYahooTicker(symbol);
  const response = await fetch(yahooChartUrl(ticker, years), {
    headers: {
      "User-Agent": YAHOO_UA,
      Accept: "application/json",
    },
  });

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
