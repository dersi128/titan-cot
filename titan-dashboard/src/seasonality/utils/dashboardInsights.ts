import type { SeasonalityComparison } from "../services/seasonalityService";
import type {
  SeasonalBias,
  SeasonalCurvePoint,
  SeasonalStrength,
  SeasonalWindow,
  SeasonalityResult,
} from "../types";
import { CHART_COMPARISON_LOOKBACKS, type ChartLookbackYears } from "../yearsLookback";

export type LookbackTrend = {
  lookback: ChartLookbackYears;
  bias: SeasonalBias;
  label: "UPTREND" | "DOWNTREND" | "FLAT" | "BULLISH" | "BEARISH" | "NEUTRAL";
};

export type WatchItem = {
  id: string;
  tone: "bull" | "bear" | "warn" | "flat";
  /** i18n key under seasonality.dash.watch.* */
  key: string;
  params?: Record<string, string | number>;
  /** Short metric shown as mono badge (e.g. +1.2%, 54%). */
  metric?: string;
  /** 0–100 conviction bar. */
  level?: number;
  detail?: string;
};

export type SeasonalTurn = {
  startLabel: string;
  peakLabel: string;
  endLabel: string;
  windowBias: "bullish" | "bearish" | null;
  afterTurnWarn: boolean;
};

export type WindowStats = {
  winRate: number;
  avgMovePct: number;
  dailyAvgPct: number;
  sampleYears: number;
  strongPeriod: boolean;
};

export type DashboardInsights = {
  bias: SeasonalBias;
  strength: SeasonalStrength;
  score: number;
  trends: LookbackTrend[];
  agreement: { bullish: number; bearish: number; neutral: number; total: number };
  windowStats: WindowStats;
  turn: SeasonalTurn;
  watch: WatchItem[];
  conclusion: {
    biasSide: "long" | "short" | "flat";
    windowLabel: string;
    riskKey: string;
  };
  currentDate: string;
};

const STRENGTH_SCORE: Record<SeasonalStrength, number> = {
  LOW: 28,
  MODERATE: 55,
  HIGH: 78,
  EXTREME: 92,
};

function trendLabel(bias: SeasonalBias, lookback: ChartLookbackYears): LookbackTrend["label"] {
  if (lookback === 20) {
    if (bias === "BULLISH") return "BULLISH";
    if (bias === "BEARISH") return "BEARISH";
    return "NEUTRAL";
  }
  if (bias === "BULLISH") return "UPTREND";
  if (bias === "BEARISH") return "DOWNTREND";
  return "FLAT";
}

/** Approximate calendar label from TDY using curve month anchors. */
export function tdyToApproxLabel(curve: SeasonalCurvePoint[], tdy: number): string {
  if (!curve.length) return `TDY ${tdy}`;
  let best = curve[0];
  let bestDist = Math.abs(best.dayOfYear - tdy);
  for (const p of curve) {
    const d = Math.abs(p.dayOfYear - tdy);
    if (d < bestDist) {
      best = p;
      bestDist = d;
    }
  }
  const monthNames = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
  const monthPts = curve.filter((p) => p.month === best.month);
  const first = monthPts[0]?.dayOfYear ?? best.dayOfYear;
  const dayInMonth = Math.max(1, Math.min(28, Math.round(best.dayOfYear - first + 1)));
  return `${dayInMonth}. ${monthNames[best.month - 1]}`;
}

function windowMovePct(curve: SeasonalCurvePoint[], win: SeasonalWindow | null): number {
  if (!win || !curve.length) return 0;
  const start = curve.find((p) => p.dayOfYear >= win.startDay) ?? curve[0];
  const end =
    [...curve].reverse().find((p) => p.dayOfYear <= win.endDay) ?? curve[curve.length - 1];
  if (!start || !end || start.smoothed === 0) return 0;
  return (end.smoothed / start.smoothed - 1) * 100;
}

function findPeakTdy(curve: SeasonalCurvePoint[], win: SeasonalWindow): number {
  const pts = curve.filter((p) => p.dayOfYear >= win.startDay && p.dayOfYear <= win.endDay);
  if (!pts.length) return Math.round((win.startDay + win.endDay) / 2);
  if (win.bias === "bearish") {
    return pts.reduce((a, b) => (b.smoothed < a.smoothed ? b : a)).dayOfYear;
  }
  return pts.reduce((a, b) => (b.smoothed > a.smoothed ? b : a)).dayOfYear;
}

