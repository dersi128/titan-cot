import { useTitanI18n } from "../../i18n";
import { toggleExcludedYear } from "../utils/yearSelection";

type SeasonalityYearFilterProps = {
  availableYears: number[];
  excludedYears: number[];
  onChange: (excludedYears: number[]) => void;
  disabled?: boolean;
};

export function SeasonalityYearFilter({
  availableYears,
  excludedYears,
  onChange,
  disabled = false,
}: SeasonalityYearFilterProps) {
  const { t } = useTitanI18n();
  const excludedSet = new Set(excludedYears);
  const allOn = availableYears.length > 0 && excludedYears.length === 0;

  if (availableYears.length === 0) return null;

  return (
    <div className="border-b border-white/[0.06] bg-transparent px-4 py-3">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-display text-[10px] font-semibold uppercase tracking-[0.14em] text-titan-gold">
            {t("seasonality.yearsLabel")}
          </p>
          <p className="mt-0.5 text-[10px] text-stone-600">{t("seasonality.yearsHint")}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={disabled || allOn}
            onClick={() => onChange([])}
            className="rounded border border-titan-gold/25 px-2 py-0.5 text-[10px] uppercase tracking-wider text-titan-gold/80 hover:border-titan-gold/50 hover:text-titan-goldBright disabled:opacity-40"
          >
            {t("seasonality.yearsAll")}
          </button>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {availableYears.map((year) => {
          const included = !excludedSet.has(year);
          return (
            <button
              key={year}
              type="button"
              disabled={disabled}
              aria-pressed={included}
              onClick={() => {
                const next = toggleExcludedYear(excludedYears, year);
                const stillIncluded = availableYears.some((y) => !next.includes(y));
                if (!stillIncluded) return;
                onChange(next);
              }}
              className={`min-w-[3.25rem] rounded border px-2 py-1 font-mono text-[11px] font-medium tabular-nums transition ${
                included
                  ? "border-sky-400/45 bg-sky-500/15 text-sky-100"
                  : "border-white/[0.06] bg-black/25 text-stone-600 line-through hover:border-white/15 hover:text-stone-400"
              } disabled:opacity-60`}
            >
              {year}
            </button>
          );
        })}
      </div>
    </div>
  );
}
