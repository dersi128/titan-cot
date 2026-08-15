import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { useTitanI18n } from "../../i18n";
import { SEASONALITY_MARKETS, normalizeCustomSymbol, resolveSeasonalityMarket } from "../markets";
import { searchSeasonalitySymbols } from "../data/seasonalitySymbolCatalog";

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
  const listId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);

  const activeUpper = activeId.toUpperCase();
  const isPreset = SEASONALITY_MARKETS.some(
    (m) => m.id === activeUpper || m.dataSymbol.toUpperCase() === activeUpper,
  );
  const isCustom = !isPreset;

  const suggestions = useMemo(() => searchSeasonalitySymbols(query, 8), [query]);

  useEffect(() => {
    setHighlight(0);
  }, [query]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const pickSuggestion = (symbol: string) => {
    const market = resolveSeasonalityMarket(symbol);
    if (!market) return;
    onSelect(market.dataSymbol);
    setQuery("");
    setOpen(false);
  };

  const submitSearch = () => {
    const market = resolveSeasonalityMarket(query);
    if (!market) return;
    onSelect(market.dataSymbol);
    setQuery("");
    setOpen(false);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!open || suggestions.length === 0) {
      if (e.key === "Escape") setOpen(false);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => (h + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => (h - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === "Enter" && open && suggestions[highlight]) {
      e.preventDefault();
      pickSuggestion(suggestions[highlight]!.symbol);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
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
        <div ref={wrapRef} className="relative min-w-[220px] flex-1">
          <input
            type="text"
            value={query}
            disabled={disabled}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
            placeholder={t("seasonality.searchPlaceholder")}
            className="w-full rounded-lg border border-titan-gold/20 bg-black/30 px-3 py-2 text-[13px] text-stone-200 placeholder:text-stone-600 outline-none focus:border-titan-gold/45"
            spellCheck={false}
            autoCapitalize="characters"
            autoComplete="off"
            role="combobox"
            aria-expanded={open && suggestions.length > 0}
            aria-controls={listId}
            aria-autocomplete="list"
          />
          {open && suggestions.length > 0 ? (
            <ul
              id={listId}
              role="listbox"
              className="absolute z-40 mt-1 max-h-64 w-full overflow-auto rounded-lg border border-white/10 bg-[#0a0e16] py-1 shadow-xl"
            >
              {suggestions.map((s, i) => (
                <li key={s.symbol} role="option" aria-selected={i === highlight}>
                  <button
                    type="button"
                    className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-[13px] transition ${
                      i === highlight ? "bg-sky-500/15 text-stone-50" : "text-stone-300 hover:bg-white/[0.04]"
                    }`}
                    onMouseEnter={() => setHighlight(i)}
                    onClick={() => pickSuggestion(s.symbol)}
                  >
                    <span className="min-w-0">
                      <span className="font-mono font-semibold tracking-wide text-sky-200">{s.symbol}</span>
                      <span className="mt-0.5 block truncate text-[11px] text-stone-500">{s.name}</span>
                    </span>
                    <span className="shrink-0 text-[9px] font-semibold uppercase tracking-[0.12em] text-stone-600">
                      {t(`seasonality.suggestKind.${s.kind}`)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
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
