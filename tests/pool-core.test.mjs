import assert from "node:assert/strict";
import test from "node:test";

import {
  calculateScores,
  createEmptyState,
  fixtures,
  getMatchesByDate,
  getMatchesForDate,
  getGroupStandings,
  getGroupAdvancementStatuses,
  getKnockoutBracket,
  getLeaderboardPickStatuses,
  getNationPointStandings,
  getOwnerOpportunityRows,
  getPlayerGoalTotals,
  getProjectedGroupBubbleTable,
  getRecentPointEvents,
  getRuleGroups,
  getScorelessOwnerTracker,
  getScorelessGroupTracker,
  getProjectedThirdPlaceTable,
  getThirdPlaceTable,
  teams,
} from "../pool-core.mjs";

test("all World Cup teams include FIFA ranking metadata for tiebreakers", () => {
  const teamsWithoutRanking = teams.filter((team) => !Number.isInteger(team.fifaRank));

  assert.equal(teams.length, 48);
  assert.deepEqual(teamsWithoutRanking, []);
  assert.equal(teams.find((team) => team.name === "Argentina").fifaRank, 1);
  assert.equal(teams.find((team) => team.name === "Spain").fifaRank, 2);
});

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

test("group standings use head-to-head before alphabetical order", () => {
  const state = createEmptyState();
  state.matches["g-h-01"] = { homeScore: 1, awayScore: 1, status: "final" };
  state.matches["g-h-02"] = { homeScore: 0, awayScore: 1, status: "final" };

  const groupH = getGroupStandings(state).H;

  assert.deepEqual(
    groupH.map((row) => row.team),
    ["Cape Verde", "Uruguay", "Saudi Arabia", "Spain"],
  );
});

