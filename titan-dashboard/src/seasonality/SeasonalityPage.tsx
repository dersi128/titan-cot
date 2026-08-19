import { useCallback, useEffect, useMemo, useState } from "react";
import { useTitanI18n } from "../i18n";
import { parseSeasonalityMarketFromHash, parseSeasonalityCyclesFromHash, setAppSectionHash } from "../lib/titanAppRoute";
import { DEFAULT_SEASONALITY_MARKET_ID, resolveSeasonalityMarket } from "./markets";
import { shouldUseSeasonalityApi, describeSeasonalityApiTarget } from "./seasonalityApi";
import type { SeasonalityComparison } from "./services/seasonalityService";
import { buildComparisonFromBars } from "./services/seasonalityService";
import { fetchOhlcWithFallback, getDefaultOhlcProviderId } from "./data/ohlcProviderConfig";
import type { OhlcBar } from "./types";
import { DEFAULT_YEARS_LOOKBACK, MAX_OHLC_FETCH_YEARS, type YearsLookback } from "./yearsLookback";
import { attachSeasonalDeviationAnalysis } from "./utils/seasonalDeviationEngine";
import {
  type PresidentialCyclePhase,
  filterBarsByPresidentialPhases,
  hasPresidentialSelection,
} from "./utils/presidentialCycle";
import { filterBarsByExcludedYears, listYearsFromBars } from "./utils/yearSelection";
import { SeasonalityDashboard } from "./components/SeasonalityDashboard";
import { SeasonalityMainChart } from "./components/SeasonalityMainChart";
import { SeasonalityMarketSelector } from "./components/SeasonalityMarketSelector";

