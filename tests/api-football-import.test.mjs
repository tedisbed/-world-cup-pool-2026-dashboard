import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import {
  apiFootballFixturesToState,
  buildFixtureTimeCache,
  canUseApiRequest,
  normalizeApiFootballTeamName,
  shouldPollApiFootball,
  writeLiveStateFromApi,
} from "../scripts/fetch-api-football.mjs";

test("API-Football importer maps aliases, scores, penalties, and selected-player goals", () => {
  const state = apiFootballFixturesToState([
    {
      fixture: { id: 1001, date: "2026-06-13T22:00:00+00:00", status: { short: "FT" } },
      teams: { home: { name: "Brazil" }, away: { name: "Morocco" } },
      goals: { home: 2, away: 1 },
      score: { penalty: { home: null, away: null } },
      events: [
        { type: "Goal", detail: "Normal Goal", player: { name: "Vinícius Júnior" } },
        { type: "Card", detail: "Yellow Card", player: { name: "Vinícius Júnior" } },
      ],
    },
    {
      fixture: { id: 1002, date: "2026-06-17T20:00:00+00:00", status: { short: "PEN" } },
      teams: { home: { name: "England" }, away: { name: "Croatia" } },
      goals: { home: 1, away: 1 },
      score: { penalty: { home: 4, away: 3 } },
      events: [],
    },
    {
      fixture: { id: 1003, date: "2026-06-12T01:00:00+00:00", status: { short: "FT" } },
      teams: { home: { name: "USA" }, away: { name: "Paraguay" } },
      goals: { home: 3, away: 0 },
      score: { penalty: { home: null, away: null } },
      events: [],
    },
  ]);

  assert.deepEqual(state.matches["g-c-02"], {
    homeScore: 2,
    awayScore: 1,
    status: "final",
    wentToPens: false,
    penaltyWinner: "",
  });
  assert.deepEqual(state.matchPlayerGoals["g-c-02"], { Vinicius: 1 });
  assert.deepEqual(state.matches["g-l-02"], {
    homeScore: 1,
    awayScore: 1,
    status: "final",
    wentToPens: true,
    penaltyWinner: "England",
  });
  assert.equal(state.matches["g-d-01"].homeScore, 3);
});

test("API-Football importer ignores unfinished and unmatched fixtures", () => {
  const state = apiFootballFixturesToState([
    {
      fixture: { id: 1004, date: "2026-06-11T19:00:00+00:00", status: { short: "NS" } },
      teams: { home: { name: "Mexico" }, away: { name: "South Africa" } },
      goals: { home: null, away: null },
      score: { penalty: { home: null, away: null } },
      events: [],
    },
    {
      fixture: { id: 1005, date: "2026-06-11T19:00:00+00:00", status: { short: "FT" } },
      teams: { home: { name: "Italy" }, away: { name: "South Africa" } },
      goals: { home: 1, away: 0 },
      score: { penalty: { home: null, away: null } },
      events: [],
    },
  ]);

  assert.deepEqual(state.matches, {});
});

test("API-Football team name normalization covers known World Cup aliases", () => {
  assert.equal(normalizeApiFootballTeamName("USA"), "United States");
  assert.equal(normalizeApiFootballTeamName("Côte d'Ivoire"), "Ivory Coast");
  assert.equal(normalizeApiFootballTeamName("Korea Republic"), "South Korea");
  assert.equal(normalizeApiFootballTeamName("Cabo Verde"), "Cape Verde");
});

test("fixture time cache maps API kickoff times to dashboard match ids", () => {
  const cache = buildFixtureTimeCache([
    {
      fixture: { id: 2001, date: "2026-06-17T20:00:00+00:00", status: { short: "NS" } },
      teams: { home: { name: "England" }, away: { name: "Croatia" } },
    },
  ]);

  assert.deepEqual(cache.fixtures, [
    { id: "g-l-02", kickoff: "2026-06-17T20:00:00.000Z", stage: "group" },
  ]);
});

test("live polling runs only inside match windows", () => {
  const cache = {
    fixtures: [
      { id: "g-l-02", kickoff: "2026-06-17T20:00:00.000Z", stage: "group" },
      { id: "m73", kickoff: "2026-06-28T20:00:00.000Z", stage: "r32" },
    ],
  };

  assert.equal(shouldPollApiFootball(cache, new Date("2026-06-17T19:49:00.000Z")), false);
  assert.equal(shouldPollApiFootball(cache, new Date("2026-06-17T19:50:00.000Z")), true);
  assert.equal(shouldPollApiFootball(cache, new Date("2026-06-17T22:15:00.000Z")), true);
  assert.equal(shouldPollApiFootball(cache, new Date("2026-06-17T22:16:00.000Z")), false);
  assert.equal(shouldPollApiFootball(cache, new Date("2026-06-28T23:15:00.000Z")), true);
  assert.equal(shouldPollApiFootball(cache, new Date("2026-06-28T23:16:00.000Z")), false);
});

