import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  getDefaultSelectedMarket,
  INSTITUTIONAL_MARKETS,
  type InstitutionalMarket,
} from "../../config/institutionalMarkets";
import { describeCotApiTarget, loadAllMappedCotData } from "../../data/cotData";
import type { CotDashboardData } from "../../types";
import { TitanLogo } from "../TitanLogo";
import { buildScannerRows, GlobalCotScanner } from "./GlobalCotScanner";
import { CotHeatmap } from "./CotHeatmap";
import { MarketDetailPanel } from "./MarketDetailPanel";
import { TitanLivePill } from "./ui/TitanPrimitives";

const REFRESH_MS = 120_000;

const MAPPING_PAYLOAD = INSTITUTIONAL_MARKETS.map((m) => ({ futuresSymbol: m.symbol }));

type DashboardView = "overview" | "market";

function lockPageScroll(lock: boolean) {
  document.documentElement.style.overflow = lock ? "hidden" : "";
  document.body.style.overflow = lock ? "hidden" : "";
}

export function TitanCotDashboard() {
  const [view, setView] = useState<DashboardView>("overview");
  const [selectedMarket, setSelectedMarket] = useState<InstitutionalMarket>(() => getDefaultSelectedMarket());
  const [bundle, setBundle] = useState<Record<string, CotDashboardData>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const marketScrollRef = useRef<HTMLDivElement>(null);

  const openMarket = useCallback((market: InstitutionalMarket) => {
    setSelectedMarket(market);
    setView("market");
  }, []);

  const backToOverview = useCallback(() => {
    setView("overview");
  }, []);

  useEffect(() => {
    if (typeof history !== "undefined" && "scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
  }, []);

  useEffect(() => {
    if (view === "market") {
      lockPageScroll(true);
      marketScrollRef.current?.scrollTo(0, 0);
    } else {
      lockPageScroll(false);
    }
    return () => lockPageScroll(false);
  }, [view, selectedMarket.symbol]);

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
          const msg = err instanceof Error ? err.message : "Failed to load CFTC data.";
          setGlobalError(
            msg.includes("Failed to fetch") || msg.includes("NetworkError")
              ? `Nelze se připojit k API (${describeCotApiTarget()}). Na Vercelu nastav VITE_COT_API_URL=https://titan-cot.onrender.com nebo pushni vercel.json proxy a redeploy.`
              : msg,
          );
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

  const selectedSymbol = selectedMarket.symbol;
  const selectedData = bundle[selectedSymbol] ?? null;
  const symbolError = errors[selectedSymbol];
  const loadingDetail = !selectedData && !symbolError && !globalError;
  const detailError = globalError ?? symbolError ?? null;

  const refreshLabel = lastRefresh
    ? lastRefresh.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
    : "—";

  const isMarketView = view === "market";

  return (
    <div className="titan-page-bg min-h-screen">
      <header className="titan-header-bar sticky top-0 z-30 shrink-0">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-5 px-4 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            {isMarketView ? (
              <button
                type="button"
                onClick={backToOverview}
                className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-titan-line/90 bg-titan-panel text-stone-400 transition-colors hover:border-titan-gold/35 hover:text-titan-goldBright"
                aria-label="Zpět na všechny trhy"
              >
                ←
              </button>
            ) : (
              <TitanLogo className="h-12 w-12 shrink-0 drop-shadow-glow" />
            )}
            <div>
              <p className="font-display text-[10px] font-semibold uppercase tracking-[0.32em] text-titan-gold">
                TITAN
              </p>
              <h1 className="font-display text-2xl font-bold tracking-tight text-stone-50 md:text-[1.75rem]">
                {isMarketView ? (
                  <>
                    {selectedMarket.shortLabel}{" "}
                    <span className="text-titan-goldDim">{selectedMarket.symbol}</span>
                  </>
                ) : (
                  "COT Dashboard"
                )}
              </h1>
              <p className="mt-1 max-w-lg text-sm leading-relaxed text-stone-500">
                {isMarketView
                  ? `${selectedMarket.subtitle} · CFTC + TradingView`
                  : "Vyber trh — otevře se samostatná stránka (bez scrollu dolů)"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 lg:justify-end">
            <TitanLivePill label={`${liveCount} markets live`} />
            <div className="rounded-xl border border-titan-line/90 bg-titan-panel/90 px-4 py-3 shadow-insetGold">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                {isMarketView ? "Report" : "Data"}
              </p>
              <p className="mt-0.5 font-mono text-sm font-medium text-titan-goldBright">
                {isMarketView && selectedData?.reportDate
                  ? selectedData.reportDate
                  : `Refresh ${REFRESH_MS / 1000}s`}
              </p>
              <p className="mt-1 text-[10px] text-stone-600">Updated {refreshLabel}</p>
            </div>
          </div>
        </div>
      </header>

      {globalError && view === "overview" ? (
        <div className="mx-auto max-w-[1600px] px-4 pt-6">
          <div className="rounded-xl border border-rose-500/30 bg-rose-950/25 px-4 py-3 text-sm text-rose-200/90 backdrop-blur-sm">
            <strong className="font-medium text-rose-300">Connection:</strong> {globalError}
          </div>
        </div>
      ) : null}

      {view === "overview" ? (
        <main className="mx-auto max-w-[1600px] space-y-6 px-4 py-8">
          <GlobalCotScanner rows={rows} selectedMarket={selectedMarket} onSelectMarket={openMarket} />
          <CotHeatmap
            markets={INSTITUTIONAL_MARKETS}
            bundle={bundle}
            selectedMarket={selectedMarket}
            onSelectMarket={openMarket}
          />
        </main>
      ) : (
        <div
          ref={marketScrollRef}
          className="fixed inset-x-0 bottom-0 top-[var(--titan-header-offset,5.5rem)] z-20 overflow-y-auto overflow-x-hidden bg-titan-black titan-page-bg"
        >
          <main className="mx-auto max-w-[1600px] px-4 py-6 pb-12">
            {globalError ? (
              <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-950/25 px-4 py-3 text-sm text-rose-200/90">
                {globalError}
              </div>
            ) : null}
            <MarketDetailPanel
              key={selectedSymbol}
              market={selectedMarket}
              data={selectedData}
              loading={loadingDetail}
              error={detailError && !selectedData ? detailError : null}
            />
          </main>
        </div>
      )}

      {view === "overview" ? (
        <footer className="border-t border-titan-line/60 py-10 text-center">
          <p className="text-[11px] text-stone-600">
            TITAN COT — Bias only, not execution
          </p>
        </footer>
      ) : null}
    </div>
  );
}
