import { useMemo, useRef } from "react";
import type { InstitutionalMarket } from "../../config/institutionalMarkets";
import { buildTradingViewEmbedUrl } from "../../lib/tradingViewEmbed";
import { useTitanI18n } from "../../i18n";
import {
  embedTradingViewSymbol,
  getTradingViewMapping,
  tradingViewFuturesUrl,
} from "../../lib/tradingViewSymbols";

type TradingViewChartProps = {
  market: InstitutionalMarket;
  selectionKey: string;
};

export function TradingViewChart({ market, selectionKey }: TradingViewChartProps) {
  const { t } = useTitanI18n();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const mapping = getTradingViewMapping(market.symbol);
  const embedSymbol = embedTradingViewSymbol(market.symbol);
  const embedUrl = useMemo(() => buildTradingViewEmbedUrl(embedSymbol), [embedSymbol]);
  const futuresUrl = tradingViewFuturesUrl(market.symbol);

  return (
    <section
      className="flex min-h-[440px] flex-col overflow-hidden rounded-xl border border-titan-line/70 bg-titan-panel"
      aria-label={`TradingView chart for ${market.shortLabel}`}
    >
      <header className="space-y-2 border-b border-titan-line/70 px-4 py-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-500">
              {t("tv.title")}
            </h3>
            <p className="mt-0.5 font-mono text-xs text-titan-goldBright">
              {t("tv.embed")}: {embedSymbol}
            </p>
            <p className="mt-0.5 font-mono text-[11px] text-stone-500">
              {t("tv.futures")}: {mapping.futuresTv} · {market.symbol}
            </p>
          </div>
          <a
            href={futuresUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 rounded-lg border border-titan-gold/35 bg-titan-gold/10 px-3 py-2 text-[11px] font-semibold text-titan-goldBright transition-colors hover:bg-titan-gold/20"
          >
            {t("tv.openFutures")}
          </a>
        </div>
        <p className="text-[11px] leading-snug text-stone-500">{mapping.embedNote}</p>
      </header>
      <iframe
        ref={iframeRef}
        key={`${selectionKey}-${embedSymbol}`}
        title={`TradingView ${market.shortLabel} (${embedSymbol})`}
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
