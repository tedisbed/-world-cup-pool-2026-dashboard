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

export function getRuleGroups() {
  return [
    {
      title: "Match Results",
      note: "Applies across group and knockout matches.",
      rules: [
        { points: rules.allEvents.winByTwo, label: "Win any match by 2+" },
        { points: rules.allEvents.loseByTwo, label: "Lose any match by 2+" },
        { points: rules.allEvents.penaltyWin, label: "Win on penalties" },
      ],
    },
    {
      title: "Group Stage",
      note: "Points tied to group-match results and final group standings.",
      rules: [
        { points: rules.groupStage.win, label: "Group-stage win" },
        { points: rules.groupStage.draw, label: "Group-stage draw" },
        { points: rules.groupStage.winGroup, label: "Win group" },
        { points: rules.groupStage.advance, label: "Advance to knockout" },
        { points: rules.groupStage.bestFourGoalDifference, label: "Top-4 group GD" },
        { points: rules.groupStage.worstFourGoalDifference, label: "Bottom-4 group GD" },
        { points: rules.groupStage.scorelessGroup, label: "Scoreless group stage" },
      ],
    },
    {
      title: "Knockout Stage",
      note: "Points for each drafted team win by round.",
      rules: [
        { points: rules.knockoutStage.r32, label: "Win Round of 32" },
        { points: rules.knockoutStage.r16, label: "Win Round of 16" },
        { points: rules.knockoutStage.qf, label: "Win quarterfinal" },
        { points: rules.knockoutStage.sf, label: "Win semifinal" },
        { points: rules.knockoutStage.final, label: "Win World Cup" },
      ],
    },
    {
      title: "Selected Players",
      note: "Ways drafted individual players can add points.",
      rules: [
        { points: rules.individualAwards.selectedPlayerGoal, label: "Selected-player goal" },
        { points: rules.individualAwards.selectedPlayerMostGoals, label: "Top selected-player scorer" },
        { points: rules.individualAwards.selectedPlayersTeamWins, label: "Selected player's team wins" },
      ],
    },
    {
      title: "Tournament Awards",
      note: "Award results for drafted players and drafted teams.",
      rules: [
        { points: rules.individualAwards.selectedPlayerAward, label: "Selected-player award" },
        { points: rules.individualAwards.selectedTeamHasAwardWinner, label: "Team has award winner" },
      ],
    },
    {
      title: "Survivor Points",
      note: "Late-tournament bonuses tied to country and federation performance.",
      rules: [
        { points: rules.nationPoints.lastFromGroup, label: "Last from group" },
        { points: rules.nationPoints.lastFromFederation, label: "Last from federation" },
      ],
    },
  ];
}

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
  { name: "Mexico", group: "A", federation: "CONCACAF", fifaRank: 14 },
  { name: "South Africa", group: "A", federation: "CAF", fifaRank: 61 },
  { name: "South Korea", group: "A", federation: "AFC", fifaRank: 22 },
  { name: "Czechia", group: "A", federation: "UEFA", fifaRank: 44 },
  { name: "Canada", group: "B", federation: "CONCACAF", fifaRank: 27 },
  { name: "Bosnia and Herzegovina", group: "B", federation: "UEFA", fifaRank: 71 },
  { name: "Qatar", group: "B", federation: "AFC", fifaRank: 51 },
  { name: "Switzerland", group: "B", federation: "UEFA", fifaRank: 19 },
  { name: "Brazil", group: "C", federation: "CONMEBOL", fifaRank: 6 },
  { name: "Morocco", group: "C", federation: "CAF", fifaRank: 7 },
  { name: "Haiti", group: "C", federation: "CONCACAF", fifaRank: 84 },
  { name: "Scotland", group: "C", federation: "UEFA", fifaRank: 36 },
  { name: "United States", group: "D", federation: "CONCACAF", fifaRank: 17 },
  { name: "Paraguay", group: "D", federation: "CONMEBOL", fifaRank: 39 },
  { name: "Australia", group: "D", federation: "AFC", fifaRank: 26 },
  { name: "Turkey", group: "D", federation: "UEFA", fifaRank: 25 },
  { name: "Germany", group: "E", federation: "UEFA", fifaRank: 10 },
  { name: "Curacao", group: "E", federation: "CONCACAF", fifaRank: 82 },
  { name: "Ivory Coast", group: "E", federation: "CAF", fifaRank: 42 },
  { name: "Ecuador", group: "E", federation: "CONMEBOL", fifaRank: 23 },
  { name: "Netherlands", group: "F", federation: "UEFA", fifaRank: 8 },
  { name: "Japan", group: "F", federation: "AFC", fifaRank: 18 },
  { name: "Sweden", group: "F", federation: "UEFA", fifaRank: 43 },
  { name: "Tunisia", group: "F", federation: "CAF", fifaRank: 40 },
  { name: "Belgium", group: "G", federation: "UEFA", fifaRank: 9 },
  { name: "Egypt", group: "G", federation: "CAF", fifaRank: 34 },
  { name: "Iran", group: "G", federation: "AFC", fifaRank: 20 },
  { name: "New Zealand", group: "G", federation: "OFC", fifaRank: 86 },
  { name: "Spain", group: "H", federation: "UEFA", fifaRank: 2 },
  { name: "Cape Verde", group: "H", federation: "CAF", fifaRank: 68 },
  { name: "Saudi Arabia", group: "H", federation: "AFC", fifaRank: 60 },
  { name: "Uruguay", group: "H", federation: "CONMEBOL", fifaRank: 16 },
  { name: "France", group: "I", federation: "UEFA", fifaRank: 3 },
  { name: "Senegal", group: "I", federation: "CAF", fifaRank: 15 },
  { name: "Iraq", group: "I", federation: "AFC", fifaRank: 58 },
  { name: "Norway", group: "I", federation: "UEFA", fifaRank: 29 },
  { name: "Argentina", group: "J", federation: "CONMEBOL", fifaRank: 1 },
  { name: "Algeria", group: "J", federation: "CAF", fifaRank: 35 },
  { name: "Austria", group: "J", federation: "UEFA", fifaRank: 24 },
  { name: "Jordan", group: "J", federation: "AFC", fifaRank: 66 },
  { name: "Portugal", group: "K", federation: "UEFA", fifaRank: 5 },
  { name: "DR Congo", group: "K", federation: "CAF", fifaRank: 56 },
  { name: "Uzbekistan", group: "K", federation: "AFC", fifaRank: 50 },
  { name: "Colombia", group: "K", federation: "CONMEBOL", fifaRank: 13 },
  { name: "England", group: "L", federation: "UEFA", fifaRank: 4 },
  { name: "Croatia", group: "L", federation: "UEFA", fifaRank: 11 },
  { name: "Ghana", group: "L", federation: "CAF", fifaRank: 72 },
  { name: "Panama", group: "L", federation: "CONCACAF", fifaRank: 30 },
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

