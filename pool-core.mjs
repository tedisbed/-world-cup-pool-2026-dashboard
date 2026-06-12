export const owners = [
  "Sherman",
  "Sarkey",
  "Schelly / Mitchell",
  "Brombach",
  "Flood",
  "Worrell",
  "Palutsis",
  "Kreienberg",
];

export const rules = {
  allEvents: {
    winByTwo: 2,
    loseByTwo: -1,
    penaltyWin: 1,
  },
  groupStage: {
    win: 3,
    draw: 1,
    winGroup: 3,
    advance: 5,
    worstFourGoalDifference: 5,
    bestFourGoalDifference: 5,
    scorelessGroup: -5,
  },
  knockoutStage: {
    r32: 4,
    r16: 5,
    qf: 7,
    sf: 8,
    final: 10,
  },
  individualAwards: {
    selectedPlayerMostGoals: 10,
    selectedPlayerAward: 8,
    selectedPlayerGoal: 2,
    selectedPlayersTeamWins: 2,
    selectedTeamHasAwardWinner: 5,
  },
  nationPoints: {
    lastFromGroup: 7,
    lastFromFederation: 5,
  },
};

export const stageLabels = {
  group: "Group Stage",
  r32: "Round of 32",
  r16: "Round of 16",
  qf: "Quarterfinal",
  sf: "Semifinal",
  final: "World Cup",
};

export const awardLabels = {
  goldenBall: "Golden Ball",
  goldenBoot: "Golden Boot",
  goldenGlove: "Golden Glove",
  bestYoungPlayer: "Best Young Player",
};

export const draftPicks = [
  { owner: "Sherman", round: 1, type: "team", name: "Spain" },
  { owner: "Sherman", round: 2, type: "team", name: "United States" },
  { owner: "Sherman", round: 3, type: "team", name: "Colombia" },
  { owner: "Sherman", round: 4, type: "player", name: "Vinicius", team: "Brazil" },
  { owner: "Sherman", round: 5, type: "team", name: "Sweden" },
  { owner: "Sherman", round: 6, type: "team", name: "South Africa" },
  { owner: "Sherman", round: 7, type: "team", name: "Tunisia" },

  { owner: "Sarkey", round: 1, type: "team", name: "France" },
  { owner: "Sarkey", round: 2, type: "team", name: "Switzerland" },
  { owner: "Sarkey", round: 3, type: "player", name: "Haaland", team: "Norway" },
  { owner: "Sarkey", round: 4, type: "team", name: "Senegal" },
  { owner: "Sarkey", round: 5, type: "team", name: "Czechia" },
  { owner: "Sarkey", round: 6, type: "team", name: "Saudi Arabia" },
  { owner: "Sarkey", round: 7, type: "team", name: "DR Congo" },

  { owner: "Schelly / Mitchell", round: 1, type: "team", name: "England" },
  { owner: "Schelly / Mitchell", round: 2, type: "team", name: "Mexico" },
  { owner: "Schelly / Mitchell", round: 3, type: "team", name: "Norway" },
  { owner: "Schelly / Mitchell", round: 4, type: "team", name: "Austria" },
  { owner: "Schelly / Mitchell", round: 5, type: "player", name: "Diaz", team: "Colombia" },
  { owner: "Schelly / Mitchell", round: 6, type: "team", name: "Uzbekistan" },
  { owner: "Schelly / Mitchell", round: 7, type: "team", name: "Curacao" },

  { owner: "Brombach", round: 1, type: "team", name: "Brazil" },
  { owner: "Brombach", round: 2, type: "player", name: "Yamal", team: "Spain" },
  { owner: "Brombach", round: 3, type: "team", name: "Turkey" },
  { owner: "Brombach", round: 4, type: "team", name: "Ivory Coast" },
  { owner: "Brombach", round: 5, type: "team", name: "Egypt" },
  { owner: "Brombach", round: 6, type: "team", name: "Ghana" },
  { owner: "Brombach", round: 7, type: "team", name: "Qatar" },

  { owner: "Flood", round: 1, type: "team", name: "Argentina" },
  { owner: "Flood", round: 2, type: "team", name: "Morocco" },
  { owner: "Flood", round: 3, type: "team", name: "Uruguay" },
  { owner: "Flood", round: 4, type: "player", name: "Oyarzabal", team: "Spain" },
  { owner: "Flood", round: 5, type: "team", name: "Australia" },
  { owner: "Flood", round: 6, type: "team", name: "Panama" },
  { owner: "Flood", round: 7, type: "team", name: "Cape Verde" },

  { owner: "Worrell", round: 1, type: "team", name: "Portugal" },
  { owner: "Worrell", round: 2, type: "player", name: "Kane", team: "England" },
  { owner: "Worrell", round: 3, type: "team", name: "Croatia" },
  { owner: "Worrell", round: 4, type: "team", name: "South Korea" },
  { owner: "Worrell", round: 5, type: "team", name: "Paraguay" },
  { owner: "Worrell", round: 6, type: "team", name: "Iran" },
  { owner: "Worrell", round: 7, type: "team", name: "Iraq" },

  { owner: "Palutsis", round: 1, type: "team", name: "Germany" },
  { owner: "Palutsis", round: 2, type: "team", name: "Netherlands" },
  { owner: "Palutsis", round: 3, type: "player", name: "Messi", team: "Argentina" },
  { owner: "Palutsis", round: 4, type: "team", name: "Ecuador" },
  { owner: "Palutsis", round: 5, type: "team", name: "New Zealand" },
  { owner: "Palutsis", round: 6, type: "team", name: "Bosnia and Herzegovina" },
  { owner: "Palutsis", round: 7, type: "team", name: "Haiti" },

  { owner: "Kreienberg", round: 1, type: "player", name: "Mbappe", team: "France" },
  { owner: "Kreienberg", round: 2, type: "team", name: "Belgium" },
  { owner: "Kreienberg", round: 3, type: "team", name: "Canada" },
  { owner: "Kreienberg", round: 4, type: "team", name: "Japan" },
  { owner: "Kreienberg", round: 5, type: "team", name: "Algeria" },
  { owner: "Kreienberg", round: 6, type: "team", name: "Scotland" },
  { owner: "Kreienberg", round: 7, type: "team", name: "Jordan" },
];

