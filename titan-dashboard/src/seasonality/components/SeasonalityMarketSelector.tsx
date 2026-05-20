import { SEASONALITY_MARKETS } from "../markets";

type SeasonalityMarketSelectorProps = {
  activeId: string;
  onSelect: (id: string) => void;
  disabled?: boolean;
};

export function SeasonalityMarketSelector({ activeId, onSelect, disabled }: SeasonalityMarketSelectorProps) {
  return (
    <div className="titan-seasonality-markets flex flex-wrap gap-1.5" role="tablist" aria-label="Markets">
      {SEASONALITY_MARKETS.map((m) => {
        const active = m.id === activeId;
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
    </div>
  );
}
