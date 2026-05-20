import type { SeasonalityResult } from "../types";
import { useTitanI18n } from "../../i18n";

type SeasonalityMonthlyTableProps = {
  result: SeasonalityResult;
  currentMonth: number;
};

function biasTone(bias: string): string {
  if (bias === "BULLISH") return "text-emerald-400/90";
  if (bias === "BEARISH") return "text-rose-400/90";
  return "text-stone-500";
}

export function SeasonalityMonthlyTable({ result, currentMonth }: SeasonalityMonthlyTableProps) {
  const { t } = useTitanI18n();

  return (
    <div className="titan-seasonality-table-wrap overflow-x-auto rounded-lg border border-white/[0.06]">
      <table className="titan-seasonality-table w-full min-w-[480px] text-left text-[12px]">
        <thead>
          <tr>
            <th className="px-4 py-2.5">{t("seasonality.table.month")}</th>
            <th className="px-4 py-2.5 text-right">{t("seasonality.table.avgReturn")}</th>
            <th className="px-4 py-2.5 text-right">{t("seasonality.table.winRate")}</th>
            <th className="px-4 py-2.5">{t("seasonality.table.bias")}</th>
          </tr>
        </thead>
        <tbody>
          {result.monthlyStats.map((row) => {
            const active = row.month === currentMonth;
            return (
              <tr key={row.month} className={active ? "titan-seasonality-table__row--active" : ""}>
                <td className="px-4 py-2 font-medium text-stone-200">
                  {row.monthLabel}
                  {active ? (
                    <span className="ml-2 text-[9px] font-semibold uppercase tracking-wider text-titan-gold/80">
                      {t("seasonality.table.current")}
                    </span>
                  ) : null}
                </td>
                <td className="px-4 py-2 text-right font-mono tabular-nums text-stone-300">
                  {(row.avgReturn * 100).toFixed(3)}%
                </td>
                <td className="px-4 py-2 text-right font-mono tabular-nums text-stone-300">
                  {row.winRate.toFixed(1)}%
                </td>
                <td className={`px-4 py-2 font-semibold uppercase tracking-wide ${biasTone(row.bias)}`}>
                  {row.bias}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
