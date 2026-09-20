import { computeTitanDashboardScore, scoreHeatClass } from "../../lib/titanCotScore";
import { formatCommercialIndex } from "../../lib/titanCotIndexSettings";
import {
  groupMarketsByCategory,
  heatmapToneFromComm26,
  isRetailExtreme,
  type HeatmapCellTone,
} from "../../lib/titanHeatmapVisuals";
import type { CotDashboardData } from "../../types";
import type { InstitutionalMarket } from "../../config/institutionalMarkets";
import { useTitanI18n } from "../../i18n";
import { TitanMarketIcon } from "./TitanMarketIcon";

type CotHeatmapProps = {
  markets: readonly InstitutionalMarket[];
  bundle: Record<string, CotDashboardData>;
  selectedMarket: InstitutionalMarket;
  onSelectMarket: (market: InstitutionalMarket) => void;
};

const LEGEND_TONES: Exclude<HeatmapCellTone, "empty">[] = [
  "extreme_long",
  "strong_long",
  "neutral",
  "strong_short",
  "extreme_short",
];

export function CotHeatmap({ markets, bundle, selectedMarket, onSelectMarket }: CotHeatmapProps) {
  const { t } = useTitanI18n();
  const groups = groupMarketsByCategory(markets);

  return (
    <div className="titan-heatmap-board">
      <div className="titan-heatmap-legend" aria-label={t("heatmap.legendColor")}>
        <span className="titan-heatmap-legend__label">{t("heatmap.legendColor")}</span>
        {LEGEND_TONES.map((tone) => (
          <span key={tone} className="titan-heatmap-legend__item">
            <i className={`titan-heatmap-legend__swatch titan-heatmap-swatch--${tone}`} aria-hidden />
            {t(`heatmap.tone.${tone}`)}
          </span>
        ))}
        <span className="titan-heatmap-legend__item">
          <i className="titan-heatmap-legend__ring" aria-hidden />
          {t("heatmap.legendRetail")}
        </span>
      </div>

      {groups.map((group) => (
        <section key={group.category} className="titan-heatmap-group titan-cmd-card">
          <h3 className="titan-cmd-kicker">{t(`category.${group.category}`)}</h3>
          <div className="titan-heatmap-grid">
            {group.markets.map((market) => {
              const data = bundle[market.symbol];
              const comm26 = data?.commercials.index26w;
              const tone = heatmapToneFromComm26(comm26);
              const retail = isRetailExtreme(data?.retail.index26w);
              const score = data ? computeTitanDashboardScore(data) : null;
              const active = market.symbol === selectedMarket.symbol;
              return (
                <button
                  key={market.id}
                  type="button"
                  aria-pressed={active}
                  disabled={!data}
                  onClick={() => data && onSelectMarket(market)}
                  className={`titan-heatmap-cell titan-heatmap-cell--${tone}${retail ? " titan-heatmap-cell--retail" : ""}${active ? " titan-heatmap-cell--active" : ""}`}
                >
                  <span className="titan-heatmap-cell__head">
                    <TitanMarketIcon market={market} size="sm" score={score ?? undefined} />
                    <span className="titan-heatmap-cell__name">{market.shortLabel}</span>
                  </span>
                  <span className="titan-heatmap-cell__index">
                    {data ? formatCommercialIndex(comm26) : "…"}
                  </span>
                  <span className="titan-heatmap-cell__meta">
                    <span>{t("heatmap.comm26")}</span>
                    {score !== null ? (
                      <span className={`titan-heatmap-cell__score ${scoreHeatClass(score)}`}>
                        {score > 0 ? `+${score}` : score}
                      </span>
                    ) : null}
                  </span>
                  {retail ? (
                    <span className="titan-heatmap-cell__retail">{t("heatmap.retailExtreme")}</span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