export const teams = [
  { name: "Mexico", group: "A", federation: "CONCACAF" },
  { name: "South Africa", group: "A", federation: "CAF" },
  { name: "South Korea", group: "A", federation: "AFC" },
  { name: "Czechia", group: "A", federation: "UEFA" },
  { name: "Canada", group: "B", federation: "CONCACAF" },
  { name: "Bosnia and Herzegovina", group: "B", federation: "UEFA" },
  { name: "Qatar", group: "B", federation: "AFC" },
  { name: "Switzerland", group: "B", federation: "UEFA" },
  { name: "Brazil", group: "C", federation: "CONMEBOL" },
  { name: "Morocco", group: "C", federation: "CAF" },
  { name: "Haiti", group: "C", federation: "CONCACAF" },
  { name: "Scotland", group: "C", federation: "UEFA" },
  { name: "United States", group: "D", federation: "CONCACAF" },
  { name: "Paraguay", group: "D", federation: "CONMEBOL" },
  { name: "Australia", group: "D", federation: "AFC" },
  { name: "Turkey", group: "D", federation: "UEFA" },
  { name: "Germany", group: "E", federation: "UEFA" },
  { name: "Curacao", group: "E", federation: "CONCACAF" },
  { name: "Ivory Coast", group: "E", federation: "CAF" },
  { name: "Ecuador", group: "E", federation: "CONMEBOL" },
  { name: "Netherlands", group: "F", federation: "UEFA" },
  { name: "Japan", group: "F", federation: "AFC" },
  { name: "Sweden", group: "F", federation: "UEFA" },
  { name: "Tunisia", group: "F", federation: "CAF" },
  { name: "Belgium", group: "G", federation: "UEFA" },
  { name: "Egypt", group: "G", federation: "CAF" },
  { name: "Iran", group: "G", federation: "AFC" },
  { name: "New Zealand", group: "G", federation: "OFC" },
  { name: "Spain", group: "H", federation: "UEFA" },
  { name: "Cape Verde", group: "H", federation: "CAF" },
  { name: "Saudi Arabia", group: "H", federation: "AFC" },
  { name: "Uruguay", group: "H", federation: "CONMEBOL" },
  { name: "France", group: "I", federation: "UEFA" },
  { name: "Senegal", group: "I", federation: "CAF" },
  { name: "Iraq", group: "I", federation: "AFC" },
  { name: "Norway", group: "I", federation: "UEFA" },
  { name: "Argentina", group: "J", federation: "CONMEBOL" },
  { name: "Algeria", group: "J", federation: "CAF" },
  { name: "Austria", group: "J", federation: "UEFA" },
  { name: "Jordan", group: "J", federation: "AFC" },
  { name: "Portugal", group: "K", federation: "UEFA" },
  { name: "DR Congo", group: "K", federation: "CAF" },
  { name: "Uzbekistan", group: "K", federation: "AFC" },
  { name: "Colombia", group: "K", federation: "CONMEBOL" },
  { name: "England", group: "L", federation: "UEFA" },
  { name: "Croatia", group: "L", federation: "UEFA" },
  { name: "Ghana", group: "L", federation: "CAF" },
  { name: "Panama", group: "L", federation: "CONCACAF" },
];

