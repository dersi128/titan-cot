import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import { INSTITUTIONAL_MARKETS } from "../config/institutionalMarkets";
import { CFTC_LEGACY_CONTRACT_CODES } from "./cftcLegacyCodes";

const pinePath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../pine/TITAN_COT_BUY_SELL.pine");

describe("TITAN COT Pine 42-market map", () => {
  it("uses the same Legacy codes as the dashboard for all 42 markets", () => {
    const pine = fs.readFileSync(pinePath, "utf8");
    assert.match(pine, /Lookback \(týdny\)/);
    assert.match(pine, /i_lookback = input\.int\(26/);

    assert.equal(INSTITUTIONAL_MARKETS.length, 42);
    for (const market of INSTITUTIONAL_MARKETS) {
      const code = CFTC_LEGACY_CONTRACT_CODES[market.symbol];
      assert.ok(code, market.symbol);
      assert.match(pine, new RegExp(`"${market.id}" => "${code}"`), `${market.id} ${market.symbol}`);
    }

    assert.match(pine, /"OIL" => "067651"/);
    assert.match(pine, /"NATGAS" => "023651"/);
    assert.match(pine, /"NZD" => "112741"/);
    assert.equal(pine.includes("06765A"), false);
    assert.equal(pine.includes("023391"), false);
    assert.equal(pine.includes('"NZD" => "061641"'), false);
  });
});
