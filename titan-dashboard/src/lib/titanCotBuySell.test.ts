import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  cotBuySellHeadline,
  cotBuySellHoldArmedConflict,
  evaluateCotBuySell,
  pineCotIndex,
} from "./titanCotBuySell";

describe("pineCotIndex", () => {
  it("is 100 at the window high and 0 at the window low", () => {
    assert.equal(pineCotIndex([0, 10, 20]), 100);
    assert.equal(pineCotIndex([20, 10, 0]), 0);
    assert.equal(pineCotIndex([5, 5, 5]), null);
  });
});

describe("evaluateCotBuySell", () => {
  it("touches 100 on a new 26w high then stays ARMED SELL", () => {
    const up = Array.from({ length: 26 }, (_, i) => i);
    const touched = evaluateCotBuySell(up);
    assert.equal(touched?.action, "TOUCH_100");
    assert.equal(touched?.armedSell, true);
    assert.equal(touched?.regime, 0);

    const stillHigh = evaluateCotBuySell([...up, 26, 27]);
    assert.equal(stillHigh?.action, "ARMED_SELL");
    assert.equal(stillHigh?.sigTouchSell, false);
  });

  it("fires SELL on EXIT 80 and then HOLDs short", () => {
    const up = Array.from({ length: 28 }, (_, i) => i);
    const sell = evaluateCotBuySell([...up, 10]);
    assert.equal(sell?.action, "SELL");
    assert.equal(sell?.sigExitSell, true);
    assert.equal(sell?.regime, -1);

    const held = evaluateCotBuySell([...up, 10, 11, 12]);
    assert.equal(held?.action, "HOLD_SHORT");
    assert.equal(held?.regime, -1);
  });

  it("fires BUY on EXIT 20 and then HOLDs long", () => {
    const down = Array.from({ length: 26 }, (_, i) => 25 - i);
    const touched = evaluateCotBuySell(down);
    assert.equal(touched?.action, "TOUCH_0");
    assert.equal(touched?.armedBuy, true);

    const buy = evaluateCotBuySell([...down, 20]);
    assert.equal(buy?.action, "BUY");
    assert.equal(buy?.sigExitBuy, true);
    assert.equal(buy?.regime, 1);

    const held = evaluateCotBuySell([...down, 20, 19, 18]);
    assert.equal(held?.action, "HOLD_LONG");
    assert.equal(held?.regime, 1);
  });

  it("keeps HOLD LONG when an opposite ARMED SELL appears", () => {
    const down = Array.from({ length: 26 }, (_, i) => 25 - i);
    const afterBuy = [...down, 20, ...Array.from({ length: 30 }, (_, i) => 21 + i)];
    const state = evaluateCotBuySell(afterBuy);
    assert.equal(state?.regime, 1);
    assert.equal(state?.armedSell, true);
    assert.equal(cotBuySellHoldArmedConflict(state!), true);
    assert.equal(cotBuySellHeadline(state!), "HOLD LONG · ARMED SELL");
  });
});
