import { useTitanI18n, type Locale } from "./TitanI18n";

const OPTIONS: { id: Locale; label: string }[] = [
  { id: "cs", label: "CS" },
  { id: "en", label: "EN" },
];

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useTitanI18n();

  return (
    <div
      className="flex items-center gap-1 rounded-xl border border-titan-gold/15 bg-titan-panel/80 p-1 backdrop-blur-md"
      role="group"
      aria-label={t("lang.label")}
    >
      {OPTIONS.map((opt) => {
        const active = locale === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => setLocale(opt.id)}
            aria-pressed={active}
            className={`rounded-lg px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider transition-all ${
              active
                ? "bg-titan-gold/20 text-titan-goldBright shadow-insetGold"
                : "text-stone-500 hover:text-stone-300"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
