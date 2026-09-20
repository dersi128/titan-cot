import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parseTitanTypeScale, TITAN_TYPE_FONT } from "./titanTypeScale";

describe("parseTitanTypeScale", () => {
  it("accepts only sm, md and lg", () => {
    assert.equal(parseTitanTypeScale("sm"), "sm");
    assert.equal(parseTitanTypeScale("md"), "md");
    assert.equal(parseTitanTypeScale("lg"), "lg");
    assert.equal(parseTitanTypeScale("xl"), null);
    assert.equal(parseTitanTypeScale(null), null);
  });
});

describe("type scale", () => {
  it("only changes text size", () => {
    assert.equal(TITAN_TYPE_FONT.md, 1);
    assert.ok(TITAN_TYPE_FONT.sm <= 0.9);
    assert.ok(TITAN_TYPE_FONT.lg >= 1.14);
  });
});
