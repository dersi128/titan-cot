import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { csMessages } from "./messages/cs";
import { enMessages, type Messages } from "./messages/en";

export type Locale = "cs" | "en";

const STORAGE_KEY = "titan-locale";

const catalogs: Record<Locale, Messages> = {
  en: enMessages,
  cs: csMessages,
};

type Params = Record<string, string | number>;

function getByPath(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in acc) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

function interpolate(template: string, params?: Params): string {
  if (!params) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) =>
    params[key] !== undefined ? String(params[key]) : `{{${key}}}`,
  );
}

function detectLocale(): Locale {
  if (typeof navigator === "undefined") return "en";
  return navigator.language.toLowerCase().startsWith("cs") ? "cs" : "en";
}

function readStoredLocale(): Locale | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === "cs" || raw === "en") return raw;
  } catch {
    /* ignore */
  }
  return null;
}

type TitanI18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Params) => string;
  messages: Messages;
};

const TitanI18nContext = createContext<TitanI18nContextValue | null>(null);

export function TitanI18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => readStoredLocale() ?? detectLocale());

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.title = locale === "cs" ? "TITAN COT Dashboard" : "TITAN COT Dashboard";
  }, [locale]);

  const messages = catalogs[locale];

  const t = useCallback(
    (key: string, params?: Params) => {
      const value = getByPath(messages, key);
      if (typeof value === "string") return interpolate(value, params);
      return key;
    },
    [messages],
  );

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t,
      messages,
    }),
    [locale, setLocale, t, messages],
  );

  return <TitanI18nContext.Provider value={value}>{children}</TitanI18nContext.Provider>;
}

export function useTitanI18n() {
  const ctx = useContext(TitanI18nContext);
  if (!ctx) {
    throw new Error("useTitanI18n must be used within TitanI18nProvider");
  }
  return ctx;
}