test("API request budget hard stops at 95 requests per UTC day", () => {
  assert.deepEqual(canUseApiRequest({ date: "2026-06-17", count: 94 }, new Date("2026-06-17T20:00:00.000Z")), {
    allowed: true,
    budget: { date: "2026-06-17", count: 95 },
  });
  assert.deepEqual(canUseApiRequest({ date: "2026-06-17", count: 95 }, new Date("2026-06-17T20:07:00.000Z")), {
    allowed: false,
    budget: { date: "2026-06-17", count: 95 },
  });
  assert.deepEqual(canUseApiRequest({ date: "2026-06-17", count: 95 }, new Date("2026-06-18T00:01:00.000Z")), {
    allowed: true,
    budget: { date: "2026-06-18", count: 1 },
  });
});

test("live state writer skips API calls outside live match windows", async () => {
  const dir = await mkdtemp(join(tmpdir(), "api-football-import-"));
  const fixtureTimesPath = join(dir, "api-fixture-times.json");
  const budgetPath = join(dir, "api-request-budget.json");
  const outputPath = join(dir, "live-state.json");
  let fetchCalls = 0;

  await writeFile(fixtureTimesPath, JSON.stringify({ fixtures: [] }));
  await writeFile(budgetPath, JSON.stringify({ date: "2026-06-17", count: 0 }));

  const result = await writeLiveStateFromApi({
    fixtureTimesPath,
    budgetPath,
    outputPath,
    now: new Date("2026-06-17T20:00:00.000Z"),
    fetchFn: async () => {
      fetchCalls += 1;
      throw new Error("fetch should not be called");
    },
  });

  assert.deepEqual(result, { changed: false, skipped: true, reason: "outside-live-window" });
  assert.equal(fetchCalls, 0);
});

test("live state writer merges API updates into existing backfilled history", async () => {
  const dir = await mkdtemp(join(tmpdir(), "api-football-import-"));
  const fixtureTimesPath = join(dir, "api-fixture-times.json");
  const budgetPath = join(dir, "api-request-budget.json");
  const outputPath = join(dir, "live-state.json");
  const existingState = {
    version: 1,
    matches: {
      "g-c-02": { homeScore: 0, awayScore: 0, status: "final", wentToPens: false, penaltyWinner: "" },
    },
    customMatches: [],
    matchPlayerGoals: {
      "g-c-02": { Mbappe: 1 },
    },
    playerGoals: {
      Vinicius: 0,
      Haaland: 0,
      Diaz: 0,
      Yamal: 0,
      Oyarzabal: 0,
      Kane: 0,
      Messi: 0,
      Mbappe: 2,
    },
    awards: {
      goldenBall: "",
      goldenBoot: "Mbappe",
      goldenGlove: "",
      bestYoungPlayer: "",
    },
  };

  await writeFile(fixtureTimesPath, JSON.stringify({ fixtures: [{ id: "g-c-02", kickoff: "2026-06-13T22:00:00.000Z", stage: "group" }] }));
  await writeFile(budgetPath, JSON.stringify({ date: "2026-06-13", count: 0 }));
  await writeFile(outputPath, JSON.stringify(existingState, null, 2));

  await writeLiveStateFromApi({
    fixtureTimesPath,
    budgetPath,
    outputPath,
    now: new Date("2026-06-13T23:00:00.000Z"),
    apiKey: "test-key",
    fetchFn: async () => ({
      ok: true,
      json: async () => ({
        response: [
          {
            fixture: { id: 1001, date: "2026-06-13T22:00:00+00:00", status: { short: "FT" } },
            teams: { home: { name: "Brazil" }, away: { name: "Morocco" } },
            goals: { home: 2, away: 1 },
            score: { penalty: { home: null, away: null } },
            events: [{ type: "Goal", detail: "Normal Goal", player: { name: "Vinícius Júnior" } }],
          },
        ],
      }),
    }),
  });

  const merged = JSON.parse(await readFile(outputPath, "utf8"));
  assert.deepEqual(merged.matches["g-c-02"], {
    homeScore: 2,
    awayScore: 1,
    status: "final",
    wentToPens: false,
    penaltyWinner: "",
  });
  assert.deepEqual(merged.matchPlayerGoals["g-c-02"], { Mbappe: 1, Vinicius: 1 });
  assert.equal(merged.playerGoals.Mbappe, 2);
  assert.equal(merged.awards.goldenBoot, "Mbappe");
});