export const knockoutBracketTemplate = [
  {
    stage: "r32",
    title: "Round of 32",
    matches: [
      { id: "m73", slots: [{ type: "group", group: "A", rank: 2 }, { type: "group", group: "B", rank: 2 }] },
      { id: "m74", slots: [{ type: "group", group: "E", rank: 1 }, { type: "third", groups: ["A", "B", "C", "D", "F"] }] },
      { id: "m75", slots: [{ type: "group", group: "F", rank: 1 }, { type: "group", group: "C", rank: 2 }] },
      { id: "m76", slots: [{ type: "group", group: "C", rank: 1 }, { type: "group", group: "F", rank: 2 }] },
      { id: "m77", slots: [{ type: "group", group: "I", rank: 1 }, { type: "third", groups: ["C", "D", "F", "G", "H"] }] },
      { id: "m78", slots: [{ type: "group", group: "E", rank: 2 }, { type: "group", group: "I", rank: 2 }] },
      { id: "m79", slots: [{ type: "group", group: "A", rank: 1 }, { type: "third", groups: ["C", "E", "F", "H", "I"] }] },
      { id: "m80", slots: [{ type: "group", group: "L", rank: 1 }, { type: "third", groups: ["E", "H", "I", "J", "K"] }] },
      { id: "m81", slots: [{ type: "group", group: "D", rank: 1 }, { type: "third", groups: ["B", "E", "F", "I", "J"] }] },
      { id: "m82", slots: [{ type: "group", group: "G", rank: 1 }, { type: "third", groups: ["A", "E", "H", "I", "J"] }] },
      { id: "m83", slots: [{ type: "group", group: "K", rank: 2 }, { type: "group", group: "L", rank: 2 }] },
      { id: "m84", slots: [{ type: "group", group: "H", rank: 1 }, { type: "group", group: "J", rank: 2 }] },
      { id: "m85", slots: [{ type: "group", group: "B", rank: 1 }, { type: "third", groups: ["E", "F", "G", "I", "J"] }] },
      { id: "m86", slots: [{ type: "group", group: "J", rank: 1 }, { type: "group", group: "H", rank: 2 }] },
      { id: "m87", slots: [{ type: "group", group: "K", rank: 1 }, { type: "third", groups: ["D", "E", "I", "J", "L"] }] },
      { id: "m88", slots: [{ type: "group", group: "D", rank: 2 }, { type: "group", group: "G", rank: 2 }] },
    ],
  },
  {
    stage: "r16",
    title: "Round of 16",
    matches: [
      { id: "m89", slots: [{ type: "winner", matchId: "m73" }, { type: "winner", matchId: "m75" }] },
      { id: "m90", slots: [{ type: "winner", matchId: "m74" }, { type: "winner", matchId: "m77" }] },
      { id: "m91", slots: [{ type: "winner", matchId: "m76" }, { type: "winner", matchId: "m78" }] },
      { id: "m92", slots: [{ type: "winner", matchId: "m79" }, { type: "winner", matchId: "m80" }] },
      { id: "m93", slots: [{ type: "winner", matchId: "m83" }, { type: "winner", matchId: "m84" }] },
      { id: "m94", slots: [{ type: "winner", matchId: "m81" }, { type: "winner", matchId: "m82" }] },
      { id: "m95", slots: [{ type: "winner", matchId: "m86" }, { type: "winner", matchId: "m88" }] },
      { id: "m96", slots: [{ type: "winner", matchId: "m85" }, { type: "winner", matchId: "m87" }] },
    ],
  },
  {
    stage: "qf",
    title: "Quarterfinals",
    matches: [
      { id: "m97", slots: [{ type: "winner", matchId: "m89" }, { type: "winner", matchId: "m90" }] },
      { id: "m98", slots: [{ type: "winner", matchId: "m93" }, { type: "winner", matchId: "m94" }] },
      { id: "m99", slots: [{ type: "winner", matchId: "m91" }, { type: "winner", matchId: "m92" }] },
      { id: "m100", slots: [{ type: "winner", matchId: "m95" }, { type: "winner", matchId: "m96" }] },
    ],
  },
  {
    stage: "sf",
    title: "Semifinals",
    matches: [
      { id: "m101", slots: [{ type: "winner", matchId: "m97" }, { type: "winner", matchId: "m98" }] },
      { id: "m102", slots: [{ type: "winner", matchId: "m99" }, { type: "winner", matchId: "m100" }] },
    ],
  },
  {
    stage: "final",
    title: "Final",
    matches: [{ id: "m104", slots: [{ type: "winner", matchId: "m101" }, { type: "winner", matchId: "m102" }] }],
  },
];

