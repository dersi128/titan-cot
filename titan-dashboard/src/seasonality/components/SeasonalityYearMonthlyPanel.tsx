import { useTitanI18n } from "../../i18n";

export type MonthlyPanelRow = {
  month: string;
  pct: number | null;
  vs10Y: number | null;
  isCurrent?: boolean;
};

type SeasonalityYearMonthlyPanelProps = {
  year: number;
  rows: MonthlyPanelRow[];
  ytdPct: number;
};

function fmtPct(pct: number): string {
  return `${pct >= 0 ? "+" : ""}${pct.toFixed(2)}%`;
}

export function SeasonalityYearMonthlyPanel({ year, rows, ytdPct }: SeasonalityYearMonthlyPanelProps) {
  const { t } = useTitanI18n();

  return (
    <aside className="titan-seasonality-year-panel" aria-label={t("seasonality.yearPanel.title", { year })}>
      <p className="titan-cmd-kicker">{t("seasonality.yearPanel.title", { year })}</p>
      <p className="mt-1 text-[9px] leading-snug text-stone-600">{t("seasonality.yearPanel.sub")}</p>
      <p className="titan-seasonality-year-panel__ytd mt-3">
        <span className="titan-cmd-kicker">{t("seasonality.yearPanel.ytd")}</span>
        <span className={ytdPct >= 0 ? "text-emerald-400/95" : "text-rose-400/95"}>{fmtPct(ytdPct)}</span>
      </p>
      <ul className="titan-seasonality-year-panel__list mt-3">
        {rows.map((row) => {
          if (row.pct === null) {
            return (
              <li key={row.month} className="titan-seasonality-year-panel__row titan-seasonality-year-panel__row--pending">
                <span className="titan-seasonality-year-panel__month">{row.month}</span>
                <span className="titan-seasonality-year-panel__pct titan-seasonality-year-panel__pct--na">—</span>
              </li>
            );
          }
          return (
            <li
              key={row.month}
              className={`titan-seasonality-year-panel__row${row.isCurrent ? " titan-seasonality-year-panel__row--current" : ""}`}
            >
              <span className="titan-seasonality-year-panel__month">{row.month}</span>
              <span className="titan-seasonality-year-panel__values">
                <span
                  className={`titan-seasonality-year-panel__pct${row.pct >= 0 ? " titan-seasonality-year-panel__pct--up" : " titan-seasonality-year-panel__pct--down"}`}
                >
                  {fmtPct(row.pct)}
                </span>
                {typeof row.vs10Y === "number" ? (
                  <span className="titan-seasonality-year-panel__vs10y">
                    {row.vs10Y >= 0 ? "+" : ""}
                    {row.vs10Y.toFixed(0)} vs 10Y
                  </span>
                ) : null}
              </span>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
