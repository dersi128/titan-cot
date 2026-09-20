import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parseTitanTypeScale, TITAN_TYPE_FONT, TITAN_TYPE_ZOOM } from "./titanTypeScale";

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
  it("keeps Large on the same layout as Normal", () => {
    assert.equal(TITAN_TYPE_ZOOM.md, 1);
    assert.equal(TITAN_TYPE_ZOOM.lg, 1);
    assert.ok(TITAN_TYPE_ZOOM.sm <= 0.92);
  });

  it("makes Larger text bigger without a layout zoom", () => {
    assert.equal(TITAN_TYPE_FONT.md, 1);
    assert.ok(TITAN_TYPE_FONT.lg >= 1.14);
    assert.equal(TITAN_TYPE_FONT.sm, 1);
  });
});