export const fixtures = [
  { id: "g-a-01", stage: "group", date: "2026-06-11", group: "A", venue: "Mexico City", home: "Mexico", away: "South Africa" },
  { id: "g-a-02", stage: "group", date: "2026-06-11", group: "A", venue: "Guadalajara", home: "South Korea", away: "Czechia" },
  { id: "g-b-01", stage: "group", date: "2026-06-12", group: "B", venue: "Toronto", home: "Canada", away: "Bosnia and Herzegovina" },
  { id: "g-d-01", stage: "group", date: "2026-06-12", group: "D", venue: "Los Angeles", home: "United States", away: "Paraguay" },
  { id: "g-c-01", stage: "group", date: "2026-06-13", group: "C", venue: "Boston", home: "Haiti", away: "Scotland" },
  { id: "g-d-02", stage: "group", date: "2026-06-13", group: "D", venue: "Vancouver", home: "Australia", away: "Turkey" },
  { id: "g-c-02", stage: "group", date: "2026-06-13", group: "C", venue: "New York/New Jersey", home: "Brazil", away: "Morocco" },
  { id: "g-b-02", stage: "group", date: "2026-06-13", group: "B", venue: "San Francisco Bay Area", home: "Qatar", away: "Switzerland" },
  { id: "g-e-01", stage: "group", date: "2026-06-14", group: "E", venue: "Philadelphia", home: "Ivory Coast", away: "Ecuador" },
  { id: "g-e-02", stage: "group", date: "2026-06-14", group: "E", venue: "Houston", home: "Germany", away: "Curacao" },
  { id: "g-f-01", stage: "group", date: "2026-06-14", group: "F", venue: "Dallas", home: "Netherlands", away: "Japan" },
  { id: "g-f-02", stage: "group", date: "2026-06-14", group: "F", venue: "Monterrey", home: "Sweden", away: "Tunisia" },
  { id: "g-h-01", stage: "group", date: "2026-06-15", group: "H", venue: "Miami", home: "Saudi Arabia", away: "Uruguay" },
  { id: "g-h-02", stage: "group", date: "2026-06-15", group: "H", venue: "Atlanta", home: "Spain", away: "Cape Verde" },
  { id: "g-g-01", stage: "group", date: "2026-06-15", group: "G", venue: "Los Angeles", home: "Iran", away: "New Zealand" },
  { id: "g-g-02", stage: "group", date: "2026-06-15", group: "G", venue: "Seattle", home: "Belgium", away: "Egypt" },
  { id: "g-i-01", stage: "group", date: "2026-06-16", group: "I", venue: "New York/New Jersey", home: "France", away: "Senegal" },
  { id: "g-i-02", stage: "group", date: "2026-06-16", group: "I", venue: "Boston", home: "Iraq", away: "Norway" },
  { id: "g-j-01", stage: "group", date: "2026-06-16", group: "J", venue: "Kansas City", home: "Argentina", away: "Algeria" },
  { id: "g-j-02", stage: "group", date: "2026-06-16", group: "J", venue: "San Francisco Bay Area", home: "Austria", away: "Jordan" },
  { id: "g-l-01", stage: "group", date: "2026-06-17", group: "L", venue: "Toronto", home: "Ghana", away: "Panama" },
  { id: "g-l-02", stage: "group", date: "2026-06-17", group: "L", venue: "Dallas", home: "England", away: "Croatia" },
  { id: "g-k-01", stage: "group", date: "2026-06-17", group: "K", venue: "Houston", home: "Portugal", away: "DR Congo" },
  { id: "g-k-02", stage: "group", date: "2026-06-17", group: "K", venue: "Mexico City", home: "Uzbekistan", away: "Colombia" },

  { id: "g-a-03", stage: "group", date: "2026-06-18", group: "A", venue: "Atlanta", home: "Czechia", away: "South Africa" },
  { id: "g-b-03", stage: "group", date: "2026-06-18", group: "B", venue: "Los Angeles", home: "Switzerland", away: "Bosnia and Herzegovina" },
  { id: "g-b-04", stage: "group", date: "2026-06-18", group: "B", venue: "Vancouver", home: "Canada", away: "Qatar" },
  { id: "g-a-04", stage: "group", date: "2026-06-18", group: "A", venue: "Guadalajara", home: "Mexico", away: "South Korea" },
  { id: "g-c-03", stage: "group", date: "2026-06-19", group: "C", venue: "Philadelphia", home: "Brazil", away: "Haiti" },
  { id: "g-c-04", stage: "group", date: "2026-06-19", group: "C", venue: "Boston", home: "Scotland", away: "Morocco" },
  { id: "g-d-03", stage: "group", date: "2026-06-19", group: "D", venue: "San Francisco Bay Area", home: "Turkey", away: "Paraguay" },
  { id: "g-d-04", stage: "group", date: "2026-06-19", group: "D", venue: "Seattle", home: "United States", away: "Australia" },
  { id: "g-e-03", stage: "group", date: "2026-06-20", group: "E", venue: "Toronto", home: "Germany", away: "Ivory Coast" },
  { id: "g-e-04", stage: "group", date: "2026-06-20", group: "E", venue: "Kansas City", home: "Ecuador", away: "Curacao" },
  { id: "g-f-03", stage: "group", date: "2026-06-20", group: "F", venue: "Houston", home: "Netherlands", away: "Sweden" },
  { id: "g-f-04", stage: "group", date: "2026-06-20", group: "F", venue: "Monterrey", home: "Tunisia", away: "Japan" },
  { id: "g-h-03", stage: "group", date: "2026-06-21", group: "H", venue: "Miami", home: "Uruguay", away: "Cape Verde" },
  { id: "g-h-04", stage: "group", date: "2026-06-21", group: "H", venue: "Atlanta", home: "Spain", away: "Saudi Arabia" },
  { id: "g-g-03", stage: "group", date: "2026-06-21", group: "G", venue: "Los Angeles", home: "Belgium", away: "Iran" },
  { id: "g-g-04", stage: "group", date: "2026-06-21", group: "G", venue: "Vancouver", home: "New Zealand", away: "Egypt" },
  { id: "g-i-03", stage: "group", date: "2026-06-22", group: "I", venue: "New York/New Jersey", home: "Norway", away: "Senegal" },
  { id: "g-i-04", stage: "group", date: "2026-06-22", group: "I", venue: "Philadelphia", home: "France", away: "Iraq" },
  { id: "g-j-03", stage: "group", date: "2026-06-22", group: "J", venue: "Dallas", home: "Argentina", away: "Austria" },
  { id: "g-j-04", stage: "group", date: "2026-06-22", group: "J", venue: "San Francisco Bay Area", home: "Jordan", away: "Algeria" },
  { id: "g-l-03", stage: "group", date: "2026-06-23", group: "L", venue: "Boston", home: "England", away: "Ghana" },
  { id: "g-l-04", stage: "group", date: "2026-06-23", group: "L", venue: "Toronto", home: "Panama", away: "Croatia" },
  { id: "g-k-03", stage: "group", date: "2026-06-23", group: "K", venue: "Houston", home: "Portugal", away: "Uzbekistan" },
  { id: "g-k-04", stage: "group", date: "2026-06-23", group: "K", venue: "Guadalajara", home: "Colombia", away: "DR Congo" },

  { id: "g-c-05", stage: "group", date: "2026-06-24", group: "C", venue: "Miami", home: "Scotland", away: "Brazil" },
  { id: "g-c-06", stage: "group", date: "2026-06-24", group: "C", venue: "Atlanta", home: "Morocco", away: "Haiti" },
  { id: "g-b-05", stage: "group", date: "2026-06-24", group: "B", venue: "Vancouver", home: "Switzerland", away: "Canada" },
  { id: "g-b-06", stage: "group", date: "2026-06-24", group: "B", venue: "Seattle", home: "Bosnia and Herzegovina", away: "Qatar" },
  { id: "g-a-05", stage: "group", date: "2026-06-24", group: "A", venue: "Mexico City", home: "Czechia", away: "Mexico" },
  { id: "g-a-06", stage: "group", date: "2026-06-24", group: "A", venue: "Monterrey", home: "South Africa", away: "South Korea" },
  { id: "g-e-05", stage: "group", date: "2026-06-25", group: "E", venue: "Philadelphia", home: "Curacao", away: "Ivory Coast" },
  { id: "g-e-06", stage: "group", date: "2026-06-25", group: "E", venue: "New York/New Jersey", home: "Ecuador", away: "Germany" },
  { id: "g-f-05", stage: "group", date: "2026-06-25", group: "F", venue: "Dallas", home: "Japan", away: "Sweden" },
  { id: "g-f-06", stage: "group", date: "2026-06-25", group: "F", venue: "Kansas City", home: "Tunisia", away: "Netherlands" },
  { id: "g-d-05", stage: "group", date: "2026-06-25", group: "D", venue: "Los Angeles", home: "Turkey", away: "United States" },
  { id: "g-d-06", stage: "group", date: "2026-06-25", group: "D", venue: "San Francisco Bay Area", home: "Paraguay", away: "Australia" },
  { id: "g-i-05", stage: "group", date: "2026-06-26", group: "I", venue: "Boston", home: "Norway", away: "France" },
  { id: "g-i-06", stage: "group", date: "2026-06-26", group: "I", venue: "Toronto", home: "Senegal", away: "Iraq" },
  { id: "g-g-05", stage: "group", date: "2026-06-26", group: "G", venue: "Seattle", home: "Egypt", away: "Iran" },
  { id: "g-g-06", stage: "group", date: "2026-06-26", group: "G", venue: "Vancouver", home: "New Zealand", away: "Belgium" },
  { id: "g-h-05", stage: "group", date: "2026-06-26", group: "H", venue: "Houston", home: "Cape Verde", away: "Saudi Arabia" },
  { id: "g-h-06", stage: "group", date: "2026-06-26", group: "H", venue: "Guadalajara", home: "Uruguay", away: "Spain" },
  { id: "g-l-05", stage: "group", date: "2026-06-27", group: "L", venue: "New York/New Jersey", home: "Panama", away: "England" },
  { id: "g-l-06", stage: "group", date: "2026-06-27", group: "L", venue: "Philadelphia", home: "Croatia", away: "Ghana" },
  { id: "g-j-05", stage: "group", date: "2026-06-27", group: "J", venue: "Kansas City", home: "Algeria", away: "Austria" },
  { id: "g-j-06", stage: "group", date: "2026-06-27", group: "J", venue: "Dallas", home: "Jordan", away: "Argentina" },
  { id: "g-k-05", stage: "group", date: "2026-06-27", group: "K", venue: "Miami", home: "Colombia", away: "Portugal" },
  { id: "g-k-06", stage: "group", date: "2026-06-27", group: "K", venue: "Atlanta", home: "DR Congo", away: "Uzbekistan" },
];

