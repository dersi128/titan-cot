/** Must match institutionalMarkets.ts `id` fields */
export const EXPECTED_MARKET_IDS = [
  "DXY",
  "EUR",
  "JPY",
  "GBP",
  "AUD",
  "CAD",
  "CHF",
  "GOLD",
  "SILVER",
  "PLATINUM",
  "PALLADIUM",
  "COPPER",
  "OIL",
  "NATGAS",
  "CORN",
  "SOYBEANS",
  "WHEAT",
  "COFFEE",
  "COCOA",
  "SUGAR",
  "COTTON",
  "CATTLE",
  "HOGS",
  "SP500",
  "NAS100",
  "DOW",
  "RUSSELL",
];

/**
 * Časté názvy z exportu / řezu mřížky → správné id v kódu.
 * Sync je přejmenuje při kopírování do src/assets.
 */
export const ICON_NAME_ALIASES = {
  DX: "DXY",
  USD: "DXY",
  DOLLAR: "DXY",
  EURO: "EUR",
  YEN: "JPY",
  POUND: "GBP",
  PLAT: "PLATINUM",
  PL: "PLATINUM",
  PT: "PLATINUM",
  PALL: "PALLADIUM",
  PD: "PALLADIUM",
  NG: "NATGAS",
  GAS: "NATGAS",
  NATURALGAS: "NATGAS",
  SOY: "SOYBEANS",
  BEANS: "SOYBEANS",
  RTY: "RUSSELL",
  RUT: "RUSSELL",
  NQ: "NAS100",
  NAS: "NAS100",
  NASDAQ: "NAS100",
  ES: "SP500",
  SP: "SP500",
  SPX: "SP500",
  YM: "DOW",
  DOWJONES: "DOW",
  LE: "CATTLE",
  LIVECATTLE: "CATTLE",
  HE: "HOGS",
  LEANHOGS: "HOGS",
  CL: "OIL",
  CRUDE: "OIL",
  WTI: "OIL",
  GC: "GOLD",
  SI: "SILVER",
  HG: "COPPER",
  ZC: "CORN",
  ZS: "SOYBEANS",
  ZW: "WHEAT",
  KC: "COFFEE",
  CC: "COCOA",
  SB: "SUGAR",
  CT: "COTTON",
  PA: "PALLADIUM",
};

const EXPECTED = new Set(EXPECTED_MARKET_IDS);

export function resolveMarketIconId(fileBaseName) {
  const raw = fileBaseName.replace(/\.png$/i, "").trim();
  const upper = raw.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (!upper) return { id: null, reason: "empty" };
  if (EXPECTED.has(upper)) return { id: upper, alias: false };
  const mapped = ICON_NAME_ALIASES[upper];
  if (mapped) return { id: mapped, alias: true, from: upper };
  return { id: null, reason: "unknown", from: upper };
}
