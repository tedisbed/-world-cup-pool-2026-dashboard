import assert from "node:assert/strict";
import test from "node:test";

import { createEmptyState } from "../pool-core.mjs";
import { loadInitialState, loadPublishedState } from "../app-state.mjs";

function storageWith(value) {
  return {
    getItem(key) {
      return value[key] ?? null;
    },
  };
}

test("published state is preferred over browser storage", async () => {
  const publishedState = createEmptyState();
  publishedState.matches["g-a-01"] = { homeScore: 2, awayScore: 0, status: "final" };
  const savedState = createEmptyState();
  savedState.matches["g-a-01"] = { homeScore: 0, awayScore: 1, status: "final" };

  const result = await loadInitialState({
    fetchJson: async () => publishedState,
    storage: storageWith({ "world-cup-pool-dashboard-v1": JSON.stringify(savedState) }),
  });

  assert.equal(result.matches["g-a-01"].homeScore, 2);
});

test("configured Google Sheet CSV source is preferred over bundled JSON", async () => {
  const bundledState = createEmptyState();
  bundledState.matches["g-a-01"] = { homeScore: 0, awayScore: 0, status: "final" };
  const csv = [
    "type,id,homeScore,awayScore,status",
    "match,g-a-01,2,1,final",
  ].join("\n");

  const result = await loadPublishedState({
    fetchConfig: async () => ({
      sources: [{ type: "google-sheet-csv", url: "https://docs.google.com/sheets.csv" }],
    }),
    fetchSource: async (source) => {
      if (source.url.includes("sheets.csv")) return csv;
      return bundledState;
    },
  });

  assert.equal(result.matches["g-a-01"].homeScore, 2);
  assert.equal(result.matches["g-a-01"].awayScore, 1);
});

test("bundled JSON remains the published fallback when configured Sheet source fails", async () => {
  const bundledState = createEmptyState();
  bundledState.matches["g-a-02"] = { homeScore: 3, awayScore: 2, status: "final" };

  const result = await loadPublishedState({
    fetchConfig: async () => ({
      sources: [{ type: "google-sheet-csv", url: "https://docs.google.com/sheets.csv" }],
    }),
    fetchSource: async (source) => {
      if (source.url.includes("sheets.csv")) throw new Error("sheet unavailable");
      return bundledState;
    },
  });

  assert.equal(result.matches["g-a-02"].homeScore, 3);
});

test("browser storage is used when published state cannot be loaded", async () => {
  const savedState = createEmptyState();
  savedState.matches["g-a-02"] = { homeScore: 1, awayScore: 1, status: "final" };

  const result = await loadInitialState({
    fetchJson: async () => {
      throw new Error("not found");
    },
    storage: storageWith({ "world-cup-pool-dashboard-v1": JSON.stringify(savedState) }),
  });

  assert.equal(result.matches["g-a-02"].awayScore, 1);
});

test("empty state is used when published and browser states are unavailable", async () => {
  const result = await loadInitialState({
    fetchJson: async () => {
      throw new Error("not found");
    },
    storage: storageWith({}),
  });

  assert.deepEqual(result, createEmptyState());
});
