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
        aside={
          <span className="rounded border border-[#2ea8ff]/40 bg-[#070b12]/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7dd3fc] shadow-[0_0_18px_-6px_rgba(46,168,255,0.3)]">
            {t("header.marketsLive", { count: liveCount })}
          </span>
        }
      />
      {scanner}
    </div>
  );
}
