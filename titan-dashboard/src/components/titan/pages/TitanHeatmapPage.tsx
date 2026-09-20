import type { CotDashboardData } from "../../../types";
import type { InstitutionalMarket } from "../../../config/institutionalMarkets";
import { INSTITUTIONAL_MARKETS } from "../../../config/institutionalMarkets";
import { useTitanI18n } from "../../../i18n";
import { TitanPageHeader } from "../ui/TitanPageHeader";
import { CotHeatmap } from "../CotHeatmap";

type TitanHeatmapPageProps = {
  liveCount: number;
  bundle: Record<string, CotDashboardData>;
  selectedMarket: InstitutionalMarket;
  onSelectMarket: (market: InstitutionalMarket) => void;
};

export function TitanHeatmapPage({
  liveCount,
  bundle,
  selectedMarket,
  onSelectMarket,
}: TitanHeatmapPageProps) {
  const { t } = useTitanI18n();

  return (
    <div className="titan-page-module titan-heatmap-page animate-fade-up">
      <TitanPageHeader
        eyebrow={t("pages.heatmap.eyebrow")}
        title={t("pages.heatmap.title")}
        description={t("pages.heatmap.description")}
        aside={
          <span className="rounded border border-[#2ea8ff]/40 bg-[#070b12]/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7dd3fc] shadow-[0_0_18px_-6px_rgba(46,168,255,0.3)]">
            {t("header.marketsLive", { count: liveCount })}
          </span>
        }
      />
      <CotHeatmap
        markets={INSTITUTIONAL_MARKETS}
        bundle={bundle}
        selectedMarket={selectedMarket}
        onSelectMarket={onSelectMarket}
      />
    </div>
  );
}
