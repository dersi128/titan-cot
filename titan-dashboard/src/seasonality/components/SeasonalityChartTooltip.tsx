import type { TooltipProps } from "recharts";
import { useTitanI18n } from "../../i18n";
import {
  CHART_LOOKBACK_ORDER,
  CURRENT_YEAR_CHART_KEY,
  lookbackChartKey,
} from "../utils/chartData";
import { lookbackColor, lookbackLabel } from "../yearsLookback";

type PayloadRow = {
  month?: string;
  monthIndex?: number;
  isCurrent?: boolean;
  [key: string]: string | number | boolean | null | undefined;
};

export function SeasonalityChartTooltip({ active, payload }: TooltipProps<number, string>) {
  const { t } = useTitanI18n();

  if (!active || !payload?.length) return null;

  const row = payload[0]?.payload as PayloadRow | undefined;
  if (!row?.month) return null;

  const fmt = (key: string) => {
    const v = row[key];
    return typeof v === "number" && !Number.isNaN(v) ? v.toFixed(1) : "—";
  };

  return (
    <div className="titan-seasonality-tooltip rounded border border-white/10 bg-[#0a0b0e]/95 px-3 py-2 shadow-lg backdrop-blur-sm">
      <p className="font-display text-[10px] font-semibold uppercase tracking-wider text-stone-200">
        {row.month}
        {row.isCurrent ? (
          <span className="ml-2 text-titan-gold/80">{t("seasonality.table.current")}</span>
        ) : null}
      </p>
      <ul className="mt-2 space-y-1">
        {CHART_LOOKBACK_ORDER.map((lb) => (
          <li key={lb} className="flex items-center justify-between gap-4 text-[10px]">
            <span className="inline-flex items-center gap-1.5 text-stone-500">
              <span
                className="h-0.5 w-3 rounded-full"
                style={{ background: lookbackColor(lb) }}
              />
              {lookbackLabel(lb)}
            </span>
            <span className="font-mono text-stone-300">{fmt(lookbackChartKey(lb))}</span>
          </li>
        ))}
        <li className="flex items-center justify-between gap-4 border-t border-white/[0.06] pt-1 text-[10px]">
          <span className="inline-flex items-center gap-1.5 text-stone-400">
            <span className="h-0.5 w-3 rounded-full bg-stone-100" />
            {t("seasonality.legendCurrentYearShort", { year: new Date().getFullYear() })}
          </span>
          <span className="font-mono text-stone-100">{fmt(CURRENT_YEAR_CHART_KEY)}</span>
        </li>
      </ul>
    </div>
  );
}