const knockoutMatchDates = {
  m73: "2026-06-28",
  m74: "2026-06-29",
  m75: "2026-06-29",
  m76: "2026-06-29",
  m77: "2026-06-30",
  m78: "2026-06-30",
  m79: "2026-06-30",
  m80: "2026-07-01",
  m81: "2026-07-01",
  m82: "2026-07-01",
  m83: "2026-07-02",
  m84: "2026-07-02",
  m85: "2026-07-02",
  m86: "2026-07-03",
  m87: "2026-07-03",
  m88: "2026-07-03",
  m89: "2026-07-04",
  m90: "2026-07-04",
  m91: "2026-07-05",
  m92: "2026-07-05",
  m93: "2026-07-06",
  m94: "2026-07-06",
  m95: "2026-07-07",
  m96: "2026-07-07",
  m97: "2026-07-09",
  m98: "2026-07-10",
  m99: "2026-07-11",
  m100: "2026-07-11",
  m101: "2026-07-14",
  m102: "2026-07-15",
  m104: "2026-07-19",
};

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

export function getMatchesByDate(state = createEmptyState()) {
  const groupsByDate = new Map();
  for (const match of getAllMatches(state)) {
    const date = match.date || "";
    if (!groupsByDate.has(date)) groupsByDate.set(date, []);
    groupsByDate.get(date).push(match);
  }

  return [...groupsByDate.entries()].map(([date, matches]) => ({ date, matches }));
}

export function getMatchesForDate(state = createEmptyState(), date = "") {
  return getAllMatches(state).filter((match) => match.date === date);
}

