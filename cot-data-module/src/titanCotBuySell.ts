/** Pine COT BUY/SELL: TOUCH 0/100 setup, EXIT 20/80 turn, hold until opposite. */

export const COT_BUY_SELL = {
  lookback: 26,
  touchHigh: 100,
  exitHigh: 80,
  touchLow: 0,
  exitLow: 20,
  cooldown: 2,
} as const;

export type CotBuySellAction =
  | "BUY"
  | "SELL"
  | "TOUCH_0"
  | "TOUCH_100"
  | "ARMED_BUY"
  | "ARMED_SELL"
  | "HOLD_LONG"
  | "HOLD_SHORT"
  | "WAIT";

export type CotBuySellState = {
  index: number | null;
  prevIndex: number | null;
  action: CotBuySellAction;
  regime: 1 | -1 | 0;
  armedBuy: boolean;
  armedSell: boolean;
  sigTouchBuy: boolean;
  sigTouchSell: boolean;
  sigExitBuy: boolean;
  sigExitSell: boolean;
  inHighZone: boolean;
  inLowZone: boolean;
  holdWeeks: number;
  armedWeeks: number;
};

export function pineCotIndex(windowNets: number[]): number | null {
  if (windowNets.length === 0) return null;
  const hh = Math.max(...windowNets);
  const ll = Math.min(...windowNets);
  if (hh === ll) return null;
  return ((windowNets[windowNets.length - 1]! - ll) / (hh - ll)) * 100;
}

export function evaluateCotBuySell(nets: number[]): CotBuySellState | null {
  const lookback = COT_BUY_SELL.lookback;
  if (nets.length < lookback) return null;

  let armedBuy = false;
  let armedSell = false;
  let regime: 1 | -1 | 0 = 0;
  let barsSinceTouchSell = 999;
  let barsSinceTouchBuy = 999;
  let barsSinceExitSell = 999;
  let barsSinceExitBuy = 999;
  let holdWeeks = 0;
  let armedWeeks = 0;
  let prevIndex: number | null = null;
  let last: CotBuySellState | null = null;

  for (let i = lookback - 1; i < nets.length; i++) {
    const window = nets.slice(i - lookback + 1, i + 1);
    const idx = pineCotIndex(window);
    const prev = prevIndex;

    const touchHighRaw: boolean =
      idx !== null && idx >= COT_BUY_SELL.touchHigh && (prev === null || prev < COT_BUY_SELL.touchHigh);
    const touchLowRaw: boolean =
      idx !== null && idx <= COT_BUY_SELL.touchLow && (prev === null || prev > COT_BUY_SELL.touchLow);

    if (touchHighRaw) {
      armedSell = true;
      armedBuy = false;
    }
    if (touchLowRaw) {
      armedBuy = true;
      armedSell = false;
    }

    const exitHighRaw: boolean =
      prev !== null && idx !== null && prev >= COT_BUY_SELL.exitHigh && idx < COT_BUY_SELL.exitHigh;
    const exitLowRaw: boolean =
      prev !== null && idx !== null && prev <= COT_BUY_SELL.exitLow && idx > COT_BUY_SELL.exitLow;

    if (exitHighRaw) armedSell = false;
    if (exitLowRaw) armedBuy = false;

    const prevBarsTouchSell = barsSinceTouchSell;
    const prevBarsTouchBuy = barsSinceTouchBuy;
    const prevBarsExitSell = barsSinceExitSell;
    const prevBarsExitBuy = barsSinceExitBuy;

    barsSinceTouchSell = touchHighRaw ? 0 : barsSinceTouchSell + 1;
    barsSinceTouchBuy = touchLowRaw ? 0 : barsSinceTouchBuy + 1;
    barsSinceExitSell = exitHighRaw ? 0 : barsSinceExitSell + 1;
    barsSinceExitBuy = exitLowRaw ? 0 : barsSinceExitBuy + 1;

    const cooldown = COT_BUY_SELL.cooldown;
    const sigTouchSell = touchHighRaw && prevBarsTouchSell >= cooldown;
    const sigTouchBuy = touchLowRaw && prevBarsTouchBuy >= cooldown;
    const sigExitSell = exitHighRaw && prevBarsExitSell >= cooldown;
    const sigExitBuy = exitLowRaw && prevBarsExitBuy >= cooldown;

    if (sigExitBuy) regime = 1;
    else if (sigExitSell) regime = -1;

    if (sigExitBuy || sigExitSell) holdWeeks = 0;
    else if (regime !== 0) holdWeeks += 1;
    else holdWeeks = 0;

    if (touchHighRaw || touchLowRaw) armedWeeks = 0;
    else if (armedBuy || armedSell) armedWeeks += 1;
    else armedWeeks = 0;

    const inHighZone = idx !== null && idx >= COT_BUY_SELL.exitHigh;
    const inLowZone = idx !== null && idx <= COT_BUY_SELL.exitLow;

    const action: CotBuySellAction = sigExitBuy
      ? "BUY"
      : sigExitSell
        ? "SELL"
        : sigTouchBuy
          ? "TOUCH_0"
          : sigTouchSell
            ? "TOUCH_100"
            : armedBuy
              ? "ARMED_BUY"
              : armedSell
                ? "ARMED_SELL"
                : regime === 1
                  ? "HOLD_LONG"
                  : regime === -1
                    ? "HOLD_SHORT"
                    : "WAIT";

    last = {
      index: idx,
      prevIndex: prev,
      action,
      regime,
      armedBuy,
      armedSell,
      sigTouchBuy,
      sigTouchSell,
      sigExitBuy,
      sigExitSell,
      inHighZone,
      inLowZone,
      holdWeeks,
      armedWeeks,
    };
    prevIndex = idx;
  }

  return last;
}

