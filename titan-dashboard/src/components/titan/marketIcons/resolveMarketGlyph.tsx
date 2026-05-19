import type { InstitutionalMarket } from "../../../config/institutionalMarkets";
import type { ComponentType } from "react";
import type { GlyphProps } from "./glyphs";
import {
  GlyphAud,
  GlyphBond,
  GlyphCad,
  GlyphCattle,
  GlyphChf,
  GlyphCocoa,
  GlyphCoffee,
  GlyphCopper,
  GlyphCorn,
  GlyphCotton,
  GlyphDefault,
  GlyphDow,
  GlyphDxy,
  GlyphEur,
  GlyphGas,
  GlyphGbp,
  GlyphGold,
  GlyphHogs,
  GlyphJpy,
  GlyphNas100,
  GlyphOil,
  GlyphPalladium,
  GlyphPlatinum,
  GlyphRussell,
  GlyphSilver,
  GlyphSoy,
  GlyphSp500,
  GlyphSugar,
  GlyphWheat,
} from "./glyphs";

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
  PLATINUM: GlyphPlatinum,
  PALLADIUM: GlyphPalladium,
  COPPER: GlyphCopper,
  OIL: GlyphOil,
  NATGAS: GlyphGas,
  CORN: GlyphCorn,
  SOYBEANS: GlyphSoy,
  WHEAT: GlyphWheat,
  COFFEE: GlyphCoffee,
  COCOA: GlyphCocoa,
  SUGAR: GlyphSugar,
  COTTON: GlyphCotton,
  CATTLE: GlyphCattle,
  HOGS: GlyphHogs,
  SP500: GlyphSp500,
  NAS100: GlyphNas100,
  DOW: GlyphDow,
  RUSSELL: GlyphRussell,
};

export function resolveMarketGlyph(market: InstitutionalMarket): ComponentType<GlyphProps> {
  return BY_ID[market.id] ?? GlyphDefault;
}

export { GlyphBond };
