import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { CotDashboardData, CotHistoryPoint } from "../types";
import {
  buildTimeMachineWeeks,
  rebuildCotDashboardAsOf,
  rebuildCotDashboardFromHistory,
  TIME_MACHINE_WEEKS,
} from "./cotAsOfSnapshot";
import { calculateCotIndexAgainstPrior } from "./titanCotScoringCore";
import { buildCotHistoryChart } from "./cotHistoryChart";

function weekDate(index: number): string {
  const stamp = Date.UTC(2023, 0, 3) + index * 7 * 24 * 60 * 60 * 1000;
  return new Date(stamp).toISOString().slice(0, 10);
}

function makeHistory(weeks: number): CotHistoryPoint[] {
  const out: CotHistoryPoint[] = [];
  for (let i = 0; i < weeks; i += 1) {
    const wave = Math.sin(i / 6);
    out.push({
      reportDate: weekDate(i),
      commercialNet: Math.round(40_000 + wave * 80_000 + i * 120),
      nonCommercialNet: Math.round(-20_000 - wave * 70_000 - i * 80),
      retailNet: Math.round(8_000 + Math.cos(i / 5) * 12_000),
    });
  }
  return out;
}

function template(): CotDashboardData {
  return {
    market: "GOLD",
    futuresSymbol: "GC1!",
    cftcMarketName: "GOLD",
    symbol: "GC1!",
    reportDate: weekDate(0),
    commercials: {
      net: 0,
      index26w: 50,
      index52w: 50,
      weeklyChange: 0,
      delta4w: 0,
      delta13w: 0,
      bias: "neutral",
    },
    nonCommercials: {
      net: 0,
      index26w: 50,
      index52w: 50,
      weeklyChange: 0,
      delta4w: 0,
      delta13w: 0,
      divergence: "none",
    },
    retail: {
      net: 0,
      index26w: 50,
      index52w: 50,
      weeklyChange: 0,
      delta4w: 0,
      delta13w: 0,
      contrarianSignal: "none",
    },
    cotScore: 0,
    cotVerdict: "NEUTRAL",
    plainEnglishExplanation: "",
    history: [],
  };
}

describe("rebuildCotDashboardFromHistory", () => {
  it("matches index and delta formulas on the latest week", () => {
    const history = makeHistory(80);
    const snap = rebuildCotDashboardFromHistory(template(), history);
    assert.ok(snap);

    const commNets = history.map((row) => row.commercialNet);
    const last = history[history.length - 1]!;
    const prev = history[history.length - 2]!;
    const prev4 = history[history.length - 5]!;

    assert.equal(snap.reportDate, last.reportDate);
    assert.equal(snap.commercials.net, last.commercialNet);
    assert.equal(snap.commercials.weeklyChange, last.commercialNet - prev.commercialNet);
    assert.equal(snap.commercials.delta4w, last.commercialNet - prev4.commercialNet);
    assert.equal(snap.commercials.index26w, calculateCotIndexAgainstPrior(commNets, 26));
    assert.equal(snap.commercials.index52w, calculateCotIndexAgainstPrior(commNets, 52));
    assert.equal(snap.history.length, history.length);
    assert.equal(typeof snap.cotScore, "number");
    assert.ok(Number.isFinite(snap.cotScore));
  });

  it("rebuilds an earlier Friday independently of later weeks", () => {
    const history = makeHistory(80);
    const latest = rebuildCotDashboardFromHistory(template(), history);
    const asOfDate = history[history.length - 5]!.reportDate;
    const asOf = rebuildCotDashboardAsOf(latest!, asOfDate);

    assert.ok(asOf);
    assert.equal(asOf.reportDate, asOfDate);
    assert.equal(asOf.history.length, history.length - 4);
    assert.equal(asOf.commercials.net, history[history.length - 5]!.commercialNet);
    assert.notEqual(asOf.commercials.net, latest!.commercials.net);
    assert.notEqual(asOf.reportDate, latest!.reportDate);
  });

  it("returns the original payload when as-of is the latest report", () => {
    const history = makeHistory(40);
    const latest = rebuildCotDashboardFromHistory(template(), history)!;
    const again = rebuildCotDashboardAsOf(latest, latest.reportDate);
    assert.equal(again, latest);
  });

  it("returns null when the report date is missing from history", () => {
    const history = makeHistory(40);
    const latest = rebuildCotDashboardFromHistory(template(), history)!;
    assert.equal(rebuildCotDashboardAsOf(latest, "1999-01-01"), null);
  });
});

describe("buildTimeMachineWeeks", () => {
  it("returns newest-first rows with the latest week flagged", () => {
    const history = makeHistory(40);
    const latest = rebuildCotDashboardFromHistory(template(), history)!;
    const rows = buildTimeMachineWeeks(latest);

    assert.equal(rows.length, TIME_MACHINE_WEEKS);
    assert.equal(rows[0]!.isLatest, true);
    assert.equal(rows[0]!.reportDate, latest.reportDate);
    assert.ok(rows[1]!.reportDate < rows[0]!.reportDate);
    assert.equal(rows[rows.length - 1]!.isLatest, false);
    assert.equal(rows[0]!.commercialNet, latest.commercials.net);
    assert.equal(rows[0]!.score, latest.cotScore);
  });
});

describe("buildCotHistoryChart", () => {
  it("slices net series to the selected window", () => {
    const history = makeHistory(80);
    const chart = buildCotHistoryChart(history, 13, "net");
    assert.equal(chart.length, 13);
    assert.equal(chart[0]!.reportDate, history[history.length - 13]!.reportDate);
    assert.equal(chart[12]!.commercialNet, history[history.length - 1]!.commercialNet);
  });

  it("builds commercial 26w index only after the lookback is available", () => {
    const history = makeHistory(40);
    const chart = buildCotHistoryChart(history, 52, "index26w");
    assert.ok(chart.length > 0);
    assert.ok(chart.every((point) => typeof point.commercialIndex === "number"));
    assert.equal(chart[chart.length - 1]!.reportDate, history[history.length - 1]!.reportDate);
  });

  it("builds weekly deltas from consecutive reports", () => {
    const history = makeHistory(20);
    const chart = buildCotHistoryChart(history, 13, "delta1w");
    assert.equal(chart.length, 13);
    const last = history[history.length - 1]!;
    const prev = history[history.length - 2]!;
    assert.equal(chart[chart.length - 1]!.commercialDelta, last.commercialNet - prev.commercialNet);
  });
});