const groups = [...new Set(teams.map((team) => team.group))].sort();
const teamByName = new Map(teams.map((team) => [team.name, team]));
const teamOwnerByName = new Map(
  draftPicks.filter((pick) => pick.type === "team").map((pick) => [pick.name, pick.owner]),
);
const selectedPlayers = draftPicks
  .filter((pick) => pick.type === "player")
  .map((pick) => ({
    name: pick.name,
    team: pick.team,
    owner: pick.owner,
    round: pick.round,
  }));

export function createEmptyState() {
  return {
    version: 1,
    matches: {},
    customMatches: [],
    matchPlayerGoals: {},
    playerGoals: Object.fromEntries(selectedPlayers.map((player) => [player.name, 0])),
    awards: {
      goldenBall: "",
      goldenBoot: "",
      goldenGlove: "",
      bestYoungPlayer: "",
    },
  };
}

export function normalizeState(input = {}) {
  const empty = createEmptyState();
  const state = {
    version: 1,
    matches: { ...empty.matches, ...(input.matches ?? {}) },
    customMatches: Array.isArray(input.customMatches) ? input.customMatches : [],
    matchPlayerGoals: normalizeMatchPlayerGoals(input.matchPlayerGoals ?? {}),
    playerGoals: { ...empty.playerGoals, ...(input.playerGoals ?? {}) },
    awards: { ...empty.awards, ...(input.awards ?? {}) },
  };

  for (const player of selectedPlayers) {
    state.playerGoals[player.name] = numberOrZero(state.playerGoals[player.name]);
  }

  return state;
}

