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
  getScorelessOwnerTracker,
  getScorelessGroupTracker,
  getProjectedThirdPlaceTable,
  getThirdPlaceTable,
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
    ["Match Results", "Group Stage", "Knockout Stage", "Selected Players", "Tournament Awards", "Survivor Points"],
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

test("projected third-place table includes every group before groups are complete", () => {
  const state = createEmptyState();

  assert.equal(getThirdPlaceTable(state).length, 0);
  assert.equal(getProjectedThirdPlaceTable(state).length, 12);
  assert.deepEqual(
    getProjectedThirdPlaceTable(state)
      .slice(0, 8)
      .map((row) => row.team),
    ["Austria", "Germany", "Ghana", "Iran", "Morocco", "Norway", "Portugal", "Qatar"],
  );
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

test("scoreless tracker keeps scoreless teams ahead of teams that have scored", () => {
  const state = createEmptyState();
  state.matches["g-a-01"] = { homeScore: 2, awayScore: 0, status: "final" };
  state.matches["g-a-02"] = { homeScore: 0, awayScore: 0, status: "final" };

  const tracker = getScorelessGroupTracker(state);
  const mexico = tracker.teams.find((row) => row.team === "Mexico");
  const southAfrica = tracker.teams.find((row) => row.team === "South Africa");
  const czechia = tracker.teams.find((row) => row.team === "Czechia");

  assert.equal(tracker.summary.scoreless, 47);
  assert.equal(tracker.summary.scored, 1);
  assert.equal(mexico.status, "cleared");
  assert.equal(southAfrica.status, "danger");
  assert.equal(czechia.status, "danger");
  assert.deepEqual(
    southAfrica.matches.map((match) => match.state),
    ["blank", "pending", "pending"],
  );
  assert.deepEqual(
    czechia.matches.map((match) => match.state),
    ["blank", "pending", "pending"],
  );
  assert.ok(tracker.teams.findIndex((row) => row.team === "South Africa") < tracker.teams.findIndex((row) => row.team === "Mexico"));
});

test("scoreless owner tracker groups each owner's drafted teams", () => {
  const state = createEmptyState();
  state.matches["g-h-02"] = { homeScore: 2, awayScore: 0, status: "final" };

  const tracker = getScorelessOwnerTracker(state);
  const sherman = tracker.find((row) => row.owner === "Sherman");

  assert.deepEqual(
    sherman.teams.map((row) => row.team),
    ["Colombia", "South Africa", "Sweden", "Tunisia", "United States", "Spain"],
  );
  assert.equal(sherman.waiting, 5);
  assert.equal(sherman.cleared, 1);
  assert.equal(sherman.teams.find((row) => row.team === "Spain").status, "cleared");
});

test("nation point standings show final last-standing winner after champion is crowned", () => {
  const state = createEmptyState();
  state.customMatches = [
    { id: "custom-r32-1", stage: "r32", home: "Brazil", away: "Haiti", homeScore: 2, awayScore: 0, status: "final" },
    { id: "custom-r32-2", stage: "r32", home: "Morocco", away: "Scotland", homeScore: 1, awayScore: 0, status: "final" },
    { id: "custom-r16-1", stage: "r16", home: "Brazil", away: "Morocco", homeScore: 3, awayScore: 1, status: "final" },
    { id: "custom-final-1", stage: "final", home: "Brazil", away: "France", homeScore: 1, awayScore: 0, status: "final" },
  ];

  const groupC = getNationPointStandings(state).groupRows.find((row) => row.key === "C");

  assert.equal(groupC.winner, "Brazil");
  assert.equal(groupC.status, "Last standing: Brazil");
  assert.ok(groupC.contenders.find((row) => row.team === "Brazil" && row.label === "Champion"));
});

test("single-team federation survivor points score immediately", () => {
  const result = calculateScores(createEmptyState());
  const palutsis = result.ownerTotals.find((row) => row.owner === "Palutsis");

  assert.ok(
    palutsis.details.some(
      (detail) =>
        detail.category === "Survivor Points" &&
        detail.reason === "New Zealand last standing from OFC" &&
        detail.points === 5,
    ),
  );
});
