import type { ValuationAssetClass } from "../types";
import { VALUATION_MARKETS, valuationMarketsByClass } from "../markets";
import { useTitanI18n } from "../../i18n";

type AssetFilter = "all" | ValuationAssetClass;

type Props = {
  activeId: string;
  assetFilter: AssetFilter;
  onFilter: (next: AssetFilter) => void;
  onSelect: (id: string) => void;
  disabled?: boolean;
};

const FILTERS: AssetFilter[] = ["all", "forex", "metal", "commodity", "equity"];

export function ValuationMarketSelector({ activeId, assetFilter, onFilter, onSelect, disabled }: Props) {
  const { t } = useTitanI18n();
  const markets = assetFilter === "all" ? [...VALUATION_MARKETS] : valuationMarketsByClass(assetFilter);
  const activeUpper = activeId.toUpperCase();

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5" role="tablist" aria-label={t("valuation.assetFilter")}>
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            role="tab"
            aria-selected={assetFilter === f}
            disabled={disabled}
            onClick={() => onFilter(f)}
            className={`titan-seasonality-lookback-btn ${assetFilter === f ? "titan-seasonality-lookback-btn--active" : ""}`}
          >
            {t(`valuation.class.${f}`)}
          </button>
        ))}
      </div>
      <div className="titan-seasonality-markets flex flex-wrap gap-1.5" role="tablist" aria-label={t("valuation.selectMarket")}>
        {markets.map((m) => {
          const active = m.id === activeUpper;
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
    </div>
  );
}
