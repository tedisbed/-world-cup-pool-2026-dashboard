import { createEmptyState, normalizeState } from "./pool-core.mjs";

export const googleSheetCsvPath =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTDvAZcUzudMTWYH5kfzoByxqte0FfSSQBhDen2stoBA2qyqbIRveAzwmp903gBmw/pub?gid=1553990171&single=true&output=csv";

export async function loadInitialState({
  fetchText = fetchGoogleSheetCsv,
} = {}) {
  return loadPublishedState({ fetchText });
}

export async function loadPublishedState({
  fetchText = fetchGoogleSheetCsv,
} = {}) {
  try {
    return normalizeState(parseStateCsv(await fetchText(googleSheetCsvPath)));
  } catch {
    return createEmptyState();
  }
}

async function fetchGoogleSheetCsv(path = googleSheetCsvPath) {
  const response = await fetch(path, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Unable to load Google Sheet CSV from ${path}: ${response.status}`);
  }
  return response.text();
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
  const id = normalizeRecordId(row.id || row.matchid || row.match_id || row.key || "");
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
  const homeScore = csvValue(row, "homescore", "home_score");
  const awayScore = csvValue(row, "awayscore", "away_score");
  if (homeScore !== "") fields.homeScore = numberFromCsv(homeScore);
  if (awayScore !== "") fields.awayScore = numberFromCsv(awayScore);
  if (row.status) fields.status = row.status;
  const wentToPens = csvValue(row, "wenttopens", "went_to_pens");
  const penaltyWinner = csvValue(row, "penaltywinner", "penalty_winner");
  if (wentToPens !== "") fields.wentToPens = booleanFromCsv(wentToPens);
  if (penaltyWinner) fields.penaltyWinner = penaltyWinner;
  return fields;
}

function normalizeRecordId(value) {
  const raw = String(value ?? "").trim();
  const bracketNumber = raw.match(/^(?:match\s*)?([7-9][0-9]|10[0-4])$/i)?.[1];
  return bracketNumber ? `m${bracketNumber}` : raw;
}

function csvValue(row, ...keys) {
  for (const key of keys) {
    if (key in row) return row[key];
  }
  return "";
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
