import assert from "node:assert/strict";
import test from "node:test";

import { createEmptyState } from "../pool-core.mjs";
import { livePublishedStatePath, loadInitialState, loadPublishedState, parseStateCsv } from "../app-state.mjs";

test("initial state loads only the live API-generated state", async () => {
  const publishedState = createEmptyState();
  publishedState.matches["g-a-01"] = { homeScore: 2, awayScore: 0, status: "final" };
  const requestedPaths = [];

  const result = await loadInitialState({
    fetchJson: async (path) => {
      requestedPaths.push(path);
      return publishedState;
    },
  });

  assert.deepEqual(requestedPaths, [livePublishedStatePath]);
  assert.equal(result.matches["g-a-01"].homeScore, 2);
});

test("published state loads the live API-generated state", async () => {
  const result = await loadPublishedState({
    fetchJson: async () => ({ ...createEmptyState(), matches: { "g-a-02": { homeScore: 3, awayScore: 2, status: "final" } } }),
  });

  assert.equal(result.matches["g-a-02"].homeScore, 3);
});

test("initial state falls back to empty state when live API data is unavailable", async () => {
  const result = await loadPublishedState({
    fetchJson: async () => {
      throw new Error("not found");
    },
  });

  assert.deepEqual(result, createEmptyState());
});

test("Google Sheet CSV parser remains available for one-time backfills", () => {
  const csv = [
    "type,id,homeScore,awayScore,status",
    "match,g-a-01,2,1,final",
  ].join("\n");
  const result = parseStateCsv(csv);

  assert.equal(result.matches["g-a-01"].homeScore, 2);
  assert.equal(result.matches["g-a-01"].awayScore, 1);
});
