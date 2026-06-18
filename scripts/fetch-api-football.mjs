import { readFile, writeFile } from "node:fs/promises";

import { createEmptyState, fixtures, getSelectedPlayers, normalizeState } from "../pool-core.mjs";

export const API_FOOTBALL_LEAGUE = 1;
export const API_FOOTBALL_SEASON = 2026;
export const API_FOOTBALL_DAILY_CAP = 95;
export const defaultOutputPath = new URL("../data/live-state.json", import.meta.url);
export const defaultFixtureTimesPath = new URL("../data/api-fixture-times.json", import.meta.url);
export const defaultBudgetPath = new URL("../data/api-request-budget.json", import.meta.url);

const completedStatusCodes = new Set(["FT", "AET", "PEN"]);
const apiEndpoint = `https://v3.football.api-sports.io/fixtures?league=${API_FOOTBALL_LEAGUE}&season=${API_FOOTBALL_SEASON}`;
const pregameWindowMs = 10 * 60 * 1000;
const groupWindowMs = 135 * 60 * 1000;
const knockoutWindowMs = 195 * 60 * 1000;

const teamAliases = new Map(
  [
    ["USA", "United States"],
    ["United States of America", "United States"],
    ["Korea Republic", "South Korea"],
    ["South Korea Republic", "South Korea"],
    ["Czech Republic", "Czechia"],
    ["Côte d'Ivoire", "Ivory Coast"],
    ["Cote d'Ivoire", "Ivory Coast"],
    ["Cote d Ivoire", "Ivory Coast"],
    ["Cabo Verde", "Cape Verde"],
    ["Cape Verde Islands", "Cape Verde"],
    ["Türkiye", "Turkey"],
    ["Turkiye", "Turkey"],
    ["IR Iran", "Iran"],
    ["Iran", "Iran"],
    ["Congo DR", "DR Congo"],
    ["Congo Democratic Republic", "DR Congo"],
    ["Democratic Republic of the Congo", "DR Congo"],
    ["Curacao", "Curacao"],
    ["Curaçao", "Curacao"],
  ].map(([alias, canonical]) => [nameKey(alias), canonical]),
);

const selectedPlayerAliases = new Map(
  getSelectedPlayers().flatMap((player) =>
    playerNameAliases(player.name).map((alias) => [nameKey(alias), player.name]),
  ),
);

export function normalizeApiFootballTeamName(name) {
  const trimmed = String(name ?? "").trim();
  if (!trimmed) return "";
  return teamAliases.get(nameKey(trimmed)) ?? trimmed;
}

export function apiFootballFixturesToState(apiFixtures) {
  const state = createEmptyState();
  const fixtureIndexes = buildFixtureIndexes();

  for (const apiFixture of apiFixtures ?? []) {
    if (!isCompletedApiFixture(apiFixture)) continue;

    const dashboardFixture = findDashboardFixture(apiFixture, fixtureIndexes);
    if (!dashboardFixture) continue;

    const homeScore = numberOrNull(apiFixture?.goals?.home);
    const awayScore = numberOrNull(apiFixture?.goals?.away);
    if (homeScore === null || awayScore === null) continue;

    const penaltyHome = numberOrNull(apiFixture?.score?.penalty?.home);
    const penaltyAway = numberOrNull(apiFixture?.score?.penalty?.away);
    const wentToPens = penaltyHome !== null && penaltyAway !== null;

    state.matches[dashboardFixture.id] = {
      homeScore,
      awayScore,
      status: "final",
      wentToPens,
      penaltyWinner: wentToPens ? penaltyWinner(dashboardFixture, penaltyHome, penaltyAway) : "",
    };

    const playerGoals = selectedPlayerGoalsFromEvents(apiFixture?.events);
    if (Object.keys(playerGoals).length) {
      state.matchPlayerGoals[dashboardFixture.id] = playerGoals;
    }
  }

  return normalizeState(state);
}