function normalizeMatchPlayerGoals(input) {
  const allowedPlayers = new Set(selectedPlayers.map((player) => player.name));
  const output = {};
  for (const [matchId, goalsByPlayer] of Object.entries(input ?? {})) {
    if (!goalsByPlayer || typeof goalsByPlayer !== "object") continue;
    const normalizedGoals = {};
    for (const [playerName, goals] of Object.entries(goalsByPlayer)) {
      if (!allowedPlayers.has(playerName)) continue;
      normalizedGoals[playerName] = numberOrZero(goals);
    }
    if (Object.keys(normalizedGoals).length) output[matchId] = normalizedGoals;
  }
  return output;
}

export function getOwnerForTeam(team) {
  return teamOwnerByName.get(team) ?? "";
}

export function getTeam(team) {
  return teamByName.get(team) ?? null;
}

export function getSelectedPlayers() {
  return selectedPlayers.map((player) => ({ ...player }));
}

export function getPlayerGoalTotals(state = createEmptyState()) {
  const normalized = normalizeState(state);
  const totals = Object.fromEntries(selectedPlayers.map((player) => [player.name, numberOrZero(normalized.playerGoals[player.name])]));

  for (const goalsByPlayer of Object.values(normalized.matchPlayerGoals)) {
    for (const [playerName, goals] of Object.entries(goalsByPlayer)) {
      if (playerName in totals) totals[playerName] += numberOrZero(goals);
    }
  }

  return totals;
}

export function getTeamsByGroup(group) {
  return teams.filter((team) => team.group === group).map((team) => team.name);
}

export function getAllMatches(state = createEmptyState()) {
  const normalized = normalizeState(state);
  const official = fixtures.map((fixture) => ({
    ...fixture,
    ...(normalized.matches[fixture.id] ?? {}),
  }));
  const custom = normalized.customMatches.map((match, index) => ({
    id: match.id || `custom-${index + 1}`,
    date: match.date || "",
    stage: match.stage || "r32",
    group: match.group || "",
    venue: match.venue || "Knockout",
    home: match.home || "",
    away: match.away || "",
    homeScore: match.homeScore,
    awayScore: match.awayScore,
    status: match.status || "scheduled",
    wentToPens: Boolean(match.wentToPens),
    penaltyWinner: match.penaltyWinner || "",
  }));

  return [...official, ...custom].sort((a, b) => {
    if (a.date !== b.date) return String(a.date).localeCompare(String(b.date));
    return String(a.id).localeCompare(String(b.id));
  });
}

export function isCompletedMatch(match) {
  return match.status === "final" && hasScore(match.homeScore) && hasScore(match.awayScore);
}

export function getMatchWinner(match) {
  if (!isCompletedMatch(match)) return "";
  const homeScore = Number(match.homeScore);
  const awayScore = Number(match.awayScore);
  if (homeScore > awayScore) return match.home;
  if (awayScore > homeScore) return match.away;
  return match.wentToPens ? match.penaltyWinner : "";
}

export function getMatchLoser(match) {
  const winner = getMatchWinner(match);
  if (!winner) return "";
  return winner === match.home ? match.away : match.home;
}

