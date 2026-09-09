import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { INSTITUTIONAL_MARKETS } from "../config/institutionalMarkets";
import type { CotDashboardData } from "../types";
import { buildScannerRows } from "./cotScannerRows";

function template(): CotDashboardData {
  return {
    market: "GOLD",
    futuresSymbol: "GC1!",
    cftcMarketName: "GOLD",
    symbol: "GC1!",
    reportDate: "2024-01-05",
    commercials: {
      net: 0,
      index26w: 82,
      index52w: 80,
      weeklyChange: 4000,
      delta4w: 8000,
      delta13w: 12000,
      bias: "bullish",
    },
    nonCommercials: {
      net: 0,
      index26w: 20,
      index52w: 22,
      weeklyChange: -2000,
      delta4w: -3000,
      delta13w: -4000,
      divergence: "bullish",
    },
    retail: {
      net: 0,
      index26w: 18,
      index52w: 20,
      weeklyChange: -1000,
      delta4w: -1500,
      delta13w: -2000,
      contrarianSignal: "bullish",
    },
    cotScore: 55,
    cotVerdict: "B LONG",
    plainEnglishExplanation: "",
    history: [],
  };
}

describe("buildScannerRows", () => {
  it("marks calculation failures as error and does not keep a substitute LIVE score", () => {
    const gold = INSTITUTIONAL_MARKETS.find((item) => item.id === "GOLD");
    assert.ok(gold);
    const broken = {
      ...template(),
      commercials: undefined,
    } as unknown as CotDashboardData;
    const rows = buildScannerRows([gold], { [gold.symbol]: broken }, {});
    assert.equal(rows[0]?.status, "error");
    assert.equal(rows[0]?.score, 0);
    assert.ok(rows[0]?.errorMessage);
  });

  it("keeps fetch errors out of live rows", () => {
    const gold = INSTITUTIONAL_MARKETS.find((item) => item.id === "GOLD");
    assert.ok(gold);
    const rows = buildScannerRows([gold], {}, { [gold.symbol]: "timeout" });
    assert.equal(rows[0]?.status, "error");
    assert.equal(rows[0]?.errorMessage, "timeout");
  });
});
