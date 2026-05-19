/**
 * TradingView Advanced Chart — symbol must be a query param (hash JSON often defaults to AAPL).
 * @see https://www.tradingview.com/widget-docs/widgets/charts/advanced-chart/
 */
export function buildTradingViewEmbedUrl(tvSymbol: string): string {
  const params = new URLSearchParams({
    symbol: tvSymbol,
    interval: "D",
    timezone: "Etc/UTC",
    theme: "dark",
    style: "1",
    locale: "en",
    enable_publishing: "false",
    allow_symbol_change: "false",
    save_image: "false",
    calendar: "false",
    hide_top_toolbar: "false",
    hide_legend: "false",
    backgroundColor: "rgba(12, 12, 16, 1)",
    gridColor: "rgba(37, 37, 45, 0.55)",
    support_host: "https://titan-cot.vercel.app",
  });

  return `https://s.tradingview.com/embed-widget/advanced-chart/?${params.toString()}`;
}
