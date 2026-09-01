/**
 * Phase 1 feature flags. Flip these as later phases land —
 * UI already reads them instead of scattering conditionals.
 */
export const FEATURE_FLAGS = {
  /** When true, COT fields are hidden for Forex Cross pairs. */
  hideCotForCrossPairs: false,
} as const
