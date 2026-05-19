import type { InstitutionalMarket } from "../../../config/institutionalMarkets";
import type { ComponentType } from "react";
import {
  GlyphAud,
  GlyphCad,
  GlyphChf,
  GlyphCoffee,
  GlyphDefault,
  GlyphDxy,
  GlyphEur,
  GlyphGas,
  GlyphGbp,
  GlyphGold,
  GlyphGrain,
  GlyphIndex,
  GlyphJpy,
  GlyphLivestock,
  GlyphMetal,
  GlyphOil,
  GlyphSilver,
  GlyphSoft,
} from "./glyphs";

type GlyphProps = { className?: string };

const BY_ID: Record<string, ComponentType<GlyphProps>> = {
  DXY: GlyphDxy,
  EUR: GlyphEur,
  JPY: GlyphJpy,
  GBP: GlyphGbp,
  AUD: GlyphAud,
  CAD: GlyphCad,
  CHF: GlyphChf,
  GOLD: GlyphGold,
  SILVER: GlyphSilver,
  PLATINUM: GlyphMetal,
  PALLADIUM: GlyphMetal,
  COPPER: GlyphMetal,
  OIL: GlyphOil,
  NATGAS: GlyphGas,
  CORN: GlyphGrain,
  SOYBEANS: GlyphGrain,
  WHEAT: GlyphGrain,
  COFFEE: GlyphCoffee,
  COCOA: GlyphSoft,
  SUGAR: GlyphSoft,
  COTTON: GlyphSoft,
  CATTLE: GlyphLivestock,
  HOGS: GlyphLivestock,
  SP500: GlyphIndex,
  NAS100: GlyphIndex,
  DOW: GlyphIndex,
  RUSSELL: GlyphIndex,
};

export function resolveMarketGlyph(market: InstitutionalMarket): ComponentType<GlyphProps> {
  return BY_ID[market.id] ?? GlyphDefault;
}
