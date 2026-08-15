import { useState } from "react";
import { useTitanI18n } from "../../i18n";
import { SEASONALITY_MARKETS, normalizeCustomSymbol, resolveSeasonalityMarket } from "../markets";

type SeasonalityMarketSelectorProps = {
  activeId: string;
  onSelect: (id: string) => void;
  disabled?: boolean;
};

export function SeasonalityMarketSelector({
  activeId,
  onSelect,
  disabled,
}: SeasonalityMarketSelectorProps) {
  const { t } = useTitanI18n();
  const [query, setQuery] = useState("");
  const activeUpper = activeId.toUpperCase();
  const isPreset = SEASONALITY_MARKETS.some(
    (m) => m.id === activeUpper || m.dataSymbol.toUpperCase() === activeUpper,
  );
  const isCustom = !isPreset;

  const submitSearch = () => {
    const market = resolveSeasonalityMarket(query);
    if (!market) return;
    onSelect(market.dataSymbol);
    setQuery("");
  };

  return (
    <div className="space-y-3">
      <div className="titan-seasonality-markets flex flex-wrap gap-1.5" role="tablist" aria-label="Markets">
        {SEASONALITY_MARKETS.map((m) => {
          const active = m.id === activeUpper || m.dataSymbol.toUpperCase() === activeUpper;
          return (
            <button
              key={m.id}
              type="button"
              role="tab"
              aria-selected={active}
              disabled={disabled}
              onClick={() => onSelect(m.id)}
              className={`titan-seasonality-market-btn ${active ? "titan-seasonality-market-btn--active" : ""}`}
            >
              {m.label}
            </button>
          );
        })}
        {isCustom ? (
          <button
            type="button"
            role="tab"
            aria-selected
            disabled={disabled}
            className="titan-seasonality-market-btn titan-seasonality-market-btn--active"
          >
            {activeId}
          </button>
        ) : null}
      </div>

      <form
        className="flex flex-wrap items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          submitSearch();
        }}
      >
        <input
          type="text"
          value={query}
          disabled={disabled}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("seasonality.searchPlaceholder")}
          className="min-w-[220px] flex-1 rounded-lg border border-titan-gold/20 bg-black/30 px-3 py-2 text-[13px] text-stone-200 placeholder:text-stone-600 outline-none focus:border-titan-gold/45"
          spellCheck={false}
          autoCapitalize="characters"
          autoComplete="off"
        />
        <button
          type="submit"
          disabled={disabled || !normalizeCustomSymbol(query)}
          className="rounded-lg border border-titan-gold/35 bg-titan-gold/15 px-3 py-2 text-[12px] font-semibold uppercase tracking-wider text-titan-goldBright disabled:opacity-40"
        >
          {t("seasonality.searchSubmit")}
        </button>
      </form>
      <p className="text-[10px] text-stone-600">{t("seasonality.searchHint")}</p>
    </div>
  );
}
