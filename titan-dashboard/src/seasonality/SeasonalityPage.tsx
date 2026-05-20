import { useCallback, useEffect, useState } from "react";
import { useTitanI18n } from "../i18n";
import { DEFAULT_SEASONALITY_MARKET_ID, getSeasonalityMarket } from "./markets";
import { fetchSeasonalityAnalysis } from "./services/seasonalityService";
import type { SeasonalityResult } from "./types";
import { DEFAULT_YEARS_LOOKBACK, type YearsLookback } from "./yearsLookback";
import { SeasonalityHero } from "./components/SeasonalityHero";
import { SeasonalityMainChart } from "./components/SeasonalityMainChart";
import { SeasonalityMarketSelector } from "./components/SeasonalityMarketSelector";
import { SeasonalityMonthlyTable } from "./components/SeasonalityMonthlyTable";
import { SeasonalityStatsCards } from "./components/SeasonalityStatsCards";

export function SeasonalityPage() {
  const { t } = useTitanI18n();
  const [marketId, setMarketId] = useState(DEFAULT_SEASONALITY_MARKET_ID);
  const [lookback, setLookback] = useState<YearsLookback>(DEFAULT_YEARS_LOOKBACK);
  const [result, setResult] = useState<SeasonalityResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (id: string, yearsLookback: YearsLookback) => {
      const market = getSeasonalityMarket(id);
      if (!market) return;
      setLoading(true);
      setError(null);
      try {
        const analysis = await fetchSeasonalityAnalysis(market.dataSymbol, { yearsLookback });
        setResult(analysis);
      } catch (err) {
        setResult(null);
        setError(err instanceof Error ? err.message : t("seasonality.loadError"));
      } finally {
        setLoading(false);
      }
    },
    [t],
  );

  useEffect(() => {
    void load(marketId, lookback);
  }, [marketId, lookback, load]);

  const currentMonth = result
    ? new Date(result.currentDate).getMonth() + 1
    : new Date().getMonth() + 1;

  return (
    <div className="titan-seasonality animate-fade-up">
      <SeasonalityHero />

      <div className="mb-4">
        <p className="titan-cmd-kicker mb-2">{t("seasonality.selectMarket")}</p>
        <SeasonalityMarketSelector activeId={marketId} onSelect={setMarketId} disabled={loading} />
      </div>

      {error ? (
        <div className="mb-4 rounded-lg border border-rose-500/30 bg-rose-950/25 px-4 py-3 text-sm text-rose-200/90">
          {error}
        </div>
      ) : null}

      {loading && !result ? (
        <div className="titan-seasonality-loading rounded-lg border border-white/[0.06] px-4 py-12 text-center text-sm text-stone-500">
          {t("seasonality.loading")}
        </div>
      ) : null}

      {result ? (
        <div className={`space-y-4${loading ? " opacity-80" : ""}`}>
          <SeasonalityMainChart
            result={result}
            currentMonth={currentMonth}
            lookback={lookback}
            onLookbackChange={setLookback}
            lookbackDisabled={loading}
          />
          <SeasonalityStatsCards result={result} />
          <div>
            <p className="titan-cmd-kicker mb-2 px-0.5">{t("seasonality.tableTitle")}</p>
            <SeasonalityMonthlyTable result={result} currentMonth={currentMonth} />
          </div>
          <p className="text-[10px] leading-relaxed text-stone-600">
            {t("seasonality.dataNote")} · {t("seasonality.disclaimer")}
          </p>
        </div>
      ) : null}

      {loading && result ? (
        <p className="text-center text-[10px] uppercase tracking-wider text-stone-600">{t("seasonality.loading")}</p>
      ) : null}
    </div>
  );
}
