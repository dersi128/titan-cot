export type AppSection = "home" | "scanner" | "seasonality" | "dme";

export type DashboardView = AppSection | "market";

export type NavigateSectionOptions = {
  /** Prefill seasonality market (`#/seasonality/GOLD`). */
  seasonalityMarket?: string;
};

const SECTIONS: AppSection[] = ["home", "scanner", "seasonality", "dme"];

export function parseAppSectionFromHash(): AppSection {
  const raw = window.location.hash.replace(/^#\/?/, "").split("/")[0]?.toLowerCase() ?? "";
  if (SECTIONS.includes(raw as AppSection)) return raw as AppSection;
  return "home";
}

/** Second hash segment when on seasonality, e.g. `#/seasonality/GOLD` → `GOLD`. */
export function parseSeasonalityMarketFromHash(): string | null {
  const parts = window.location.hash.replace(/^#\/?/, "").split("/").filter(Boolean);
  if (parts[0]?.toLowerCase() !== "seasonality") return null;
  const raw = parts[1]?.trim();
  if (!raw) return null;
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

export function setAppSectionHash(section: AppSection, options?: NavigateSectionOptions): void {
  let next: string;
  if (section === "home") {
    next = "#/";
  } else if (section === "seasonality" && options?.seasonalityMarket?.trim()) {
    next = `#/seasonality/${encodeURIComponent(options.seasonalityMarket.trim())}`;
  } else {
    next = `#/${section}`;
  }
  if (window.location.hash !== next) {
    window.location.hash = next;
  }
}

export function isAppSection(value: string): value is AppSection {
  return SECTIONS.includes(value as AppSection);
}
