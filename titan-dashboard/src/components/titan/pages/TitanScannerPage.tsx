import type { ReactNode } from "react";
import { useTitanI18n } from "../../../i18n";
import { TitanPageHeader } from "../ui/TitanPageHeader";

type TitanScannerPageProps = {
  liveCount: number;
  scanner: ReactNode;
};

export function TitanScannerPage({ liveCount, scanner }: TitanScannerPageProps) {
  const { t } = useTitanI18n();

  return (
    <div className="titan-page-module animate-fade-up">
      <TitanPageHeader
        eyebrow={t("pages.scanner.eyebrow")}
        title={t("pages.scanner.title")}
        description={t("pages.scanner.description")}
        aside={
          <span className="rounded border border-titan-gold/20 bg-titan-black/50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-titan-gold/90">
            {t("header.marketsLive", { count: liveCount })}
          </span>
        }
      />
      {scanner}
    </div>
  );
}
