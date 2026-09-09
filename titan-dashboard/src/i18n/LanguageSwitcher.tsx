import { useTitanI18n, type Locale } from "./TitanI18n";

const OPTIONS: { id: Locale; label: string }[] = [
  { id: "cs", label: "CS" },
  { id: "en", label: "EN" },
];

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useTitanI18n();

  return (
    <div
      className="titan-lang-switch"
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
            className={`titan-lang-switch__btn ${active ? "titan-lang-switch__btn--active" : ""}`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
