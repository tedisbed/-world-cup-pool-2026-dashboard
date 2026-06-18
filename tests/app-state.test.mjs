import assert from "node:assert/strict";
import test from "node:test";

import { createEmptyState } from "../pool-core.mjs";
import { googleSheetCsvPath, loadInitialState, loadPublishedState, parseStateCsv } from "../app-state.mjs";

test("initial state loads the published Google Sheet CSV", async () => {
  const csv = [
    "type,id,homeScore,awayScore,status",
    "match,g-a-01,2,0,final",
  ].join("\n");
  const requestedPaths = [];

  const result = await loadInitialState({
    fetchText: async (path) => {
      requestedPaths.push(path);
      return csv;
    },
  });

  assert.deepEqual(requestedPaths, [googleSheetCsvPath]);
  assert.equal(result.matches["g-a-01"].homeScore, 2);
});

test("published state loads the Google Sheet CSV", async () => {
  const result = await loadPublishedState({
    fetchText: async () => [
      "type,id,homeScore,awayScore,status",
      "match,g-a-02,3,2,final",
    ].join("\n"),
  });

  assert.equal(result.matches["g-a-02"].homeScore, 3);
});

test("initial state falls back to empty state when the Google Sheet is unavailable", async () => {
  const result = await loadPublishedState({
    fetchText: async () => {
      throw new Error("not found");
    },
  });

  assert.deepEqual(result, createEmptyState());
});

test("Google Sheet CSV parser loads score rows", () => {
  const csv = [
    "type,id,homeScore,awayScore,status",
    "match,g-a-01,2,1,final",
  ].join("\n");
  const result = parseStateCsv(csv);

  assert.equal(result.matches["g-a-01"].homeScore, 2);
  assert.equal(result.matches["g-a-01"].awayScore, 1);
});
