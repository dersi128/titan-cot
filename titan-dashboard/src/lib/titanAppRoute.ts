export type AppSection = "home" | "scanner" | "seasonality" | "dme";

export type DashboardView = AppSection | "market";

const SECTIONS: AppSection[] = ["home", "scanner", "seasonality", "dme"];

export function parseAppSectionFromHash(): AppSection {
  const raw = window.location.hash.replace(/^#\/?/, "").split("/")[0]?.toLowerCase() ?? "";
  if (SECTIONS.includes(raw as AppSection)) return raw as AppSection;
  return "home";
}

export function setAppSectionHash(section: AppSection): void {
  const next = section === "home" ? "#/" : `#/${section}`;
  if (window.location.hash !== next) {
    window.location.hash = next;
  }
}

export function isAppSection(value: string): value is AppSection {
  return SECTIONS.includes(value as AppSection);
}
