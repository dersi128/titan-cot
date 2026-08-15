import { useEffect, useState } from "react";
import { useTitanI18n } from "../../../i18n";
import {
  DEFAULT_COT_INDEX_ZONE_THRESHOLDS,
  getCotIndexZoneThresholds,
  resetCotIndexZoneThresholds,
  setCotIndexZoneThresholds,
  subscribeCotIndexZoneThresholds,
  type CotIndexZoneThresholds,
} from "../../../lib/titanCotIndexSettings";

type FieldKey = keyof CotIndexZoneThresholds;

const FIELDS: Array<{ key: FieldKey; hint: string }> = [
  { key: "extremeLow", hint: "≤ → EXTREME LOW" },
  { key: "lowExtreme", hint: "soft marker" },
  { key: "neutralLow", hint: "below → bearish extreme" },
  { key: "neutralHigh", hint: "above → bullish extreme" },
  { key: "highExtreme", hint: "soft marker" },
  { key: "extremeHigh", hint: "≥ → EXTREME HIGH" },
];

export function TitanCotIndexSettingsModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { t } = useTitanI18n();
  const [draft, setDraft] = useState<CotIndexZoneThresholds>(() => getCotIndexZoneThresholds());

  useEffect(() => {
    if (!open) return;
    setDraft(getCotIndexZoneThresholds());
  }, [open]);

  useEffect(() => subscribeCotIndexZoneThresholds(() => setDraft(getCotIndexZoneThresholds())), []);

  if (!open) return null;

  const onChange = (key: FieldKey, raw: string) => {
    const n = Number(raw);
    setDraft((prev) => ({ ...prev, [key]: Number.isFinite(n) ? n : prev[key] }));
  };

  const save = () => {
    setCotIndexZoneThresholds(draft);
    onClose();
  };

  const reset = () => {
    const next = resetCotIndexZoneThresholds();
    setDraft(next);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <button type="button" className="absolute inset-0 bg-black/70" aria-label={t("settings.close")} onClick={onClose} />
      <div className="relative z-[81] w-full max-w-lg rounded-xl border border-white/10 bg-[#0a0e16] p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-display text-[10px] font-semibold uppercase tracking-[0.14em] text-sky-300/80">
              {t("settings.eyebrow")}
            </p>
            <h2 className="mt-1 font-display text-lg font-semibold text-stone-50">{t("settings.title")}</h2>
            <p className="mt-2 text-[12px] leading-relaxed text-stone-500">{t("settings.cotIndexHint")}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-white/10 px-2 py-1 text-[11px] text-stone-400 hover:text-stone-200"
          >
            {t("settings.close")}
          </button>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {FIELDS.map(({ key, hint }) => (
            <label key={key} className="block">
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-stone-500">
                {t(`settings.fields.${key}`)}
              </span>
              <input
                type="number"
                step="1"
                value={draft[key]}
                onChange={(e) => onChange(key, e.target.value)}
                className="mt-1 w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 font-mono text-sm text-stone-100 outline-none focus:border-sky-500/40"
              />
              <span className="mt-1 block text-[10px] text-stone-600">{hint}</span>
            </label>
          ))}
        </div>

        <p className="mt-4 text-[11px] text-stone-600">{t("settings.defaults", {
          values: Object.values(DEFAULT_COT_INDEX_ZONE_THRESHOLDS).join(" / "),
        })}</p>

        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={reset}
            className="rounded border border-white/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-stone-400 hover:text-stone-200"
          >
            {t("settings.reset")}
          </button>
          <button
            type="button"
            onClick={save}
            className="rounded border border-sky-400/40 bg-sky-500/15 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-sky-200"
          >
            {t("settings.save")}
          </button>
        </div>
      </div>
    </div>
  );
}
