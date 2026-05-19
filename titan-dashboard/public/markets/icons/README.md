# Market icon PNGs (optional)

Drop **transparent PNG** files here.  
**File name = market id** from `institutionalMarkets.ts` (uppercase).

## Kontrola názvů (doporučeno)

```bash
npm run icons:check
```

Ukáže co sedí, co přejmenovat, co chybí.

## Sync + deploy

```bash
npm run icons:sync
```

Kopíruje ikony do `src/assets/markets/icons/` (Vite bundling).

## Správné názvy (27 trhů)

| Soubor | Trh |
|--------|-----|
| `DXY.png` | Dollar index |
| `EUR.png` | Euro |
| `JPY.png` | Yen |
| `GBP.png` | Pound |
| `AUD.png` | Aussie |
| `CAD.png` | CAD |
| `CHF.png` | Franc |
| `GOLD.png` | Gold |
| `SILVER.png` | Silver |
| `PLATINUM.png` | Platinum |
| `PALLADIUM.png` | Palladium |
| `COPPER.png` | Copper |
| `OIL.png` | Crude |
| `NATGAS.png` | Natural gas |
| `CORN.png` | Corn |
| `SOYBEANS.png` | Soybeans |
| `WHEAT.png` | Wheat |
| `COFFEE.png` | Coffee |
| `COCOA.png` | Cocoa |
| `SUGAR.png` | Sugar |
| `COTTON.png` | Cotton |
| `CATTLE.png` | Live cattle |
| `HOGS.png` | Hogs |
| `SP500.png` | S&P |
| `NAS100.png` | Nasdaq |
| `DOW.png` | Dow |
| `RUSSELL.png` | Russell |

## Časté zkratky (sync je opraví sám)

| Tvůj název | → použije se |
|------------|----------------|
| `PLAT.png`, `PL.png` | `PLATINUM.png` |
| `PALL.png`, `PD.png` | `PALLADIUM.png` |
| `NG.png` | `NATGAS.png` |
| `SOY.png` | `SOYBEANS.png` |
| `RTY.png` | `RUSSELL.png` |
| `NQ.png` | `NAS100.png` |
| `ES.png` | `SP500.png` |
| `YM.png` | `DOW.png` |
| `GC.png` | `GOLD.png` |
| `CL.png` | `OIL.png` |

Chybí PNG → dashboard zobrazí SVG (funguje normálně).

Recommended: **256×256**, transparent background, **no text** in the image.
