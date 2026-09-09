import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { INSTITUTIONAL_MARKETS } from "../config/institutionalMarkets";
import type { ScannerRowModel } from "./cotScannerRows";
import {
  buildHomeOverviewStats,
  selectHighestConviction,
  type HomeScannerRow,
} from "./titanHomeOverview";
import { convictionRankScore } from "./titanConviction";

function market(id: string) {
  const found = INSTITUTIONAL_MARKETS.find((item) => item.id === id);
  assert.ok(found, id);
  return found;
}

function homeRow(id: string, patch: Partial<HomeScannerRow> = {}): HomeScannerRow {
  return {
    market: market(id),
    score: 40,
    conviction: 3,
    persistenceWeeks: 2,
    regime: "accumulation",
    status: "live",
    ...patch,
  };
}

function scannerRow(id: string, patch: Partial<ScannerRowModel> = {}): ScannerRowModel {
  return {
    market: market(id),
    score: 40,
    verdict: "B LONG",
    comm26: 70,
    retail26: 40,
    regime: "accumulation",
    conviction: 3,
    persistenceWeeks: 2,
    isExtreme: false,
    status: "live",
    ...patch,
  };
}

describe("buildHomeOverviewStats watchlists", () => {
  it("keeps longs at +20 and shorts at -20, drops the inner band", () => {
    const rows = [
      homeRow("EUR", { score: 20, conviction: 1 }),
      homeRow("AUD", { score: 19, conviction: 5 }),
      homeRow("GBP", { score: -20, conviction: 1 }),
      homeRow("JPY", { score: -19, conviction: 5 }),
      homeRow("GOLD", { score: 80, conviction: 2 }),
    ];
    const stats = buildHomeOverviewStats(INSTITUTIONAL_MARKETS, {}, rows);
    assert.deepEqual(
      stats.strongestLongs.map((item) => item.market.id),
      ["GOLD", "EUR"],
    );
    assert.deepEqual(
      stats.strongestShorts.map((item) => item.market.id),
      ["GBP"],
    );
  });

  it("keeps the existing rank order inside the ±20 lists", () => {
    const weakHighConv = homeRow("EUR", { score: 21, conviction: 5, persistenceWeeks: 8 });
    const strongLowConv = homeRow("AUD", { score: 90, conviction: 0, persistenceWeeks: 0 });
    const rankWeak = convictionRankScore(21, 5, 8);
    const rankStrong = convictionRankScore(90, 0, 0);
    const stats = buildHomeOverviewStats(INSTITUTIONAL_MARKETS, {}, [weakHighConv, strongLowConv]);
    const first = rankWeak >= rankStrong ? "EUR" : "AUD";
    assert.equal(stats.strongestLongs[0]?.market.id, first);
  });

  it("excludes error rows from valid-market overviews", () => {
    const rows = [
      homeRow("EUR", { score: 40, status: "error" }),
      homeRow("AUD", { score: 50 }),
    ];
    const stats = buildHomeOverviewStats(INSTITUTIONAL_MARKETS, {}, rows);
    assert.equal(stats.liveCount, 1);
    assert.deepEqual(
      stats.strongestLongs.map((item) => item.market.id),
      ["AUD"],
    );
  });
});

describe("selectHighestConviction", () => {
  it("sorts by conviction first and uses rank on ties", () => {
    const lowConvHighRank = scannerRow("EUR", { score: 90, conviction: 2, persistenceWeeks: 8 });
    const highConv = scannerRow("AUD", { score: 10, conviction: 5, persistenceWeeks: 0 });
    const tiedConvWeaker = scannerRow("GBP", { score: 20, conviction: 4, persistenceWeeks: 0 });
    const tiedConvStronger = scannerRow("JPY", { score: 80, conviction: 4, persistenceWeeks: 8 });
    const ranked = selectHighestConviction([
      lowConvHighRank,
      highConv,
      tiedConvWeaker,
      tiedConvStronger,
    ]);
    assert.deepEqual(
      ranked.map((item) => item.market.id),
      ["AUD", "JPY", "GBP", "EUR"],
    );
  });
});
