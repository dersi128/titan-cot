import {
  parsePresidentialPhasesQuery,
  type PresidentialCyclePhase,
} from "../seasonality/utils/presidentialCycle";

export type AppSection = "home" | "scanner" | "seasonality" | "valuation" | "dme";

export type DashboardView = AppSection | "market";

export type NavigateSectionOptions = {
  /** Prefill seasonality market (`#/seasonality/GOLD`). */
  seasonalityMarket?: string;
  /** Prefill presidential cycle filter (`?cycles=midterm`). */
  seasonalityCycles?: PresidentialCyclePhase[];
  /** Prefill valuation market (`#/valuation/GOLD`). */
  valuationMarket?: string;
};

const SECTIONS: AppSection[] = ["home", "scanner", "seasonality", "valuation", "dme"];

function hashPathAndQuery(): { path: string; query: string } {
  const raw = window.location.hash.replace(/^#\/?/, "");
  const q = raw.indexOf("?");
  if (q < 0) return { path: raw, query: "" };
  return { path: raw.slice(0, q), query: raw.slice(q + 1) };
}

export function parseAppSectionFromHash(): AppSection {
  const { path } = hashPathAndQuery();
  const raw = path.split("/")[0]?.toLowerCase() ?? "";
  if (SECTIONS.includes(raw as AppSection)) return raw as AppSection;
  return "home";
}

/** Second hash segment when on seasonality, e.g. `#/seasonality/GOLD` → `GOLD`. */
export function parseSeasonalityMarketFromHash(): string | null {
  const { path } = hashPathAndQuery();
  const parts = path.split("/").filter(Boolean);
  if (parts[0]?.toLowerCase() !== "seasonality") return null;
  const raw = parts[1]?.trim();
  if (!raw) return null;
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

/** Second hash segment when on valuation, e.g. `#/valuation/GOLD` → `GOLD`. */
export function parseValuationMarketFromHash(): string | null {
  const { path } = hashPathAndQuery();
  const parts = path.split("/").filter(Boolean);
  if (parts[0]?.toLowerCase() !== "valuation") return null;
  const raw = parts[1]?.trim();
  if (!raw) return null;
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

/** `?cycles=midterm` or `?cycles=election,post` on seasonality hash. */
export function parseSeasonalityCyclesFromHash(): PresidentialCyclePhase[] | null {
  const { path, query } = hashPathAndQuery();
  if (path.split("/")[0]?.toLowerCase() !== "seasonality") return null;
  if (!query) return null;
  const params = new URLSearchParams(query);
  return parsePresidentialPhasesQuery(params.get("cycles"));
}

export function setAppSectionHash(section: AppSection, options?: NavigateSectionOptions): void {
  let next: string;
  if (section === "home") {
    next = "#/";
  } else if (section === "seasonality" && options?.seasonalityMarket?.trim()) {
    next = `#/seasonality/${encodeURIComponent(options.seasonalityMarket.trim())}`;
    const cycles = options.seasonalityCycles?.filter(Boolean);
    if (cycles?.length) {
      next += `?cycles=${encodeURIComponent(cycles.join(","))}`;
    }
  } else if (section === "valuation" && options?.valuationMarket?.trim()) {
    next = `#/valuation/${encodeURIComponent(options.valuationMarket.trim())}`;
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
