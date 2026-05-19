import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  getDefaultSelectedMarket,
  INSTITUTIONAL_MARKETS,
  type InstitutionalMarket,
} from "../../config/institutionalMarkets";
import { loadAllMappedCotData } from "../../data/cotData";
import type { CotDashboardData } from "../../types";
import { buildScannerRows, GlobalCotScanner } from "./GlobalCotScanner";
import { CotHeatmap } from "./CotHeatmap";
import { MarketDetailPanel } from "./MarketDetailPanel";

const REFRESH_MS = 120_000;

const MAPPING_PAYLOAD = INSTITUTIONAL_MARKETS.map((m) => ({ futuresSymbol: m.symbol }));

export function TitanCotDashboard() {
  const [selectedMarket, setSelectedMarket] = useState<InstitutionalMarket>(() => getDefaultSelectedMarket());
  const [bundle, setBundle] = useState<Record<string, CotDashboardData>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const marketDetailAnchorRef = useRef<HTMLDivElement>(null);
  const skipScrollOnMountRef = useRef(true);

  const handleSelectMarket = useCallback((market: InstitutionalMarket) => {
    setSelectedMarket(market);
  }, []);

  const selectedSymbol = selectedMarket.symbol;

  useEffect(() => {
    if (skipScrollOnMountRef.current) {
      skipScrollOnMountRef.current = false;
      return;
    }
    marketDetailAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [selectedSymbol]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const { bundle: nextBundle, errors: nextErrors } = await loadAllMappedCotData(MAPPING_PAYLOAD);
        if (cancelled) return;
        setBundle(nextBundle);
        setErrors(nextErrors);
        setGlobalError(null);
      } catch (err) {
        if (!cancelled) {
          setGlobalError(err instanceof Error ? err.message : "Failed to load CFTC data.");
          setBundle({});
          setErrors({});
        }
      }
    };
    void run();
    const id = window.setInterval(() => void run(), REFRESH_MS);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  const rows = useMemo(() => buildScannerRows(INSTITUTIONAL_MARKETS, bundle, errors), [bundle, errors]);

  const selectedData = bundle[selectedSymbol] ?? null;
  const symbolError = errors[selectedSymbol];
  const loadingDetail = !selectedData && !symbolError && !globalError;

  const detailError = globalError ?? symbolError ?? null;

  return (
    <div className="min-h-screen bg-titan-black">
      <header className="sticky top-0 z-20 border-b border-titan-line bg-titan-void/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-3 px-4 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-display text-[10px] font-semibold uppercase tracking-[0.28em] text-titan-gold">
              TITAN
            </p>
            <h1 className="font-display text-2xl font-semibold tracking-tight text-stone-100 md:text-3xl">
              COT Dashboard
            </h1>
            <p className="mt-1 max-w-xl text-sm text-stone-500">
              Swing-oriented institutional positioning · CFTC Legacy Futures Only · Bias, not execution
            </p>
          </div>
          <div className="rounded-lg border border-titan-line bg-titan-panel px-4 py-3 text-right transition-colors duration-300">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">Selected</p>
            <p className="mt-1 font-mono text-sm text-titan-gold transition-all duration-300">
              {selectedMarket.shortLabel}{" "}
              <span className="text-titan-goldDim">{selectedMarket.symbol}</span>
            </p>
            <p className="mt-1 text-[10px] text-stone-600">Data refresh · {REFRESH_MS / 1000}s</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] space-y-8 px-4 py-8">
        {globalError ? (
          <div className="rounded-lg border border-rose-500/30 bg-rose-950/20 px-4 py-3 text-sm text-rose-200/90">
            <strong className="text-rose-300">Connection:</strong> {globalError} — start the COT API (
            <code className="rounded bg-titan-elevated px-1">cot-data-module</code>).
          </div>
        ) : null}

        <div className="space-y-8">
          <GlobalCotScanner
            rows={rows}
            selectedMarket={selectedMarket}
            onSelectMarket={handleSelectMarket}
          />
          <CotHeatmap
            markets={INSTITUTIONAL_MARKETS}
            bundle={bundle}
            selectedMarket={selectedMarket}
            onSelectMarket={handleSelectMarket}
          />
        </div>

        <div
          ref={marketDetailAnchorRef}
          id="market-detail"
          key={selectedSymbol}
          className="titan-market-surface scroll-mt-28"
        >
          <MarketDetailPanel
            market={selectedMarket}
            data={selectedData}
            loading={loadingDetail}
            error={detailError && !selectedData ? detailError : null}
          />
        </div>
      </main>

      <footer className="border-t border-titan-line py-8 text-center text-[11px] text-stone-600">
        TITAN COT Dashboard — Smart money context only. Past positioning does not predict future prices.
      </footer>
    </div>
  );
}
