import { useCallback, useEffect, useMemo, useState } from "react";
import { useTitanI18n } from "../i18n";
import { DEFAULT_SEASONALITY_MARKET_ID, resolveSeasonalityMarket } from "./markets";
import {
  fetchSeasonalityComparisonFromApi,
  shouldUseSeasonalityApi,
  describeSeasonalityApiTarget,
} from "./seasonalityApi";
import type { SeasonalityComparison } from "./services/seasonalityService";
import { fetchSeasonalityComparisonWithSource } from "./services/seasonalityService";
import { DEFAULT_YEARS_LOOKBACK, type YearsLookback } from "./yearsLookback";
import { attachSeasonalDeviationAnalysis } from "./utils/seasonalDeviationEngine";
import {
  type PresidentialCyclePhase,
  hasPresidentialSelection,
} from "./utils/presidentialCycle";
import { SeasonalityHero } from "./components/SeasonalityHero";
import { SeasonalityDeviationSection } from "./components/SeasonalityDeviationSection";
import { SeasonalityMainChart } from "./components/SeasonalityMainChart";
import { SeasonalityMarketSelector } from "./components/SeasonalityMarketSelector";
import { SeasonalityMonthlyTable } from "./components/SeasonalityMonthlyTable";
import { SeasonalityStatsCards } from "./components/SeasonalityStatsCards";

export function SeasonalityPage() {
  const { t } = useTitanI18n();
  const [marketId, setMarketId] = useState(DEFAULT_SEASONALITY_MARKET_ID);
  const [lookback, setLookback] = useState<YearsLookback>(DEFAULT_YEARS_LOOKBACK);
  /** Default: cycles off → full lookback years (10/15/20). */
  const [cycles, setCycles] = useState<PresidentialCyclePhase[]>([]);
  const [comparison, setComparison] = useState<SeasonalityComparison | null>(null);
  const [dataSource, setDataSource] = useState("yahoo");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (id: string, phases: PresidentialCyclePhase[]) => {
      const market = resolveSeasonalityMarket(id);
      if (!market) return;
      setLoading(true);
      setError(null);
      // Empty selection = no presidential filter → full lookback years.
      const phaseFilter = hasPresidentialSelection(phases) ? phases : null;
      try {
        if (shouldUseSeasonalityApi()) {
          const curves = await fetchSeasonalityComparisonFromApi(market.dataSymbol, phaseFilter);
          setComparison(curves);
          setDataSource("api");
        } else {
          const { comparison: curves, ohlcSource } = await fetchSeasonalityComparisonWithSource(
            market.dataSymbol,
            { presidentialPhases: phaseFilter },
          );
          setComparison(curves);
          setDataSource(ohlcSource);
        }
      } catch (err) {
        setComparison(null);
        setError(err instanceof Error ? err.message : t("seasonality.loadError"));
      } finally {
        setLoading(false);
      }
    },
    [t],
  );

  useEffect(() => {
    void load(marketId, cycles);
  }, [marketId, cycles, load]);

  const market = resolveSeasonalityMarket(marketId);

  const result = useMemo(() => {
    if (!comparison) return null;
    const base =
      comparison[lookback] ??
      comparison[10] ??
      comparison[DEFAULT_YEARS_LOOKBACK] ??
      Object.values(comparison)[0] ??
      null;
    if (!base) return null;
    if (lookback === 10) {
      if (base.deviationAnalysis) return base;
      return attachSeasonalDeviationAnalysis(base);
    }
    return base;
  }, [comparison, lookback]);

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

      <div className={`space-y-4${loading ? " opacity-90" : ""}`}>
        <SeasonalityMainChart
          result={result}
          comparison={comparison}
          marketLabel={market?.label ?? marketId}
          lookback={lookback}
          onLookbackChange={setLookback}
          currentMonth={currentMonth}
          presidentialPhases={cycles}
          onPresidentialPhasesChange={setCycles}
          filtersDisabled={loading}
          loading={loading}
        />

        {result ? (
          <>
            <SeasonalityStatsCards result={result} />
            {lookback === 10 ? <SeasonalityDeviationSection result={result} /> : null}
            <div>
              <p className="titan-cmd-kicker mb-2 px-0.5">{t("seasonality.tableTitle")}</p>
              <SeasonalityMonthlyTable result={result} currentMonth={currentMonth} />
            </div>
            <p className="text-[10px] leading-relaxed text-stone-600">
              {shouldUseSeasonalityApi()
                ? t("seasonality.dataNoteApi", { target: describeSeasonalityApiTarget() })
                : dataSource === "yahoo"
                  ? t("seasonality.dataNoteYahoo")
                  : t("seasonality.dataNote")}{" "}
              · {t("seasonality.disclaimer")}
            </p>
          </>
        ) : null}
      </div>
    </div>
  );
}
