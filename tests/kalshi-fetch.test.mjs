import assert from "node:assert/strict";
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { writeKalshiOddsSnapshot } from "../scripts/fetch-kalshi-odds.mjs";

test("Kalshi odds snapshot is fetched server-side and keyed by match id", async () => {
  const dir = await mkdtemp(join(tmpdir(), "kalshi-odds-"));
  const outputPath = join(dir, "kalshi-odds.json");
  const requestedUrls = [];

  const result = await writeKalshiOddsSnapshot({
    outputPath,
    now: new Date("2026-06-17T12:00:00.000Z"),
    fetchFn: async (url) => {
      requestedUrls.push(url);
      return {
        ok: true,
        json: async () => ({
          markets: [
            { ticker: "KXWCGAME-26JUN17PORCOD-TIE", yes_sub_title: "Tie", yes_ask_dollars: "0.1700" },
            { ticker: "KXWCGAME-26JUN17PORCOD-POR", yes_sub_title: "Portugal", yes_ask_dollars: "0.7700" },
            { ticker: "KXWCGAME-26JUN17PORCOD-COD", yes_sub_title: "Congo DR", yes_ask_dollars: "0.0800" },
          ],
        }),
      };
    },
    matches: [{ id: "g-k-01", date: "2026-06-17", home: "Portugal", away: "DR Congo", status: "open" }],
  });

  const snapshot = JSON.parse(await readFile(outputPath, "utf8"));

  assert.equal(result.changed, true);
  assert.equal(requestedUrls.length, 1);
  assert.match(requestedUrls[0], /event_ticker=KXWCGAME-26JUN17PORCOD/);
  assert.deepEqual(snapshot.matches["g-k-01"], {
    favoriteLabel: "Portugal",
    favoriteProbability: 77,
    drawProbability: 17,
    underdogLabel: "DR Congo",
    underdogProbability: 8,
    marketsUrl: "https://kalshi.com/markets/kxwcgame-26jun17porcod",
  });
});