export function mergeApiStateIntoLiveState(liveInput = createEmptyState(), apiInput = createEmptyState()) {
  const liveState = normalizeState(liveInput);
  const apiState = normalizeState(apiInput);
  const merged = normalizeState(liveState);

  for (const [matchId, apiMatch] of Object.entries(apiState.matches)) {
    merged.matches[matchId] = { ...apiMatch };
  }

  for (const [matchId, apiGoals] of Object.entries(apiState.matchPlayerGoals)) {
    merged.matchPlayerGoals[matchId] = {
      ...(merged.matchPlayerGoals[matchId] ?? {}),
      ...apiGoals,
    };
  }

  for (const match of apiState.customMatches) {
    if (!merged.customMatches.some((existing) => existing.id === match.id)) {
      merged.customMatches.push({ ...match });
    }
  }

  return normalizeState(merged);
}

export function buildFixtureTimeCache(apiFixtures) {
  const fixtureIndexes = buildFixtureIndexes();
  const rows = [];
  const seen = new Set();

  for (const apiFixture of apiFixtures ?? []) {
    const dashboardFixture = findDashboardFixture(apiFixture, fixtureIndexes);
    const kickoff = dateOrNull(apiFixture?.fixture?.date);
    if (!dashboardFixture || !kickoff || seen.has(dashboardFixture.id)) continue;
    seen.add(dashboardFixture.id);
    rows.push({
      id: dashboardFixture.id,
      kickoff: kickoff.toISOString(),
      stage: dashboardFixture.stage,
    });
  }

  rows.sort((a, b) => a.kickoff.localeCompare(b.kickoff) || a.id.localeCompare(b.id));
  return {
    fixtures: rows,
  };
}

export function getApiFootballFixtureDiagnostics(apiFixtures) {
  const fixtureIndexes = buildFixtureIndexes();
  const diagnostics = {
    received: Array.isArray(apiFixtures) ? apiFixtures.length : 0,
    matched: 0,
    unmatched: 0,
    completed: 0,
    unmatchedSamples: [],
  };

  for (const apiFixture of apiFixtures ?? []) {
    if (isCompletedApiFixture(apiFixture)) diagnostics.completed += 1;
    if (findDashboardFixture(apiFixture, fixtureIndexes)) {
      diagnostics.matched += 1;
      continue;
    }

    diagnostics.unmatched += 1;
    if (diagnostics.unmatchedSamples.length < 8) {
      diagnostics.unmatchedSamples.push(apiFixtureLabel(apiFixture));
    }
  }

  return diagnostics;
}

export function assertUsableApiFootballFixtures(apiFixtures) {
  const diagnostics = getApiFootballFixtureDiagnostics(apiFixtures);
  if (diagnostics.received === 0) {
    throw new Error(`API-Football returned 0 fixtures for league=${API_FOOTBALL_LEAGUE} season=${API_FOOTBALL_SEASON}`);
  }
  if (diagnostics.matched === 0) {
    throw new Error(
      [
        `API-Football returned ${diagnostics.received} fixtures but 0 matched dashboard fixtures for league=${API_FOOTBALL_LEAGUE} season=${API_FOOTBALL_SEASON}.`,
        diagnostics.unmatchedSamples.length ? `Unmatched samples: ${diagnostics.unmatchedSamples.join("; ")}` : "",
      ]
        .filter(Boolean)
        .join(" "),
    );
  }
  return diagnostics;
}

export function shouldPollApiFootball(fixtureTimeCache, now = new Date()) {
  const nowMs = now.getTime();
  if (!Number.isFinite(nowMs)) return false;

  return (fixtureTimeCache?.fixtures ?? []).some((fixture) => {
    const kickoff = dateOrNull(fixture.kickoff);
    if (!kickoff) return false;
    const start = kickoff.getTime() - pregameWindowMs;
    const end = kickoff.getTime() + (fixture.stage === "group" ? groupWindowMs : knockoutWindowMs);
    return nowMs >= start && nowMs <= end;
  });
}

export function canUseApiRequest(currentBudget = {}, now = new Date()) {
  const date = utcDate(now);
  const count = currentBudget?.date === date ? numberOrZero(currentBudget.count) : 0;
  if (count >= API_FOOTBALL_DAILY_CAP) {
    return { allowed: false, budget: { date, count } };
  }
  return { allowed: true, budget: { date, count: count + 1 } };
}

