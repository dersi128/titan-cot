import { useEffect, useRef } from "react";
import type { InstitutionalMarket } from "../../config/institutionalMarkets";
import { futuresToTradingViewSymbol, tradingViewChartUrl } from "../../lib/tradingViewSymbols";

type TradingViewChartProps = {
  market: InstitutionalMarket;
  /** Remount widget when selection changes */
  selectionKey: string;
};

const WIDGET_SCRIPT = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";

export function TradingViewChart({ market, selectionKey }: TradingViewChartProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const tvSymbol = futuresToTradingViewSymbol(market.symbol);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    host.replaceChildren();

    const widgetShell = document.createElement("div");
    widgetShell.className = "tradingview-widget-container h-full w-full";
    widgetShell.style.height = "100%";

    const widgetInner = document.createElement("div");
    widgetInner.className = "tradingview-widget-container__widget";
    widgetInner.style.height = "100%";

    const script = document.createElement("script");
    script.src = WIDGET_SCRIPT;
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: tvSymbol,
      interval: "D",
      timezone: "exchange",
      theme: "dark",
      style: "1",
      locale: "en",
      enable_publishing: false,
      hide_top_toolbar: false,
      hide_legend: false,
      allow_symbol_change: false,
      save_image: false,
      calendar: false,
      hide_volume: false,
      support_host: "https://www.tradingview.com",
      backgroundColor: "#0c0c10",
      gridColor: "rgba(37, 37, 45, 0.55)",
    });

    widgetShell.appendChild(widgetInner);
    widgetShell.appendChild(script);
    host.appendChild(widgetShell);

    return () => {
      host.replaceChildren();
    };
  }, [tvSymbol, selectionKey]);

  return (
    <section
      id="tradingview-chart"
      className="flex min-h-[420px] flex-col overflow-hidden rounded-xl border border-titan-line/70 bg-titan-black/50"
      aria-label={`TradingView chart for ${market.shortLabel}`}
    >
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-titan-line/70 px-4 py-3">
        <div>
          <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-500">
            Price chart
          </h3>
          <p className="mt-0.5 font-mono text-xs text-titan-goldDim">
            {tvSymbol} · TradingView
          </p>
        </div>
        <a
          href={tradingViewChartUrl(market.symbol)}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border border-titan-line/80 bg-titan-elevated/50 px-3 py-1.5 text-[11px] font-medium text-stone-400 transition-colors hover:border-titan-gold/30 hover:text-titan-goldBright"
        >
          Open full chart ↗
        </a>
      </header>
      <div
        key={selectionKey}
        ref={hostRef}
        className="relative min-h-[380px] flex-1 w-full"
      />
    </section>
  );
}