export function SeasonalityPage() {
  const { t } = useTitanI18n();
  const [marketId, setMarketId] = useState(
    () => parseSeasonalityMarketFromHash() ?? DEFAULT_SEASONALITY_MARKET_ID,
  );
  const [lookback, setLookback] = useState<YearsLookback>(DEFAULT_YEARS_LOOKBACK);
  const [cycles, setCycles] = useState<PresidentialCyclePhase[]>(
    () => parseSeasonalityCyclesFromHash() ?? [],
  );
  const [excludedYears, setExcludedYears] = useState<number[]>([]);
  const [sourceBars, setSourceBars] = useState<OhlcBar[] | null>(null);
  const [comparison, setComparison] = useState<SeasonalityComparison | null>(null);
  const [ohlcBars, setOhlcBars] = useState<OhlcBar[] | null>(null);
  const [dataSource, setDataSource] = useState("yahoo");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const selectMarket = useCallback((id: string) => {
    setMarketId(id);
    setExcludedYears([]);
    setAppSectionHash("seasonality", {
      seasonalityMarket: id,
      seasonalityCycles: hasPresidentialSelection(cycles) ? cycles : undefined,
    });
  }, [cycles]);

  const onCyclesChange = useCallback(
    (next: PresidentialCyclePhase[]) => {
      setCycles(next);
      setAppSectionHash("seasonality", {
        seasonalityMarket: marketId,
        seasonalityCycles: hasPresidentialSelection(next) ? next : undefined,
      });
    },
    [marketId],
  );

  useEffect(() => {
    const syncFromHash = () => {
      const fromHash = parseSeasonalityMarketFromHash();
      if (fromHash) setMarketId(fromHash);
      const fromCycles = parseSeasonalityCyclesFromHash();
      if (fromCycles) setCycles(fromCycles);
    };
    window.addEventListener("hashchange", syncFromHash);
    syncFromHash();
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, []);

  /** Fetch raw OHLC once per market (filters rebuild locally). */
  const loadBars = useCallback(
    async (id: string) => {
      const market = resolveSeasonalityMarket(id);
      if (!market) return;
      setLoading(true);
      setError(null);
      try {
        const { bars, source } = await fetchOhlcWithFallback(
          market.dataSymbol,
          MAX_OHLC_FETCH_YEARS,
          getDefaultOhlcProviderId(),
        );
        setSourceBars(bars);
        setDataSource(shouldUseSeasonalityApi() ? "api" : source);
      } catch (err) {
        setSourceBars(null);
        setComparison(null);
        setOhlcBars(null);
        setError(err instanceof Error ? err.message : t("seasonality.loadError"));
      } finally {
        setLoading(false);
      }
    },
    [t],
  );

  useEffect(() => {
    void loadBars(marketId);
  }, [marketId, loadBars]);

  /** Apply cycle + year filters and rebuild all lookback curves. */
  useEffect(() => {
    if (!sourceBars) return;
    const market = resolveSeasonalityMarket(marketId);
    if (!market) return;

    let cancelled = false;
    const phaseFilter = hasPresidentialSelection(cycles) ? cycles : null;

    void (async () => {
      setLoading(true);
      setError(null);
      try {
        const curves = await buildComparisonFromBars(market.dataSymbol, sourceBars, {
          presidentialPhases: phaseFilter,
          excludedYears,
        });
        if (cancelled) return;
        const filtered = filterBarsByExcludedYears(
          filterBarsByPresidentialPhases(sourceBars, phaseFilter),
          excludedYears,
        );
        setComparison(curves);
        setOhlcBars(filtered);
      } catch (err) {
        if (cancelled) return;
        setComparison(null);
        setOhlcBars(null);
        setError(err instanceof Error ? err.message : t("seasonality.loadError"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [sourceBars, marketId, cycles, excludedYears, t]);

  const availableYears = useMemo(() => {
    if (!sourceBars) return [];
    const phaseFilter = hasPresidentialSelection(cycles) ? cycles : null;
    return listYearsFromBars(filterBarsByPresidentialPhases(sourceBars, phaseFilter));
  }, [sourceBars, cycles]);

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
    if (base.deviationAnalysis) return base;
    return attachSeasonalDeviationAnalysis(base);
  }, [comparison, lookback]);

  const currentMonth = result
    ? new Date(result.currentDate).getMonth() + 1
    : new Date().getMonth() + 1;

  return (
    <div className="titan-seasonality animate-fade-up">
      {error ? (
        <div className="mb-4 rounded-lg border border-rose-500/30 bg-rose-950/25 px-4 py-3 text-sm text-rose-200/90">
          {error}
        </div>
      ) : null}

      <div className="mb-4">
        <p className="titan-cmd-kicker mb-2">{t("seasonality.selectMarket")}</p>
        <SeasonalityMarketSelector activeId={marketId} onSelect={selectMarket} disabled={loading} />
      </div>

      <div className={`space-y-4${loading ? " opacity-90" : ""}`}>
        {result && comparison ? (
          <>
            <SeasonalityDashboard
              result={result}
              comparison={comparison}
              currentMonth={currentMonth}
            />
            <SeasonalityMainChart
              result={result}
              comparison={comparison}
              ohlcBars={ohlcBars}
              availableYears={availableYears}
              marketLabel={market?.label ?? marketId}
              lookback={lookback}
              onLookbackChange={setLookback}
              currentMonth={currentMonth}
              presidentialPhases={cycles}
              onPresidentialPhasesChange={onCyclesChange}
              excludedYears={excludedYears}
              onExcludedYearsChange={setExcludedYears}
              filtersDisabled={loading}
              loading={loading}
            />
            <p className="text-[10px] leading-relaxed text-stone-600">
              {shouldUseSeasonalityApi()
                ? t("seasonality.dataNoteApi", { target: describeSeasonalityApiTarget() })
                : dataSource === "yahoo"
                  ? t("seasonality.dataNoteYahoo")
                  : t("seasonality.dataNote")}
            </p>
          </>
        ) : loading ? (
          <div className="titan-seasonality-panel px-5 py-10 text-center text-sm text-stone-500">
            {t("seasonality.loading")}
          </div>
        ) : null}
      </div>
    </div>
  );
}
