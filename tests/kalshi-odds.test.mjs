import assert from "node:assert/strict";
import test from "node:test";

import { getKalshiEventTicker, summarizeWinnerMarkets } from "../kalshi-odds.mjs";

test("builds Kalshi World Cup game event tickers from fixture teams and dates", () => {
  const ticker = getKalshiEventTicker({
    date: "2026-06-17",
    home: "Portugal",
    away: "DR Congo",
  });

  assert.equal(ticker, "KXWCGAME-26JUN17PORCOD");
});

test("does not build Kalshi tickers for unknown teams or dates", () => {
  assert.equal(getKalshiEventTicker({ date: "2026-06-17", home: "TBD", away: "Portugal" }), "");
  assert.equal(getKalshiEventTicker({ date: "", home: "Portugal", away: "DR Congo" }), "");
});

test("summarizes Kalshi winner markets with favorite, draw, and underdog probabilities", () => {
  const summary = summarizeWinnerMarkets(
    {
      home: "Portugal",
      away: "DR Congo",
    },
    [
      {
        ticker: "KXWCGAME-26JUN17PORCOD-TIE",
        yes_sub_title: "Tie",
        yes_bid_dollars: "0.1600",
        yes_ask_dollars: "0.1700",
        last_price_dollars: "0.1700",
      },
      {
        ticker: "KXWCGAME-26JUN17PORCOD-POR",
        yes_sub_title: "Portugal",
        yes_bid_dollars: "0.7600",
        yes_ask_dollars: "0.7700",
        last_price_dollars: "0.7700",
      },
      {
        ticker: "KXWCGAME-26JUN17PORCOD-COD",
        yes_sub_title: "Congo DR",
        yes_bid_dollars: "0.0700",
        yes_ask_dollars: "0.0800",
        last_price_dollars: "0.0800",
      },
    ],
  );

  assert.deepEqual(summary, {
    favoriteLabel: "Portugal",
    favoriteProbability: 77,
    drawProbability: 17,
    underdogLabel: "DR Congo",
    underdogProbability: 8,
    marketsUrl: "https://kalshi.com/markets/kxwcgame-26jun17porcod",
  });
});
