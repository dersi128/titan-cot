import type { InstitutionalMarket } from "../config/institutionalMarkets";
import type { CotDashboardData } from "../types";
import {
  commercialIndexZone,
  evaluateTitanPositioning,
  resolveMarketRegime,
  type MarketRegimeId,
} from "./titanCommercialIndex";
import { computeInstitutionalConviction } from "./titanConviction";
import {
  computeTitanDashboardScore,
  resolveTitanVerdict,
  type TitanBiasVerdict,
} from "./titanCotScore";

export type ScannerRowModel = {
  market: InstitutionalMarket;
  score: number;
  verdict: TitanBiasVerdict;
  comm26: number | null;
  retail26: number | null;
  regime: MarketRegimeId;
  conviction: number;
  persistenceWeeks: number;
  isExtreme: boolean;
  status: "live" | "loading" | "error";
  errorMessage?: string;
};

function isExtremeCommercial(index26w: number): boolean {
  const z = commercialIndexZone(index26w);
  return z === "extreme_short" || z === "extreme_long" || index26w <= 20 || index26w >= 80;
}

function errorRow(
  market: InstitutionalMarket,
  errorMessage: string,
  data?: CotDashboardData,
): ScannerRowModel {
  const comm26 = data?.commercials?.index26w;
  const retail26 = data?.retail?.index26w;
  return {
    market,
    score: 0,
    verdict: "NEUTRAL",
    comm26: typeof comm26 === "number" && Number.isFinite(comm26) ? comm26 : null,
    retail26: typeof retail26 === "number" && Number.isFinite(retail26) ? retail26 : null,
    regime: "neutral",
    conviction: 0,
    persistenceWeeks: 0,
    isExtreme: false,
    status: "error",
    errorMessage,
  };
}

export function buildScannerRows(
  markets: readonly InstitutionalMarket[],
  bundle: Record<string, CotDashboardData>,
  errors: Record<string, string>,
): ScannerRowModel[] {
  return markets.map((market) => {
    const data = bundle[market.symbol];
    if (data) {
      try {
        const score = computeTitanDashboardScore(data);
        if (!Number.isFinite(score)) {
          return errorRow(market, "Invalid COT score", data);
        }
        const conviction = computeInstitutionalConviction(data, score).level;
        const read = evaluateTitanPositioning(data);
        const comm26 = data.commercials?.index26w;
        const retail26 = data.retail?.index26w;
        return {
          market,
          score,
          verdict: resolveTitanVerdict(data),
        comm26: typeof comm26 === "number" && Number.isFinite(comm26) ? comm26 : null,
        retail26: typeof retail26 === "number" && Number.isFinite(retail26) ? retail26 : null,
          regime: resolveMarketRegime(data),
          conviction,
          persistenceWeeks: read?.commercialPersistenceWeeks ?? 0,
          isExtreme: Number.isFinite(comm26) ? isExtremeCommercial(comm26) : false,
          status: "live",
        };
      } catch (err) {
        console.error("[TITAN] buildScannerRows failed", market.symbol, err);
        const message = err instanceof Error ? err.message : "Calculation error";
        return errorRow(market, message, data);
      }
    }
    if (errors[market.symbol]) {
      return errorRow(market, errors[market.symbol]);
    }
    return {
      market,
      score: 0,
      verdict: "NEUTRAL",
      comm26: null,
      retail26: null,
      regime: "neutral",
      conviction: 0,
      persistenceWeeks: 0,
      isExtreme: false,
      status: "loading",
    };
  });
}