export function getGroupStandings(state = createEmptyState()) {
  const standings = {};
  const records = Object.fromEntries(
    teams.map((team) => [
      team.name,
      {
        team: team.name,
        group: team.group,
        owner: getOwnerForTeam(team.name),
        played: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        gf: 0,
        ga: 0,
        gd: 0,
        points: 0,
      },
    ]),
  );

  for (const match of getAllMatches(state)) {
    if (match.stage !== "group" || !isCompletedMatch(match)) continue;
    const home = records[match.home];
    const away = records[match.away];
    if (!home || !away) continue;

    const homeScore = Number(match.homeScore);
    const awayScore = Number(match.awayScore);
    home.played += 1;
    away.played += 1;
    home.gf += homeScore;
    home.ga += awayScore;
    away.gf += awayScore;
    away.ga += homeScore;

    if (homeScore > awayScore) {
      home.wins += 1;
      home.points += 3;
      away.losses += 1;
    } else if (awayScore > homeScore) {
      away.wins += 1;
      away.points += 3;
      home.losses += 1;
    } else {
      home.draws += 1;
      away.draws += 1;
      home.points += 1;
      away.points += 1;
    }
  }

  for (const record of Object.values(records)) {
    record.gd = record.gf - record.ga;
  }

  for (const group of groups) {
    standings[group] = Object.values(records)
      .filter((record) => record.group === group)
      .sort(compareGroupRecords)
      .map((record, index) => ({ ...record, rank: index + 1 }));
  }

  return standings;
}

export function isGroupComplete(state, group) {
  return fixtures
    .filter((fixture) => fixture.group === group)
    .every((fixture) => isCompletedMatch({ ...fixture, ...(normalizeState(state).matches[fixture.id] ?? {}) }));
}

export function areAllGroupsComplete(state) {
  return groups.every((group) => isGroupComplete(state, group));
}

export function getQualifiedTeams(state = createEmptyState()) {
  const standings = getGroupStandings(state);
  const qualified = new Set();

  for (const group of groups) {
    if (!isGroupComplete(state, group)) continue;
    qualified.add(standings[group][0].team);
    qualified.add(standings[group][1].team);
  }

  if (areAllGroupsComplete(state)) {
    getThirdPlaceTable(state)
      .slice(0, 8)
      .forEach((record) => qualified.add(record.team));
  }

  return qualified;
}

export function getThirdPlaceTable(state = createEmptyState()) {
  const standings = getGroupStandings(state);
  return groups
    .filter((group) => isGroupComplete(state, group))
    .map((group) => standings[group][2])
    .filter(Boolean)
    .sort(compareGroupRecords);
}

export function calculateScores(inputState = createEmptyState()) {
  const state = normalizeState(inputState);
  const scoreRows = new Map(owners.map((owner) => [owner, { owner, score: 0, details: [] }]));
  const add = (owner, points, reason, subject = "", category = "") => {
    if (!owner || !Number.isFinite(points) || points === 0) return;
    const row = scoreRows.get(owner);
    row.score += points;
    row.details.push({ points, reason, subject, category });
  };

  for (const match of getAllMatches(state)) {
    if (!isCompletedMatch(match)) continue;
    const winner = getMatchWinner(match);
    const loser = getMatchLoser(match);
    const homeScore = Number(match.homeScore);
    const awayScore = Number(match.awayScore);
    const margin = Math.abs(homeScore - awayScore);

    if (winner && margin >= 2) {
      add(getOwnerForTeam(winner), rules.allEvents.winByTwo, `${winner} won by 2+`, match.id, "All Events");
      add(getOwnerForTeam(loser), rules.allEvents.loseByTwo, `${loser} lost by 2+`, match.id, "All Events");
    }

    if (match.stage === "group") {
      if (homeScore > awayScore) {
        add(getOwnerForTeam(match.home), rules.groupStage.win, `${match.home} group win`, match.id, "Group Stage");
      } else if (awayScore > homeScore) {
        add(getOwnerForTeam(match.away), rules.groupStage.win, `${match.away} group win`, match.id, "Group Stage");
      } else {
        add(getOwnerForTeam(match.home), rules.groupStage.draw, `${match.home} group draw`, match.id, "Group Stage");
        add(getOwnerForTeam(match.away), rules.groupStage.draw, `${match.away} group draw`, match.id, "Group Stage");
      }
    } else if (winner) {
      if (match.stage === "final") {
        add(getOwnerForTeam(winner), rules.knockoutStage.final, `${winner} won the World Cup`, match.id, "Knockout Stage");
      } else if (rules.knockoutStage[match.stage]) {
        add(
          getOwnerForTeam(winner),
          rules.knockoutStage[match.stage],
          `${winner} won ${stageLabels[match.stage]}`,
          match.id,
          "Knockout Stage",
        );
      }
    }

    if (winner && match.wentToPens) {
      add(getOwnerForTeam(winner), rules.allEvents.penaltyWin, `${winner} won on penalties`, match.id, "All Events");
    }

    if (winner) {
      for (const player of selectedPlayers.filter((entry) => entry.team === winner)) {
        add(
          player.owner,
          rules.individualAwards.selectedPlayersTeamWins,
          `${player.name}'s team won`,
          match.id,
          "Individual Awards",
        );
      }
    }
  }

  scoreGroupBonuses(state, add);
  scorePlayerBonuses(state, add);
  scoreNationBonuses(state, add);

  return {
    ownerTotals: [...scoreRows.values()].sort((a, b) => b.score - a.score || a.owner.localeCompare(b.owner)),
    groupStandings: getGroupStandings(state),
    qualifiedTeams: [...getQualifiedTeams(state)].sort(),
    teamProgress: getTeamProgress(state),
  };
}

