import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { regimeCardAccent, regimePillClass } from "./titanRegimeTone";

describe("regimePillClass", () => {
  it("colors TRENDING from signed score and stays neutral inside ±20", () => {
    assert.equal(regimePillClass("trending", 40), "titan-regime-pill--bull");
    assert.equal(regimePillClass("trending", -40), "titan-regime-pill--bear");
    assert.equal(regimePillClass("trending", 19), "titan-regime-pill--neutral");
    assert.equal(regimePillClass("trending", -19), "titan-regime-pill--neutral");
    assert.equal(regimePillClass("trending", 20), "titan-regime-pill--bull");
    assert.equal(regimePillClass("trending", -20), "titan-regime-pill--bear");
    assert.equal(regimePillClass("trending"), "titan-regime-pill--neutral");
  });

  it("leaves accumulation green and distribution red", () => {
    assert.equal(regimePillClass("accumulation", -80), "titan-regime-pill--bull");
    assert.equal(regimePillClass("distribution", 80), "titan-regime-pill--bear");
  });
});

describe("regimeCardAccent", () => {
  it("does not paint TRENDING cards green by default", () => {
    assert.equal(regimeCardAccent("trending"), "titan-regime-card--neutral");
    assert.equal(regimeCardAccent("accumulation"), "titan-regime-card--bull");
  });
});
