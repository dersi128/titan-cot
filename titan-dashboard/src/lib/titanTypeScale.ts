export type TitanTypeScaleId = "sm" | "md" | "lg";

export const TITAN_TYPE_SCALES = ["sm", "md", "lg"] as const;
export const TITAN_TYPE_DEFAULT: TitanTypeScaleId = "md";
export const TITAN_TYPE_STORAGE_KEY = "titan-type-scale";

export function parseTitanTypeScale(raw: string | null | undefined): TitanTypeScaleId | null {
  if (raw === "sm" || raw === "md" || raw === "lg") return raw;
  return null;
}

export function applyTitanTypeScale(scale: TitanTypeScaleId): void {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.titanType = scale;
}
