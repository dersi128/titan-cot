import type { TooltipProps } from "recharts";
import { useTitanI18n } from "../../i18n";
import {
  CURRENT_YEAR_CHART_KEY,
  ROLLING_CHART_COLORS,
  ROLLING_CHART_KEYS,
  ROLLING_CHART_ORDER,
  rollingWindowLabel,
} from "../utils/rollingChartData";

type PayloadRow = {
  offsetLabel?: string;
  isToday?: boolean;
  [key: string]: string | number | boolean | null | undefined;
};

type SeasonalityChartTooltipProps = TooltipProps<number, string> & {
  mode?: "rolling" | "monthly";
};

export function SeasonalityChartTooltip({ active, payload, mode = "rolling" }: SeasonalityChartTooltipProps) {
  const { t } = useTitanI18n();

  if (!active || !payload?.length) return null;

  const row = payload[0]?.payload as PayloadRow | undefined;
  if (!row?.offsetLabel) return null;

  const fmt = (key: string) => {
    const v = row[key];
    return typeof v === "number" && !Number.isNaN(v) ? v.toFixed(1) : "—";
  };

  return (
    <div className="titan-seasonality-tooltip rounded border border-white/10 bg-[#0a0b0e]/95 px-3 py-2 shadow-lg backdrop-blur-sm">
      <p className="font-display text-[10px] font-semibold uppercase tracking-wider text-stone-200">
        {row.offsetLabel}
        {row.isToday ? <span className="ml-2 text-titan-gold/80">{t("seasonality.table.current")}</span> : null}
      </p>
      <p className="mt-1 text-[9px] text-stone-600">
        {mode === "rolling" ? t("seasonality.chartTooltipRolling") : t("seasonality.chartTooltipIndex")}
      </p>
      <ul className="mt-2 space-y-1">
        {ROLLING_CHART_ORDER.map((w) => (
          <li key={w} className="flex items-center justify-between gap-4 text-[10px]">
            <span className="inline-flex items-center gap-1.5 text-stone-500">
              <span className="h-0.5 w-3 rounded-full" style={{ background: ROLLING_CHART_COLORS[w] }} />
              {rollingWindowLabel(w)}
            </span>
            <span className="font-mono text-stone-300">{fmt(ROLLING_CHART_KEYS[w])}</span>
          </li>
        ))}
        <li className="flex items-center justify-between gap-4 border-t border-white/[0.06] pt-1 text-[10px]">
          <span className="text-stone-400">{t("seasonality.legendLivePath")}</span>
          <span className="font-mono text-stone-100">{fmt(CURRENT_YEAR_CHART_KEY)}</span>
        </li>
      </ul>
    </div>
  );
}
