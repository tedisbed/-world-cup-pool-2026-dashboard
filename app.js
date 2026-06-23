import {
  areAllGroupsComplete,
  calculateScores,
  createEmptyState,
  draftPicks,
  fixtures,
  getAllMatches,
  getGroupAdvancementStatuses,
  getGroupStandings,
  getKnockoutBracket,
  getMatchImpact,
  getMatchWinner,
  getMatchesForDate,
  getNationPointStandings,
  getOwnerForTeam,
  getOwnerOpportunityRows,
  getPlayerGoalTotals,
  getProjectedGroupBubbleTable,
  getProjectedThirdPlaceTable,
  getQualifiedTeams,
  getRuleGroups,
  getScorelessOwnerTracker,
  getScorelessGroupTracker,
  getSelectedPlayers,
  getTeam,
  getThirdPlaceTable,
  getRecentPointEvents,
  isCompletedMatch,
  normalizeState,
  owners,
  rules,
  stageLabels,
  teams,
} from "./pool-core.mjs";
import { loadInitialState } from "./app-state.mjs";

const adminStorageKey = "world-cup-pool-dashboard-admin-unlocked";
const adminPassword = "Noah";
const selectedPlayers = getSelectedPlayers();
const ownerColors = {
  Sherman: "#e76f51",
  Sarkey: "#2a9d8f",
  "Schelly / Mitchell": "#6f42c1",
  Brombach: "#0f766e",
  Flood: "#b7791f",
  Worrell: "#2563eb",
  Palutsis: "#be185d",
  Kreienberg: "#475569",
};

let state = createEmptyState();
let adminUnlocked = sessionStorage.getItem(adminStorageKey) === "true";
let selectedMatchId = fixtures[0].id;
let activeTab = "today";
let kalshiOdds = {};
const filters = {
  search: "",
  owner: "all",
  group: "all",
  status: "all",
};

normalizeStaticMarkup();

const dom = {
  leaderboard: document.getElementById("leaderboard"),
  todayPanel: document.getElementById("today-panel"),
  pulsePanel: document.getElementById("pulse-panel"),
  statusStrip: document.getElementById("status-strip"),
  spotlight: document.getElementById("spotlight"),
  matchList: document.getElementById("match-list"),
  impactPanel: document.getElementById("impact-panel"),
  groupsPanel: document.getElementById("groups-panel"),
  bracketPanel: document.getElementById("bracket-panel"),
  survivorPointsPanel: document.getElementById("survivor-points-panel"),
  goalsPanel: document.getElementById("goals-panel"),
  draftPanel: document.getElementById("draft-panel"),
  rulesPanel: document.getElementById("rules-panel"),
  scorelessPanel: document.getElementById("scoreless-panel"),
  search: document.getElementById("search"),
  ownerFilter: document.getElementById("owner-filter"),
  groupFilter: document.getElementById("group-filter"),
  statusFilter: document.getElementById("status-filter"),
};

init();

function normalizeStaticMarkup() {
  document.querySelector('[data-tab="update"]')?.remove();
  document.querySelector("#tab-update")?.remove();
  document.querySelector('[data-tab="awards"]')?.remove();
  document.querySelector("#tab-awards")?.remove();

  const legacyDataTab = document.querySelector('[data-tab="data"]');
  if (legacyDataTab) {
    legacyDataTab.dataset.tab = "rules";
    legacyDataTab.textContent = "Rules";
  }

  const legacyDataPanel = document.getElementById("tab-data");
  if (legacyDataPanel) {
    legacyDataPanel.id = "tab-rules";
    const panel = legacyDataPanel.querySelector("#data-panel");
    if (panel) panel.id = "rules-panel";
  }
}

async function init() {
  state = await loadInitialState();
  kalshiOdds = await loadKalshiOdds();
  selectedMatchId = firstRelevantMatch()?.id ?? fixtures[0].id;
  populateFilters();
  attachEvents();
  render();
}

async function loadKalshiOdds() {
  try {
    const response = await fetch("./data/kalshi-odds.json", { cache: "no-store" });
    if (!response.ok) return {};
    const snapshot = await response.json();
    return snapshot?.matches && typeof snapshot.matches === "object" ? snapshot.matches : {};
  } catch {
    return {};
  }
}

function attachEvents() {
  document.querySelector(".tabs").addEventListener("click", (event) => {
    normalizeStaticMarkup();
    const tab = event.target.closest("[data-tab]");
    if (!tab) return;
    activeTab = tab.dataset.tab;
    document.querySelectorAll(".tab").forEach((button) => {
      button.classList.toggle("active", button.dataset.tab === activeTab);
    });
    document.querySelectorAll(".tab-panel").forEach((panel) => {
      panel.classList.toggle("active", panel.id === `tab-${activeTab}`);
    });
    renderActiveTab();
  });

  dom.search.addEventListener("input", (event) => {
    filters.search = event.target.value;
    renderMatches();
  });
  dom.ownerFilter.addEventListener("change", (event) => {
    filters.owner = event.target.value;
    renderMatches();
  });
  dom.groupFilter.addEventListener("change", (event) => {
    filters.group = event.target.value;
    renderMatches();
  });
  dom.statusFilter.addEventListener("change", (event) => {
    filters.status = event.target.value;
    renderMatches();
  });

  document.body.addEventListener("click", handleClick);

}

function populateFilters() {
  dom.ownerFilter.innerHTML = [
    `<option value="all">All owners</option>`,
    ...owners.map((owner) => `<option value="${escapeHtml(owner)}">${escapeHtml(owner)}</option>`),
  ].join("");

  const groupOptions = [...new Set(teams.map((team) => team.group))].sort();
  dom.groupFilter.innerHTML = [
    `<option value="all">All groups</option>`,
    ...groupOptions.map((group) => `<option value="${group}">Group ${group}</option>`),
    `<option value="knockout">Knockout</option>`,
  ].join("");
}

function render() {
  const result = calculateScores(state);
  renderLeaderboard(result);
  renderStatusStrip(result);
  renderToday(result);
  renderPulse();
  renderSpotlight();
  renderMatches();
  renderGroups(result);
  renderBracket();
  renderNationPoints();
  renderPlayerGoals();
  renderDraft();
  renderRules();
  renderScoreless();
}

