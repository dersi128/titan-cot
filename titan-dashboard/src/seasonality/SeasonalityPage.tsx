import { useCallback, useEffect, useMemo, useState } from "react";
import { useTitanI18n } from "../i18n";
import { DEFAULT_SEASONALITY_MARKET_ID, getSeasonalityMarket } from "./markets";
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
  PRESIDENTIAL_CYCLE_PHASES,
  type PresidentialCyclePhase,
} from "./utils/presidentialCycle";
import { SeasonalityHero } from "./components/SeasonalityHero";
import { SeasonalityDeviationSection } from "./components/SeasonalityDeviationSection";
import { SeasonalityMainChart } from "./components/SeasonalityMainChart";
import { SeasonalityMarketSelector } from "./components/SeasonalityMarketSelector";
import { SeasonalityMonthlyTable } from "./components/SeasonalityMonthlyTable";
import { SeasonalityPresidentialFilter } from "./components/SeasonalityPresidentialFilter";
import { SeasonalityStatsCards } from "./components/SeasonalityStatsCards";

export function SeasonalityPage() {
  const { t } = useTitanI18n();
  const [marketId, setMarketId] = useState(DEFAULT_SEASONALITY_MARKET_ID);
  const [lookback, setLookback] = useState<YearsLookback>(DEFAULT_YEARS_LOOKBACK);
  const [cycles, setCycles] = useState<PresidentialCyclePhase[]>([...PRESIDENTIAL_CYCLE_PHASES]);
  const [comparison, setComparison] = useState<SeasonalityComparison | null>(null);
  const [dataSource, setDataSource] = useState("yahoo");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (id: string, phases: PresidentialCyclePhase[]) => {
      const market = getSeasonalityMarket(id);
      if (!market) return;
      setLoading(true);
      setError(null);
      try {
        if (shouldUseSeasonalityApi()) {
          const curves = await fetchSeasonalityComparisonFromApi(market.dataSymbol, phases);
          setComparison(curves);
          setDataSource("api");
        } else {
          const { comparison: curves, ohlcSource } = await fetchSeasonalityComparisonWithSource(
            market.dataSymbol,
            { presidentialPhases: phases },
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

  const market = getSeasonalityMarket(marketId);

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

      {!comparison ? (
        <div className="mb-4">
          <SeasonalityPresidentialFilter value={cycles} onChange={setCycles} disabled={false} />
        </div>
      ) : null}

      {error ? (
        <div className="mb-4 rounded-lg border border-rose-500/30 bg-rose-950/25 px-4 py-3 text-sm text-rose-200/90">
          {error}
        </div>
      ) : null}

      {loading && !comparison ? (
        <div className="titan-seasonality-loading rounded-lg border border-white/[0.06] px-4 py-12 text-center text-sm text-stone-500">
          {t("seasonality.loading")}
        </div>
      ) : null}

      {comparison && result ? (
        <div className={`space-y-4${loading ? " opacity-80" : ""}`}>
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
          />
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
        </div>
      ) : null}

      {loading && comparison ? (
        <p className="text-center text-[10px] uppercase tracking-wider text-stone-600">
          {t("seasonality.loading")}
        </p>
      ) : null}
    </div>
  );
}