export async function fetchApiFootballFixtures({ apiKey = process.env.API_FOOTBALL_KEY, fetchFn = globalThis.fetch } = {}) {
  if (!apiKey) throw new Error("Missing API_FOOTBALL_KEY");
  if (typeof fetchFn !== "function") throw new Error("fetch is not available in this Node runtime");

  const response = await fetchFn(apiEndpoint, {
    headers: {
      "x-apisports-key": apiKey,
    },
  });

  if (!response.ok) {
    throw new Error(`API-Football request failed: ${response.status}`);
  }

  const payload = await response.json();
  const errors = apiFootballErrors(payload?.errors);
  if (errors) {
    throw new Error(`API-Football response errors: ${errors}`);
  }
  if (!Array.isArray(payload?.response)) {
    throw new Error("API-Football response did not include a response array");
  }
  return payload.response;
}

export async function writeLiveStateFromApi({
  outputPath = defaultOutputPath,
  fixtureTimesPath = defaultFixtureTimesPath,
  budgetPath = defaultBudgetPath,
  apiKey = process.env.API_FOOTBALL_KEY,
  fetchFn = globalThis.fetch,
  mode = "poll",
  now = new Date(),
} = {}) {
  if (mode !== "refresh-schedule") {
    const fixtureTimeCache = await readJsonFile(fixtureTimesPath, null);
    if (!shouldPollApiFootball(fixtureTimeCache, now)) {
      return { changed: false, skipped: true, reason: "outside-live-window" };
    }
  }

  const budgetCheck = canUseApiRequest(await readJsonFile(budgetPath, {}), now);
  if (!budgetCheck.allowed) {
    return { changed: false, skipped: true, reason: "daily-api-cap-reached", budget: budgetCheck.budget };
  }
  await writeJsonFile(budgetPath, budgetCheck.budget);

  const apiFixtures = await fetchApiFootballFixtures({ apiKey, fetchFn });
  const diagnostics = assertUsableApiFootballFixtures(apiFixtures);
  console.log(
    `API-Football fixtures received=${diagnostics.received} matched=${diagnostics.matched} unmatched=${diagnostics.unmatched} completed=${diagnostics.completed}`,
  );
  const apiState = apiFootballFixturesToState(apiFixtures);
  const state = mergeApiStateIntoLiveState(await readJsonFile(outputPath, createEmptyState()), apiState);
  const fixtureTimeCache = buildFixtureTimeCache(apiFixtures);
  if (!fixtureTimeCache.fixtures.length) {
    throw new Error(`API-Football returned ${diagnostics.matched} matched fixtures but none had usable kickoff times`);
  }
  await writeJsonFile(fixtureTimesPath, fixtureTimeCache);
  const nextJson = `${JSON.stringify(state, null, 2)}\n`;

  try {
    const currentJson = await readFile(outputPath, "utf8");
    if (currentJson === nextJson) return { changed: false, state, budget: budgetCheck.budget };
  } catch {
    // Missing output file is expected on first run.
  }

  await writeFile(outputPath, nextJson);
  return { changed: true, state, budget: budgetCheck.budget };
}

function buildFixtureIndexes() {
  const byDateAndTeams = new Map();
  const byTeams = new Map();

  for (const fixture of fixtures) {
    const teamsKey = fixtureTeamsKey(fixture.home, fixture.away);
    byDateAndTeams.set(`${fixture.date}:${teamsKey}`, fixture);
    byTeams.set(teamsKey, [...(byTeams.get(teamsKey) ?? []), fixture]);
  }

  return { byDateAndTeams, byTeams };
}

function findDashboardFixture(apiFixture, indexes) {
  const home = normalizeApiFootballTeamName(apiFixture?.teams?.home?.name);
  const away = normalizeApiFootballTeamName(apiFixture?.teams?.away?.name);
  const teamsKey = fixtureTeamsKey(home, away);
  const date = String(apiFixture?.fixture?.date ?? "").slice(0, 10);

  return indexes.byDateAndTeams.get(`${date}:${teamsKey}`) ?? uniqueFixture(indexes.byTeams.get(teamsKey));
}