function renderActiveTab() {
  const result = calculateScores(state);
  if (activeTab === "today") renderToday(result);
  if (activeTab === "pulse") renderPulse();
  if (activeTab === "matches") {
    renderSpotlight();
    renderMatches();
  }
  if (activeTab === "groups") renderGroups(result);
  if (activeTab === "bracket") renderBracket();
  if (activeTab === "survivor-points") renderNationPoints();
  if (activeTab === "goals") renderPlayerGoals();
  if (activeTab === "draft") renderDraft();
  if (activeTab === "rules") renderRules();
  if (activeTab === "scoreless") renderScoreless();
}

function renderLeaderboard(result) {
  const maxScore = Math.max(1, ...result.ownerTotals.map((row) => row.score));
  dom.leaderboard.innerHTML = result.ownerTotals
    .map((row, index) => {
      const picks = draftPicks.filter((pick) => pick.owner === row.owner);
      const bar = Math.max(5, Math.round((row.score / maxScore) * 100));
      const details = [...row.details].sort((a, b) => Math.abs(b.points) - Math.abs(a.points) || a.reason.localeCompare(b.reason));
      return `
        <details class="leader-detail" style="--owner-color: ${ownerColor(row.owner)}">
          <summary class="leader-row">
            <div class="rank">${index + 1}</div>
            <div>
              <div class="owner-name">${escapeHtml(row.owner)}</div>
              <div class="owner-picks">
                ${picks.map((pick) => pickBadge(pick)).join("")}
              </div>
              <div class="score-bar" style="width:${bar}%"></div>
            </div>
            <div class="score">${row.score}</div>
          </summary>
          <div class="leader-breakdown">
            ${
              details.length
                ? `<ul class="detail-list">${details.map((detail) => detailItem(detail)).join("")}</ul>`
                : `<div class="empty-state compact-empty">No scored events yet.</div>`
            }
          </div>
        </details>
      `;
    })
    .join("");
}

function renderToday(result) {
  const today = todayIso();
  const matches = getMatchesForDate(state, today);
  const completed = matches.filter(isCompletedMatch).length;
  const totalSwing = matches.reduce((sum, match) => sum + todayOpportunityLines(match).length, 0);

  dom.todayPanel.innerHTML = `
    <div class="today-layout">
      <section class="card today-summary">
        <div class="section-title">
          <span>Today</span>
          <small>${formatDate(today)}</small>
        </div>
        <div class="today-metrics">
          <div><strong>${matches.length}</strong><span>Matches</span></div>
          <div><strong>${completed}</strong><span>Final</span></div>
          <div><strong>${totalSwing}</strong><span>Point paths</span></div>
        </div>
      </section>
      ${
        matches.length
          ? matches.map((match) => todayMatchCard(match, result)).join("")
          : `<div class="empty-state">No matches are scheduled for today.</div>`
      }
    </div>
  `;
}

function renderPulse() {
  const events = getRecentPointEvents(state, 18);
  const opportunities = getOwnerOpportunityRows(state);

  dom.pulsePanel.innerHTML = `
    <div class="pulse-grid">
      <section class="card">
        <div class="section-title">
          <span>Recent Points</span>
          <small>${events.length ? `${events.length} latest` : "No points yet"}</small>
        </div>
        ${
          events.length
            ? `<ul class="event-feed">${events.map(pointEventItem).join("")}</ul>`
            : `<div class="empty-state">No scored events yet.</div>`
        }
      </section>

      <section class="card">
        <div class="section-title">
          <span>Visible Opportunity</span>
          <small>Known fixtures only</small>
        </div>
        ${opportunityTable(opportunities)}
      </section>
    </div>
  `;
}

function renderStatusStrip(result) {
  const allMatches = getAllMatches(state);
  const completed = allMatches.filter(isCompletedMatch).length;
  const leader = result.ownerTotals[0];
  const next = firstRelevantMatch();
  const qualified = result.qualifiedTeams.length;
  const allGroupDone = areAllGroupsComplete(state);

  dom.statusStrip.innerHTML = `
    <div class="metric">
      <span>Leader</span>
      <strong>${escapeHtml(leader.owner)}</strong>
      <em>${leader.score} points</em>
    </div>
    <div class="metric">
      <span>Results Entered</span>
      <strong>${completed}</strong>
      <em>${allMatches.length} total match rows</em>
    </div>
    <div class="metric">
      <span>Next Match</span>
      <strong>${next ? formatDate(next.date) : "None"}</strong>
      <em>${next ? `${escapeHtml(next.home)} vs ${escapeHtml(next.away)}` : "All scheduled rows are final"}</em>
    </div>
    <div class="metric">
      <span>Advanced</span>
      <strong>${qualified}</strong>
      <em>${allGroupDone ? "Third-place table active" : "Top-two only until all groups finish"}</em>
    </div>
  `;
}

function renderSpotlight() {
  const allMatches = getAllMatches(state);
  const today = todayIso();
  const todaysMatches = allMatches.filter((match) => match.date === today);
  const upcoming = allMatches.filter((match) => !isCompletedMatch(match) && match.date >= today);
  const spotlightMatches = todaysMatches.length ? todaysMatches : upcoming.slice(0, 4);
  const title = todaysMatches.length ? "Today" : "Next Up";

  dom.spotlight.innerHTML = `
    <div class="section-title">
      <span>${title}</span>
      <small>${spotlightMatches.length ? formatDate(spotlightMatches[0].date) : "No upcoming rows"}</small>
    </div>
    ${
      spotlightMatches.length
        ? `<div class="spotlight-grid">${spotlightMatches.map(miniMatchCard).join("")}</div>`
        : `<div class="empty-state">No upcoming scheduled matches.</div>`
    }
  `;
}

function renderMatches() {
  const matches = filterMatches(getAllMatches(state));

  dom.matchList.innerHTML = matches.length
    ? matches.map(matchCard).join("")
    : `<div class="empty-state">No matches match the current filters.</div>`;
  renderImpact();
}

