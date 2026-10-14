import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { INSTITUTIONAL_MARKETS } from "../config/institutionalMarkets";
import { COT_MARKET_MAPPINGS as dashboardMap, getCotMarketMapping as getDashboardMapping } from "./cotMarketMap";
import {
  COT_MARKET_MAPPINGS as cftcMap,
  getCotMarketMapping,
} from "../../../cot-data-module/src/cotMarketMap";
import { groupMarketsForHeatmap } from "./titanHeatmapVisuals";

const ADDED = {
  "ZF1!": "044601",
  "ZN1!": "043602",
  "ZB1!": "020601",
  "RB1!": "111659",
  "HO1!": "022651",
  "ZM1!": "026603",
  "ZL1!": "007601",
  "ZR1!": "039601",
  "OJ1!": "040701",
  "GF1!": "061641",
  "6M1!": "095741",
  "BTC1!": "133741",
  "ETH1!": "146021",
  "VX1!": "1170E1",
} as const;

const REJECTED = ["067411", "03565B", "042601", "043607", "020604", "133742", "146022"];

describe("InsiderWeek 42-market registry", () => {
  it("covers 42 institutional markets with matching CFTC Legacy codes", () => {
    assert.equal(INSTITUTIONAL_MARKETS.length, 42);
    assert.equal(cftcMap.length, 42);
    assert.equal(dashboardMap.length, 42);

    const dashboardSymbols = new Set(dashboardMap.map((m) => m.futuresSymbol));
    const cftcSymbols = new Set(cftcMap.map((m) => m.futuresSymbol));
    for (const market of INSTITUTIONAL_MARKETS) {
      assert.equal(dashboardSymbols.has(market.symbol), true, market.symbol);
      assert.equal(cftcSymbols.has(market.symbol), true, market.symbol);
      assert.equal(getDashboardMapping(market.symbol)?.futuresSymbol, market.symbol);
      assert.equal(getCotMarketMapping(market.symbol)?.futuresSymbol, market.symbol);
    }
  });

  it("maps the new contracts to verified Legacy Futures Only codes", () => {
    for (const [symbol, code] of Object.entries(ADDED)) {
      assert.equal(getCotMarketMapping(symbol)?.cftcContractMarketCode, code);
    }
    assert.equal(getCotMarketMapping("CL1!")?.cftcContractMarketCode, "067651");
    assert.equal(getCotMarketMapping("NG1!")?.cftcContractMarketCode, "023651");
    const codes = cftcMap.map((m) => m.cftcContractMarketCode);
    assert.equal(new Set(codes).size, codes.length);
    for (const code of REJECTED) {
      assert.equal(codes.includes(code), false, code);
    }
  });

  it("groups the full board into heatmap sections without dropping markets", () => {
    const grouped = groupMarketsForHeatmap(INSTITUTIONAL_MARKETS);
    const ids = grouped.flatMap((g) => g.markets.map((m) => m.id));
    assert.equal(ids.length, 42);
    assert.deepEqual(
      grouped.map((g) => g.group),
      ["forex", "metals", "commodities", "bonds", "indices", "other"],
    );
    assert.equal(grouped.find((g) => g.group === "bonds")?.markets.length, 3);
    assert.equal(grouped.find((g) => g.group === "other")?.markets.length, 3);
  });
});
