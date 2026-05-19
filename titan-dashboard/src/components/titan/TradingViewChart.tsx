import { useMemo, useRef } from "react";
import type { InstitutionalMarket } from "../../config/institutionalMarkets";
import { buildTradingViewEmbedUrl } from "../../lib/tradingViewEmbed";
import { futuresToTradingViewSymbol, tradingViewChartUrl } from "../../lib/tradingViewSymbols";

type TradingViewChartProps = {
  market: InstitutionalMarket;
  selectionKey: string;
};

export function TradingViewChart({ market, selectionKey }: TradingViewChartProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const tvSymbol = futuresToTradingViewSymbol(market.symbol);
  const embedUrl = useMemo(() => buildTradingViewEmbedUrl(tvSymbol), [tvSymbol]);

  return (
    <section
      className="flex min-h-[440px] flex-col overflow-hidden rounded-xl border border-titan-line/70 bg-titan-panel"
      aria-label={`TradingView chart for ${market.shortLabel}`}
    >
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-titan-line/70 px-4 py-3">
        <div>
          <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-500">
            TradingView · cena futures
          </h3>
          <p className="mt-0.5 font-mono text-xs text-titan-goldBright">
            {tvSymbol}
            <span className="text-stone-600"> · {market.symbol}</span>
          </p>
        </div>
        <a
          href={tradingViewChartUrl(market.symbol)}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border border-titan-line/80 bg-titan-elevated/50 px-3 py-1.5 text-[11px] font-medium text-stone-400 transition-colors hover:border-titan-gold/30 hover:text-titan-goldBright"
        >
          Otevřít v TV ↗
        </a>
      </header>
      <iframe
        ref={iframeRef}
        key={`${selectionKey}-${tvSymbol}`}
        title={`TradingView ${market.shortLabel} (${tvSymbol})`}
        src={embedUrl}
        className="min-h-[400px] w-full flex-1 border-0 bg-titan-panel"
        tabIndex={-1}
        allowFullScreen
        loading="eager"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </section>
  );
}
