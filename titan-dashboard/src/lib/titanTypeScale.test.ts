import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parseTitanTypeScale } from "./titanTypeScale";

describe("parseTitanTypeScale", () => {
  it("accepts only sm, md and lg", () => {
    assert.equal(parseTitanTypeScale("sm"), "sm");
    assert.equal(parseTitanTypeScale("md"), "md");
    assert.equal(parseTitanTypeScale("lg"), "lg");
    assert.equal(parseTitanTypeScale("xl"), null);
    assert.equal(parseTitanTypeScale(null), null);
  });
});
