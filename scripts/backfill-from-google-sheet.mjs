import { readFile, writeFile } from "node:fs/promises";

import { livePublishedStatePath, parseStateCsv } from "../app-state.mjs";
import { createEmptyState, normalizeState } from "../pool-core.mjs";

export const defaultGoogleSheetCsvUrl =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTDvAZcUzudMTWYH5kfzoByxqte0FfSSQBhDen2stoBA2qyqbIRveAzwmp903gBmw/pub?gid=1553990171&single=true&output=csv";
export const defaultLiveStatePath = new URL(`..${livePublishedStatePath.slice(1)}`, import.meta.url);

export function mergeBackfillState(apiInput = createEmptyState(), sheetInput = createEmptyState()) {
  const apiState = normalizeState(apiInput);
  const sheetState = normalizeState(sheetInput);
  const merged = normalizeState(apiState);

  for (const [matchId, sheetMatch] of Object.entries(sheetState.matches)) {
    if (isFinalMatch(sheetMatch) && !isFinalMatch(merged.matches[matchId])) {
      merged.matches[matchId] = { ...sheetMatch };
    }
  }

  const customMatchesById = new Map(merged.customMatches.map((match) => [match.id, match]));
  for (const match of sheetState.customMatches) {
    if (!customMatchesById.has(match.id)) customMatchesById.set(match.id, { ...match });
  }
  merged.customMatches = [...customMatchesById.values()];

  for (const [matchId, sheetGoals] of Object.entries(sheetState.matchPlayerGoals)) {
    const mergedGoals = { ...(merged.matchPlayerGoals[matchId] ?? {}) };
    for (const [player, goals] of Object.entries(sheetGoals)) {
      if (!(player in mergedGoals)) mergedGoals[player] = goals;
    }
    if (Object.keys(mergedGoals).length) merged.matchPlayerGoals[matchId] = mergedGoals;
  }

  const playersWithApiMatchGoals = new Set();
  for (const goalsByPlayer of Object.values(apiState.matchPlayerGoals)) {
    for (const [player, goals] of Object.entries(goalsByPlayer)) {
      if (Number(goals) > 0) playersWithApiMatchGoals.add(player);
    }
  }

  for (const [player, goals] of Object.entries(sheetState.playerGoals)) {
    if (!playersWithApiMatchGoals.has(player) && Number(goals) > 0) {
      merged.playerGoals[player] = goals;
    }
  }

  for (const [award, winner] of Object.entries(sheetState.awards)) {
    if (!merged.awards[award] && winner) merged.awards[award] = winner;
  }

  return normalizeState(merged);
}

export async function backfillFromGoogleSheet({
  sheetCsvUrl = defaultGoogleSheetCsvUrl,
  sheetCsvPath = "",
  liveStatePath = defaultLiveStatePath,
  fetchFn = globalThis.fetch,
} = {}) {
  const [liveState, sheetCsv] = await Promise.all([
    readJsonFile(liveStatePath, createEmptyState()),
    sheetCsvPath ? readFile(sheetCsvPath, "utf8") : fetchCsv(sheetCsvUrl, fetchFn),
  ]);
  const merged = mergeBackfillState(liveState, parseStateCsv(sheetCsv));
  await writeFile(liveStatePath, `${JSON.stringify(merged, null, 2)}\n`);
  return merged;
}

async function fetchCsv(url, fetchFn) {
  if (typeof fetchFn !== "function") throw new Error("fetch is not available in this Node runtime");
  const response = await fetchFn(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`Unable to fetch Google Sheet CSV: ${response.status}`);
  return response.text();
}

async function readJsonFile(path, fallback) {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch {
    return fallback;
  }
}

function isFinalMatch(match) {
  return match?.status === "final" && Number.isFinite(Number(match.homeScore)) && Number.isFinite(Number(match.awayScore));
}

function cliOptions(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--csv" && argv[index + 1]) options.sheetCsvPath = argv[++index];
    if (arg === "--url" && argv[index + 1]) options.sheetCsvUrl = argv[++index];
    if (arg === "--live-state" && argv[index + 1]) options.liveStatePath = argv[++index];
  }
  return options;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  backfillFromGoogleSheet(cliOptions(process.argv.slice(2)))
    .then(() => {
      console.log("Backfilled data/live-state.json from Google Sheet history");
    })
    .catch((error) => {
      console.error(error.message);
      process.exitCode = 1;
    });
}
