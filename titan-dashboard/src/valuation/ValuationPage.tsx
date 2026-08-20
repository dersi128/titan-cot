import { useCallback, useEffect, useState } from "react";
import { useTitanI18n } from "../i18n";
import { parseValuationMarketFromHash, setAppSectionHash } from "../lib/titanAppRoute";
import { DEFAULT_VALUATION_MARKET_ID, getValuationMarket } from "./markets";
import { computeValuation } from "./engine";
import { fetchYahooDailyOHLC } from "../seasonality/data/yahooOhlcProvider";
import { describeValuationApiTarget, fetchValuationDetail, fetchValuationUniverse } from "./valuationApi";
import type { ValuationAssetClass, ValuationSnapshot, ValuationUniverseRow } from "./types";
import { ValuationMarketSelector } from "./components/ValuationMarketSelector";
import { ValuationHero } from "./components/ValuationHero";
import { ValuationChart } from "./components/ValuationChart";
import { ValuationUniverse } from "./components/ValuationUniverse";

type AssetFilter = "all" | ValuationAssetClass;

async function computeLocal(id: string): Promise<ValuationSnapshot> {
  const market = getValuationMarket(id);
  if (!market) throw new Error(`Unknown market ${id}`);
  const bars = await fetchYahooDailyOHLC(market.yahooSymbol, 20);
  return computeValuation({
    market,
    price: bars.map((b) => ({ date: b.date, value: b.close })),
    withHistory: true,
  });
}

export function ValuationPage() {
  const { t } = useTitanI18n();
  const [marketId, setMarketId] = useState(
    () => parseValuationMarketFromHash() ?? DEFAULT_VALUATION_MARKET_ID,
  );
  const [assetFilter, setAssetFilter] = useState<AssetFilter>("all");
  const [snapshot, setSnapshot] = useState<ValuationSnapshot | null>(null);
  const [rows, setRows] = useState<ValuationUniverseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<"api" | "yahoo">("api");

  const selectMarket = useCallback((id: string) => {
    setMarketId(id);
    setAppSectionHash("valuation", { valuationMarket: id });
  }, []);

  useEffect(() => {
    const sync = () => {
      const fromHash = parseValuationMarketFromHash();
      if (fromHash) setMarketId(fromHash);
    };
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      setError(null);
      try {
        const snap = await fetchValuationDetail(marketId);
        if (cancelled) return;
        setSnapshot(snap);
        setSource("api");
      } catch {
        try {
          const snap = await computeLocal(marketId);
          if (cancelled) return;
          setSnapshot(snap);
          setSource("yahoo");
        } catch (err) {
          if (cancelled) return;
          setSnapshot(null);
          setError(err instanceof Error ? err.message : t("valuation.loadError"));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [marketId, t]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const universe = await fetchValuationUniverse();
        if (!cancelled) setRows(universe);
      } catch {
        if (!cancelled) setRows([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="titan-seasonality animate-fade-up">
      {error ? (
        <div className="mb-4 rounded-lg border border-rose-500/30 bg-rose-950/25 px-4 py-3 text-sm text-rose-200/90">
          {error}
        </div>
      ) : null}

      <div className="mb-4">
        <p className="titan-cmd-kicker mb-2">{t("valuation.selectMarket")}</p>
        <ValuationMarketSelector
          activeId={marketId}
          assetFilter={assetFilter}
          onFilter={setAssetFilter}
          onSelect={selectMarket}
          disabled={loading}
        />
      </div>

      <div className={`space-y-4${loading ? " opacity-90" : ""}`}>
        {snapshot ? (
          <>
            <ValuationHero snapshot={snapshot} />
            <ValuationChart snapshot={snapshot} />
            {rows.length > 0 ? (
              <ValuationUniverse rows={rows} activeId={marketId} onSelect={selectMarket} />
            ) : null}
            <p className="text-[10px] leading-relaxed text-stone-600">
              {source === "api"
                ? t("valuation.dataNoteApi", { target: describeValuationApiTarget() })
                : t("valuation.dataNoteYahoo")}
            </p>
            <p className="text-[10px] leading-relaxed text-stone-600">{t("valuation.disclaimer")}</p>
          </>
        ) : loading ? (
          <div className="titan-seasonality-panel px-5 py-10 text-center text-sm text-stone-500">
            {t("valuation.loading")}
          </div>
        ) : null}
      </div>
    </div>
  );
}