function renderImpact() {
  const match = getAllMatches(state).find((row) => row.id === selectedMatchId) ?? firstRelevantMatch();
  if (!match) {
    dom.impactPanel.innerHTML = `<h3>Impact</h3><div class="empty-state">Select a match.</div>`;
    return;
  }

  const result = calculateScores(state);
  const impact = getMatchImpact(match, state);
  const scoredDetails = result.ownerTotals
    .flatMap((ownerRow) => ownerRow.details.map((detail) => ({ owner: ownerRow.owner, ...detail })))
    .filter((detail) => detail.subject === match.id);

  dom.impactPanel.innerHTML = `
    <h3>${escapeHtml(match.home)} vs ${escapeHtml(match.away)}</h3>
    <div class="muted">${stageLabels[match.stage] ?? match.stage} ${match.group ? `+ Group ${match.group}` : ""} + ${formatDate(match.date)}</div>

    <div class="impact-section">
      <div class="card-title">Owned Teams</div>
      <ul>
        ${impact.rows
          .map(
            (row) => `
              <li>
                <span class="owner-chip" style="--owner-color:${ownerColor(row.owner)}">${escapeHtml(row.owner || "Unowned")}</span>
                ${escapeHtml(row.label)}
              </li>
            `,
          )
          .join("")}
      </ul>
    </div>

    <div class="impact-section">
      <div class="card-title">Scoring Paths</div>
      <ul>${impact.possible.map((line) => `<li>${escapeHtml(line)}</li>`).join("")}</ul>
    </div>

    ${
      impact.playerRows.length
        ? `<div class="impact-section"><div class="card-title">Player Exposure</div><ul>${impact.playerRows.map((line) => `<li>${escapeHtml(line)}</li>`).join("")}</ul></div>`
        : ""
    }

    <div class="impact-section">
      <div class="card-title">Entered Result</div>
      ${
        scoredDetails.length
          ? `<ul class="detail-list">${scoredDetails.map((detail) => detailItem(detail, detail.owner)).join("")}</ul>`
          : `<div class="empty-state">No points from this match yet.</div>`
      }
    </div>
  `;
}

function renderGroups(result) {
  const groupsPanel = document.getElementById("groups-panel");
  if (!groupsPanel) return;
  const standings = getGroupStandings(state);
  const qualified = getQualifiedTeams(state);
  const advancementStatuses = getGroupAdvancementStatuses(state);
  const allGroupsComplete = areAllGroupsComplete(state);
  const thirdTable = allGroupsComplete ? getThirdPlaceTable(state) : getProjectedThirdPlaceTable(state);
  const bubbleTable = getProjectedGroupBubbleTable(state);
  const projectedThirdPlaceTeams = new Set(thirdTable.slice(0, 8).map((row) => row.team));

  groupsPanel.innerHTML = `
    <div class="group-grid">
      ${Object.entries(standings)
        .map(([group, rows]) => groupTable(group, rows, qualified, projectedThirdPlaceTeams, allGroupsComplete, advancementStatuses))
        .join("")}
    </div>
    <section class="card" style="margin-top:12px">
      <div class="section-title">
        <span>Third / Fourth Bubble</span>
        <small>${allGroupsComplete ? "Third-place top 8 advance; all fourth-place teams are out" : "Projected from current standings; includes every 3rd and 4th place team"}</small>
      </div>
      ${
        bubbleTable.length
          ? standingsTable(bubbleTable.map((row) => ({ ...row, rank: row.groupRank })), qualified, "standings-table", {
              showThirdPlaceStatus: true,
              allGroupsComplete,
              advancementStatuses,
            })
          : `<div class="empty-state">No completed groups yet.</div>`
      }
    </section>
  `;
}

function renderBracket() {
  const bracketPanel = document.getElementById("bracket-panel");
  if (!bracketPanel) return;
  const bracket = getKnockoutBracket(state);

  bracketPanel.innerHTML = `
    <section class="card">
      <div class="section-title">
        <span>Knockout Bracket</span>
        <small>Current leaders fill in as group results are entered</small>
      </div>
      ${bracketPathView(bracket)}
      <div class="bracket-scroll">
        <div class="bracket-grid">
          ${bracket.rounds.map(bracketRound).join("")}
        </div>
      </div>
    </section>
  `;
}

function bracketPathView(bracket) {
  const rounds = Object.fromEntries(bracket.rounds.map((round) => [round.stage, round.matches]));
  const matchMap = new Map(bracket.rounds.flatMap((round) => round.matches.map((match) => [match.id, match])));
  const qfMatches = rounds.qf ?? [];
  const sfMatches = rounds.sf ?? [];
  const finalMatch = rounds.final?.[0];

  return `
    <div class="bracket-path">
      <div class="bracket-path-head">
        <strong>Path to the Final</strong>
        <span>Round of 32 winners feed the Round of 16, then into quarters, semis, and final.</span>
      </div>
      <div class="bracket-path-grid">
        ${qfMatches.map((match) => bracketQuarterPath(match, matchMap)).join("")}
      </div>
      <div class="bracket-final-path">
        ${sfMatches.map((match) => bracketNextStep(match, "Semifinal", matchMap)).join("")}
        ${finalMatch ? bracketNextStep(finalMatch, "Final", matchMap) : ""}
      </div>
    </div>
  `;
}

function bracketQuarterPath(match, matchMap) {
  const feederIds = sourceMatchIds(match);
  return `
    <article class="bracket-path-lane">
      <div class="bracket-path-target">
        <span>Quarterfinal</span>
        <strong>${escapeHtml(match.title)}</strong>
      </div>
      <div class="bracket-path-sources">
        ${feederIds.map((id) => bracketRoundOf16Path(matchMap.get(id), matchMap)).join("")}
      </div>
    </article>
  `;
}

function bracketRoundOf16Path(match, matchMap) {
  if (!match) return "";
  const feederIds = sourceMatchIds(match);
  return `
    <div class="bracket-path-node">
      <div class="bracket-path-match">
        <span>Round of 16</span>
        <strong>${escapeHtml(match.title)}</strong>
      </div>
      <div class="bracket-path-mini-list">
        ${feederIds.map((id) => bracketMiniMatch(matchMap.get(id))).join("")}
      </div>
    </div>
  `;
}

function bracketMiniMatch(match) {
  if (!match) return "";
  return `
    <div class="bracket-path-mini">
      <span>${escapeHtml(match.title)}</span>
      <strong>${match.slots.map((slot) => escapeHtml(slot.team || slot.label)).join(" / ")}</strong>
    </div>
  `;
}

function bracketNextStep(match, label, matchMap) {
  const feederIds = sourceMatchIds(match);
  return `
    <article class="bracket-next-step">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(match.title)}</strong>
      <em>${feederIds.map((id) => escapeHtml(matchMap.get(id)?.title ?? `Match ${id.slice(1)}`)).join(" vs ")}</em>
    </article>
  `;
}

function sourceMatchIds(match) {
  return match.slots
    .map((slot) => String(slot.label).match(/^Winner Match (\d+)$/)?.[1])
    .filter(Boolean)
    .map((number) => `m${number}`);
}