function windowWinRate(result: SeasonalityResult, win: SeasonalWindow | null): number {
  if (!win) return result.overallWinRate;
  const months = new Set(
    result.seasonalCurve
      .filter((p) => p.dayOfYear >= win.startDay && p.dayOfYear <= win.endDay)
      .map((p) => p.month),
  );
  const stats = result.monthlyStats.filter((m) => months.has(m.month));
  if (!stats.length) return result.overallWinRate;
  return stats.reduce((s, m) => s + m.winRate, 0) / stats.length;
}

function computeScore(
  bias: SeasonalBias,
  strength: SeasonalStrength,
  winRate: number,
  agreementBull: number,
  agreementBear: number,
  total: number,
): number {
  let base = STRENGTH_SCORE[strength];
  if (bias === "NEUTRAL") {
    base = Math.round(base * 0.45 + 50 * 0.55);
  } else {
    const agree = bias === "BULLISH" ? agreementBull : agreementBear;
    const agreeBoost = total ? (agree / total) * 12 : 0;
    base = Math.min(98, Math.round(base + agreeBoost));
  }
  const wrPull = (winRate - 50) * 0.25;
  const scored = Math.round(Math.max(5, Math.min(98, base + wrPull)));
  return scored;
}

export function buildDashboardInsights(
  result: SeasonalityResult,
  comparison: SeasonalityComparison,
): DashboardInsights {
  const trends: LookbackTrend[] = CHART_COMPARISON_LOOKBACKS.filter((lb) => comparison[lb]).map(
    (lb) => {
      const bias = comparison[lb]!.seasonalBias;
      return { lookback: lb, bias, label: trendLabel(bias, lb) };
    },
  );

  const agreement = {
    bullish: trends.filter((t) => t.bias === "BULLISH").length,
    bearish: trends.filter((t) => t.bias === "BEARISH").length,
    neutral: trends.filter((t) => t.bias === "NEUTRAL").length,
    total: trends.length,
  };

  const win = result.currentSeasonalWindow;
  const avgMovePct = windowMovePct(result.seasonalCurve, win);
  const winRate = windowWinRate(result, win);
  const strongPeriod =
    (result.seasonalBias !== "NEUTRAL" &&
      (result.seasonalStrength === "HIGH" || result.seasonalStrength === "EXTREME")) ||
    winRate >= 62;

  const windowStats: WindowStats = {
    winRate,
    avgMovePct,
    dailyAvgPct: result.averageReturnInWindow * 100,
    sampleYears: result.yearsUsed,
    strongPeriod,
  };

  const curve = result.seasonalCurve;
  let turn: SeasonalTurn = {
    startLabel: "—",
    peakLabel: "—",
    endLabel: "—",
    windowBias: null,
    afterTurnWarn: false,
  };

  if (win) {
    const peak = findPeakTdy(curve, win);
    const peakLo = Math.max(win.startDay, peak - 3);
    const peakHi = Math.min(win.endDay, peak + 3);
    const tdy = result.tradingDayOfYear ?? 0;
    turn = {
      startLabel: tdyToApproxLabel(curve, win.startDay),
      peakLabel: `${tdyToApproxLabel(curve, peakLo)} – ${tdyToApproxLabel(curve, peakHi)}`,
      endLabel: tdyToApproxLabel(curve, win.endDay),
      windowBias: win.bias,
      afterTurnWarn: tdy > 0 && tdy >= win.endDay - 5,
    };
  }

  const score = computeScore(
    result.seasonalBias,
    result.seasonalStrength,
    winRate,
    agreement.bullish,
    agreement.bearish,
    agreement.total,
  );

  const month = new Date(result.currentDate).getMonth() + 1;
  const monthStat = result.monthlyStats.find((m) => m.month === month);
  const nextBest = [...result.monthlyStats]
    .filter((m) => m.month !== month)
    .sort((a, b) => b.avgReturn - a.avgReturn)[0];

  const watch: WatchItem[] = [];
  if (monthStat) {
    const monthPct = `${monthStat.avgReturn >= 0 ? "+" : ""}${(monthStat.avgReturn * 100).toFixed(2)}%`;
    watch.push({
      id: "month",
      tone:
        monthStat.bias === "BULLISH" ? "bull" : monthStat.bias === "BEARISH" ? "bear" : "flat",
      key: "monthFlow",
      params: { month: monthStat.monthLabel },
      metric: monthPct,
      level: Math.min(100, Math.round(monthStat.winRate)),
      detail: `WR ${monthStat.winRate.toFixed(0)}%`,
    });
  }
  const alignLevel =
    result.seasonalityAlignment === "ALIGNED"
      ? 82
      : result.seasonalityAlignment === "STRONGLY_DIVERGING"
        ? 28
        : 52;
  const alignMetric =
    result.deviationAnalysis != null
      ? `${result.deviationAnalysis.deviationPct >= 0 ? "+" : ""}${result.deviationAnalysis.deviationPct.toFixed(1)} pts`
      : undefined;
  watch.push({
    id: "align",
    tone:
      result.seasonalityAlignment === "ALIGNED"
        ? "bull"
        : result.seasonalityAlignment === "STRONGLY_DIVERGING"
          ? "bear"
          : "warn",
    key:
      result.seasonalityAlignment === "ALIGNED"
        ? "aligned"
        : result.seasonalityAlignment === "STRONGLY_DIVERGING"
          ? "against"
          : "diverging",
    metric: alignMetric,
    level: alignLevel,
    detail: result.deviationAnalysis?.level
      ? String(result.deviationAnalysis.level).replace("_", " ")
      : undefined,
  });
  if (win) {
    watch.push({
      id: "window",
      tone: win.bias === "bullish" ? "bull" : "bear",
      key: win.bias === "bullish" ? "bullWindow" : "bearWindow",
      params: { label: win.label },
      metric: `${avgMovePct >= 0 ? "+" : ""}${avgMovePct.toFixed(1)}%`,
      level: Math.min(100, Math.round(winRate)),
      detail: `WR ${winRate.toFixed(0)}%`,
    });
  }
  if (turn.afterTurnWarn) {
    watch.push({
      id: "turn",
      tone: "bear",
      key: "nearTurn",
      metric: turn.endLabel,
      level: 22,
      detail: turn.endLabel,
    });
  }
  if (nextBest) {
    watch.push({
      id: "next",
      tone: nextBest.avgReturn >= 0 ? "bull" : "bear",
      key: "nextBest",
      params: {
        month: nextBest.monthLabel,
        pct: `${nextBest.avgReturn >= 0 ? "+" : ""}${(nextBest.avgReturn * 100).toFixed(1)}%`,
      },
      metric: `${nextBest.avgReturn >= 0 ? "+" : ""}${(nextBest.avgReturn * 100).toFixed(1)}%`,
      level: Math.min(100, Math.round(nextBest.winRate)),
      detail: nextBest.monthLabel,
    });
  }
  if (result.volatilityRegime === "HIGH") {
    watch.push({
      id: "vol",
      tone: "warn",
      key: "highVol",
      metric: "HIGH",
      level: 78,
    });
  } else if (result.volatilityRegime) {
    watch.push({
      id: "vol",
      tone: result.volatilityRegime === "LOW" ? "bull" : "flat",
      key: result.volatilityRegime === "LOW" ? "lowVol" : "normVol",
      metric: result.volatilityRegime,
      level: result.volatilityRegime === "LOW" ? 35 : 55,
    });
  }

  const biasSide =
    result.seasonalBias === "BULLISH" ? "long" : result.seasonalBias === "BEARISH" ? "short" : "flat";

  const windowLabel = win
    ? win.bias === "bullish"
      ? `bullish → ${turn.endLabel}`
      : `bearish → ${turn.endLabel}`
    : "no active window";

  const riskKey = turn.afterTurnWarn
    ? "afterTurn"
    : result.seasonalityAlignment !== "ALIGNED"
      ? "divergence"
      : result.seasonalBias === "NEUTRAL"
        ? "weakSeason"
        : "regimeOk";

  return {
    bias: result.seasonalBias,
    strength: result.seasonalStrength,
    score,
    trends,
    agreement,
    windowStats,
    turn,
    watch: watch.slice(0, 5),
    conclusion: { biasSide, windowLabel, riskKey },
    currentDate: result.currentDate,
  };
}
