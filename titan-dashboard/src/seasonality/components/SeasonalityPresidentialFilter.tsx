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
};

export function SeasonalityPresidentialFilter({
  value,
  onChange,
  disabled = false,
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
    <div className="rounded-lg border border-white/[0.06] bg-[#0e1218] px-3 py-3">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <p className="titan-cmd-kicker">{t("seasonality.presidentialLabel")}</p>
        <button
          type="button"
          disabled={disabled || allOn}
          onClick={selectAll}
          className="text-[10px] uppercase tracking-wider text-stone-500 hover:text-stone-300 disabled:opacity-40"
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
              className={`rounded-md border px-2.5 py-1.5 text-[11px] transition ${
                active
                  ? "border-fuchsia-400/50 bg-fuchsia-500/15 text-fuchsia-200"
                  : "border-white/[0.08] bg-transparent text-stone-500 hover:border-white/20 hover:text-stone-300"
              }`}
            >
              {t(`seasonality.presidential.${phase}`)}
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-[10px] text-stone-600">{t("seasonality.presidentialHint")}</p>
    </div>
  );
}
