import { useTitanI18n } from "../../i18n";
import {
  PRESIDENTIAL_CYCLE_PHASES,
  type PresidentialCyclePhase,
  isAllPresidentialPhases,
} from "../utils/presidentialCycle";

type SeasonalityPresidentialFilterProps = {
  value: PresidentialCyclePhase[];
  onChange: (phases: PresidentialCyclePhase[]) => void;
  disabled?: boolean;
  /** Compact strip for inside the Seasonax chart card. */
  compact?: boolean;
};

export function SeasonalityPresidentialFilter({
  value,
  onChange,
  disabled = false,
  compact = false,
}: SeasonalityPresidentialFilterProps) {
  const { t } = useTitanI18n();
  const allOn = isAllPresidentialPhases(value);

  const toggle = (phase: PresidentialCyclePhase) => {
    const set = new Set(value);
    if (set.has(phase)) {
      set.delete(phase);
      if (set.size === 0) {
        onChange([...PRESIDENTIAL_CYCLE_PHASES]);
        return;
      }
      onChange(PRESIDENTIAL_CYCLE_PHASES.filter((p) => set.has(p)));
      return;
    }
    set.add(phase);
    onChange(PRESIDENTIAL_CYCLE_PHASES.filter((p) => set.has(p)));
  };

  const selectAll = () => onChange([...PRESIDENTIAL_CYCLE_PHASES]);

  return (
    <div
      className={
        compact
          ? "border-b border-white/[0.06] bg-[#161a22] px-4 py-3"
          : "rounded-lg border border-fuchsia-400/25 bg-fuchsia-500/[0.06] px-4 py-3"
      }
    >
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <p className="text-[12px] font-semibold tracking-wide text-fuchsia-200/95">
          {t("seasonality.presidentialLabel")}
        </p>
        <button
          type="button"
          disabled={disabled || allOn}
          onClick={selectAll}
          className="rounded border border-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-stone-400 hover:border-white/25 hover:text-stone-200 disabled:opacity-40"
        >
          {t("seasonality.presidentialAll")}
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {PRESIDENTIAL_CYCLE_PHASES.map((phase) => {
          const active = value.includes(phase);
          return (
            <button
              key={phase}
              type="button"
              disabled={disabled}
              aria-pressed={active}
              onClick={() => toggle(phase)}
              className={`rounded-md border px-3 py-2 text-[12px] font-medium transition ${
                active
                  ? "border-fuchsia-300/70 bg-fuchsia-500/25 text-fuchsia-100 shadow-[0_0_0_1px_rgba(240,171,252,0.25)]"
                  : "border-white/10 bg-[#0b0f14] text-stone-400 hover:border-fuchsia-400/40 hover:text-stone-200"
              } disabled:cursor-wait disabled:opacity-60`}
            >
              {t(`seasonality.presidential.${phase}`)}
            </button>
          );
        })}
      </div>
      {!compact ? (
        <p className="mt-2 text-[11px] text-stone-500">{t("seasonality.presidentialHint")}</p>
      ) : null}
    </div>
  );
}
