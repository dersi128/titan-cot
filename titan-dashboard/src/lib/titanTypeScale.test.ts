import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parseTitanTypeScale, TITAN_TYPE_ZOOM } from "./titanTypeScale";

describe("parseTitanTypeScale", () => {
  it("accepts only sm, md and lg", () => {
    assert.equal(parseTitanTypeScale("sm"), "sm");
    assert.equal(parseTitanTypeScale("md"), "md");
    assert.equal(parseTitanTypeScale("lg"), "lg");
    assert.equal(parseTitanTypeScale("xl"), null);
    assert.equal(parseTitanTypeScale(null), null);
  });
});

describe("TITAN_TYPE_ZOOM", () => {
  it("makes Larger clearly bigger than Normal", () => {
    assert.equal(TITAN_TYPE_ZOOM.md, 1);
    assert.ok(TITAN_TYPE_ZOOM.lg >= 1.18);
    assert.ok(TITAN_TYPE_ZOOM.sm <= 0.92);
  });
});