test("group standings use overall goal difference when head-to-head is still tied", () => {
  const state = createEmptyState();
  state.matches["g-h-01"] = { homeScore: 1, awayScore: 1, status: "final" };
  state.matches["g-h-04"] = { homeScore: 3, awayScore: 0, status: "final" };

  const groupH = getGroupStandings(state).H;

  assert.deepEqual(
    groupH.map((row) => row.team),
    ["Spain", "Uruguay", "Saudi Arabia", "Cape Verde"],
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

test("knockout bracket includes scheduled dates for bracket cards", () => {
  const bracket = getKnockoutBracket(createEmptyState());
  const matches = new Map(bracket.rounds.flatMap((round) => round.matches.map((match) => [match.id, match])));

  assert.equal(matches.get("m73").date, "2026-06-28");
  assert.equal(matches.get("m89").date, "2026-07-04");
  assert.equal(matches.get("m97").date, "2026-07-09");
  assert.equal(matches.get("m101").date, "2026-07-14");
  assert.equal(matches.get("m104").date, "2026-07-19");
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

test("knockout bracket uses sheet-provided official match participants", () => {
  const state = createEmptyState();
  state.customMatches = [
    {
      id: "m74",
      stage: "r32",
      date: "2026-06-29",
      venue: "Gillette Stadium, Foxborough",
      home: "Germany",
      away: "Paraguay",
      status: "scheduled",
    },
  ];

  const bracket = getKnockoutBracket(state);
  const match74 = bracket.rounds
    .find((round) => round.stage === "r32")
    .matches.find((match) => match.id === "m74");

  assert.deepEqual(
    match74.slots.map((slot) => ({ label: slot.label, team: slot.team })),
    [
      { label: "Sheet home", team: "Germany" },
      { label: "Sheet away", team: "Paraguay" },
    ],
  );
});

test("knockout bracket exposes scores and advances official bracket winners", () => {
  const state = createEmptyState();
  state.matches["g-j-01"] = { homeScore: 2, awayScore: 0, status: "final" };
  state.matches.m86 = { homeScore: 2, awayScore: 0, status: "final" };

  const bracket = getKnockoutBracket(state);
  const roundOf32 = bracket.rounds.find((round) => round.stage === "r32");
  const roundOf16 = bracket.rounds.find((round) => round.stage === "r16");
  const match86 = roundOf32.matches.find((match) => match.id === "m86");
  const match95 = roundOf16.matches.find((match) => match.id === "m95");

  assert.equal(match86.homeScore, 2);
  assert.equal(match86.awayScore, 0);
  assert.equal(match86.status, "final");
  assert.equal(match86.winner, "Argentina");
  assert.equal(match95.slots[0].label, "Winner Match 86");
  assert.equal(match95.slots[0].team, "Argentina");
});

test("group advancement statuses distinguish confirmed and projected outcomes", () => {
  const state = createEmptyState();
  state.matches["g-a-01"] = { homeScore: 2, awayScore: 0, status: "final" };
  state.matches["g-a-02"] = { homeScore: 0, awayScore: 2, status: "final" };
  state.matches["g-a-03"] = { homeScore: 3, awayScore: 0, status: "final" };
  state.matches["g-a-04"] = { homeScore: 2, awayScore: 0, status: "final" };
  state.matches["g-a-06"] = { homeScore: 0, awayScore: 1, status: "final" };

  const statuses = getGroupAdvancementStatuses(state);

  assert.deepEqual(
    {
      Mexico: statuses.Mexico,
      Czechia: statuses.Czechia,
      "South Africa": statuses["South Africa"],
    },
    {
      Mexico: { label: "CONFIRMED", tone: "confirmed", confirmed: true, eliminated: false, projected: true },
      Czechia: { label: "CONFIRMED", tone: "confirmed", confirmed: true, eliminated: false, projected: true },
      "South Africa": { label: "CONF OUT", tone: "out", confirmed: true, eliminated: true, projected: false },
    },
  );
});

test("knockout bracket slots include advancement status for projected teams", () => {
  const state = createEmptyState();
  state.matches["g-a-01"] = { homeScore: 2, awayScore: 0, status: "final" };
  state.matches["g-a-02"] = { homeScore: 0, awayScore: 2, status: "final" };
  state.matches["g-a-03"] = { homeScore: 3, awayScore: 0, status: "final" };
  state.matches["g-a-04"] = { homeScore: 2, awayScore: 0, status: "final" };

  const bracket = getKnockoutBracket(state);
  const match79 = bracket.rounds
    .find((round) => round.stage === "r32")
    .matches.find((match) => match.id === "m79");

  assert.equal(match79.slots[0].label, "Group A winner");
  assert.equal(match79.slots[0].team, "Czechia");
  assert.equal(match79.slots[0].advancementStatus.label, "CONFIRMED");
});

test("projected third-place table includes every group before groups are complete", () => {
  const state = createEmptyState();

  assert.equal(getThirdPlaceTable(state).length, 0);
  assert.equal(getProjectedThirdPlaceTable(state).length, 12);
  assert.deepEqual(
    getProjectedThirdPlaceTable(state)
      .slice(0, 8)
      .map((row) => row.team),
    ["Australia", "Norway", "Panama", "Egypt", "Algeria", "Scotland", "Tunisia", "Ivory Coast"],
  );
});

test("projected group bubble table includes third and fourth place teams", () => {
  const rows = getProjectedGroupBubbleTable(createEmptyState());

  assert.equal(rows.length, 24);
  assert.equal(rows.filter((row) => row.groupRank === 3).length, 12);
  assert.equal(rows.filter((row) => row.groupRank === 4).length, 12);
  assert.deepEqual(
    rows.slice(0, 2).map((row) => ({ team: row.team, groupRank: row.groupRank, thirdPlaceRank: row.thirdPlaceRank })),
    [
      { team: "Australia", groupRank: 3, thirdPlaceRank: 1 },
      { team: "Norway", groupRank: 3, thirdPlaceRank: 2 },
    ],
  );
  assert.ok(rows.find((row) => row.team === "Jordan" && row.groupRank === 4));
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

test("nation point standings eliminate official bracket losers", () => {
  const state = createEmptyState();
  state.matches["g-a-01"] = { homeScore: 2, awayScore: 1, status: "final" };
  state.matches["g-a-02"] = { homeScore: 0, awayScore: 1, status: "final" };
  state.matches["g-a-03"] = { homeScore: 0, awayScore: 2, status: "final" };
  state.matches["g-a-04"] = { homeScore: 2, awayScore: 0, status: "final" };
  state.matches["g-a-05"] = { homeScore: 0, awayScore: 2, status: "final" };
  state.matches["g-a-06"] = { homeScore: 2, awayScore: 0, status: "final" };
  state.matches["g-b-01"] = { homeScore: 2, awayScore: 0, status: "final" };
  state.matches["g-b-02"] = { homeScore: 0, awayScore: 3, status: "final" };
  state.matches["g-b-03"] = { homeScore: 2, awayScore: 0, status: "final" };
  state.matches["g-b-04"] = { homeScore: 2, awayScore: 0, status: "final" };
  state.matches["g-b-05"] = { homeScore: 2, awayScore: 0, status: "final" };
  state.matches["g-b-06"] = { homeScore: 1, awayScore: 0, status: "final" };
  state.matches.m73 = { homeScore: 1, awayScore: 2, status: "final" };

  const standings = getNationPointStandings(state);
  const groupA = standings.groupRows.find((row) => row.key === "A");
  const caf = standings.federationRows.find((row) => row.key === "CAF");
  const groupSouthAfrica = groupA.contenders.find((row) => row.team === "South Africa");
  const cafSouthAfrica = caf.contenders.find((row) => row.team === "South Africa");

  assert.equal(groupSouthAfrica.alive, false);
  assert.equal(groupSouthAfrica.label, "Lost Round of 32");
  assert.equal(cafSouthAfrica.alive, false);
  assert.equal(cafSouthAfrica.label, "Lost Round of 32");
});

test("official knockout bracket wins score for team owners", () => {
  const state = createEmptyState();
  state.matches["g-a-01"] = { homeScore: 1, awayScore: 0, status: "final" };
  state.matches["g-a-02"] = { homeScore: 1, awayScore: 0, status: "final" };
  state.matches["g-a-03"] = { homeScore: 0, awayScore: 2, status: "final" };
  state.matches["g-a-04"] = { homeScore: 2, awayScore: 0, status: "final" };
  state.matches["g-a-05"] = { homeScore: 0, awayScore: 3, status: "final" };
  state.matches["g-a-06"] = { homeScore: 2, awayScore: 0, status: "final" };
  state.matches["g-b-01"] = { homeScore: 2, awayScore: 0, status: "final" };
  state.matches["g-b-02"] = { homeScore: 0, awayScore: 3, status: "final" };
  state.matches["g-b-03"] = { homeScore: 2, awayScore: 0, status: "final" };
  state.matches["g-b-04"] = { homeScore: 2, awayScore: 0, status: "final" };
  state.matches["g-b-05"] = { homeScore: 2, awayScore: 0, status: "final" };
  state.matches["g-b-06"] = { homeScore: 1, awayScore: 0, status: "final" };
  state.matches.m73 = { homeScore: 1, awayScore: 2, status: "final" };

  const result = calculateScores(state);
  const kreienberg = result.ownerTotals.find((row) => row.owner === "Kreienberg");

  assert.ok(kreienberg.details.some((detail) => detail.reason === "Canada won Round of 32" && detail.points === 4));
});

test("leaderboard pick statuses distinguish knockout eliminations from group exits", () => {
  const state = createEmptyState();
  state.matches["g-a-01"] = { homeScore: 1, awayScore: 0, status: "final" };
  state.matches["g-a-02"] = { homeScore: 1, awayScore: 0, status: "final" };
  state.matches["g-a-03"] = { homeScore: 0, awayScore: 2, status: "final" };
  state.matches["g-a-04"] = { homeScore: 2, awayScore: 0, status: "final" };
  state.matches["g-a-05"] = { homeScore: 0, awayScore: 3, status: "final" };
  state.matches["g-a-06"] = { homeScore: 2, awayScore: 0, status: "final" };
  state.matches["g-b-01"] = { homeScore: 2, awayScore: 0, status: "final" };
  state.matches["g-b-02"] = { homeScore: 0, awayScore: 3, status: "final" };
  state.matches["g-b-03"] = { homeScore: 2, awayScore: 0, status: "final" };
  state.matches["g-b-04"] = { homeScore: 2, awayScore: 0, status: "final" };
  state.matches["g-b-05"] = { homeScore: 2, awayScore: 0, status: "final" };
  state.matches["g-b-06"] = { homeScore: 1, awayScore: 0, status: "final" };
  state.matches.m73 = { homeScore: 1, awayScore: 2, status: "final" };

  const statuses = getLeaderboardPickStatuses(state);

  assert.equal(statuses["South Africa"].badgeLabel, "KO'D");
  assert.equal(statuses["South Africa"].tone, "knocked-out");
  assert.equal(statuses["South Africa"].titleLabel, "Knocked out in Round of 32");
  assert.equal(statuses.Czechia.badgeLabel, "Out");
  assert.equal(statuses.Czechia.tone, "out");
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
  state.matches["g-a-01"] = { homeScore: 2, awayScore: 0, status: "final" };
  state.matches["g-h-02"] = { homeScore: 2, awayScore: 0, status: "final" };

  const tracker = getScorelessOwnerTracker(state);
  const sherman = tracker.find((row) => row.owner === "Sherman");

  assert.deepEqual(
    sherman.teams.map((row) => row.team),
    ["South Africa", "Colombia", "Sweden", "Tunisia", "United States", "Spain"],
  );
  assert.equal(sherman.waiting, 5);
  assert.equal(sherman.cleared, 1);
  assert.equal(sherman.playedScoreless, 1);
  assert.equal(sherman.notPlayed, 4);
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

test("same-round survivor ties award all tied teams", () => {
  const state = createEmptyState();
  for (const fixture of fixtures.filter((match) => match.stage === "group")) {
    state.matches[fixture.id] = { homeScore: 1, awayScore: 0, status: "final" };
  }
  state.matches["g-a-01"] = { homeScore: 2, awayScore: 1, status: "final" };
  state.matches["g-a-02"] = { homeScore: 0, awayScore: 0, status: "final" };
  state.matches["g-a-03"] = { homeScore: 0, awayScore: 2, status: "final" };
  state.matches["g-a-04"] = { homeScore: 2, awayScore: 0, status: "final" };
  state.matches["g-a-05"] = { homeScore: 0, awayScore: 2, status: "final" };
  state.matches["g-a-06"] = { homeScore: 2, awayScore: 0, status: "final" };
  state.customMatches = [
    { id: "custom-r32-mexico", stage: "r32", home: "Mexico", away: "Brazil", homeScore: 0, awayScore: 1, status: "final" },
    { id: "custom-r32-south-africa", stage: "r32", home: "South Africa", away: "Canada", homeScore: 1, awayScore: 2, status: "final" },
  ];

  const standings = getNationPointStandings(state);
  const groupA = standings.groupRows.find((row) => row.key === "A");
  const result = calculateScores(state);
  const schellyMitchell = result.ownerTotals.find((row) => row.owner === "Schelly / Mitchell");
  const sherman = result.ownerTotals.find((row) => row.owner === "Sherman");

  assert.deepEqual(groupA.winners.sort(), ["Mexico", "South Africa"]);
  assert.equal(groupA.status, "Last standing tie: Mexico, South Africa");
  assert.ok(schellyMitchell.details.some((detail) => detail.reason === "Mexico last standing from Group A" && detail.points === 7));
  assert.ok(sherman.details.some((detail) => detail.reason === "South Africa last standing from Group A" && detail.points === 7));
});
