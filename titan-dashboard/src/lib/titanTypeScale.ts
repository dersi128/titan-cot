export type TitanTypeScaleId = "sm" | "md" | "lg";

export const TITAN_TYPE_SCALES = ["sm", "md", "lg"] as const;
export const TITAN_TYPE_DEFAULT: TitanTypeScaleId = "md";
export const TITAN_TYPE_STORAGE_KEY = "titan-type-scale";

/** Layout zoom vs Normal. Small shrinks the whole Home; Large must not. */
export const TITAN_TYPE_ZOOM: Record<TitanTypeScaleId, number> = {
  sm: 0.9,
  md: 1,
  lg: 1,
};

/** Text size vs Normal. Large grows glyphs only, so Home still fits. */
export const TITAN_TYPE_FONT: Record<TitanTypeScaleId, number> = {
  sm: 1,
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
  root.style.setProperty("--titan-ui-zoom", String(TITAN_TYPE_ZOOM[scale]));
  root.style.setProperty("--titan-type-font", String(TITAN_TYPE_FONT[scale]));
}
