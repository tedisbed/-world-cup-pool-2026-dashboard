import {
  areAllGroupsComplete,
  calculateScores,
  createEmptyState,
  draftPicks,
  fixtures,
  getAllMatches,
  getGroupStandings,
  getKnockoutBracket,
  getMatchImpact,
  getMatchWinner,
  getMatchesForDate,
  getNationPointStandings,
  getOwnerForTeam,
  getOwnerOpportunityRows,
  getPlayerGoalTotals,
  getQualifiedTeams,
  getRuleGroups,
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
import { loadInitialState, saveStateSnapshot, storageKey } from "./app-state.mjs";

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
let activeTab = "matches";
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
  nationPointsPanel: document.getElementById("nation-points-panel"),
  goalsPanel: document.getElementById("goals-panel"),
  draftPanel: document.getElementById("draft-panel"),
  rulesPanel: document.getElementById("rules-panel"),
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
  selectedMatchId = firstRelevantMatch()?.id ?? fixtures[0].id;
  populateFilters();
  attachEvents();
  render();
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
  const thirdTable = getThirdPlaceTable(state);

  groupsPanel.innerHTML = `
    <div class="group-grid">
      ${Object.entries(standings)
        .map(([group, rows]) => groupTable(group, rows, qualified))
        .join("")}
    </div>
    <section class="card" style="margin-top:12px">
      <div class="section-title">
        <span>Third-Place Table</span>
        <small>${areAllGroupsComplete(state) ? "Top 8 advance" : "Activates when all groups are complete"}</small>
      </div>
      ${
        thirdTable.length
          ? standingsTable(thirdTable.map((row, index) => ({ ...row, rank: index + 1 })), qualified, "standings-table")
          : `<div class="empty-state">No completed groups yet.</div>`
      }
    </section>
    <section class="card" style="margin-top:12px">
      <div class="section-title">
        <span>Nation Points Watch</span>
        <small>Last from group +7, last from federation +5</small>
      </div>
      ${nationWatch(result)}
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
      <div class="bracket-scroll">
        <div class="bracket-grid">
          ${bracket.rounds.map(bracketRound).join("")}
        </div>
      </div>
    </section>
  `;
}

function renderNationPoints() {
  const nationPointsPanel = document.getElementById("nation-points-panel");
  if (!nationPointsPanel) return;
  const standings = getNationPointStandings(state);

  nationPointsPanel.innerHTML = `
    <div class="nation-points-layout">
      <section class="card">
        <div class="section-title">
          <span>Last From Group</span>
          <small>+${rules.nationPoints.lastFromGroup} when one country is last standing</small>
        </div>
        <div class="nation-race-grid">
          ${standings.groupRows.map(nationRaceCard).join("")}
        </div>
      </section>

      <section class="card">
        <div class="section-title">
          <span>Last From Federation</span>
          <small>+${rules.nationPoints.lastFromFederation} by confederation</small>
        </div>
        <div class="nation-race-grid federation-grid">
          ${standings.federationRows.map(nationRaceCard).join("")}
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

function groupTable(group, rows, qualified) {
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
      ${standingsTable(rows, qualified, "standings-table")}
    </section>
  `;
}

function standingsTable(rows, qualified, className = "") {
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
            (row) => `
              <tr class="${qualified.has(row.team) ? "qualified-row" : ""}">
                <td>${row.rank}. ${escapeHtml(row.team)}</td>
                <td>${row.points}</td>
                <td>${row.gd > 0 ? "+" : ""}${row.gd}</td>
                <td>${row.gf}</td>
                <td><span class="owner-chip" style="--owner-color:${ownerColor(row.owner)}">${escapeHtml(row.owner)}</span></td>
              </tr>
            `,
          )
          .join("")}
      </tbody>
    </table>
  `;
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
  return `
    <div class="bracket-slot ${hasTeam ? "filled" : ""}">
      <strong>${escapeHtml(slot.team || slot.label)}</strong>
      <span>${hasTeam ? escapeHtml(slot.label) : "Pending"}</span>
      ${slot.owner ? `<span class="owner-chip" style="--owner-color:${ownerColor(slot.owner)}">${escapeHtml(slot.owner)}</span>` : ""}
    </div>
  `;
}

function nationRaceCard(row) {
  const contenders = row.contenders.slice(0, 4);
  return `
    <article class="nation-race-card">
      <div class="nation-race-head">
        <div>
          <strong>${escapeHtml(row.title)}</strong>
          <span>${escapeHtml(row.status)}</span>
        </div>
        <span class="point-chip">+${row.points}</span>
      </div>
      ${
        row.winner
          ? `<div class="nation-race-winner"><strong>${escapeHtml(row.winner)}</strong><span class="owner-chip" style="--owner-color:${ownerColor(row.owner)}">${escapeHtml(row.owner)}</span></div>`
          : ""
      }
      <div class="nation-contender-list">
        ${contenders.map(nationContenderRow).join("")}
      </div>
    </article>
  `;
}

function nationContenderRow(row) {
  return `
    <div class="nation-contender-row ${row.alive ? "" : "eliminated"}">
      <div>
        <strong>${escapeHtml(row.team)}</strong>
        <span>${escapeHtml(row.label)} · ${escapeHtml(row.group)} · ${escapeHtml(row.federation)}</span>
      </div>
      <span class="owner-chip" style="--owner-color:${ownerColor(row.owner)}">${escapeHtml(row.owner)}</span>
    </div>
  `;
}

function nationWatch(result) {
  const rows = Object.values(result.teamProgress)
    .sort((a, b) => b.rank - a.rank || Number(b.alive) - Number(a.alive) || a.team.localeCompare(b.team))
    .slice(0, 16);

  return `
    <table>
      <thead><tr><th>Team</th><th>State</th><th>Group</th><th>Fed</th><th>Owner</th></tr></thead>
      <tbody>
        ${rows
          .map(
            (row) => `
              <tr>
                <td>${escapeHtml(row.team)}</td>
                <td>${escapeHtml(row.label)}</td>
                <td>${escapeHtml(row.group)}</td>
                <td>${escapeHtml(row.federation)}</td>
                <td><span class="owner-chip" style="--owner-color:${ownerColor(getOwnerForTeam(row.team))}">${escapeHtml(getOwnerForTeam(row.team))}</span></td>
              </tr>
            `,
          )
          .join("")}
      </tbody>
    </table>
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
  saveState();
  render();
}

function saveState() {
  saveStateSnapshot(state, localStorage, storageKey);
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
