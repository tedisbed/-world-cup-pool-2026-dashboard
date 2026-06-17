import { createEmptyState, normalizeState } from "./pool-core.mjs";

export const storageKey = "world-cup-pool-dashboard-v1";
export const livePublishedStatePath = "./data/live-state.json";
export const publishedStatePath = "./data/state.json";
export const dataSourceConfigPath = "./data/source-config.json";
export const defaultPublishedSources = [
  { type: "json", url: livePublishedStatePath },
  { type: "json", url: publishedStatePath },
];

export async function loadInitialState({
  fetchJson,
  fetchConfig = fetchDataSourceConfig,
  fetchSource = fetchPublishedSource,
  storage = globalThis.localStorage,
  key = storageKey,
} = {}) {
  try {
    if (fetchJson) return normalizeState(await fetchJson(publishedStatePath));
    return await loadPublishedState({ fetchConfig, fetchSource });
  } catch {
    return loadSavedState(storage, key);
  }
}

export async function loadPublishedState({
  fetchConfig = fetchDataSourceConfig,
  fetchSource = fetchPublishedSource,
} = {}) {
  const configuredSources = await getConfiguredSources(fetchConfig);
  const sources = uniqueSources([...configuredSources, ...defaultPublishedSources]);
  let lastError = new Error("No published data sources configured");

  for (const source of sources) {
    try {
      const state = await fetchSource(source);
      return normalizeState(sourceTextToState(source, state));
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
}

export function loadSavedState(storage = globalThis.localStorage, key = storageKey) {
  try {
    const raw = storage?.getItem(key);
    return raw ? normalizeState(JSON.parse(raw)) : createEmptyState();
  } catch {
    return createEmptyState();
  }
}

export function saveStateSnapshot(state, storage = globalThis.localStorage, key = storageKey) {
  storage?.setItem(key, JSON.stringify(state));
}

async function fetchDataSourceConfig() {
  const response = await fetch(dataSourceConfigPath, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Unable to load data source config: ${response.status}`);
  }
  return response.json();
}

async function fetchPublishedSource(source) {
  const response = await fetch(source.url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Unable to load published state from ${source.url}: ${response.status}`);
  }

  if (isCsvSource(source)) {
    return response.text();
  }

  return response.json();
}

async function getConfiguredSources(fetchConfig) {
  try {
    const config = await fetchConfig();
    return normalizeSources(config?.sources);
  } catch {
    return [];
  }
}

function normalizeSources(sources) {
  if (!Array.isArray(sources)) return [];

  return sources
    .map((source) => ({
      type: normalizeSourceType(source?.type),
      url: String(source?.url ?? "").trim(),
    }))
    .filter((source) => source.url);
}

function normalizeSourceType(type) {
  const normalized = String(type ?? "json").trim().toLowerCase();
  if (["csv", "google-sheet-csv", "google_sheets_csv", "sheet-csv"].includes(normalized)) return "csv";
  return "json";
}

function uniqueSources(sources) {
  const seen = new Set();
  return sources.filter((source) => {
    const key = `${source.type}:${source.url}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function sourceTextToState(source, state) {
  if (typeof state === "string" && isCsvSource(source)) {
    return parseStateCsv(state);
  }
  return state;
}

function isCsvSource(source) {
  return normalizeSourceType(source?.type) === "csv";
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