export function getKnockoutBracket(state = createEmptyState()) {
  const normalized = normalizeState(state);
  const standings = getGroupStandings(normalized);
  const advancementStatuses = getGroupAdvancementStatuses(normalized);
  const matchWinners = getBracketMatchWinners(normalized);
  const rounds = [];

  for (const round of knockoutBracketTemplate) {
    rounds.push({
      ...round,
      matches: round.matches.map((match) => ({
        ...resolveBracketMatch(match, round.stage, normalized, standings, matchWinners, advancementStatuses),
      })),
    });
  }

  return { rounds };
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
        fairPlay: team.fairPlay ?? 0,
        fifaRank: team.fifaRank ?? 999,
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
    const groupRecords = Object.values(records).filter((record) => record.group === group);
    const groupMatches = getAllMatches(state).filter((match) => match.stage === "group" && match.group === group && isCompletedMatch(match));
    standings[group] = rankGroupRecords(groupRecords, groupMatches)
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

export function getProjectedThirdPlaceTable(state = createEmptyState()) {
  const standings = getGroupStandings(state);
  return groups
    .map((group) => standings[group][2])
    .filter(Boolean)
    .sort(compareGroupRecords);
}

export function getProjectedGroupBubbleTable(state = createEmptyState()) {
  const standings = getGroupStandings(state);
  const thirdPlaceRows = getProjectedThirdPlaceTable(state).map((row, index) => ({
    ...row,
    groupRank: 3,
    thirdPlaceRank: index + 1,
  }));
  const fourthPlaceRows = groups
    .map((group) => standings[group][3])
    .filter(Boolean)
    .sort(compareGroupRecords)
    .map((row) => ({
      ...row,
      groupRank: 4,
      thirdPlaceRank: 0,
    }));

  return [...thirdPlaceRows, ...fourthPlaceRows];
}

export function getGroupAdvancementStatuses(state = createEmptyState()) {
  const standings = getGroupStandings(state);
  const qualified = getQualifiedTeams(state);
  const allGroupsComplete = areAllGroupsComplete(state);
  const projectedThirdPlaceTeams = new Set(getProjectedThirdPlaceTable(state).slice(0, 8).map((row) => row.team));
  const statuses = {};

  for (const group of groups) {
    const groupRows = standings[group] ?? [];
    const groupComplete = isGroupComplete(state, group);

    for (const row of groupRows) {
      statuses[row.team] = groupAdvancementStatus(row, groupRows, {
        allGroupsComplete,
        groupComplete,
        projectedThirdPlaceTeams,
        qualified,
      });
    }
  }

  return statuses;
}

function groupAdvancementStatus(row, groupRows, { allGroupsComplete, groupComplete, projectedThirdPlaceTeams, qualified }) {
  if (qualified.has(row.team)) {
    return { label: row.rank === 3 ? "CONF 3RD" : "CONFIRMED", tone: "confirmed", confirmed: true, eliminated: false, projected: true };
  }

  if (groupComplete) {
    if (row.rank === 3 && !allGroupsComplete) {
      return { label: "3RD BUBBLE", tone: "bubble", confirmed: false, eliminated: false, projected: true };
    }
    return { label: row.rank === 3 ? "CONF OUT 3RD" : "CONF OUT", tone: "out", confirmed: true, eliminated: true, projected: false };
  }

  if (isConfirmedTopTwo(row, groupRows)) {
    return { label: "CONFIRMED", tone: "confirmed", confirmed: true, eliminated: false, projected: true };
  }

  if (isConfirmedOutOfTopThree(row, groupRows)) {
    return { label: "CONF OUT", tone: "out", confirmed: true, eliminated: true, projected: false };
  }

  if (row.rank <= 2) {
    return { label: "PROJECTED", tone: "advancing", confirmed: false, eliminated: false, projected: true };
  }

  if (row.rank === 3) {
    return projectedThirdPlaceTeams.has(row.team)
      ? { label: "PROJ 3RD", tone: "bubble", confirmed: false, eliminated: false, projected: true }
      : { label: "PROJ OUT 3RD", tone: "out", confirmed: false, eliminated: false, projected: false };
  }

  return { label: "PROJ OUT", tone: "out", confirmed: false, eliminated: false, projected: false };
}

function isConfirmedTopTwo(row, groupRows) {
  const teamsThatCanCatch = groupRows.filter((other) => other.team !== row.team && maxGroupPoints(other) >= row.points);
  return teamsThatCanCatch.length <= 1;
}

function isConfirmedOutOfTopThree(row, groupRows) {
  const rowMax = maxGroupPoints(row);
  const teamsAlreadyBeyondReach = groupRows.filter((other) => other.team !== row.team && other.points > rowMax);
  return teamsAlreadyBeyondReach.length >= 3;
}

function maxGroupPoints(row) {
  return row.points + Math.max(0, 3 - row.played) * 3;
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

export function getRecentPointEvents(inputState = createEmptyState(), limit = 20) {
  const state = normalizeState(inputState);
  const matchesById = new Map(getAllMatches(state).map((match) => [match.id, match]));
  return calculateScores(state).ownerTotals
    .flatMap((row) =>
      row.details.map((detail) => {
        const match = matchesById.get(detail.subject);
        return {
          owner: row.owner,
          points: detail.points,
          reason: detail.reason,
          category: detail.category,
          subject: detail.subject,
          date: match?.date ?? "",
          match: match ? `${match.home} vs ${match.away}` : "",
        };
      }),
    )
    .sort((a, b) => String(b.date).localeCompare(String(a.date)) || Math.abs(b.points) - Math.abs(a.points) || a.owner.localeCompare(b.owner))
    .slice(0, limit);
}

export function getOwnerOpportunityRows(inputState = createEmptyState()) {
  const state = normalizeState(inputState);
  const scoreRows = new Map(calculateScores(state).ownerTotals.map((row) => [row.owner, row.score]));
  const rows = new Map(
    owners.map((owner) => [
      owner,
      {
        owner,
        current: scoreRows.get(owner) ?? 0,
        teamOpportunity: 0,
        playerOpportunity: 0,
        remainingVisible: 0,
        maxVisible: scoreRows.get(owner) ?? 0,
      },
    ]),
  );
  const add = (owner, field, points) => {
    if (!owner || !rows.has(owner) || !Number.isFinite(points) || points <= 0) return;
    rows.get(owner)[field] += points;
  };

  for (const match of getAllMatches(state)) {
    if (isCompletedMatch(match)) continue;
    const teamPoints = maxTeamOpportunityForMatch(match);
    add(getOwnerForTeam(match.home), "teamOpportunity", teamPoints);
    add(getOwnerForTeam(match.away), "teamOpportunity", teamPoints);

    for (const player of selectedPlayers.filter((entry) => entry.team === match.home || entry.team === match.away)) {
      add(
        player.owner,
        "playerOpportunity",
        rules.individualAwards.selectedPlayerGoal + rules.individualAwards.selectedPlayersTeamWins,
      );
    }
  }

  return [...rows.values()]
    .map((row) => ({
      ...row,
      remainingVisible: row.teamOpportunity + row.playerOpportunity,
      maxVisible: row.current + row.teamOpportunity + row.playerOpportunity,
    }))
    .sort((a, b) => b.maxVisible - a.maxVisible || b.remainingVisible - a.remainingVisible || b.current - a.current || a.owner.localeCompare(b.owner));
}

function maxTeamOpportunityForMatch(match) {
  if (match.stage === "group") return rules.groupStage.win + rules.allEvents.winByTwo;
  const stagePoints = match.stage === "final" ? rules.knockoutStage.final : rules.knockoutStage[match.stage] || 0;
  return stagePoints + rules.allEvents.winByTwo;
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
  const advancementStatuses = getGroupAdvancementStatuses(state);
  const standings = getGroupStandings(state);

  for (const group of groups) {
    for (const record of standings[group]) {
      const advancementStatus = advancementStatuses[record.team];
      if (advancementStatus?.eliminated) {
        progress[record.team].rank = 0;
        progress[record.team].alive = false;
        progress[record.team].label = "Group exit confirmed";
      } else if (qualified.has(record.team) || advancementStatus?.confirmed || (!allGroupsComplete && record.rank === 3)) {
        progress[record.team].rank = 1;
        progress[record.team].alive = true;
        progress[record.team].label = advancementStatus?.confirmed ? "Qualified confirmed" : record.rank === 3 ? "Third-place bubble" : "Advanced";
      }
    }
  }

  const stageRank = { r32: 1, r16: 2, qf: 3, sf: 4, final: 5 };
  const knockoutMatches = getResolvedKnockoutMatches(state)
    .sort((a, b) => (stageRank[a.stage] ?? 1) - (stageRank[b.stage] ?? 1) || String(a.id).localeCompare(String(b.id)));
  for (const match of knockoutMatches) {
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

function getResolvedKnockoutMatches(state) {
  const customAndFixtureMatches = getAllMatches(state).filter((match) => match.stage !== "group" && isCompletedMatch(match));
  const existingKeys = new Set(customAndFixtureMatches.map(bracketMatchKey).filter(Boolean));
  const officialMatches = getKnockoutBracket(state).rounds.flatMap((round) =>
    round.matches
      .map((match) => ({
        ...match,
        home: match.slots[0]?.team || "",
        away: match.slots[1]?.team || "",
      }))
      .filter((match) => match.home && match.away && isCompletedMatch(match)),
  );

  return [...customAndFixtureMatches, ...officialMatches.filter((match) => !existingKeys.has(match.id))];
}

export function getNationPointStandings(state = createEmptyState()) {
  const progress = getTeamProgress(state);
  const federations = [...new Set(teams.map((team) => team.federation))].sort();

  return {
    groupRows: groups.map((group) =>
      nationPointRace({
        key: group,
        title: `Group ${group}`,
        points: rules.nationPoints.lastFromGroup,
        teamNames: getTeamsByGroup(group),
        progress,
      }),
    ),
    federationRows: federations.map((federation) =>
      nationPointRace({
        key: federation,
        title: federation,
        points: rules.nationPoints.lastFromFederation,
        teamNames: teams.filter((team) => team.federation === federation).map((team) => team.name),
        progress,
      }),
    ),
  };
}

export function getScorelessGroupTracker(inputState = createEmptyState()) {
  const state = normalizeState(inputState);
  const teamRows = teams.map((team) => {
    const matches = fixtures
      .filter((fixture) => fixture.stage === "group" && (fixture.home === team.name || fixture.away === team.name))
      .sort((a, b) => String(a.date).localeCompare(String(b.date)) || String(a.id).localeCompare(String(b.id)))
      .map((fixture, index) => {
        const match = { ...fixture, ...(state.matches[fixture.id] ?? {}) };
        const completed = isCompletedMatch(match);
        const goals = completed ? goalsForTeamInMatch(match, team.name) : 0;
        const opponent = match.home === team.name ? match.away : match.home;
        return {
          id: match.id,
          slot: index + 1,
          opponent,
          completed,
          goals,
          state: completed ? (goals > 0 ? "scored" : "blank") : "pending",
        };
      });
    const completed = matches.filter((match) => match.completed).length;
    const goals = matches.reduce((total, match) => total + match.goals, 0);
    const status = goals > 0 ? "cleared" : completed === matches.length ? "locked" : completed > 0 ? "danger" : "open";

    return {
      team: team.name,
      owner: getOwnerForTeam(team.name),
      group: team.group,
      federation: team.federation,
      completed,
      goals,
      remaining: Math.max(0, matches.length - completed),
      status,
      matches,
    };
  });

  const statusRank = { locked: 0, danger: 1, open: 2, cleared: 3 };
  const rows = teamRows.sort(
    (a, b) =>
      statusRank[a.status] - statusRank[b.status] ||
      b.completed - a.completed ||
      a.group.localeCompare(b.group) ||
      a.team.localeCompare(b.team),
  );

  return {
    summary: {
      total: rows.length,
      scoreless: rows.filter((row) => row.goals === 0).length,
      scored: rows.filter((row) => row.goals > 0).length,
      locked: rows.filter((row) => row.status === "locked").length,
      danger: rows.filter((row) => row.status === "danger").length,
      open: rows.filter((row) => row.status === "open").length,
    },
    teams: rows,
  };
}

export function getScorelessOwnerTracker(inputState = createEmptyState()) {
  const teamRows = new Map(getScorelessGroupTracker(inputState).teams.map((row) => [row.team, row]));
  const statusRank = { locked: 0, danger: 1, open: 2, cleared: 3 };

  return owners.map((owner) => {
    const ownerTeams = draftPicks
      .filter((pick) => pick.owner === owner && pick.type === "team")
      .map((pick) => teamRows.get(pick.name))
      .filter(Boolean)
      .sort(
        (a, b) =>
          statusRank[a.status] - statusRank[b.status] ||
          b.completed - a.completed ||
          a.team.localeCompare(b.team),
      );

    return {
      owner,
      waiting: ownerTeams.filter((row) => row.goals === 0).length,
      cleared: ownerTeams.filter((row) => row.goals > 0).length,
      playedScoreless: ownerTeams.filter((row) => row.goals === 0 && row.completed > 0).length,
      notPlayed: ownerTeams.filter((row) => row.goals === 0 && row.completed === 0).length,
      teams: ownerTeams,
    };
  });
}

function goalsForTeamInMatch(match, team) {
  if (match.home === team) return numberOrZero(match.homeScore);
  if (match.away === team) return numberOrZero(match.awayScore);
  return 0;
}

function scoreNationBonuses(state, add) {
  const progress = getTeamProgress(state);
  for (const group of groups) {
    awardLastStanding(
      getTeamsByGroup(group),
      progress,
      rules.nationPoints.lastFromGroup,
      (team) => `${team} last standing from Group ${group}`,
      add,
      "Survivor Points",
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
      "Survivor Points",
    );
  }
}

function awardLastStanding(teamNames, progress, points, reasonForTeam, add, category) {
  const rows = teamNames.map((team) => progress[team]).filter(Boolean);
  const winner = lastStandingWinner(rows);
  if (!winner) return;

  add(getOwnerForTeam(winner.team), points, reasonForTeam(winner.team), winner.team, category);
}

function nationPointRace({ key, title, points, teamNames, progress }) {
  const rows = teamNames
    .map((team) => progress[team])
    .filter(Boolean)
    .sort((a, b) => b.rank - a.rank || Number(b.alive) - Number(a.alive) || a.team.localeCompare(b.team));
  const liveRows = rows.filter((row) => row.alive);
  const winner = lastStandingWinner(rows);

  return {
    key,
    title,
    points,
    status: winner ? `Last standing: ${winner.team}` : `${liveRows.length} alive`,
    winner: winner?.team ?? "",
    owner: winner ? getOwnerForTeam(winner.team) : "",
    contenders: rows.map((row) => ({
      team: row.team,
      owner: getOwnerForTeam(row.team),
      group: row.group,
      federation: row.federation,
      alive: row.alive,
      rank: row.rank,
      label: row.label,
    })),
  };
}

function lastStandingWinner(rows) {
  const liveRows = rows.filter((row) => row.alive);
  if (liveRows.length > 1) return null;

  const topRank = Math.max(0, ...rows.map((row) => row.rank));
  const candidates = rows.filter((row) => row.rank === topRank);
  if (candidates.length !== 1) return null;
  if (liveRows.length === 1 && liveRows[0].team !== candidates[0].team) return null;
  return candidates[0];
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
    b.fairPlay - a.fairPlay ||
    a.fifaRank - b.fifaRank ||
    a.team.localeCompare(b.team)
  );
}

function rankGroupRecords(records, matches) {
  return groupBy(records, (record) => record.points)
    .sort((a, b) => Number(b.key) - Number(a.key))
    .flatMap((group) => (group.rows.length > 1 ? breakGroupTie(group.rows, matches) : group.rows));
}

function breakGroupTie(records, matches) {
  const h2hRows = records.map((record) => ({ ...record, h2h: headToHeadRecord(record.team, records, matches) }));
  const h2hGroups = groupBy(h2hRows, (row) => `${row.h2h.points}|${row.h2h.gd}|${row.h2h.gf}`)
    .sort((a, b) => compareHeadToHeadKey(a.key, b.key));

  if (h2hGroups.length > 1) {
    return h2hGroups.flatMap((group) => {
      const rows = group.rows.map(({ h2h, ...row }) => row);
      return rows.length > 1 && rows.length < records.length ? breakGroupTie(rows, matches) : rows;
    });
  }

  return [...records].sort(compareOverallGroupTie);
}

function headToHeadRecord(team, tiedRecords, matches) {
  const tiedTeams = new Set(tiedRecords.map((record) => record.team));
  const record = { points: 0, gf: 0, ga: 0, gd: 0 };

  for (const match of matches) {
    if (!tiedTeams.has(match.home) || !tiedTeams.has(match.away)) continue;
    if (match.home !== team && match.away !== team) continue;
    const goalsFor = match.home === team ? numberOrZero(match.homeScore) : numberOrZero(match.awayScore);
    const goalsAgainst = match.home === team ? numberOrZero(match.awayScore) : numberOrZero(match.homeScore);
    record.gf += goalsFor;
    record.ga += goalsAgainst;
    if (goalsFor > goalsAgainst) record.points += 3;
    else if (goalsFor === goalsAgainst) record.points += 1;
  }

  record.gd = record.gf - record.ga;
  return record;
}

function compareHeadToHeadKey(a, b) {
  const [aPoints, aGd, aGf] = a.split("|").map(Number);
  const [bPoints, bGd, bGf] = b.split("|").map(Number);
  return bPoints - aPoints || bGd - aGd || bGf - aGf;
}

function compareOverallGroupTie(a, b) {
  return (
    b.gd - a.gd ||
    b.gf - a.gf ||
    b.fairPlay - a.fairPlay ||
    a.fifaRank - b.fifaRank ||
    a.team.localeCompare(b.team)
  );
}

function groupBy(rows, keyForRow) {
  const groups = new Map();
  for (const row of rows) {
    const key = keyForRow(row);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(row);
  }
  return [...groups.entries()].map(([key, groupedRows]) => ({ key, rows: groupedRows }));
}

function getBracketMatchWinners(state) {
  const winners = {};
  for (const match of getAllMatches(state)) {
    if (match.stage === "group") continue;
    const key = bracketMatchKey(match);
    const winner = getMatchWinner(match);
    if (key && winner) winners[key] = winner;
  }
  return winners;
}

function resolveBracketMatch(match, stage, state, standings, matchWinners, advancementStatuses) {
  const slots = match.slots.map((slot) => resolveBracketSlot(slot, standings, matchWinners, advancementStatuses));
  const result = bracketMatchResult(state, match.id);
  const winner = bracketResultWinner(result, slots);
  if (winner) matchWinners[match.id] = winner;

  return {
    id: match.id,
    stage,
    date: knockoutMatchDates[match.id] ?? "",
    title: `Match ${match.id.slice(1)}`,
    homeScore: result?.homeScore,
    awayScore: result?.awayScore,
    status: result?.status || "scheduled",
    wentToPens: Boolean(result?.wentToPens),
    penaltyWinner: result?.penaltyWinner || "",
    winner,
    slots,
  };
}

function bracketMatchResult(state, matchId) {
  const direct = state.matches?.[matchId];
  if (direct) return direct;
  return state.customMatches.find((match) => bracketMatchKey(match) === matchId) ?? null;
}

function bracketResultWinner(result, slots) {
  if (!result || result.status !== "final" || !hasScore(result.homeScore) || !hasScore(result.awayScore)) return "";
  const homeScore = Number(result.homeScore);
  const awayScore = Number(result.awayScore);
  if (homeScore > awayScore) return slots[0]?.team || "";
  if (awayScore > homeScore) return slots[1]?.team || "";
  return result.wentToPens ? result.penaltyWinner || "" : "";
}

function bracketMatchKey(match) {
  const id = String(match.id ?? "").toLowerCase();
  const number = id.match(/(?:^|[^0-9])([7-9][0-9]|10[0-4])(?:[^0-9]|$)/)?.[1];
  return number ? `m${number}` : "";
}

function resolveBracketSlot(slot, standings, matchWinners, advancementStatuses = {}) {
  if (slot.type === "group") {
    const label = `Group ${slot.group} ${slot.rank === 1 ? "winner" : "runner-up"}`;
    const record = standings[slot.group]?.[slot.rank - 1];
    return {
      label,
      team: record?.played > 0 ? record.team : "",
      owner: record?.played > 0 ? getOwnerForTeam(record.team) : "",
      advancementStatus: record?.played > 0 ? advancementStatuses[record.team] ?? null : null,
    };
  }

  if (slot.type === "third") {
    const label = `Best 3rd ${slot.groups.join("/")}`;
    const record = slot.groups
      .map((group) => standings[group]?.[2])
      .filter((entry) => entry?.played > 0)
      .sort(compareGroupRecords)[0];
    return {
      label,
      team: record?.team ?? "",
      owner: record?.team ? getOwnerForTeam(record.team) : "",
      advancementStatus: record?.team ? advancementStatuses[record.team] ?? null : null,
    };
  }

  if (slot.type === "winner") {
    const label = `Winner Match ${slot.matchId.slice(1)}`;
    const team = matchWinners[slot.matchId] ?? "";
    return {
      label,
      team,
      owner: team ? getOwnerForTeam(team) : "",
      advancementStatus: team ? advancementStatuses[team] ?? null : null,
    };
  }

  return { label: "", team: "", owner: "", advancementStatus: null };
}

function numberOrZero(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

function hasScore(value) {
  if (value === "" || value === null || value === undefined) return false;
  return Number.isFinite(Number(value));
}
