import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  groupMarketsByCategory,
  heatmapToneFromComm26,
  isRetailExtreme,
} from "./titanHeatmapVisuals";
import type { InstitutionalMarket } from "../config/institutionalMarkets";

describe("heatmapToneFromComm26", () => {
  it("maps commercial 26w bands", () => {
    assert.equal(heatmapToneFromComm26(null), "empty");
    assert.equal(heatmapToneFromComm26(undefined), "empty");
    assert.equal(heatmapToneFromComm26(Number.NaN), "empty");
    assert.equal(heatmapToneFromComm26(95), "extreme_long");
    assert.equal(heatmapToneFromComm26(70), "strong_long");
    assert.equal(heatmapToneFromComm26(50), "neutral");
    assert.equal(heatmapToneFromComm26(30), "strong_short");
    assert.equal(heatmapToneFromComm26(10), "extreme_short");
  });
});

describe("isRetailExtreme", () => {
  it("flags only the outer 20/80 band", () => {
    assert.equal(isRetailExtreme(81), true);
    assert.equal(isRetailExtreme(19), true);
    assert.equal(isRetailExtreme(50), false);
    assert.equal(isRetailExtreme(null), false);
  });
});

describe("groupMarketsByCategory", () => {
  it("keeps category order and drops empty groups", () => {
    const markets: InstitutionalMarket[] = [
      { id: "GOLD", symbol: "GC1!", shortLabel: "GOLD", subtitle: "Gold", category: "metals" },
      { id: "EUR", symbol: "6E1!", shortLabel: "EUR", subtitle: "Euro", category: "forex" },
      { id: "OIL", symbol: "CL1!", shortLabel: "OIL", subtitle: "WTI", category: "energy" },
    ];
    assert.deepEqual(
      groupMarketsByCategory(markets).map((g) => g.category),
      ["forex", "metals", "energy"],
    );
  });
});
