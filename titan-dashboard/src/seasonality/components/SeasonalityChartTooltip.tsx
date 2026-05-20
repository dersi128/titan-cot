import type { TooltipProps } from "recharts";
import { useTitanI18n } from "../../i18n";
import {
  CHART_LOOKBACK_ORDER,
  CURRENT_YEAR_CHART_KEY,
  lookbackChartKey,
} from "../utils/chartData";
import { lookbackColor, lookbackLabel } from "../yearsLookback";
import {
  ROLLING_CHART_COLORS,
  ROLLING_CHART_KEYS,
  ROLLING_CHART_ORDER,
  rollingWindowLabel,
} from "../utils/rollingChartData";

type PayloadRow = {
  month?: string;
  isCurrent?: boolean;
  monthReturnPct?: number | null;
  seasonalIndex?: number | null;
  [key: string]: string | number | boolean | null | undefined;
};

type SeasonalityChartTooltipProps = TooltipProps<number, string> & {
  mode?: "monthly" | "rolling";
};

export function SeasonalityChartTooltip({ active, payload }: SeasonalityChartTooltipProps) {
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
        {row.isCurrent ? <span className="ml-2 text-titan-gold/80">{t("seasonality.table.current")}</span> : null}
      </p>
      <p className="mt-1 text-[9px] text-stone-600">{t("seasonality.chartTooltipIndex")}</p>
      <ul className="mt-2 space-y-1">
        <li className="flex justify-between gap-4 text-[10px]">
          <span className="text-stone-100">{t("seasonality.legendLivePath")}</span>
          <span className="font-mono text-stone-100">{fmt(CURRENT_YEAR_CHART_KEY)}</span>
        </li>
        {ROLLING_CHART_ORDER.map((w) => (
          <li key={w} className="flex justify-between gap-4 text-[10px]">
            <span className="inline-flex items-center gap-1 text-stone-500">
              <span className="h-0.5 w-2 rounded-full" style={{ background: ROLLING_CHART_COLORS[w] }} />
              {rollingWindowLabel(w)}
            </span>
            <span className="font-mono text-stone-300">{fmt(ROLLING_CHART_KEYS[w])}</span>
          </li>
        ))}
        {CHART_LOOKBACK_ORDER.map((lb) => (
          <li key={lb} className="flex justify-between gap-4 text-[10px]">
            <span className="inline-flex items-center gap-1 text-stone-500">
              <span className="h-0.5 w-2 rounded-full" style={{ background: lookbackColor(lb) }} />
              {lookbackLabel(lb)}
            </span>
            <span className="font-mono text-stone-400">{fmt(lookbackChartKey(lb))}</span>
          </li>
        ))}
        {typeof row.monthReturnPct === "number" ? (
          <li className="flex justify-between gap-4 border-t border-white/[0.06] pt-1 text-[10px]">
            <span className="text-stone-500">{t("seasonality.yearPanel.monthReturn")}</span>
            <span
              className={`font-mono font-semibold${row.monthReturnPct >= 0 ? " text-emerald-400/90" : " text-rose-400/90"}`}
            >
              {row.monthReturnPct >= 0 ? "+" : ""}
              {row.monthReturnPct.toFixed(2)}%
            </span>
          </li>
        ) : null}
        {typeof row.seasonalIndex === "number" ? (
          <li className="flex justify-between gap-4 text-[10px]">
            <span className="text-stone-500">{t("seasonality.yearPanel.vs10y")}</span>
            <span className="font-mono text-titan-gold/90">
              {row.seasonalIndex >= 0 ? "+" : ""}
              {row.seasonalIndex.toFixed(1)} idx
            </span>
          </li>
        ) : null}
      </ul>
    </div>
  );
}
