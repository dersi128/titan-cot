import type { InstitutionalMarket } from "../config/institutionalMarkets";
import { INSTITUTIONAL_MARKETS } from "../config/institutionalMarkets";
import type { CotDashboardData } from "../types";
import {
  buildCommercialIndexSeries,
  evaluateTitanPositioning,
  type MarketRegimeId,
} from "./titanCommercialIndex";
import { computeTitanDashboardScore, resolveTitanVerdict } from "./titanCotScore";
import type { TitanBiasVerdict } from "./titanCotScore";

/** FX futures (ex-DXY) used for dollar breadth. */
export const DME_FX_MARKETS = INSTITUTIONAL_MARKETS.filter(
  (m) => m.category === "forex" && m.symbol !== "DX1!",
);

export type DollarPressureId = "elevated" | "soft" | "neutral";
export type FxBreadthId = "wide_usd" | "narrow_usd" | "mixed" | "wide_fx";

export type DmeFxPanel = {
  market: InstitutionalMarket;
  score: number;
  verdict: TitanBiasVerdict;
  regime: MarketRegimeId;
  /** True when FX COT score < 0 → currency soft → relative USD support vs that pair */
  usdFavoring: boolean;
  status: "live" | "missing";
};

export type DmeOverview = {
  dxyAvailable: boolean;
  dxyRegime: MarketRegimeId | null;
  dxyScore: number | null;
  dxyCommercial26w: number | null;
  dxyWeeklyChange: number | null;
  dollarPressure: DollarPressureId;
  fxBreadth: FxBreadthId;
  usdFavoringCount: number;
  fxLiveCount: number;
  fxExtremeCount: number;
  /** Last N points of DXY commercial 26W index (real history). */
  dxyIndexSpark: number[];
  panels: DmeFxPanel[];
};

function pressureFromScore(score: number | null): DollarPressureId {
  if (score === null) return "neutral";
  if (score >= 25) return "elevated";
  if (score <= -25) return "soft";
  return "neutral";
}

function breadthFromCounts(usdFavoring: number, live: number): FxBreadthId {
  if (live === 0) return "mixed";
  const pct = usdFavoring / live;
  if (pct >= 0.67) return "wide_usd";
  if (pct >= 0.5) return "narrow_usd";
  if (pct <= 0.33) return "wide_fx";
  return "mixed";
}

export function buildDmeOverview(bundle: Record<string, CotDashboardData>): DmeOverview {
  const dxy = bundle["DX1!"];
  const dxyAvailable = Boolean(dxy);
  const dxyRead = dxy ? evaluateTitanPositioning(dxy) : null;
  const dxyScore = dxy && Number.isFinite(dxy.cotScore) ? Math.round(computeTitanDashboardScore(dxy)) : null;
  const dxyCommercial26w =
    dxy && Number.isFinite(dxy.commercials.index26w) ? Math.round(dxy.commercials.index26w) : null;
  const dxyWeeklyChange =
    dxy && Number.isFinite(dxy.commercials.weeklyChange) ? dxy.commercials.weeklyChange : null;

  const series = dxy ? buildCommercialIndexSeries(dxy.history ?? []) : [];
  const dxyIndexSpark = series.slice(-12).map((v) => Math.round(v));

  const panels: DmeFxPanel[] = DME_FX_MARKETS.map((market) => {
    const data = bundle[market.symbol];
    if (!data) {
      return {
        market,
        score: 0,
        verdict: "NEUTRAL",
        regime: "neutral",
        usdFavoring: false,
        status: "missing",
      };
    }
    const score = Math.round(computeTitanDashboardScore(data));
    return {
      market,
      score,
      verdict: resolveTitanVerdict(data),
      regime: evaluateTitanPositioning(data)?.regime ?? "neutral",
      usdFavoring: score < 0,
      status: "live",
    };
  });

  const livePanels = panels.filter((p) => p.status === "live");
  const usdFavoringCount = livePanels.filter((p) => p.usdFavoring).length;
  const fxExtremeCount = livePanels.filter((p) => Math.abs(p.score) >= 40).length;

  return {
    dxyAvailable,
    dxyRegime: dxyRead?.regime ?? (dxyAvailable ? "neutral" : null),
    dxyScore,
    dxyCommercial26w,
    dxyWeeklyChange,
    dollarPressure: pressureFromScore(dxyScore),
    fxBreadth: breadthFromCounts(usdFavoringCount, livePanels.length),
    usdFavoringCount,
    fxLiveCount: livePanels.length,
    fxExtremeCount,
    dxyIndexSpark: dxyIndexSpark.length >= 2 ? dxyIndexSpark : [50, 50],
    panels,
  };
}

export function dmeSparkTone(pressure: DollarPressureId): "bull" | "bear" | "neutral" {
  if (pressure === "elevated") return "bull";
  if (pressure === "soft") return "bear";
  return "neutral";
}
