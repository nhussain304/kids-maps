import test from "node:test";
import assert from "node:assert/strict";
import {
  validProgress,
  mergeProgress,
  pointsFor,
  missions,
  questions,
} from "../src/data.js";
test("corrupt storage is ignored", () => {
  for (const value of [null, {}, "kindness", 42])
    assert.deepEqual(validProgress(value), []);
});
test("unknown and repeated missions cannot inflate XP", () => {
  assert.deepEqual(validProgress(["kindness", "kindness", "hacked", null]), [
    "kindness",
  ]);
  assert.equal(pointsFor(["kindness", "kindness", "hacked"]), 30);
});
test("cloud merge preserves local and remote completions", () => {
  assert.deepEqual(
    mergeProgress(["kindness", "quiz"], ["teamwork", "kindness"]),
    ["kindness", "quiz", "teamwork"],
  );
});
test("full journey has 180 XP and five distinct map destinations", () => {
  assert.equal(new Set(missions.map((m) => m.id)).size, 5);
  assert.equal(pointsFor([...missions.map((m) => m.id), "quiz"]), 180);
  for (const q of questions)
    assert.ok(q.answer >= 0 && q.answer < q.options.length);
});
