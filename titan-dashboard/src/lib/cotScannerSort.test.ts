import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { INSTITUTIONAL_MARKETS } from "../config/institutionalMarkets";
import type { ScannerRowModel } from "./cotScannerRows";
import {
  nextScannerSort,
  sortScannerRows,
  type ScannerSortKey,
} from "./cotScannerSort";
import type { TitanBiasVerdict } from "./titanCotScore";
import type { MarketRegimeId } from "./titanCommercialIndex";

function market(id: string) {
  const found = INSTITUTIONAL_MARKETS.find((item) => item.id === id);
  assert.ok(found, id);
  return found;
}

function row(
  id: string,
  patch: Partial<ScannerRowModel> = {},
): ScannerRowModel {
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

const labels: Record<MarketRegimeId, string> = {
  accumulation: "AKUMULACE",
  distribution: "DISTRIBUCE",
  trending: "TRENDING",
  rotation: "ROTACE",
  exhaustion: "VYČERPÁNÍ",
  transition: "PŘECHOD",
  neutral: "NEUTRÁLNÍ",
};

function labelsOf(regime: MarketRegimeId) {
  return labels[regime];
}

function ids(rows: ScannerRowModel[]) {
  return rows.map((item) => item.market.id);
}

function sortBy(key: ScannerSortKey, dir: "asc" | "desc", rows: ScannerRowModel[]) {
  return sortScannerRows(rows, { key, dir }, labelsOf);
}

describe("sortScannerRows", () => {
  it("keeps the default conviction rank order and ties by market", () => {
    const gbp = row("GBP", { score: 90, conviction: 5, persistenceWeeks: 8 });
    const eur = row("EUR", { score: 30, conviction: 2, persistenceWeeks: 1 });
    const aud = row("AUD", { score: -30, conviction: 2, persistenceWeeks: 1 });
    const sorted = sortScannerRows([eur, aud, gbp], null, labelsOf);
    assert.equal(sorted[0]?.market.id, "GBP");
    const tied = sortScannerRows(
      [
        row("EUR", { score: 30, conviction: 1, persistenceWeeks: 0 }),
        row("AUD", { score: 30, conviction: 1, persistenceWeeks: 0 }),
      ],
      null,
      labelsOf,
    );
    assert.deepEqual(ids(tied), ["AUD", "EUR"]);
  });

  it("sorts market A-Z and reverses on desc", () => {
    const rows = [row("GOLD"), row("AUD"), row("EUR")];
    assert.deepEqual(ids(sortBy("market", "asc", rows)), ["AUD", "EUR", "GOLD"]);
    assert.deepEqual(ids(sortBy("market", "desc", rows)), ["GOLD", "EUR", "AUD"]);
  });

  it("sorts score and bias by signed value, not absolute", () => {
    const rows = [row("EUR", { score: -80 }), row("AUD", { score: 10 }), row("GBP", { score: 40 })];
    assert.deepEqual(ids(sortBy("score", "desc", rows)), ["GBP", "AUD", "EUR"]);
    assert.deepEqual(ids(sortBy("score", "asc", rows)), ["EUR", "AUD", "GBP"]);
    assert.deepEqual(ids(sortBy("bias", "desc", rows)), ["GBP", "AUD", "EUR"]);
  });

  it("sorts verdict from extreme short to extreme long", () => {
    const rows = [
      row("EUR", { verdict: "A+ EXTREME LONG" }),
      row("AUD", { verdict: "A+ EXTREME SHORT" }),
      row("GBP", { verdict: "NEUTRAL" }),
      row("JPY", { verdict: "WEAK SHORT" as TitanBiasVerdict }),
    ];
    assert.deepEqual(ids(sortBy("verdict", "asc", rows)), ["AUD", "JPY", "GBP", "EUR"]);
    assert.deepEqual(ids(sortBy("verdict", "desc", rows)), ["EUR", "GBP", "JPY", "AUD"]);
  });

  it("sorts comm, retail and conviction numerically and keeps missing last", () => {
    const rows = [
      row("EUR", { comm26: 10, retail26: 90, conviction: 1 }),
      row("AUD", { comm26: null, retail26: null, conviction: 5 }),
      row("GBP", { comm26: 80, retail26: 20, conviction: 3 }),
    ];
    assert.deepEqual(ids(sortBy("comm26", "desc", rows)), ["GBP", "EUR", "AUD"]);
    assert.deepEqual(ids(sortBy("comm26", "asc", rows)), ["EUR", "GBP", "AUD"]);
    assert.deepEqual(ids(sortBy("retail26", "desc", rows)), ["EUR", "GBP", "AUD"]);
    assert.deepEqual(ids(sortBy("conviction", "desc", rows)), ["AUD", "GBP", "EUR"]);
  });

  it("sorts regime by translated label", () => {
    const rows = [
      row("EUR", { regime: "trending" }),
      row("AUD", { regime: "accumulation" }),
      row("GBP", { regime: "distribution" }),
    ];
    assert.deepEqual(ids(sortBy("regime", "asc", rows)), ["AUD", "GBP", "EUR"]);
    assert.deepEqual(ids(sortBy("regime", "desc", rows)), ["EUR", "GBP", "AUD"]);
  });

  it("keeps invalid rows and missing values at the bottom in both directions", () => {
    const rows = [
      row("EUR", { score: 50 }),
      row("AUD", { status: "error", score: 0 }),
      row("GBP", { status: "loading", score: 0 }),
      row("JPY", { score: -40 }),
    ];
    const desc = sortBy("score", "desc", rows);
    const asc = sortBy("score", "asc", rows);
    assert.deepEqual(ids(desc).slice(0, 2), ["EUR", "JPY"]);
    assert.deepEqual(ids(asc).slice(0, 2), ["JPY", "EUR"]);
    assert.deepEqual(ids(desc).slice(2), ["AUD", "GBP"]);
    assert.deepEqual(ids(asc).slice(2), ["AUD", "GBP"]);
  });

  it("uses market as a stable tiebreak", () => {
    const rows = [row("EUR", { score: 25 }), row("AUD", { score: 25 })];
    assert.deepEqual(ids(sortBy("score", "desc", rows)), ["AUD", "EUR"]);
    assert.deepEqual(ids(sortBy("score", "asc", rows)), ["AUD", "EUR"]);
  });
});

describe("nextScannerSort", () => {
  it("starts with the column default and toggles on repeat clicks", () => {
    const first = nextScannerSort(null, "score");
    assert.deepEqual(first, { key: "score", dir: "desc" });
    const second = nextScannerSort(first, "score");
    assert.deepEqual(second, { key: "score", dir: "asc" });
    const switched = nextScannerSort(second, "market");
    assert.deepEqual(switched, { key: "market", dir: "asc" });
  });
});
