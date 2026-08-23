import { getCachedCotDashboard } from "./cotCache.js";
import type { CotDashboardOutput } from "./cotGold.js";
import { COT_MARKET_MAPPINGS, getCotMarketMapping } from "./cotMarketMap.js";

/** Compact COT payload for ChatGPT (no full weekly history). */
export type GptCotReport = {
  market: string;
  futuresSymbol: string;
  slug: string;
  reportDate: string;
  cotScore: number;
  cotVerdict: string;
  marketPhase: string;
  summary: string;
  commercials: {
    net: number;
    index26w: number;
    index52w: number;
    bias: string;
  };
  nonCommercials: {
    net: number;
    index26w: number;
    index52w: number;
    divergence: string;
  };
  retail: {
    net: number;
    index26w: number;
    index52w: number;
    contrarianSignal: string;
  };
  scoreComponents: CotDashboardOutput["scoreComponents"];
};

export function listGptCotMarkets(): Array<{
  slug: string;
  market: string;
  futuresSymbol: string;
  aliases: string[];
}> {
  return COT_MARKET_MAPPINGS.map((m) => ({
    slug: m.apiSlug,
    market: m.displayName,
    futuresSymbol: m.futuresSymbol,
    aliases: [...(m.aliases ?? []), m.apiSlug, m.futuresSymbol],
  }));
}

export function toGptCotReport(data: CotDashboardOutput, slug: string): GptCotReport {
  return {
    market: data.market,
    futuresSymbol: data.futuresSymbol,
    slug,
    reportDate: data.reportDate,
    cotScore: data.cotScore,
    cotVerdict: data.cotVerdict,
    marketPhase: data.marketPhase,
    summary: data.plainEnglishExplanation,
    commercials: {
      net: data.commercials.net,
      index26w: data.commercials.index26w,
      index52w: data.commercials.index52w,
      bias: data.commercials.bias,
    },
    nonCommercials: {
      net: data.nonCommercials.net,
      index26w: data.nonCommercials.index26w,
      index52w: data.nonCommercials.index52w,
      divergence: data.nonCommercials.divergence,
    },
    retail: {
      net: data.retail.net,
      index26w: data.retail.index26w,
      index52w: data.retail.index52w,
      contrarianSignal: data.retail.contrarianSignal,
    },
    scoreComponents: data.scoreComponents,
  };
}

export async function buildGptCotReport(symbolOrSlug: string): Promise<GptCotReport | null> {
  const mapping = getCotMarketMapping(symbolOrSlug);
  if (!mapping) return null;
  const data = await getCachedCotDashboard(mapping.futuresSymbol);
  return toGptCotReport(data, mapping.apiSlug);
}
