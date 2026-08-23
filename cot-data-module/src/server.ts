import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";

import { getCachedCotDashboard } from "./cotCache.js";
import { loadCotBundle } from "./cotBundle.js";
import { fetchGoldCotDashboardData } from "./cotGold.js";
import { COT_MARKET_MAPPINGS, getCotMarketMapping } from "./cotMarketMap.js";
import { requireChatGptApiKey } from "./gptAuth.js";
import { buildGptCotReport, listGptCotMarkets } from "./gptCotReport.js";
import {
  handleSeasonalityBundle,
  handleSeasonalityMarkets,
  handleSeasonalitySingle,
} from "./seasonalityRoutes.js";
import { getMacroRates, isFredConfigured } from "./fredRates.js";

const PORT = Number(process.env.PORT ?? 3000);

const corsOrigins = process.env.CORS_ORIGIN?.split(",")
  .map((o) => o.trim())
  .filter(Boolean);

const app = express();

app.use(
  cors({
    origin: corsOrigins?.length ? corsOrigins : true,
  }),
);
app.use(express.json());

app.get("/health", (_request, response) => {
  response.json({
    status: "ok",
    cotCacheTtlMs: Number(process.env.COT_CACHE_TTL_MS ?? 15 * 60 * 1000),
    seasonalityCacheTtlMs: Number(process.env.SEASONALITY_CACHE_TTL_MS ?? 6 * 60 * 60 * 1000),
    seasonalityOhlcProvider: process.env.SEASONALITY_OHLC_PROVIDER ?? "yahoo",
    fredConfigured: isFredConfigured(),
    fredCacheTtlMs: Number(process.env.FRED_CACHE_TTL_MS ?? 6 * 60 * 60 * 1000),
    chatgptApiKeyConfigured: Boolean(process.env.CHATGPT_API_KEY?.trim()),
  });
});

app.get("/api/macro/rates", asyncHandler(async (_request, response) => {
  response.json(await getMacroRates());
}));

app.get("/api/seasonality/markets", asyncHandler(handleSeasonalityMarkets));

app.get("/api/seasonality/:symbol/bundle", asyncHandler(handleSeasonalityBundle));

app.get("/api/seasonality/:symbol", asyncHandler(handleSeasonalitySingle));

app.get("/api/cot/mappings", (_request, response) => {
  response.json({
    mappings: COT_MARKET_MAPPINGS,
  });
});

/** One request for the whole dashboard — best for shared hosting. */
app.get("/api/cot/bundle", asyncHandler(async (request, response) => {
  const raw = request.query.symbols;
  const symbols =
    typeof raw === "string" && raw.length > 0
      ? raw.split(",").map((s) => s.trim())
      : COT_MARKET_MAPPINGS.map((m) => m.futuresSymbol);

  response.json(await loadCotBundle(symbols));
}));

app.get("/api/cot/gold", asyncHandler(async (_request, response) => {
  response.json(await fetchGoldCotDashboardData());
}));

app.get("/api/cot/:symbol", asyncHandler(async (request, response) => {
  const symbolRaw = request.params.symbol;
  const symbol = Array.isArray(symbolRaw) ? symbolRaw[0] : symbolRaw;
  const mapping = getCotMarketMapping(symbol);

  if (!mapping) {
    response.status(404).json({
      status: "unsupported",
      error: "No COT mapping exists for this futures market.",
      mappings: COT_MARKET_MAPPINGS,
    });
    return;
  }

  response.json(await getCachedCotDashboard(mapping.futuresSymbol));
}));

/** —— ChatGPT Custom GPT Actions (compact COT reports) —— */
app.use("/api/gpt", requireChatGptApiKey);

app.get("/api/gpt/markets", (_request, response) => {
  response.json({ markets: listGptCotMarkets() });
});

app.get("/api/gpt/cot/:symbol", asyncHandler(async (request, response) => {
  const symbolRaw = request.params.symbol;
  const symbol = Array.isArray(symbolRaw) ? symbolRaw[0] : symbolRaw;
  const report = await buildGptCotReport(symbol ?? "");
  if (!report) {
    response.status(404).json({
      error: "Unknown market.",
      markets: listGptCotMarkets().map((m) => m.slug),
    });
    return;
  }
  response.json(report);
}));

app.get("/api/gpt/cot-report", asyncHandler(async (request, response) => {
  const q = typeof request.query.market === "string" ? request.query.market.trim() : "";
  if (!q) {
    response.status(400).json({
      error: "Query ?market= is required (e.g. gold, nasdaq, silver).",
      markets: listGptCotMarkets().map((m) => m.slug),
    });
    return;
  }
  const report = await buildGptCotReport(q);
  if (!report) {
    response.status(404).json({
      error: `No COT mapping for "${q}".`,
      markets: listGptCotMarkets().map((m) => m.slug),
    });
    return;
  }
  response.json(report);
}));

app.use((request, response) => {
  response.status(404).json({
    error: "Route not found.",
    path: request.path,
  });
});

app.use((error: unknown, _request: Request, response: Response, _next: NextFunction) => {
  console.error(error);
  response.status(500).json({
    error: "Failed to fetch COT data.",
    message: error instanceof Error ? error.message : "Unknown error",
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`COT API listening on port ${PORT}`);
});

function asyncHandler(
  handler: (request: Request, response: Response, next: NextFunction) => Promise<void>,
) {
  return (request: Request, response: Response, next: NextFunction) => {
    handler(request, response, next).catch(next);
  };
}