function renderNationPoints() {
  const survivorPointsPanel = document.getElementById("survivor-points-panel");
  if (!survivorPointsPanel) return;
  const standings = getNationPointStandings(state);

  survivorPointsPanel.innerHTML = `
    <div class="nation-points-layout">
      <section class="card">
        <div class="section-title">
          <span>Group Survivors</span>
          <small>+${rules.nationPoints.lastFromGroup} when one country is last standing</small>
        </div>
        <div class="nation-race-grid">
          ${standings.groupRows.map(nationRaceCard).join("")}
        </div>
      </section>

      <section class="card">
        <div class="section-title">
          <span>Federation Survivors</span>
          <small>+${rules.nationPoints.lastFromFederation} by confederation</small>
        </div>
        <div class="nation-race-grid federation-grid">
          ${standings.federationRows.map((row) => nationRaceCard(row, { compact: true })).join("")}
        </div>
      </section>
    </div>
  `;
}

function renderPlayerGoals() {
  const goalsPanel = document.getElementById("goals-panel");
  if (!goalsPanel) return;
  const playerGoalTotals = getPlayerGoalTotals(state);
  const maxGoals = Math.max(0, ...selectedPlayers.map((player) => Number(playerGoalTotals[player.name] || 0)));
  const topScorers = selectedPlayers.filter((player) => maxGoals > 0 && Number(playerGoalTotals[player.name] || 0) === maxGoals);
  const playerRows = [...selectedPlayers].sort(
    (a, b) =>
      Number(playerGoalTotals[b.name] || 0) - Number(playerGoalTotals[a.name] || 0) ||
      a.name.localeCompare(b.name),
  );

  goalsPanel.innerHTML = `
    <section class="card">
      <div class="section-title">
        <span>Selected Player Goals</span>
        <small>${topScorers.length ? `+${rules.individualAwards.selectedPlayerMostGoals}: ${topScorers.map((player) => player.name).join(", ")}` : "No goals yet"}</small>
      </div>
      ${playerRows.map((player) => playerGoalRow(player, playerGoalTotals)).join("")}
    </section>
  `;
}

