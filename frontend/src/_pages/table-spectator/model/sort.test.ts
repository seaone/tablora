import test from "node:test";
import assert from "node:assert/strict";
import { compareScoreValues, parseTimeToMs } from "./sort";

test("parseTimeToMs parses zero and normal times", () => {
  assert.equal(parseTimeToMs("0"), 0);
  assert.equal(parseTimeToMs("0:30"), 30);
  assert.equal(parseTimeToMs("1:23.45"), 83.45);
  assert.equal(parseTimeToMs("1:00:00"), 3600);
});

test("parseTimeToMs rejects empty, invalid, and negative values", () => {
  assert.equal(parseTimeToMs(""), Infinity);
  assert.equal(parseTimeToMs("abc"), Infinity);
  assert.equal(parseTimeToMs("-1:00"), Infinity);
});

test("missing and invalid scores sort last in both directions", () => {
  for (const direction of ["asc", "desc"] as const) {
    assert.equal(compareScoreValues("time", direction, "", "10"), 1);
    assert.equal(compareScoreValues("time", direction, "10", ""), -1);
    assert.equal(compareScoreValues("number", direction, "", "5"), 1);
    assert.equal(compareScoreValues("number", direction, "5", ""), -1);
  }
});

test("number and time directions are respected", () => {
  assert.equal(compareScoreValues("number", "desc", "10", "5"), -5);
  assert.equal(compareScoreValues("time", "asc", "5", "10"), -5);
  assert.ok(compareScoreValues("text", "asc", "a", "b") < 0);
});