function scoreGroupBonuses(state, add) {
  const standings = getGroupStandings(state);

  for (const group of groups) {
    if (!isGroupComplete(state, group)) continue;
    const ranked = standings[group];
    const groupWinner = ranked[0]?.team;
    if (groupWinner) {
      add(getOwnerForTeam(groupWinner), rules.groupStage.winGroup, `${groupWinner} won Group ${group}`, groupWinner, "Group Stage");
    }

    ranked.slice(0, 2).forEach((record) => {
      add(
        getOwnerForTeam(record.team),
        rules.groupStage.advance,
        `${record.team} advanced from Group ${group}`,
        record.team,
        "Group Stage",
      );
    });
  }

  if (!areAllGroupsComplete(state)) return;

  getThirdPlaceTable(state)
    .slice(0, 8)
    .forEach((record) => {
      add(
        getOwnerForTeam(record.team),
        rules.groupStage.advance,
        `${record.team} advanced as third-place team`,
        record.team,
        "Group Stage",
      );
    });

  const allRecords = Object.values(standings).flat();
  allRecords
    .filter((record) => record.gf === 0)
    .forEach((record) => {
      add(
        getOwnerForTeam(record.team),
        rules.groupStage.scorelessGroup,
        `${record.team} scoreless in group`,
        record.team,
        "Group Stage",
      );
    });

  [...allRecords]
    .sort((a, b) => b.gd - a.gd || b.gf - a.gf || b.points - a.points || a.team.localeCompare(b.team))
    .slice(0, 4)
    .forEach((record) => {
      add(
        getOwnerForTeam(record.team),
        rules.groupStage.bestFourGoalDifference,
        `${record.team} top-4 group goal difference`,
        record.team,
        "Group Stage",
      );
    });

  [...allRecords]
    .sort((a, b) => a.gd - b.gd || a.gf - b.gf || a.points - b.points || a.team.localeCompare(b.team))
    .slice(0, 4)
    .forEach((record) => {
      add(
        getOwnerForTeam(record.team),
        rules.groupStage.worstFourGoalDifference,
        `${record.team} bottom-4 group goal difference`,
        record.team,
        "Group Stage",
      );
    });
}

function scorePlayerBonuses(state, add) {
  const playerMap = new Map(selectedPlayers.map((player) => [player.name, player]));
  const playerGoalTotals = getPlayerGoalTotals(state);

  for (const player of selectedPlayers) {
    const goals = numberOrZero(playerGoalTotals[player.name]);
    if (goals > 0) {
      add(
        player.owner,
        goals * rules.individualAwards.selectedPlayerGoal,
        `${player.name} goals`,
        player.name,
        "Individual Awards",
      );
    }
  }

  const maxGoals = Math.max(0, ...selectedPlayers.map((player) => numberOrZero(playerGoalTotals[player.name])));
  if (maxGoals > 0) {
    selectedPlayers
      .filter((player) => numberOrZero(playerGoalTotals[player.name]) === maxGoals)
      .forEach((player) => {
        add(
          player.owner,
          rules.individualAwards.selectedPlayerMostGoals,
          "Top selected-player scorer",
          player.name,
          "Individual Awards",
        );
      });
  }

  for (const [awardKey, winnerName] of Object.entries(state.awards)) {
    if (!winnerName || winnerName === "Other") continue;
    const player = playerMap.get(winnerName);
    if (!player) continue;
    const awardLabel = awardLabels[awardKey] ?? awardKey;

    add(
      player.owner,
      rules.individualAwards.selectedPlayerAward,
      `${player.name} ${awardLabel}`,
      player.name,
      "Individual Awards",
    );
    add(
      getOwnerForTeam(player.team),
      rules.individualAwards.selectedTeamHasAwardWinner,
      `${player.team} has ${awardLabel} winner`,
      player.team,
      "Individual Awards",
    );
  }
}

