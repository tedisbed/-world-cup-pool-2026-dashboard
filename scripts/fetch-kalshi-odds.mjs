import { readFile, writeFile } from "node:fs/promises";

import { fixtures, isCompletedMatch } from "../pool-core.mjs";
import { getKalshiEventTicker, summarizeWinnerMarkets } from "../kalshi-odds.mjs";

export const defaultOutputPath = new URL("../data/kalshi-odds.json", import.meta.url);

const kalshiApiBase = "https://external-api.kalshi.com/trade-api/v2";
const defaultLookaheadDays = 7;

export async function writeKalshiOddsSnapshot({
  outputPath = defaultOutputPath,
  now = new Date(),
  fetchFn = globalThis.fetch,
  matches = fixtures,
  lookaheadDays = defaultLookaheadDays,
} = {}) {
  if (typeof fetchFn !== "function") throw new Error("fetch is not available in this Node runtime");

  const snapshotMatches = {};
  const targetMatches = matches.filter((match) => shouldFetchMatch(match, now, lookaheadDays));

  for (const match of targetMatches) {
    const ticker = getKalshiEventTicker(match);
    const markets = await fetchKalshiMarkets(ticker, fetchFn);
    const summary = summarizeWinnerMarkets(match, markets);
    if (summary) snapshotMatches[match.id] = summary;
  }

  const snapshot = {
    updatedAt: now.toISOString(),
    matches: snapshotMatches,
  };
  const nextJson = `${JSON.stringify(snapshot, null, 2)}\n`;

  try {
    const currentJson = await readFile(outputPath, "utf8");
    if (currentJson === nextJson) return { changed: false, snapshot };
  } catch {
    // Missing output file is expected on first run.
  }

  await writeFile(outputPath, nextJson);
  return { changed: true, snapshot };
}

async function fetchKalshiMarkets(ticker, fetchFn) {
  const response = await fetchFn(`${kalshiApiBase}/markets?event_ticker=${encodeURIComponent(ticker)}&status=open`);
  if (!response.ok) return [];
  const data = await response.json();
  return Array.isArray(data?.markets) ? data.markets : [];
}

function shouldFetchMatch(match, now, lookaheadDays) {
  if (isCompletedMatch(match) || !getKalshiEventTicker(match)) return false;
  const today = isoDate(now);
  return match.date >= today && match.date <= addDaysIso(today, lookaheadDays);
}

function isoDate(date) {
  const parsed = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toISOString().slice(0, 10);
}

function addDaysIso(date, days) {
  const parsed = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return date;
  parsed.setUTCDate(parsed.getUTCDate() + days);
  return parsed.toISOString().slice(0, 10);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  writeKalshiOddsSnapshot()
    .then((result) => {
      console.log(result.changed ? "Updated Kalshi odds snapshot." : "Kalshi odds snapshot already current.");
    })
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    });
}
