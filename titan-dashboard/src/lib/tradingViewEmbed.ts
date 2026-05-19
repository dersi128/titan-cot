/** TradingView advanced chart iframe URL (React-safe, no script injection). */
export function buildTradingViewEmbedUrl(tvSymbol: string): string {
  const config = {
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
    support_host: "https://www.tradingview.com",
    backgroundColor: "rgba(12, 12, 16, 1)",
    gridColor: "rgba(37, 37, 45, 0.55)",
  };

  return `https://s.tradingview.com/embed-widget/advanced-chart/?locale=en#${encodeURIComponent(JSON.stringify(config))}`;
}