export function getTeamProgress(state = createEmptyState()) {
  const progress = Object.fromEntries(
    teams.map((team) => [
      team.name,
      {
        team: team.name,
        group: team.group,
        federation: team.federation,
        rank: 0,
        alive: true,
        label: "Group stage",
      },
    ]),
  );

  const allGroupsComplete = areAllGroupsComplete(state);
  const qualified = getQualifiedTeams(state);
  const standings = getGroupStandings(state);

  for (const group of groups) {
    if (!isGroupComplete(state, group)) continue;
    for (const record of standings[group]) {
      if (qualified.has(record.team) || (!allGroupsComplete && record.rank === 3)) {
        progress[record.team].rank = 1;
        progress[record.team].alive = true;
        progress[record.team].label = record.rank === 3 ? "Third-place bubble" : "Advanced";
      } else {
        progress[record.team].rank = 0;
        progress[record.team].alive = false;
        progress[record.team].label = "Group exit";
      }
    }
  }

  const stageRank = { r32: 1, r16: 2, qf: 3, sf: 4, final: 5 };
  for (const match of getAllMatches(state)) {
    if (match.stage === "group" || !isCompletedMatch(match)) continue;
    const winner = getMatchWinner(match);
    const loser = getMatchLoser(match);
    const rank = stageRank[match.stage] ?? 1;
    if (match.home && progress[match.home]) {
      progress[match.home].rank = Math.max(progress[match.home].rank, rank);
      progress[match.home].label = stageLabels[match.stage] ?? "Knockout";
    }
    if (match.away && progress[match.away]) {
      progress[match.away].rank = Math.max(progress[match.away].rank, rank);
      progress[match.away].label = stageLabels[match.stage] ?? "Knockout";
    }
    if (loser && progress[loser]) {
      progress[loser].alive = false;
      progress[loser].label = `Lost ${stageLabels[match.stage] ?? "knockout"}`;
    }
    if (winner && progress[winner]) {
      progress[winner].rank = match.stage === "final" ? 6 : Math.max(progress[winner].rank, rank + 1);
      progress[winner].alive = match.stage !== "final";
      progress[winner].label = match.stage === "final" ? "Champion" : "Advanced";
    }
  }

  return progress;
}

function scoreNationBonuses(state, add) {
  if (!areAllGroupsComplete(state)) return;

  const progress = getTeamProgress(state);
  for (const group of groups) {
    awardLastStanding(
      getTeamsByGroup(group),
      progress,
      rules.nationPoints.lastFromGroup,
      (team) => `${team} last standing from Group ${group}`,
      add,
      "Nation Points",
    );
  }

  const federations = [...new Set(teams.map((team) => team.federation))].sort();
  for (const federation of federations) {
    awardLastStanding(
      teams.filter((team) => team.federation === federation).map((team) => team.name),
      progress,
      rules.nationPoints.lastFromFederation,
      (team) => `${team} last standing from ${federation}`,
      add,
      "Nation Points",
    );
  }
}

function awardLastStanding(teamNames, progress, points, reasonForTeam, add, category) {
  const rows = teamNames.map((team) => progress[team]).filter(Boolean);
  const liveRows = rows.filter((row) => row.alive);
  if (liveRows.length > 1) return;

  const topRank = Math.max(...rows.map((row) => row.rank));
  const candidates = rows.filter((row) => row.rank === topRank);
  if (candidates.length !== 1) return;
  if (liveRows.length === 1 && liveRows[0].team !== candidates[0].team) return;

  add(getOwnerForTeam(candidates[0].team), points, reasonForTeam(candidates[0].team), candidates[0].team, category);
}

export function getMatchImpact(match, state = createEmptyState()) {
  const selectedMatch = { ...match, ...(state.matches?.[match.id] ?? {}) };
  const rows = [
    {
      label: selectedMatch.home,
      owner: getOwnerForTeam(selectedMatch.home),
      playerOwners: selectedPlayers.filter((player) => player.team === selectedMatch.home),
    },
    {
      label: selectedMatch.away,
      owner: getOwnerForTeam(selectedMatch.away),
      playerOwners: selectedPlayers.filter((player) => player.team === selectedMatch.away),
    },
  ];
  const possible = [];
  if (selectedMatch.stage === "group") {
    possible.push(`${selectedMatch.home} win: team owner +3, plus +2 if margin is 2+`);
    possible.push(`Draw: both team owners +1`);
    possible.push(`${selectedMatch.away} win: team owner +3, plus +2 if margin is 2+`);
  } else {
    const stagePoints = selectedMatch.stage === "final" ? 10 : rules.knockoutStage[selectedMatch.stage] || 0;
    possible.push(`Winner: team owner +${stagePoints}${selectedMatch.stage === "final" ? " for the World Cup" : ` for ${stageLabels[selectedMatch.stage]}`}`);
    possible.push("Penalty winner: team owner +1");
    possible.push("2+ goal margin: winner owner +2, loser owner -1");
  }

  const playerRows = rows.flatMap((row) =>
    row.playerOwners.map((player) => `${player.owner} gets +2 whenever ${player.name}'s ${player.team} wins`),
  );

  return { rows, possible, playerRows };
}

function compareGroupRecords(a, b) {
  return (
    b.points - a.points ||
    b.gd - a.gd ||
    b.gf - a.gf ||
    a.ga - b.ga ||
    a.team.localeCompare(b.team)
  );
}

function numberOrZero(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

function hasScore(value) {
  if (value === "" || value === null || value === undefined) return false;
  return Number.isFinite(Number(value));
}