export function evaluateCotBuySellFromHistory(
  history: { commercialNet: number }[] | undefined,
): CotBuySellState | null {
  if (!history || history.length < COT_BUY_SELL.lookback) return null;
  return evaluateCotBuySell(history.map((row) => row.commercialNet));
}

export function cotBuySellIsBull(state: CotBuySellState): boolean {
  return (
    state.regime === 1 ||
    state.sigExitBuy ||
    state.sigTouchBuy ||
    state.armedBuy ||
    state.action === "HOLD_LONG"
  );
}

export function cotBuySellIsBear(state: CotBuySellState): boolean {
  return (
    state.regime === -1 ||
    state.sigExitSell ||
    state.sigTouchSell ||
    state.armedSell ||
    state.action === "HOLD_SHORT"
  );
}

export function cotBuySellHoldArmedConflict(state: CotBuySellState): boolean {
  const holdLong = state.regime === 1;
  const holdShort = state.regime === -1;
  const armedSell = state.armedSell || state.sigTouchSell || state.action === "ARMED_SELL" || state.action === "TOUCH_100";
  const armedBuy = state.armedBuy || state.sigTouchBuy || state.action === "ARMED_BUY" || state.action === "TOUCH_0";
  return (holdLong && armedSell) || (holdShort && armedBuy);
}

/** Separate reversal-model headline. Does not describe main COT bias. */
export function cotBuySellHeadline(state: CotBuySellState): string {
  if (cotBuySellHoldArmedConflict(state)) {
    if (state.regime === 1) return "HOLD LONG · ARMED SELL";
    return "HOLD SHORT · ARMED BUY";
  }
  switch (state.action) {
    case "BUY":
      return "BUY · EXIT 20";
    case "SELL":
      return "SELL · EXIT 80";
    case "TOUCH_0":
    case "ARMED_BUY":
      return "TOUCH 0 · ARMED BUY";
    case "TOUCH_100":
    case "ARMED_SELL":
      return "TOUCH 100 · ARMED SELL";
    case "HOLD_LONG":
      return "HOLD LONG";
    case "HOLD_SHORT":
      return "HOLD SHORT";
    default:
      return "WAIT";
  }
}

export function cotBuySellPositionPoints(state: CotBuySellState, index26w: number): number {
  switch (state.action) {
    case "BUY":
      return 50;
    case "SELL":
      return -50;
    case "HOLD_LONG":
      return 40;
    case "HOLD_SHORT":
      return -40;
    case "TOUCH_0":
    case "ARMED_BUY":
      return 25;
    case "TOUCH_100":
    case "ARMED_SELL":
      return -25;
    default: {
      const idx = Math.max(0, Math.min(100, index26w));
      return Math.max(-20, Math.min(20, Math.round((idx - 50) * 0.4)));
    }
  }
}
