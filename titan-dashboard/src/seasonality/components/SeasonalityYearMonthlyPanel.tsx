import type { MonthlyYearReturn } from "../types";
import { useTitanI18n } from "../../i18n";

type SeasonalityYearMonthlyPanelProps = {
  year: number;
  returns: MonthlyYearReturn[] | undefined;
  ytdPct: number;
};

function fmtPct(pct: number): string {
  const sign = pct >= 0 ? "+" : "";
  return `${sign}${pct.toFixed(2)}%`;
}

export function SeasonalityYearMonthlyPanel({ year, returns, ytdPct }: SeasonalityYearMonthlyPanelProps) {
  const { t } = useTitanI18n();
  const rows = returns ?? [];

  return (
    <aside className="titan-seasonality-year-panel" aria-label={t("seasonality.yearPanel.title", { year })}>
      <p className="titan-cmd-kicker">{t("seasonality.yearPanel.title", { year })}</p>
      <p className="mt-1 text-[9px] leading-snug text-stone-600">{t("seasonality.yearPanel.sub")}</p>
      <p className="titan-seasonality-year-panel__ytd mt-3">
        <span className="titan-cmd-kicker">{t("seasonality.yearPanel.ytd")}</span>
        <span className={ytdPct >= 0 ? "text-emerald-400/95" : "text-rose-400/95"}>
          {fmtPct(ytdPct)}
        </span>
      </p>
      <ul className="titan-seasonality-year-panel__list mt-3">
        {rows.map((row) => {
          const pct = row.pct;
          if (pct === null) {
            return (
              <li
                key={row.month}
                className={`titan-seasonality-year-panel__row${row.isCurrent ? " titan-seasonality-year-panel__row--current" : ""} titan-seasonality-year-panel__row--pending`}
              >
                <span className="titan-seasonality-year-panel__month">{row.monthLabel}</span>
                <span className="titan-seasonality-year-panel__pct titan-seasonality-year-panel__pct--na">—</span>
              </li>
            );
          }
          const positive = pct >= 0;
          return (
            <li
              key={row.month}
              className={`titan-seasonality-year-panel__row${row.isCurrent ? " titan-seasonality-year-panel__row--current" : ""}`}
            >
              <span className="titan-seasonality-year-panel__month">{row.monthLabel}</span>
              <span
                className={`titan-seasonality-year-panel__pct${positive ? " titan-seasonality-year-panel__pct--up" : " titan-seasonality-year-panel__pct--down"}`}
              >
                {fmtPct(pct)}
              </span>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
