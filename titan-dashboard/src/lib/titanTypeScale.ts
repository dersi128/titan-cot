export type TitanTypeScaleId = "sm" | "md" | "lg";

export const TITAN_TYPE_SCALES = ["sm", "md", "lg"] as const;
export const TITAN_TYPE_DEFAULT: TitanTypeScaleId = "md";
export const TITAN_TYPE_STORAGE_KEY = "titan-type-scale";

/** Text size vs Normal. Layout stays the same at every step. */
export const TITAN_TYPE_FONT: Record<TitanTypeScaleId, number> = {
  sm: 0.88,
  md: 1,
  lg: 1.16,
};

export function parseTitanTypeScale(raw: string | null | undefined): TitanTypeScaleId | null {
  if (raw === "sm" || raw === "md" || raw === "lg") return raw;
  return null;
}

export function applyTitanTypeScale(scale: TitanTypeScaleId): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.dataset.titanType = scale;
  root.style.setProperty("--titan-type-font", String(TITAN_TYPE_FONT[scale]));
  root.style.removeProperty("--titan-ui-zoom");
}
