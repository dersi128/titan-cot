import { useTitanI18n } from "../../i18n";
import {
  PRESIDENTIAL_CYCLE_PHASES,
  type PresidentialCyclePhase,
  hasPresidentialSelection,
  isAllPresidentialPhases,
} from "../utils/presidentialCycle";

type SeasonalityPresidentialFilterProps = {
  value: PresidentialCyclePhase[];
  onChange: (phases: PresidentialCyclePhase[]) => void;
  disabled?: boolean;
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
  const noneOn = !hasPresidentialSelection(value);

  const toggle = (phase: PresidentialCyclePhase) => {
    const set = new Set(value);
    if (set.has(phase)) {
      set.delete(phase);
      onChange(PRESIDENTIAL_CYCLE_PHASES.filter((p) => set.has(p)));
      return;
    }
    set.add(phase);
    onChange(PRESIDENTIAL_CYCLE_PHASES.filter((p) => set.has(p)));
  };

  const selectAll = () => onChange([...PRESIDENTIAL_CYCLE_PHASES]);
  const clearAll = () => onChange([]);

  return (
    <div
      className={
        compact
          ? "border-b border-white/[0.06] bg-transparent px-4 py-3"
          : "titan-neon-glass px-4 py-3"
      }
    >
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <p className="font-display text-[10px] font-semibold uppercase tracking-[0.14em] text-titan-gold">
          {t("seasonality.presidentialLabel")}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={disabled || noneOn}
            onClick={clearAll}
            className="rounded border border-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-stone-500 hover:text-stone-300 disabled:opacity-40"
          >
            {t("seasonality.presidentialNone")}
          </button>
          <button
            type="button"
            disabled={disabled || allOn}
            onClick={selectAll}
            className="rounded border border-titan-gold/25 px-2 py-0.5 text-[10px] uppercase tracking-wider text-titan-gold/80 hover:border-titan-gold/50 hover:text-titan-goldBright disabled:opacity-40"
          >
            {t("seasonality.presidentialAll")}
          </button>
        </div>
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
              className={`rounded-lg border px-3 py-2 text-[12px] font-medium transition ${
                active
                  ? "border-titan-gold/55 bg-titan-gold/15 text-titan-goldBright"
                  : "border-white/[0.08] bg-black/20 text-stone-500 hover:border-titan-gold/30 hover:text-stone-300"
              } disabled:opacity-60`}
            >
              {t(`seasonality.presidential.${phase}`)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
