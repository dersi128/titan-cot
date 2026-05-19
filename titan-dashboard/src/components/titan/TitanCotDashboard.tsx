import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  getDefaultSelectedMarket,
  INSTITUTIONAL_MARKETS,
  type InstitutionalMarket,
} from "../../config/institutionalMarkets";
import { loadAllMappedCotData } from "../../data/cotData";
import type { CotDashboardData } from "../../types";
import { TitanLogo } from "../TitanLogo";
import { buildScannerRows, GlobalCotScanner } from "./GlobalCotScanner";
import { CotHeatmap } from "./CotHeatmap";
import { MarketDetailPanel } from "./MarketDetailPanel";
import { TitanLivePill } from "./ui/TitanPrimitives";

const REFRESH_MS = 120_000;

const MAPPING_PAYLOAD = INSTITUTIONAL_MARKETS.map((m) => ({ futuresSymbol: m.symbol }));

export function TitanCotDashboard() {
  const [selectedMarket, setSelectedMarket] = useState<InstitutionalMarket>(() => getDefaultSelectedMarket());
  const [bundle, setBundle] = useState<Record<string, CotDashboardData>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
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
    const charts = document.getElementById("market-charts");
    if (charts) {
      charts.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      marketDetailAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
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
        setLastRefresh(new Date());
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
  const liveCount = useMemo(() => rows.filter((r) => r.status === "live").length, [rows]);

  const selectedData = bundle[selectedSymbol] ?? null;
  const symbolError = errors[selectedSymbol];
  const loadingDetail = !selectedData && !symbolError && !globalError;
  const detailError = globalError ?? symbolError ?? null;

  const refreshLabel = lastRefresh
    ? lastRefresh.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
    : "—";

  return (
    <div className="titan-page-bg min-h-screen">
      <header className="titan-header-bar sticky top-0 z-20">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-5 px-4 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <TitanLogo className="h-12 w-12 shrink-0 drop-shadow-glow" />
            <div>
              <p className="font-display text-[10px] font-semibold uppercase tracking-[0.32em] text-titan-gold">
                TITAN
              </p>
              <h1 className="font-display text-2xl font-bold tracking-tight text-stone-50 md:text-[1.75rem]">
                COT Dashboard
              </h1>
              <p className="mt-1 max-w-lg text-sm leading-relaxed text-stone-500">
                Institutional positioning · CFTC Legacy Futures · Swing bias context only
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 lg:justify-end">
            <TitanLivePill label={`${liveCount} markets live`} />
            <div className="rounded-xl border border-titan-line/90 bg-titan-panel/90 px-4 py-3 shadow-insetGold">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">Focus</p>
              <p className="mt-0.5 font-mono text-sm font-medium text-titan-goldBright">
                {selectedMarket.shortLabel}{" "}
                <span className="text-titan-goldDim">{selectedMarket.symbol}</span>
              </p>
              <p className="mt-1 text-[10px] text-stone-600">
                Refresh {REFRESH_MS / 1000}s · Updated {refreshLabel}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] space-y-6 px-4 py-8">
        {globalError ? (
          <div className="rounded-xl border border-rose-500/30 bg-rose-950/25 px-4 py-3 text-sm text-rose-200/90 backdrop-blur-sm">
            <strong className="font-medium text-rose-300">Connection:</strong> {globalError} — start the COT API (
            <code className="rounded bg-titan-elevated px-1.5 py-0.5 font-mono text-xs">cot-data-module</code>).
          </div>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-1">
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

      <footer className="border-t border-titan-line/60 py-10 text-center">
        <p className="text-[11px] text-stone-600">
          TITAN COT — Smart money context only · Bias only, not execution
        </p>
        <p className="mt-1 text-[10px] text-stone-700">
          Past positioning does not predict future prices
        </p>
      </footer>
    </div>
  );
}
