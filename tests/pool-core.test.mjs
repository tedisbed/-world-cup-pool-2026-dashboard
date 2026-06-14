import assert from "node:assert/strict";
import test from "node:test";

import {
  calculateScores,
  createEmptyState,
  getMatchesByDate,
  getMatchesForDate,
  getKnockoutBracket,
  getNationPointStandings,
  getOwnerOpportunityRows,
  getPlayerGoalTotals,
  getRecentPointEvents,
  getRuleGroups,
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

test("rules reference groups related scoring paths", () => {
  const groups = getRuleGroups();

  assert.deepEqual(
    groups.map((group) => group.title),
    ["Match Results", "Group Stage", "Knockout Stage", "Selected Players", "Tournament Awards", "Nation Points"],
  );

  const selectedPlayers = groups.find((group) => group.title === "Selected Players");
  assert.deepEqual(
    selectedPlayers.rules.map((rule) => rule.label),
    ["Selected-player goal", "Top selected-player scorer", "Selected player's team wins"],
  );

  const groupStage = groups.find((group) => group.title === "Group Stage");
  assert.ok(groupStage.rules.some((rule) => rule.label === "Advance to knockout"));
  assert.ok(groupStage.rules.some((rule) => rule.points < 0 && rule.label === "Scoreless group stage"));
});

test("knockout bracket starts with source placeholders", () => {
  const bracket = getKnockoutBracket(createEmptyState());
  const roundOf32 = bracket.rounds.find((round) => round.stage === "r32");
  const match86 = roundOf32.matches.find((match) => match.id === "m86");

  assert.deepEqual(
    match86.slots.map((slot) => ({ label: slot.label, team: slot.team })),
    [
      { label: "Group J winner", team: "" },
      { label: "Group H runner-up", team: "" },
    ],
  );
});

test("knockout bracket fills group source slots from current standings leaders", () => {
  const state = createEmptyState();
  state.matches["g-j-01"] = { homeScore: 2, awayScore: 0, status: "final" };

  const bracket = getKnockoutBracket(state);
  const match86 = bracket.rounds
    .find((round) => round.stage === "r32")
    .matches.find((match) => match.id === "m86");

  assert.equal(match86.slots[0].label, "Group J winner");
  assert.equal(match86.slots[0].team, "Argentina");
});

test("nation point standings split last-standing races by group and federation", () => {
  const standings = getNationPointStandings(createEmptyState());

  assert.equal(standings.groupRows.length, 12);
  assert.equal(standings.federationRows.length, 6);

  const groupA = standings.groupRows.find((row) => row.key === "A");
  assert.equal(groupA.title, "Group A");
  assert.equal(groupA.points, 7);
  assert.equal(groupA.status, "4 alive");
  assert.deepEqual(
    groupA.contenders.map((row) => row.team),
    ["Czechia", "Mexico", "South Africa", "South Korea"],
  );

  const concacaf = standings.federationRows.find((row) => row.key === "CONCACAF");
  assert.equal(concacaf.title, "CONCACAF");
  assert.equal(concacaf.points, 5);
  assert.ok(concacaf.contenders.some((row) => row.team === "Mexico"));
});
