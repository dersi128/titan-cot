import type { ValuationUniverseRow } from "../types";
import { useTitanI18n } from "../../i18n";

function scoreTone(score: number): string {
  if (score >= 15) return "text-emerald-400";
  if (score <= -15) return "text-rose-400";
  return "text-stone-300";
}

export function ValuationUniverse({
  rows,
  activeId,
  onSelect,
}: {
  rows: ValuationUniverseRow[];
  activeId: string;
  onSelect: (id: string) => void;
}) {
  const { t } = useTitanI18n();
  const sorted = [...rows].sort((a, b) => b.score - a.score);

  return (
    <section className="titan-seasonality-table-wrap overflow-hidden">
      <div className="flex items-end justify-between px-4 pt-4">
        <div>
          <p className="titan-cmd-kicker">{t("valuation.universeTitle")}</p>
          <p className="mt-1 text-[12px] text-stone-500">{t("valuation.universeSub")}</p>
        </div>
        <p className="font-mono text-[11px] text-stone-600">{sorted.length}</p>
      </div>
      <div className="mt-3 overflow-x-auto">
        <table className="titan-seasonality-table w-full text-left text-[13px]">
          <thead>
            <tr>
              <th className="px-4 py-2">{t("valuation.colMarket")}</th>
              <th className="px-4 py-2">{t("valuation.colClass")}</th>
              <th className="px-4 py-2">{t("valuation.colScore")}</th>
              <th className="px-4 py-2">{t("valuation.colVerdict")}</th>
              <th className="px-4 py-2">{t("valuation.gap")}</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => {
              const active = row.marketId === activeId;
              return (
                <tr
                  key={row.marketId}
                  className={active ? "titan-seasonality-table__row--active" : undefined}
                >
                  <td className="px-4 py-2">
                    <button
                      type="button"
                      className="font-semibold tracking-wide text-stone-100 hover:text-sky-200"
                      onClick={() => onSelect(row.marketId)}
                    >
                      {row.label}
                    </button>
                  </td>
                  <td className="px-4 py-2 text-stone-500">{t(`valuation.class.${row.assetClass}`)}</td>
                  <td className={`px-4 py-2 font-mono font-semibold ${scoreTone(row.score)}`}>{row.score}</td>
                  <td className={`px-4 py-2 ${scoreTone(row.score)}`}>
                    {t(`valuation.verdict.${row.verdict}`)}
                  </td>
                  <td className="px-4 py-2 font-mono text-stone-400">
                    {row.gapPct == null ? "—" : `${row.gapPct > 0 ? "+" : ""}${row.gapPct.toFixed(1)}%`}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
