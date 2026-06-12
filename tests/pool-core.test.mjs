import assert from "node:assert/strict";
import test from "node:test";

import {
  calculateScores,
  createEmptyState,
  getMatchesByDate,
  getMatchesForDate,
  getOwnerOpportunityRows,
  getPlayerGoalTotals,
  getRecentPointEvents,
} from "../pool-core.mjs";

test("match-level selected-player goals roll into totals and scoring", () => {
  const state = createEmptyState();
  state.matchPlayerGoals["g-a-02"] = { Mbappe: 2 };

  assert.equal(getPlayerGoalTotals(state).Mbappe, 2);

  const mbappeOwner = calculateScores(state).ownerTotals.find((row) => row.owner === "Kreienberg");
  assert.ok(mbappeOwner.details.some((detail) => detail.reason === "Mbappe goals" && detail.points === 4));
});

test("matches can be grouped by date for score entry", () => {
  const groups = getMatchesByDate(createEmptyState());

  assert.equal(groups[0].date, "2026-06-11");
  assert.deepEqual(
    groups[0].matches.map((match) => match.id),
    ["g-a-01", "g-a-02"],
  );
  assert.ok(groups.some((group) => group.date === "2026-06-12" && group.matches.length === 2));
});

test("matches can be filtered to one date for the today view", () => {
  const matches = getMatchesForDate(createEmptyState(), "2026-06-12");

  assert.deepEqual(
    matches.map((match) => match.id),
    ["g-b-01", "g-d-01"],
  );
});

test("recent point events list owner scoring details from finalized matches", () => {
  const state = createEmptyState();
  state.matches["g-a-01"] = { homeScore: 2, awayScore: 0, status: "final", wentToPens: false, penaltyWinner: "" };

  const events = getRecentPointEvents(state);

  assert.ok(events.some((event) => event.owner === "Schelly / Mitchell" && event.reason === "Mexico group win" && event.points === 3));
  assert.ok(events.some((event) => event.owner === "Sherman" && event.reason === "South Africa lost by 2+" && event.points === -1));
});

test("owner opportunity rows estimate visible remaining upside", () => {
  const state = createEmptyState();
  state.matches["g-a-01"] = { homeScore: 2, awayScore: 0, status: "final", wentToPens: false, penaltyWinner: "" };

  const rows = getOwnerOpportunityRows(state);
  const sherman = rows.find((row) => row.owner === "Sherman");

  assert.ok(sherman.remainingVisible > 0);
  assert.equal(sherman.maxVisible, sherman.current + sherman.remainingVisible);
  assert.ok(sherman.teamOpportunity > 0);
  assert.ok(sherman.playerOpportunity > 0);
});
