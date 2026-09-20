export type TitanTypeScaleId = "sm" | "md" | "lg";

export const TITAN_TYPE_SCALES = ["sm", "md", "lg"] as const;
export const TITAN_TYPE_DEFAULT: TitanTypeScaleId = "md";
export const TITAN_TYPE_STORAGE_KEY = "titan-type-scale";

/** UI zoom vs Normal. Most titan CSS is px, so html font-size alone does nothing. */
export const TITAN_TYPE_ZOOM: Record<TitanTypeScaleId, number> = {
  sm: 0.9,
  md: 1,
  lg: 1.2,
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
}