function renderDraft() {
  const draftPanel = document.getElementById("draft-panel");
  if (!draftPanel) return;

  draftPanel.innerHTML = `
    <section class="card">
      <div class="section-title">
        <span>Draft Board</span>
        <small>Gold cells are selected players</small>
      </div>
      <div class="draft-table-wrap">
        <table class="draft-table">
          <thead>
            <tr>
              <th>Round</th>
              ${owners.map((owner) => `<th>${escapeHtml(owner)}</th>`).join("")}
            </tr>
          </thead>
          <tbody>
            ${[1, 2, 3, 4, 5, 6, 7]
              .map(
                (round) => `
                  <tr>
                    <td><strong>Round ${round}</strong></td>
                    ${owners
                      .map((owner) => {
                        const pick = draftPicks.find((entry) => entry.owner === owner && entry.round === round);
                        return `<td>${draftPickCell(pick)}</td>`;
                      })
                      .join("")}
                  </tr>
                `,
              )
              .join("")}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderRules() {
  const rulesPanel = document.getElementById("rules-panel");
  if (!rulesPanel) return;
  rulesPanel.innerHTML = `
    <section class="data-box rules-reference">
      <h3>Rules</h3>
      <div class="rules-group-grid">${getRuleGroups().map(ruleGroup).join("")}</div>
      <p class="muted">
        Fixture names are normalized to the pool sheet. Schedule source:
        <a href="https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/match-schedule-fixtures-results-teams-stadiums">FIFA match schedule</a>.
      </p>
    </section>
  `;
}

function renderScoreless() {
  const scorelessPanel = document.getElementById("scoreless-panel");
  if (!scorelessPanel) return;
  const tracker = getScorelessGroupTracker(state);
  const ownerTracker = getScorelessOwnerTracker(state);

  scorelessPanel.innerHTML = `
    <section class="card scoreless-card">
      <div class="section-title">
        <span>Scoreless Watch</span>
        <small>${tracker.summary.scoreless} still scoreless, ${tracker.summary.scored} cleared</small>
      </div>
      <div class="scoreless-summary">
        ${scorelessSummaryChip("Waiting", tracker.summary.scoreless)}
        ${scorelessSummaryChip("Danger", tracker.summary.danger + tracker.summary.locked)}
        ${scorelessSummaryChip("Cleared", tracker.summary.scored)}
      </div>
      <div class="scoreless-subsection">
        <div>
          <strong>Owner Tracker</strong>
          <span>Drafted teams by person</span>
        </div>
      </div>
      <div class="scoreless-owner-grid">
        ${ownerTracker.map(scorelessOwnerCard).join("")}
      </div>
      <div class="scoreless-subsection teams">
        <div>
          <strong>Team Tracker</strong>
          <span>All World Cup teams</span>
        </div>
      </div>
      <div class="scoreless-grid">
        ${tracker.teams.map(scorelessTeamCard).join("")}
      </div>
    </section>
  `;
}

function scorelessSummaryChip(label, value) {
  return `
    <div class="scoreless-summary-chip">
      <strong>${value}</strong>
      <span>${escapeHtml(label)}</span>
    </div>
  `;
}

function scorelessOwnerCard(row) {
  return `
    <article class="scoreless-owner-card" style="--owner-color:${ownerColor(row.owner)}">
      <div class="scoreless-owner-head">
        <strong>${escapeHtml(row.owner)}</strong>
        <span>${row.notPlayed} not played / ${row.playedScoreless} no goal / ${row.cleared} cleared</span>
      </div>
      <div class="scoreless-owner-teams">
        ${row.teams.map(scorelessOwnerTeam).join("")}
      </div>
    </article>
  `;
}

function scorelessOwnerTeam(row) {
  const state = row.goals > 0 ? "cleared" : row.completed > 0 ? "played" : "not-played";
  const marker = row.goals > 0 ? "✓" : row.completed > 0 ? "!" : "•";
  const label = row.goals > 0
    ? `${row.goals} goal${row.goals === 1 ? "" : "s"}`
    : row.completed > 0
      ? `${row.completed} played, no goal`
      : "Not played";
  return `
    <span class="scoreless-owner-team ${escapeHtml(state)}" title="${escapeHtml(`${row.team}: ${label}`)}">
      <span>${escapeHtml(marker)}</span>
      ${escapeHtml(row.team)}
    </span>
  `;
}

function scorelessTeamCard(row) {
  const labelByStatus = {
    locked: "Scoreless",
    danger: `${row.remaining} left`,
    open: "Waiting",
    cleared: "Scored",
  };
  return `
    <article class="scoreless-team-card ${escapeHtml(row.status)}">
      <div class="scoreless-team-main">
        <div>
          <strong>${escapeHtml(row.team)}</strong>
          <span>Group ${escapeHtml(row.group)} · ${escapeHtml(row.federation)}</span>
        </div>
        <span class="owner-chip" style="--owner-color:${ownerColor(row.owner)}">${escapeHtml(row.owner)}</span>
      </div>
      <div class="scoreless-team-meta">
        <span>${row.goals} GF</span>
        <span>${escapeHtml(labelByStatus[row.status] ?? "Open")}</span>
      </div>
      <div class="scoreless-match-row">
        ${row.matches.map(scorelessMatchBubble).join("")}
      </div>
    </article>
  `;
}

function scorelessMatchBubble(match) {
  const labelByState = {
    scored: "✓",
    blank: "X",
    pending: "-",
  };
  const titleByState = {
    scored: `${match.goals} goal${match.goals === 1 ? "" : "s"}`,
    blank: "No goals",
    pending: "Pending",
  };
  return `
    <span class="scoreless-match-bubble ${escapeHtml(match.state)}" title="${escapeHtml(`Match ${match.slot} vs ${match.opponent}: ${titleByState[match.state]}`)}">
      <span>${escapeHtml(labelByState[match.state] ?? "-")}</span>
      <small>${match.slot}</small>
    </span>
  `;
}

function matchCard(match) {
  const homeOwner = getOwnerForTeam(match.home);
  const awayOwner = getOwnerForTeam(match.away);
  const winner = getMatchWinner(match);
  const selected = match.id === selectedMatchId ? " selected" : "";
  const playerGoalLines = selectedPlayersForMatch(match)
    .filter((player) => matchPlayerGoals(match.id)[player.name] > 0)
    .map((player) => `${player.name}: ${matchPlayerGoals(match.id)[player.name]}`);

  return `
    <article class="match-card${selected}" data-action="select-match" data-match-id="${escapeHtml(match.id)}">
      <div>
        <div class="match-title">
          <span>${escapeHtml(match.home)} vs ${escapeHtml(match.away)}</span>
          <small>${formatDate(match.date)}</small>
        </div>
        <div class="team-line">
          <strong>${escapeHtml(match.home)}</strong>
          <span class="owner-chip" style="--owner-color:${ownerColor(homeOwner)}">${escapeHtml(homeOwner)}</span>
        </div>
        <div class="team-line">
          <strong>${escapeHtml(match.away)}</strong>
          <span class="owner-chip" style="--owner-color:${ownerColor(awayOwner)}">${escapeHtml(awayOwner)}</span>
        </div>
        <div class="match-meta">
          <span class="badge">${escapeHtml(stageLabels[match.stage] ?? match.stage)}</span>
          ${match.group ? `<span class="badge">Group ${escapeHtml(match.group)}</span>` : ""}
          <span class="badge">${escapeHtml(match.venue || "TBD")}</span>
          <span class="status-badge">${isCompletedMatch(match) ? `Final${winner ? `: ${escapeHtml(winner)}` : ""}` : "Open"}</span>
        </div>
        ${kalshiOddsBlock(match)}
      </div>
      <div class="match-summary">
        <div class="readonly-score">${scoreValue(match.homeScore) || "-"}<span>:</span>${scoreValue(match.awayScore) || "-"}</div>
        ${playerGoalLines.length ? `<div class="muted">${playerGoalLines.map(escapeHtml).join(" + ")}</div>` : `<div class="muted">No selected-player goals entered</div>`}
      </div>
    </article>
  `;
}

function todayMatchCard(match, result) {
  const winner = getMatchWinner(match);
  const scoredDetails = result.ownerTotals
    .flatMap((ownerRow) => ownerRow.details.map((detail) => ({ owner: ownerRow.owner, ...detail })))
    .filter((detail) => detail.subject === match.id);
  const selectedPlayerRows = selectedPlayersForMatch(match);

  return `
    <article class="card today-match">
      <div class="today-match-main">
        <div>
          <div class="match-title">
            <span>${escapeHtml(match.home)} vs ${escapeHtml(match.away)}</span>
            <small>${escapeHtml(match.venue || "TBD")}</small>
          </div>
          <div class="match-meta">
            <span class="badge">${escapeHtml(stageLabels[match.stage] ?? match.stage)}</span>
            ${match.group ? `<span class="badge">Group ${escapeHtml(match.group)}</span>` : ""}
            <span class="status-badge">${isCompletedMatch(match) ? `Final${winner ? `: ${escapeHtml(winner)}` : ""}` : "Open"}</span>
          </div>
          ${kalshiOddsBlock(match)}
        </div>
        <div class="readonly-score">${scoreValue(match.homeScore) || "-"}<span>:</span>${scoreValue(match.awayScore) || "-"}</div>
      </div>

      <div class="today-columns">
        <section>
          <div class="card-title">Owners</div>
          <div class="team-line">
            <strong>${escapeHtml(match.home)}</strong>
            <span class="owner-chip" style="--owner-color:${ownerColor(getOwnerForTeam(match.home))}">${escapeHtml(getOwnerForTeam(match.home) || "Unowned")}</span>
          </div>
          <div class="team-line">
            <strong>${escapeHtml(match.away)}</strong>
            <span class="owner-chip" style="--owner-color:${ownerColor(getOwnerForTeam(match.away))}">${escapeHtml(getOwnerForTeam(match.away) || "Unowned")}</span>
          </div>
        </section>

        <section>
          <div class="card-title">Selected Players</div>
          ${
            selectedPlayerRows.length
              ? `<ul class="today-list">${selectedPlayerRows.map((player) => `<li><strong>${escapeHtml(player.name)}</strong><span>${escapeHtml(player.team)} + ${escapeHtml(player.owner)}</span></li>`).join("")}</ul>`
              : `<div class="muted">No selected players in this match.</div>`
          }
        </section>

        <section>
          <div class="card-title">${isCompletedMatch(match) ? "Points Received" : "Available Points"}</div>
          ${
            isCompletedMatch(match)
              ? scoredDetails.length
                ? `<ul class="detail-list">${scoredDetails.map((detail) => detailItem(detail, detail.owner)).join("")}</ul>`
                : `<div class="muted">No pool points from this result.</div>`
              : `<ul class="today-list">${todayOpportunityLines(match).map((line) => `<li>${escapeHtml(line)}</li>`).join("")}</ul>`
          }
        </section>
      </div>
    </article>
  `;
}

function todayOpportunityLines(match) {
  const impact = getMatchImpact(match, state);
  const playerGoalLines = selectedPlayersForMatch(match).map((player) => `${player.name} goal: ${player.owner} +2`);
  return [...impact.possible, ...playerGoalLines];
}

function kalshiOddsBlock(match) {
  if (isCompletedMatch(match)) return "";
  const summary = kalshiOdds[match.id];
  if (!summary) return "";

  const secondary = [
    summary.drawProbability === null ? "" : `Draw ${summary.drawProbability}%`,
    summary.underdogLabel && summary.underdogProbability !== null ? `${summary.underdogLabel} ${summary.underdogProbability}%` : "",
  ].filter(Boolean);

  return `
    <div class="kalshi-odds">
      <span>Market favorite</span>
      <strong>${escapeHtml(summary.favoriteLabel)} ${summary.favoriteProbability}%</strong>
      ${secondary.length ? `<em>${secondary.map(escapeHtml).join(" + ")}</em>` : ""}
      ${summary.marketsUrl ? `<a href="${escapeHtml(summary.marketsUrl)}" target="_blank" rel="noopener">Kalshi</a>` : ""}
    </div>
  `;
}

function pointEventItem(event) {
  const className = event.points < 0 ? "point-chip negative" : "point-chip";
  const date = event.date ? formatDate(event.date) : event.category;
  const context = event.match || event.category;
  return `
    <li>
      <span class="${className}">${event.points > 0 ? "+" : ""}${event.points}</span>
      <div>
        <strong>${escapeHtml(event.owner)}</strong>
        <span>${escapeHtml(event.reason)}</span>
        <em>${escapeHtml(date)}${context ? ` + ${escapeHtml(context)}` : ""}</em>
      </div>
    </li>
  `;
}

function opportunityTable(rows) {
  return `
    <div class="opportunity-table-wrap">
      <table class="opportunity-table">
        <thead>
          <tr><th>Owner</th><th>Now</th><th>Teams</th><th>Players</th><th>Left</th><th>Max</th></tr>
        </thead>
        <tbody>
          ${rows
            .map(
              (row) => `
                <tr>
                  <td><span class="owner-chip" style="--owner-color:${ownerColor(row.owner)}">${escapeHtml(row.owner)}</span></td>
                  <td>${row.current}</td>
                  <td>${row.teamOpportunity}</td>
                  <td>${row.playerOpportunity}</td>
                  <td>${row.remainingVisible}</td>
                  <td><strong>${row.maxVisible}</strong></td>
                </tr>
              `,
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function adminGate() {
  return `
    <section class="card admin-gate ${adminUnlocked ? "unlocked" : ""}">
      <div>
        <div class="card-title">${adminUnlocked ? "Editing Unlocked" : "Editing Locked"}</div>
        <div class="muted">${adminUnlocked ? "Data changes are enabled in this browser session." : "Enter the admin key to change awards, imports, or local data."}</div>
      </div>
      ${
        adminUnlocked
          ? `<button class="icon-button" type="button" data-action="lock-admin">Lock</button>`
          : `<div class="admin-form"><input id="admin-key" type="password" autocomplete="current-password" placeholder="Admin key" aria-label="Admin key" /><button class="icon-button" type="button" data-action="unlock-admin">Unlock</button></div>`
      }
    </section>
  `;
}

function miniMatchCard(match) {
  const homeOwner = getOwnerForTeam(match.home);
  const awayOwner = getOwnerForTeam(match.away);
  return `
    <button class="mini-match" data-action="select-match" data-match-id="${escapeHtml(match.id)}" type="button">
      <div class="match-title">
        <span>${escapeHtml(match.home)} vs ${escapeHtml(match.away)}</span>
        <small>${escapeHtml(match.venue)}</small>
      </div>
      <div class="match-meta">
        <span class="owner-chip" style="--owner-color:${ownerColor(homeOwner)}">${escapeHtml(homeOwner)}</span>
        <span class="owner-chip" style="--owner-color:${ownerColor(awayOwner)}">${escapeHtml(awayOwner)}</span>
      </div>
    </button>
  `;
}

function playerGoalRow(player, playerGoalTotals) {
  const goals = Number(playerGoalTotals[player.name] || 0);
  return `
    <div class="player-row">
      <div>
        <strong>${escapeHtml(player.name)}</strong>
        <div class="muted">${escapeHtml(player.team)} + ${escapeHtml(player.owner)}</div>
      </div>
      <strong class="goal-total">${goals}</strong>
    </div>
  `;
}

function groupTable(group, rows, qualified, projectedThirdPlaceTeams, allGroupsComplete, advancementStatuses) {
  const complete = fixtures.filter((fixture) => fixture.group === group).every((fixture) => {
    const match = { ...fixture, ...(state.matches[fixture.id] ?? {}) };
    return isCompletedMatch(match);
  });

  return `
    <section class="card">
      <div class="section-title">
        <span>Group ${group}</span>
        <small>${complete ? "Complete" : "Open"}</small>
      </div>
      ${standingsTable(rows, qualified, "standings-table", { showAdvancement: true, allGroupsComplete, projectedThirdPlaceTeams, advancementStatuses })}
    </section>
  `;
}

function standingsTable(rows, qualified, className = "", options = {}) {
  return `
    <table class="${escapeHtml(className)}">
      <thead>
        <tr>
          <th>Team</th><th>Pts</th><th>GD</th><th>GF</th><th>Owner</th>
        </tr>
      </thead>
      <tbody>
        ${rows
          .map(
            (row) => {
              const advancement = options.showThirdPlaceStatus
                ? thirdPlaceStatus(row, options.allGroupsComplete, options.advancementStatuses)
                : options.showAdvancement
                  ? options.advancementStatuses?.[row.team] ?? advancementStatus(row, qualified, options.allGroupsComplete, options.projectedThirdPlaceTeams)
                  : null;
              return `
              <tr class="${advancement ? `advancement-${advancement.tone}` : qualified.has(row.team) ? "qualified-row" : ""}">
                <td>
                  <div class="standings-team-cell">
                    <span>${row.rank}. ${escapeHtml(row.team)}</span>
                    ${advancement ? `<span class="advance-badge ${advancement.tone}">${escapeHtml(advancement.label)}</span>` : ""}
                  </div>
                </td>
                <td>${row.points}</td>
                <td>${row.gd > 0 ? "+" : ""}${row.gd}</td>
                <td>${row.gf}</td>
                <td><span class="owner-chip" style="--owner-color:${ownerColor(row.owner)}">${escapeHtml(row.owner)}</span></td>
              </tr>
            `;
            },
          )
          .join("")}
      </tbody>
    </table>
  `;
}

function advancementStatus(row, qualified, allGroupsComplete, projectedThirdPlaceTeams) {
  return getAdvancementStatus(row, qualified, allGroupsComplete, projectedThirdPlaceTeams);
}

export function getAdvancementStatus(row, qualified, allGroupsComplete, projectedThirdPlaceTeams = new Set()) {
  if (qualified.has(row.team)) {
    return row.rank === 3
      ? { label: "ADV 3RD", tone: "advancing" }
      : { label: "ADVANCING", tone: "advancing" };
  }
  if (!allGroupsComplete && row.rank <= 2) return { label: "ADVANCING", tone: "advancing" };
  if (!allGroupsComplete && row.rank === 3) {
    return projectedThirdPlaceTeams.has(row.team)
      ? { label: "PROJ ADV 3RD", tone: "advancing" }
      : { label: "PROJ OUT 3RD", tone: "out" };
  }
  if (row.rank === 3) return { label: "OUT 3RD", tone: "out" };
  return { label: "OUT", tone: "out" };
}

function thirdPlaceStatus(row, allGroupsComplete, advancementStatuses = {}) {
  const confirmedStatus = advancementStatuses[row.team];
  if (confirmedStatus?.confirmed) return confirmedStatus;
  if (row.groupRank === 4 || row.rank === 4) {
    return { label: "OUT 4TH", tone: "out" };
  }
  const thirdPlaceRank = row.thirdPlaceRank ?? row.rank;
  if (thirdPlaceRank <= 8) {
    return { label: allGroupsComplete ? "ADVANCES" : "PROJ ADV 3RD", tone: "advancing" };
  }
  return { label: allGroupsComplete ? "OUT 3RD" : "PROJ OUT 3RD", tone: "out" };
}

function bracketRound(round) {
  return `
    <section class="bracket-round">
      <div class="bracket-round-title">${escapeHtml(round.title)}</div>
      <div class="bracket-match-list">
        ${round.matches.map(bracketMatch).join("")}
      </div>
    </section>
  `;
}

function bracketMatch(match) {
  return `
    <article class="bracket-match">
      <div class="bracket-match-title">${escapeHtml(match.title)}</div>
      ${match.slots.map(bracketSlot).join("")}
    </article>
  `;
}

function bracketSlot(slot) {
  const hasTeam = Boolean(slot.team);
  const advancement = slot.advancementStatus;
  return `
    <div class="bracket-slot ${hasTeam ? "filled" : ""} ${advancement ? `advancement-${escapeHtml(advancement.tone)}` : ""}">
      <strong>${escapeHtml(slot.team || slot.label)}</strong>
      <span>${hasTeam ? escapeHtml(slot.label) : "Pending"}</span>
      ${advancement ? `<span class="advance-badge ${escapeHtml(advancement.tone)}">${escapeHtml(advancement.label)}</span>` : ""}
      ${slot.owner ? `<span class="owner-chip" style="--owner-color:${ownerColor(slot.owner)}">${escapeHtml(slot.owner)}</span>` : ""}
    </div>
  `;
}

function nationRaceCard(row, { compact = false } = {}) {
  const contenders = row.contenders;
  return `
    <article class="nation-race-card ${compact ? "compact" : ""}">
      <div class="nation-race-head">
        <div>
          <strong>${escapeHtml(row.title)}</strong>
          <span>${escapeHtml(row.status)}</span>
        </div>
        <span class="point-chip">+${row.points}</span>
      </div>
      ${
        row.winner
          ? `<div class="nation-race-winner"><span>Last standing</span><strong>${escapeHtml(row.winner)}</strong><span class="owner-chip" style="--owner-color:${ownerColor(row.owner)}">${escapeHtml(row.owner)}</span></div>`
          : ""
      }
      <div class="nation-contender-list ${compact ? "compact" : ""}">
        ${contenders.map((contender) => nationContenderRow(contender, { compact })).join("")}
      </div>
    </article>
  `;
}

function nationContenderRow(row, { compact = false } = {}) {
  const badge = row.alive ? (row.label.includes("confirmed") ? "CONF" : "LIVE") : "ELIM";
  return `
    <div class="nation-contender-row ${compact ? "compact" : ""} ${row.alive ? "" : "eliminated"}">
      <div>
        <strong>${escapeHtml(row.team)} <span class="survival-badge ${row.alive ? "live" : "eliminated"}">${escapeHtml(badge)}</span></strong>
        <span>${escapeHtml(row.label)} · ${escapeHtml(row.group)} · ${escapeHtml(row.federation)}</span>
      </div>
      <span class="owner-chip" style="--owner-color:${ownerColor(row.owner)}">${escapeHtml(row.owner)}</span>
    </div>
  `;
}

function draftPickCell(pick) {
  if (!pick) return "";
  const isPlayer = pick.type === "player";
  return `
    <div class="pick-cell ${isPlayer ? "player" : ""}">
      <strong>${escapeHtml(pick.name)}</strong>
      <span class="team-chip ${isPlayer ? "player" : ""}">${isPlayer ? escapeHtml(pick.team) : escapeHtml(getTeam(pick.name)?.federation ?? "")}</span>
    </div>
  `;
}

function pickBadge(pick) {
  const label = pick.type === "player" ? `${pick.name}` : pick.name;
  return `<span class="team-chip ${pick.type === "player" ? "player" : ""}">${escapeHtml(label)}</span>`;
}

function detailItem(detail, owner = "") {
  const className = detail.points < 0 ? "point-chip negative" : "point-chip";
  const ownerPrefix = owner ? `${owner}: ` : "";
  return `
    <li>
      <span class="${className}">${detail.points > 0 ? "+" : ""}${detail.points}</span>
      <span>${escapeHtml(ownerPrefix)}${escapeHtml(detail.reason)}</span>
    </li>
  `;
}

function ruleGroup(group) {
  return `
    <section class="rules-group">
      <div class="section-title">
        <span>${escapeHtml(group.title)}</span>
        <small>${escapeHtml(group.note)}</small>
      </div>
      <div class="rules-list">${group.rules.map(ruleLine).join("")}</div>
    </section>
  `;
}

function ruleLine({ points, label }) {
  return `
    <div class="rule-line">
      <span class="${points < 0 ? "point-chip negative" : "point-chip"}">${points > 0 ? "+" : ""}${points}</span>
      <span>${escapeHtml(label)}</span>
    </div>
  `;
}

function handleClick(event) {
  if (event.target.closest(".match-card") && event.target.closest("input, select, textarea, label")) {
    return;
  }

  const action = event.target.closest("[data-action]")?.dataset.action;
  if (!action) return;

  if (action === "unlock-admin") {
    unlockAdmin();
    return;
  }

  if (action === "lock-admin") {
    lockAdmin();
    return;
  }

  if (action === "select-match") {
    const row = event.target.closest("[data-match-id]");
    selectedMatchId = row.dataset.matchId;
    render();
    return;
  }
}

function unlockAdmin() {
  const input = document.getElementById("admin-key");
  if (input?.value === adminPassword) {
    adminUnlocked = true;
    sessionStorage.setItem(adminStorageKey, "true");
    render();
    return;
  }
  window.alert("Incorrect admin key.");
}

function lockAdmin() {
  adminUnlocked = false;
  sessionStorage.removeItem(adminStorageKey);
  render();
}

function requireAdmin(showAlert = true) {
  if (adminUnlocked) return true;
  if (showAlert) window.alert("Enter the admin key before editing local data.");
  return false;
}

function filterMatches(matches) {
  const today = todayIso();
  const query = filters.search.trim().toLowerCase();
  return matches.filter((match) => {
    if (filters.group !== "all") {
      if (filters.group === "knockout" && match.stage === "group") return false;
      if (filters.group !== "knockout" && match.group !== filters.group) return false;
    }
    if (filters.status === "today" && match.date !== today) return false;
    if (filters.status === "upcoming" && (isCompletedMatch(match) || match.date < today)) return false;
    if (filters.status === "final" && !isCompletedMatch(match)) return false;
    if (filters.status === "open" && isCompletedMatch(match)) return false;
    if (filters.owner !== "all") {
      const playerTeams = selectedPlayers.filter((player) => player.owner === filters.owner).map((player) => player.team);
      const owned =
        getOwnerForTeam(match.home) === filters.owner ||
        getOwnerForTeam(match.away) === filters.owner ||
        playerTeams.includes(match.home) ||
        playerTeams.includes(match.away);
      if (!owned) return false;
    }
    if (query) {
      const haystack = [
        match.home,
        match.away,
        match.venue,
        match.group,
        stageLabels[match.stage] ?? match.stage,
        getOwnerForTeam(match.home),
        getOwnerForTeam(match.away),
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });
}

function firstRelevantMatch() {
  const today = todayIso();
  const matches = getAllMatches(state);
  return (
    matches.find((match) => match.date === today && !isCompletedMatch(match)) ??
    matches.find((match) => !isCompletedMatch(match) && match.date >= today) ??
    matches.find((match) => !isCompletedMatch(match)) ??
    matches[0]
  );
}

function exportJson() {
  downloadFile(`world-cup-pool-${todayIso()}.json`, JSON.stringify(state, null, 2), "application/json");
}

function exportScoreCsv() {
  const result = calculateScores(state);
  const rows = [["rank", "owner", "score", "detail_points", "detail_reason", "category"]];
  result.ownerTotals.forEach((row, index) => {
    if (!row.details.length) {
      rows.push([index + 1, row.owner, row.score, "", "", ""]);
    } else {
      row.details.forEach((detail) => {
        rows.push([index + 1, row.owner, row.score, detail.points, detail.reason, detail.category]);
      });
    }
  });
  downloadFile(`world-cup-pool-scores-${todayIso()}.csv`, toCsv(rows), "text/csv");
}

function exportMatchCsv() {
  const rows = [["id", "stage", "group", "date", "venue", "home", "away", "home_score", "away_score", "status", "winner", "home_owner", "away_owner"]];
  getAllMatches(state).forEach((match) => {
    rows.push([
      match.id,
      stageLabels[match.stage] ?? match.stage,
      match.group,
      match.date,
      match.venue,
      match.home,
      match.away,
      scoreValue(match.homeScore),
      scoreValue(match.awayScore),
      match.status || "scheduled",
      getMatchWinner(match),
      getOwnerForTeam(match.home),
      getOwnerForTeam(match.away),
    ]);
  });
  downloadFile(`world-cup-pool-matches-${todayIso()}.csv`, toCsv(rows), "text/csv");
}

async function copyJson() {
  await navigator.clipboard.writeText(JSON.stringify(state, null, 2));
}

function importPastedJson() {
  const area = document.getElementById("paste-json");
  if (!area?.value.trim()) return;
  try {
    state = normalizeState(JSON.parse(area.value));
    saveAndRender();
  } catch (error) {
    window.alert(`Invalid JSON: ${error.message}`);
  }
}

function importJsonFile(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  if (!requireAdmin()) {
    event.target.value = "";
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    try {
      state = normalizeState(JSON.parse(String(reader.result)));
      saveAndRender();
    } catch (error) {
      window.alert(`Invalid JSON: ${error.message}`);
    }
  };
  reader.readAsText(file);
  event.target.value = "";
}

function resetState() {
  if (!requireAdmin()) return;
  if (!window.confirm("Reset all saved results and awards in this browser?")) return;
  state = createEmptyState();
  selectedMatchId = firstRelevantMatch()?.id ?? fixtures[0].id;
  saveAndRender();
}

function loadDemoResults() {
  state = createEmptyState();
  const samples = [
    ["g-a-01", 2, 0],
    ["g-a-02", 1, 1],
    ["g-b-01", 1, 0],
    ["g-d-01", 2, 2],
    ["g-c-02", 3, 1],
    ["g-i-01", 3, 1],
  ];
  samples.forEach(([id, homeScore, awayScore]) => {
    state.matches[id] = {
      homeScore,
      awayScore,
      status: "final",
      wentToPens: false,
      penaltyWinner: "",
    };
  });
  state.matchPlayerGoals["g-a-01"] = { Yamal: 1 };
  state.matchPlayerGoals["g-i-01"] = { Mbappe: 1 };
  state.awards.goldenBoot = "Vinicius";
  saveAndRender();
}

function saveAndRender() {
  render();
}

function downloadFile(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function toCsv(rows) {
  return rows
    .map((row) =>
      row
        .map((cell) => String(cell ?? ""))
        .map((cell) => `"${cell.replaceAll('"', '""')}"`)
        .join(","),
    )
    .join("\n");
}

function selectedPlayersForMatch(match) {
  return selectedPlayers.filter((player) => player.team === match.home || player.team === match.away);
}

function matchPlayerGoals(matchId) {
  return state.matchPlayerGoals[matchId] ?? {};
}

function scoreValue(value) {
  return value === undefined || value === null ? "" : String(value);
}

function formatDate(date) {
  if (!date) return "TBD";
  const parsed = new Date(`${date}T12:00:00`);
  return parsed.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function todayIso() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function ownerColor(owner) {
  return ownerColors[owner] ?? "#667085";
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
