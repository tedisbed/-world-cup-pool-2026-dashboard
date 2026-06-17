import assert from "node:assert/strict";
import test from "node:test";

import { createEmptyState } from "../pool-core.mjs";
import { mergeBackfillState } from "../scripts/backfill-from-google-sheet.mjs";

test("backfill keeps API final results over Google Sheet match rows", () => {
  const apiState = createEmptyState();
  apiState.matches["g-a-01"] = { homeScore: 3, awayScore: 0, status: "final", wentToPens: false, penaltyWinner: "" };
  const sheetState = createEmptyState();
  sheetState.matches["g-a-01"] = { homeScore: 2, awayScore: 0, status: "final", wentToPens: false, penaltyWinner: "" };

  const merged = mergeBackfillState(apiState, sheetState);

  assert.equal(merged.matches["g-a-01"].homeScore, 3);
});

test("backfill imports Google Sheet final matches missing from API state", () => {
  const apiState = createEmptyState();
  const sheetState = createEmptyState();
  sheetState.matches["g-a-01"] = { homeScore: 2, awayScore: 0, status: "final", wentToPens: false, penaltyWinner: "" };

  const merged = mergeBackfillState(apiState, sheetState);

  assert.deepEqual(merged.matches["g-a-01"], sheetState.matches["g-a-01"]);
});

test("backfill preserves sheet scorer details only where API has no scorer detail", () => {
  const apiState = createEmptyState();
  apiState.matchPlayerGoals["g-c-02"] = { Vinicius: 1 };
  const sheetState = createEmptyState();
  sheetState.matchPlayerGoals["g-c-02"] = { Vinicius: 2, Mbappe: 1 };
  sheetState.matchPlayerGoals["g-i-01"] = { Mbappe: 1 };

  const merged = mergeBackfillState(apiState, sheetState);

  assert.deepEqual(merged.matchPlayerGoals["g-c-02"], { Vinicius: 1, Mbappe: 1 });
  assert.deepEqual(merged.matchPlayerGoals["g-i-01"], { Mbappe: 1 });
});

test("backfill keeps manual player totals only for players without API match goals", () => {
  const apiState = createEmptyState();
  apiState.matchPlayerGoals["g-c-02"] = { Vinicius: 1 };
  const sheetState = createEmptyState();
  sheetState.playerGoals.Vinicius = 3;
  sheetState.playerGoals.Mbappe = 2;

  const merged = mergeBackfillState(apiState, sheetState);

  assert.equal(merged.playerGoals.Vinicius, 0);
  assert.equal(merged.playerGoals.Mbappe, 2);
});

test("backfill preserves awards and custom matches from the Google Sheet", () => {
  const apiState = createEmptyState();
  const sheetState = createEmptyState();
  sheetState.awards.goldenBoot = "Vinicius";
  sheetState.customMatches = [
    { id: "custom-r32-1", stage: "r32", home: "Brazil", away: "Haiti", homeScore: 2, awayScore: 0, status: "final" },
  ];

  const merged = mergeBackfillState(apiState, sheetState);

  assert.equal(merged.awards.goldenBoot, "Vinicius");
  assert.deepEqual(merged.customMatches, sheetState.customMatches);
});
