import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getDefaultSelectedMarket,
  INSTITUTIONAL_MARKETS,
  type InstitutionalMarket,
} from "../../config/institutionalMarkets";
import { describeCotApiTarget, loadAllMappedCotData } from "../../data/cotData";
import type { CotDashboardData } from "../../types";
import { TitanInstitutionalBackdrop } from "../TitanInstitutionalBackdrop";
import { buildScannerRows, GlobalCotScanner } from "./GlobalCotScanner";
import { TitanHomeCommandCenter } from "./home/TitanHomeCommandCenter";
import { TitanHomeHero } from "./home/TitanHomeHero";
import { MarketDetailPanel } from "./MarketDetailPanel";
import { TitanDetailErrorBoundary } from "./TitanDetailErrorBoundary";
import { LanguageSwitcher, useTitanI18n } from "../../i18n";
import { TitanLivePill } from "./ui/TitanPrimitives";

const REFRESH_MS = 120_000;

const MAPPING_PAYLOAD = INSTITUTIONAL_MARKETS.map((m) => ({ futuresSymbol: m.symbol }));

type DashboardView = "overview" | "market";

function lockPageScroll(lock: boolean) {
  const value = lock ? "hidden" : "";
  document.documentElement.style.overflow = value;
  document.body.style.overflow = value;
  if (!lock) {
    document.documentElement.style.removeProperty("overflow");
    document.body.style.removeProperty("overflow");
  }
}

export function TitanCotDashboard() {
  const { t } = useTitanI18n();
  const [view, setView] = useState<DashboardView>("overview");
  const [selectedMarket, setSelectedMarket] = useState<InstitutionalMarket>(() => getDefaultSelectedMarket());
  const [bundle, setBundle] = useState<Record<string, CotDashboardData>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const openMarket = useCallback((market: InstitutionalMarket) => {
    setSelectedMarket(market);
    setView("market");
  }, []);

  const backToOverview = useCallback(() => {
    setView("overview");
    lockPageScroll(false);
    requestAnimationFrame(() => {
      window.scrollTo(0, 0);
    });
  }, []);

  useEffect(() => {
    if (typeof history !== "undefined" && "scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
  }, []);

  useEffect(() => {
    if (view === "market") {
      window.scrollTo(0, 0);
    }
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
          const msg = err instanceof Error ? err.message : t("errors.loadCftc");
          setGlobalError(
            msg.includes("Failed to fetch") || msg.includes("NetworkError")
              ? t("errors.apiConnect", { target: describeCotApiTarget() })
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
  }, [t]);

  const rows = useMemo(() => {
    try {
      return buildScannerRows(INSTITUTIONAL_MARKETS, bundle, errors);
    } catch (err) {
      console.error("[TITAN] buildScannerRows batch failed", err);
      return [];
    }
  }, [bundle, errors]);
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
      <TitanInstitutionalBackdrop />
      <div className="titan-content-layer min-h-screen">
        <header className={`titan-header-bar sticky top-0 z-30 shrink-0 ${isMarketView ? "" : "titan-header-bar--home"}`}>
          <div className={`mx-auto max-w-[1680px] px-4 md:px-6 ${isMarketView ? "py-5" : "py-2 md:py-3"}`}>
            {isMarketView ? (
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start gap-4">
                  <button
                    type="button"
                    onClick={backToOverview}
                    className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-titan-gold/20 bg-titan-panel/90 text-lg text-titan-goldBright shadow-card transition-all hover:border-titan-gold/45 hover:bg-titan-elevated/80"
                    aria-label={t("header.backMarkets")}
                  >
                    ←
                  </button>
                  <div>
                    <p className="font-display text-[10px] font-semibold uppercase tracking-[0.32em] text-titan-gold">
                      {t("header.marketDetail")}
                    </p>
                    <h1 className="font-display text-2xl font-bold tracking-tight text-stone-50 md:text-[1.75rem]">
                      {selectedMarket.shortLabel}{" "}
                      <span className="text-titan-goldDim">{selectedMarket.symbol}</span>
                    </h1>
                    <p className="mt-1 max-w-lg text-sm leading-relaxed text-stone-500">
                      {selectedMarket.subtitle} · {t("header.cftcTv")}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 lg:justify-end">
                  <LanguageSwitcher />
                  <TitanLivePill label={t("header.marketsLive", { count: liveCount })} />
                  <div className="rounded-xl border border-titan-gold/15 bg-titan-panel/80 px-4 py-3 shadow-insetGold backdrop-blur-md">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                      {t("header.report")}
                    </p>
                    <p className="mt-0.5 font-mono text-sm font-medium text-titan-goldBright">
                      {selectedData?.reportDate ?? "—"}
                    </p>
                    <p className="mt-1 text-[10px] text-stone-600">{t("header.updated", { time: refreshLabel })}</p>
                  </div>
                </div>
              </div>
            ) : (
              <TitanHomeHero
                liveCount={liveCount}
                refreshSec={REFRESH_MS / 1000}
                refreshLabel={refreshLabel}
              />
            )}
          </div>
        </header>

        {globalError && view === "overview" ? (
          <div className="mx-auto max-w-[1600px] px-4 pt-6">
            <div className="rounded-xl border border-rose-500/30 bg-rose-950/25 px-4 py-3 text-sm text-rose-200/90 backdrop-blur-sm">
              <strong className="font-medium text-rose-300">{t("header.connection")}:</strong> {globalError}
            </div>
          </div>
        ) : null}

        {view === "overview" ? (
          <main className="titan-home-main mx-auto w-full max-w-[1680px] px-4 py-4 md:px-6 md:py-5">
            <TitanHomeCommandCenter
              rows={rows}
              bundle={bundle}
              onSelectMarket={openMarket}
              scanner={
                <GlobalCotScanner rows={rows} selectedMarket={selectedMarket} onSelectMarket={openMarket} />
              }
            />
          </main>
        ) : null}

        {view === "market" ? (
          <main className="mx-auto max-w-[1600px] px-4 py-6 pb-12">
            {globalError ? (
              <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-950/25 px-4 py-3 text-sm text-rose-200/90">
                {globalError}
              </div>
            ) : null}
            <TitanDetailErrorBoundary key={selectedSymbol}>
              <MarketDetailPanel
                market={selectedMarket}
                data={selectedData}
                loading={loadingDetail}
                error={detailError && !selectedData ? detailError : null}
              />
            </TitanDetailErrorBoundary>
          </main>
        ) : null}

        <footer
          className="border-t border-white/[0.06] py-6 text-center"
          hidden={view !== "overview"}
          aria-hidden={view !== "overview"}
        >
          <p className="text-[10px] tracking-wide text-stone-600">{t("footerNote")}</p>
        </footer>
      </div>
    </div>
  );
}
