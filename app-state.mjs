import { createEmptyState, normalizeState } from "./pool-core.mjs";

export const livePublishedStatePath = "./data/live-state.json";

export async function loadInitialState({
  fetchJson = fetchLiveState,
} = {}) {
  return loadPublishedState({ fetchJson });
}

export async function loadPublishedState({
  fetchJson = fetchLiveState,
} = {}) {
  try {
    return normalizeState(await fetchJson(livePublishedStatePath));
  } catch {
    return createEmptyState();
  }
}

async function fetchLiveState(path = livePublishedStatePath) {
  const response = await fetch(path, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Unable to load live state from ${path}: ${response.status}`);
  }
  return response.json();
}

export function parseStateCsv(csv) {
  const rows = parseCsvRows(csv);
  if (!rows.length) return createEmptyState();

  const [headerRow, ...dataRows] = rows;
  const headers = headerRow.map(normalizeHeader);
  const state = createEmptyState();

  for (const row of dataRows) {
    const entry = Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ""]));
    applyCsvRow(state, entry);
  }

  return state;
}

function applyCsvRow(state, row) {
  const type = normalizeHeader(row.type || row.record || row.entity || row.kind);
  const id = String(row.id || row.matchid || row.match_id || row.key || "").trim();
  if (!type || !id) return;

  if (type === "match") {
    state.matches[id] = {
      ...(state.matches[id] ?? {}),
      ...matchFieldsFromRow(row),
    };
    return;
  }

  if (type === "custommatch" || type === "custom_match") {
    state.customMatches.push({
      id,
      ...matchFieldsFromRow(row),
      date: row.date || "",
      stage: row.stage || "r32",
      group: row.group || "",
      venue: row.venue || "Knockout",
      home: row.home || "",
      away: row.away || "",
    });
    return;
  }

  if (type === "matchplayergoal" || type === "match_player_goal") {
    const player = String(row.player || row.playername || row.player_name || row.field || "").trim();
    if (!player) return;
    state.matchPlayerGoals[id] = {
      ...(state.matchPlayerGoals[id] ?? {}),
      [player]: numberFromCsv(row.goals || row.value),
    };
    return;
  }

  if (type === "playergoal" || type === "player_goal") {
    state.playerGoals[id] = numberFromCsv(row.goals || row.value);
    return;
  }

  if (type === "award") {
    state.awards[id] = row.winner || row.value || "";
  }
}

function matchFieldsFromRow(row) {
  const fields = {};
  if ("homescore" in row && row.homescore !== "") fields.homeScore = numberFromCsv(row.homescore);
  if ("awayscore" in row && row.awayscore !== "") fields.awayScore = numberFromCsv(row.awayscore);
  if (row.status) fields.status = row.status;
  if ("wenttopens" in row && row.wenttopens !== "") fields.wentToPens = booleanFromCsv(row.wenttopens);
  if (row.penaltywinner) fields.penaltyWinner = row.penaltywinner;
  return fields;
}

function parseCsvRows(csv) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < csv.length; index += 1) {
    const char = csv[index];
    const next = csv[index + 1];

    if (quoted) {
      if (char === '"' && next === '"') {
        field += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (char !== "\r") {
      field += char;
    }
  }

  row.push(field);
  if (row.some((value) => value !== "")) rows.push(row);

  return rows;
}

function normalizeHeader(header) {
  return String(header ?? "").trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
}

function numberFromCsv(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function booleanFromCsv(value) {
  return ["1", "true", "yes", "y"].includes(String(value).trim().toLowerCase());
}