function apiFixtureLabel(apiFixture) {
  const date = String(apiFixture?.fixture?.date ?? "").slice(0, 10) || "unknown date";
  const home = normalizeApiFootballTeamName(apiFixture?.teams?.home?.name) || "unknown home";
  const away = normalizeApiFootballTeamName(apiFixture?.teams?.away?.name) || "unknown away";
  return `${date} ${home} vs ${away}`;
}

function apiFootballErrors(errors) {
  if (!errors) return "";
  if (Array.isArray(errors)) return errors.filter(Boolean).join("; ");
  if (typeof errors === "string") return errors;
  if (typeof errors === "object") {
    return Object.entries(errors)
      .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(", ") : value}`)
      .join("; ");
  }
  return String(errors);
}

async function readJsonFile(path, fallback) {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch {
    return fallback;
  }
}

async function writeJsonFile(path, value) {
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`);
}

function selectedPlayerGoalsFromEvents(events) {
  const goals = {};
  for (const event of events ?? []) {
    if (!isGoalEvent(event)) continue;
    const player = selectedPlayerAliases.get(nameKey(event?.player?.name));
    if (player) goals[player] = (goals[player] ?? 0) + 1;
  }
  return goals;
}

function isGoalEvent(event) {
  const type = String(event?.type ?? "").toLowerCase();
  const detail = String(event?.detail ?? "").toLowerCase();
  return type === "goal" && !detail.includes("missed") && !detail.includes("cancelled") && !detail.includes("disallowed");
}

function isCompletedApiFixture(apiFixture) {
  return completedStatusCodes.has(String(apiFixture?.fixture?.status?.short ?? "").toUpperCase());
}

function penaltyWinner(fixture, homePenaltyScore, awayPenaltyScore) {
  if (homePenaltyScore === awayPenaltyScore) return "";
  return homePenaltyScore > awayPenaltyScore ? fixture.home : fixture.away;
}

function uniqueFixture(matches) {
  return matches?.length === 1 ? matches[0] : null;
}

function fixtureTeamsKey(home, away) {
  return [normalizeApiFootballTeamName(home), normalizeApiFootballTeamName(away)].map(nameKey).sort().join("|");
}

function playerNameAliases(name) {
  const aliasesByPlayer = {
    Vinicius: ["Vinicius", "Vinicius Junior", "Vinícius Júnior", "Vinícius Junior", "Vini Jr", "Vini Jr."],
    Haaland: ["Haaland", "Erling Haaland"],
    Diaz: ["Diaz", "Díaz", "Luis Diaz", "Luis Díaz"],
    Yamal: ["Yamal", "Lamine Yamal"],
    Oyarzabal: ["Oyarzabal", "Mikel Oyarzabal"],
    Kane: ["Kane", "Harry Kane"],
    Messi: ["Messi", "Lionel Messi"],
    Mbappe: ["Mbappe", "Mbappé", "Kylian Mbappe", "Kylian Mbappé"],
  };
  return aliasesByPlayer[name] ?? [name];
}

function nameKey(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "");
}

function numberOrNull(value) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function numberOrZero(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function dateOrNull(value) {
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date : null;
}

function utcDate(date) {
  return date.toISOString().slice(0, 10);
}

function cliMode(argv) {
  return argv.includes("--refresh-schedule") ? "refresh-schedule" : "poll";
}

if (import.meta.url === `file://${process.argv[1]}`) {
  writeLiveStateFromApi({ mode: cliMode(process.argv.slice(2)) })
    .then((result) => {
      if (result.skipped) {
        console.log(`Skipped API-Football fetch: ${result.reason}`);
        return;
      }
      console.log(result.changed ? "Updated data/live-state.json" : "data/live-state.json already current");
    })
    .catch((error) => {
      console.error(error.message);
      process.exitCode = 1;
    });
}
