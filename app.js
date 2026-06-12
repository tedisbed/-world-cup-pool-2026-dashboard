import {
  awardLabels,
  areAllGroupsComplete,
  calculateScores,
  createEmptyState,
  draftPicks,
  fixtures,
  getAllMatches,
  getGroupStandings,
  getMatchImpact,
  getMatchWinner,
  getMatchesByDate,
  getMatchesForDate,
  getOwnerForTeam,
  getOwnerOpportunityRows,
  getPlayerGoalTotals,
  getQualifiedTeams,
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

const storageKey = "world-cup-pool-dashboard-v1";
const adminStorageKey = "world-cup-pool-dashboard-admin-unlocked";
const adminPassword = "Noah";
const officialIds = new Set(fixtures.map((fixture) => fixture.id));
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

let state = loadState();
let adminUnlocked = sessionStorage.getItem(adminStorageKey) === "true";
let selectedMatchId = firstRelevantMatch()?.id ?? fixtures[0].id;
let activeTab = "matches";
let renderTimer = 0;
const filters = {
  search: "",
  owner: "all",
  group: "all",
  status: "all",
};

const dom = {
  leaderboard: document.getElementById("leaderboard"),
  todayPanel: document.getElementById("today-panel"),
  pulsePanel: document.getElementById("pulse-panel"),
  statusStrip: document.getElementById("status-strip"),
  spotlight: document.getElementById("spotlight"),
  matchList: document.getElementById("match-list"),
  impactPanel: document.getElementById("impact-panel"),
  updatePanel: document.getElementById("update-panel"),
  awardsPanel: document.getElementById("awards-panel"),
  groupsPanel: document.getElementById("groups-panel"),
  draftPanel: document.getElementById("draft-panel"),
  dataPanel: document.getElementById("data-panel"),
  search: document.getElementById("search"),
  ownerFilter: document.getElementById("owner-filter"),
  groupFilter: document.getElementById("group-filter"),
  statusFilter: document.getElementById("status-filter"),
};

init();

function init() {
  populateFilters();
  attachEvents();
  render();
}

function attachEvents() {
  document.querySelector(".tabs").addEventListener("click", (event) => {
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
  document.body.addEventListener("change", handleChange);
  document.body.addEventListener("input", handleInput);

  document.getElementById("export-json").addEventListener("click", exportJson);
  document.getElementById("export-score-csv").addEventListener("click", exportScoreCsv);
  document.getElementById("import-json").addEventListener("change", importJsonFile);
  document.getElementById("reset-state").addEventListener("click", resetState);
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
  renderUpdateScore();
  renderAwards(result);
  renderGroups(result);
  renderDraft();
  renderData(result);
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

function renderAwards(result) {
  const playerGoalTotals = getPlayerGoalTotals(state);
  const maxGoals = Math.max(0, ...selectedPlayers.map((player) => Number(playerGoalTotals[player.name] || 0)));
  const topScorers = selectedPlayers.filter((player) => Number(playerGoalTotals[player.name] || 0) === maxGoals && maxGoals > 0);

  dom.awardsPanel.innerHTML = `
    <div class="award-grid">
      <section class="card">
        <div class="section-title">
          <span>Selected Player Goals</span>
          <small>${topScorers.length ? topScorers.map((player) => player.name).join(", ") : "No leader yet"}</small>
        </div>
        ${selectedPlayers.map((player) => playerGoalRow(player, playerGoalTotals)).join("")}
      </section>

      <section class="card">
        <div class="section-title">
          <span>Award Winners</span>
          <small>Selected player +8, selected team +5</small>
        </div>
        ${Object.entries(awardLabels).map(awardRow).join("")}
        <div class="impact-section">
          <div class="card-title">Current Award Points</div>
          <ul class="detail-list">
            ${result.ownerTotals
              .flatMap((row) =>
                row.details
                  .filter((detail) => detail.category === "Individual Awards")
                  .map((detail) => detailItem(detail, row.owner)),
              )
              .slice(0, 12)
              .join("") || `<li><span class="point-chip">0</span><span>No award points entered.</span></li>`}
          </ul>
        </div>
      </section>
    </div>
  `;
}

function renderGroups(result) {
  const standings = getGroupStandings(state);
  const qualified = getQualifiedTeams(state);
  const thirdTable = getThirdPlaceTable(state);

  dom.groupsPanel.innerHTML = `
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
          ? standingsTable(thirdTable.map((row, index) => ({ ...row, rank: index + 1 })), qualified)
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

function renderDraft() {
  dom.draftPanel.innerHTML = `
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

function renderData(result) {
  const serialized = JSON.stringify(state, null, 2);
  const disabled = adminUnlocked ? "" : "disabled";
  dom.dataPanel.innerHTML = `
    <div class="data-grid">
      <section class="data-box">
        <h3>Export</h3>
        <div class="knockout-form">
          <button type="button" data-action="export-json">JSON Snapshot</button>
          <button type="button" data-action="export-score-csv">Scores CSV</button>
          <button type="button" data-action="export-match-csv">Matches CSV</button>
          <button type="button" data-action="copy-json">Copy JSON</button>
        </div>
        <textarea class="import-area" readonly>${escapeHtml(serialized)}</textarea>
      </section>

      <section class="data-box">
        <h3>Import</h3>
        <textarea class="import-area" id="paste-json" placeholder="Paste exported JSON" ${disabled}></textarea>
        <div class="knockout-form" style="margin-top:8px">
          <button type="button" data-action="import-pasted-json" ${disabled}>Import Pasted JSON</button>
          <button type="button" data-action="load-demo" ${disabled}>Load Sample Results</button>
        </div>
      </section>

      <section class="data-box">
        <h3>Add Knockout Match</h3>
        <form class="knockout-form" id="knockout-form">
          <select name="stage" aria-label="Stage" ${disabled}>
            <option value="r32">Round of 32</option>
            <option value="r16">Round of 16</option>
            <option value="qf">Quarterfinal</option>
            <option value="sf">Semifinal</option>
            <option value="final">Final</option>
          </select>
          <input name="date" type="date" value="2026-06-29" ${disabled} />
          <select name="home" aria-label="Home team" ${disabled}>${teamOptions()}</select>
          <select name="away" aria-label="Away team" ${disabled}>${teamOptions("Germany")}</select>
          <button class="full-span" type="submit" ${disabled}>Add Match Row</button>
        </form>
      </section>

      <section class="data-box">
        <h3>Rule Reference</h3>
        <div class="rules-list">${ruleLines().join("")}</div>
        <p class="muted">
          Fixture names are normalized to the pool sheet. Schedule source:
          <a href="https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/match-schedule-fixtures-results-teams-stadiums">FIFA match schedule</a>.
        </p>
      </section>
    </div>
  `;

  document.getElementById("knockout-form")?.addEventListener("submit", addKnockoutMatch);
}

function matchCard(match) {
  const homeOwner = getOwnerForTeam(match.home);
  const awayOwner = getOwnerForTeam(match.away);
  const winner = getMatchWinner(match);
  const selected = match.id === selectedMatchId ? " selected" : "";
  const isCustom = !officialIds.has(match.id);
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
        <div class="result-options">
          ${isCustom ? `<button class="icon-button danger" type="button" data-action="remove-custom" data-match-id="${escapeHtml(match.id)}">Remove</button>` : ""}
        </div>
      </div>
    </article>
  `;
}

function renderUpdateScore() {
  const matches = getAllMatches(state);
  const match = matches.find((row) => row.id === selectedMatchId) ?? firstRelevantMatch();
  if (!match) {
    dom.updatePanel.innerHTML = `<div class="empty-state">No match rows available.</div>`;
    return;
  }
  selectedMatchId = match.id;
  const selectedPlayerRows = selectedPlayersForMatch(match);
  const disabled = adminUnlocked ? "" : "disabled";

  dom.updatePanel.innerHTML = `
    ${adminGate()}
    <section class="card update-score-card">
      <div class="section-title">
        <span>Update Score</span>
        <small>${formatDate(match.date)}${match.group ? ` + Group ${escapeHtml(match.group)}` : ""} + ${escapeHtml(match.venue || "TBD")}</small>
      </div>

      <label class="match-picker">
        <span class="muted">Match</span>
        <select data-action="pick-update-match" aria-label="Match to update">
          ${matchDayOptions()}
        </select>
      </label>

      <div class="update-teams">
        ${updateTeamPanel(match, "home")}
        ${updateTeamPanel(match, "away")}
      </div>

      <div class="result-options update-options">
        <label class="check-label"><input data-match-id="${escapeHtml(match.id)}" data-field="status" type="checkbox" ${match.status === "final" ? "checked" : ""} ${disabled} /> Final</label>
        ${
          match.stage !== "group"
            ? `
              <label class="check-label"><input data-match-id="${escapeHtml(match.id)}" data-field="wentToPens" type="checkbox" ${match.wentToPens ? "checked" : ""} ${disabled} /> Pens</label>
              <select class="compact-select" data-match-id="${escapeHtml(match.id)}" data-field="penaltyWinner" aria-label="Penalty winner" ${disabled}>
                <option value="">PK winner</option>
                <option value="${escapeHtml(match.home)}" ${match.penaltyWinner === match.home ? "selected" : ""}>${escapeHtml(match.home)}</option>
                <option value="${escapeHtml(match.away)}" ${match.penaltyWinner === match.away ? "selected" : ""}>${escapeHtml(match.away)}</option>
              </select>
            `
            : ""
        }
      </div>

      <div class="impact-section">
        <div class="card-title">Selected Players In This Match</div>
        ${
          selectedPlayerRows.length
            ? selectedPlayerRows.map((player) => matchPlayerGoalRow(match, player)).join("")
            : `<div class="empty-state compact-empty">No selected players from the 8 picks are in this match.</div>`
        }
      </div>
    </section>
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

function updateTeamPanel(match, side) {
  const team = match[side];
  const scoreField = side === "home" ? "homeScore" : "awayScore";
  const owner = getOwnerForTeam(team);
  const disabled = adminUnlocked ? "" : "disabled";
  return `
    <section class="update-team">
      <div>
        <strong>${escapeHtml(team)}</strong>
        <div class="muted">${escapeHtml(side === "home" ? "Home" : "Away")} + <span class="owner-chip" style="--owner-color:${ownerColor(owner)}">${escapeHtml(owner || "Unowned")}</span></div>
      </div>
      <input class="score-input" data-match-id="${escapeHtml(match.id)}" data-field="${scoreField}" type="number" min="0" step="1" value="${scoreValue(match[scoreField])}" aria-label="${escapeHtml(team)} score" ${disabled} />
    </section>
  `;
}

function matchPlayerGoalRow(match, player) {
  const goals = matchPlayerGoals(match.id)[player.name] ?? 0;
  const disabled = adminUnlocked ? "" : "disabled";
  return `
    <div class="player-row">
      <div>
        <strong>${escapeHtml(player.name)}</strong>
        <div class="muted">${escapeHtml(player.team)} + ${escapeHtml(player.owner)}</div>
      </div>
      <input class="compact-input" data-match-id="${escapeHtml(match.id)}" data-match-player-goal="${escapeHtml(player.name)}" type="number" min="0" step="1" value="${goals}" aria-label="${escapeHtml(player.name)} goals in this match" ${disabled} />
    </div>
  `;
}

function adminGate() {
  return `
    <section class="card admin-gate ${adminUnlocked ? "unlocked" : ""}">
      <div>
        <div class="card-title">${adminUnlocked ? "Editing Unlocked" : "Editing Locked"}</div>
        <div class="muted">${adminUnlocked ? "Score updates and data changes are enabled in this browser session." : "Enter the admin key to change scores, awards, imports, or match rows."}</div>
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

function awardRow([key, label]) {
  const selected = state.awards[key] ?? "";
  const disabled = adminUnlocked ? "" : "disabled";
  return `
    <label class="award-row">
      <strong>${escapeHtml(label)}</strong>
      <select class="award-select" data-award="${escapeHtml(key)}" ${disabled}>
        <option value="">Not set</option>
        <option value="Other" ${selected === "Other" ? "selected" : ""}>Other / unselected</option>
        ${selectedPlayers
          .map((player) => `<option value="${escapeHtml(player.name)}" ${selected === player.name ? "selected" : ""}>${escapeHtml(player.name)} (${escapeHtml(player.team)})</option>`)
          .join("")}
      </select>
    </label>
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
      ${standingsTable(rows, qualified)}
    </section>
  `;
}

function standingsTable(rows, qualified) {
  return `
    <table>
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

function ruleLines() {
  return [
    [rules.allEvents.winByTwo, "Win any match by 2+"],
    [rules.allEvents.loseByTwo, "Lose any match by 2+"],
    [rules.allEvents.penaltyWin, "Win on penalties"],
    [rules.groupStage.win, "Group-stage win"],
    [rules.groupStage.draw, "Group-stage draw"],
    [rules.groupStage.winGroup, "Win group"],
    [rules.groupStage.advance, "Advance to knockout"],
    [rules.groupStage.bestFourGoalDifference, "Top-4 group GD"],
    [rules.groupStage.worstFourGoalDifference, "Bottom-4 group GD"],
    [rules.groupStage.scorelessGroup, "Scoreless group stage"],
    [rules.knockoutStage.r32, "Win Round of 32"],
    [rules.knockoutStage.r16, "Win Round of 16"],
    [rules.knockoutStage.qf, "Win quarterfinal"],
    [rules.knockoutStage.sf, "Win semifinal"],
    [rules.knockoutStage.final, "Win World Cup"],
    [rules.individualAwards.selectedPlayerGoal, "Selected-player goal"],
    [rules.individualAwards.selectedPlayerAward, "Selected-player award"],
    [rules.individualAwards.selectedTeamHasAwardWinner, "Team has award winner"],
    [rules.nationPoints.lastFromGroup, "Last from group"],
    [rules.nationPoints.lastFromFederation, "Last from federation"],
  ].map(
    ([points, label]) => `
      <div class="rule-line">
        <span class="${points < 0 ? "point-chip negative" : "point-chip"}">${points > 0 ? "+" : ""}${points}</span>
        <span>${escapeHtml(label)}</span>
      </div>
    `,
  );
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

  if (action === "remove-custom") {
    if (!requireAdmin()) return;
    const id = event.target.closest("[data-match-id]").dataset.matchId;
    state.customMatches = state.customMatches.filter((match) => match.id !== id);
    saveAndRender();
    return;
  }

  if (action === "export-json") exportJson();
  if (action === "export-score-csv") exportScoreCsv();
  if (action === "export-match-csv") exportMatchCsv();
  if (action === "copy-json") copyJson();
  if (action === "import-pasted-json" && requireAdmin()) importPastedJson();
  if (action === "load-demo" && requireAdmin()) loadDemoResults();
}

function handleChange(event) {
  if (event.target.dataset.action === "pick-update-match") {
    selectedMatchId = event.target.value;
    render();
    return;
  }

  const matchId = event.target.dataset.matchId;
  const field = event.target.dataset.field;
  if (matchId && field) {
    if (!requireAdmin()) return;
    const value = readFieldValue(event.target, field);
    updateMatch(matchId, { [field]: value });
    saveAndRender();
    return;
  }

  const matchPlayerGoal = event.target.dataset.matchPlayerGoal;
  if (matchId && matchPlayerGoal) {
    if (!requireAdmin()) return;
    updateMatchPlayerGoal(matchId, matchPlayerGoal, event.target.value);
    saveAndRender();
    return;
  }

  const award = event.target.dataset.award;
  if (award) {
    if (!requireAdmin()) return;
    state.awards[award] = event.target.value;
    saveAndRender();
  }
}

function handleInput(event) {
  const matchId = event.target.dataset.matchId;
  const field = event.target.dataset.field;
  if (matchId && (field === "homeScore" || field === "awayScore")) {
    if (!requireAdmin(false)) return;
    updateMatch(matchId, { [field]: event.target.value });
    saveState();
    scheduleRender();
    return;
  }

  const matchPlayerGoal = event.target.dataset.matchPlayerGoal;
  if (matchId && matchPlayerGoal) {
    if (!requireAdmin(false)) return;
    updateMatchPlayerGoal(matchId, matchPlayerGoal, event.target.value);
    saveState();
    scheduleRender();
  }
}

function readFieldValue(target, field) {
  if (field === "status") return target.checked ? "final" : "scheduled";
  if (field === "wentToPens") return target.checked;
  return target.value;
}

function updateMatch(id, patch) {
  if (officialIds.has(id)) {
    state.matches[id] = {
      status: "scheduled",
      homeScore: "",
      awayScore: "",
      wentToPens: false,
      penaltyWinner: "",
      ...(state.matches[id] ?? {}),
      ...patch,
    };
    return;
  }

  const match = state.customMatches.find((entry) => entry.id === id);
  if (match) Object.assign(match, patch);
}

function updateMatchPlayerGoal(matchId, playerName, value) {
  state.matchPlayerGoals[matchId] = {
    ...(state.matchPlayerGoals[matchId] ?? {}),
    [playerName]: Math.max(0, Number(value || 0)),
  };
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
  if (showAlert) window.alert("Enter the admin key on the Update Score tab before editing.");
  return false;
}

function addKnockoutMatch(event) {
  event.preventDefault();
  if (!requireAdmin()) return;
  const formData = new FormData(event.currentTarget);
  const home = String(formData.get("home"));
  const away = String(formData.get("away"));
  if (!home || !away || home === away) {
    window.alert("Pick two different teams.");
    return;
  }

  const id = `ko-${Date.now()}`;
  state.customMatches.push({
    id,
    stage: String(formData.get("stage")),
    date: String(formData.get("date") || "2026-06-29"),
    group: "",
    venue: "Knockout",
    home,
    away,
    homeScore: "",
    awayScore: "",
    status: "scheduled",
    wentToPens: false,
    penaltyWinner: "",
  });
  selectedMatchId = id;
  saveAndRender();
  activeTab = "matches";
  document.querySelector('[data-tab="matches"]').click();
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

function scheduleRender() {
  window.clearTimeout(renderTimer);
  renderTimer = window.setTimeout(render, 350);
}

function loadState() {
  try {
    const raw = localStorage.getItem(storageKey);
    return raw ? normalizeState(JSON.parse(raw)) : createEmptyState();
  } catch {
    return createEmptyState();
  }
}

function saveState() {
  localStorage.setItem(storageKey, JSON.stringify(state));
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

function teamOptions(selected = "Brazil") {
  return teams
    .map((team) => `<option value="${escapeHtml(team.name)}" ${team.name === selected ? "selected" : ""}>${escapeHtml(team.name)}</option>`)
    .join("");
}

function selectedPlayersForMatch(match) {
  return selectedPlayers.filter((player) => player.team === match.home || player.team === match.away);
}

function matchPlayerGoals(matchId) {
  return state.matchPlayerGoals[matchId] ?? {};
}

function formatMatchOption(match) {
  const group = match.group ? `Group ${match.group}` : stageLabels[match.stage] ?? match.stage;
  return `${match.home} vs ${match.away} - ${group} - ${match.venue || "TBD"}`;
}

function matchDayOptions() {
  return getMatchesByDate(state)
    .map(
      ({ date, matches }) => `
        <optgroup label="${escapeHtml(formatDate(date))}">
          ${matches.map((match) => `<option value="${escapeHtml(match.id)}" ${match.id === selectedMatchId ? "selected" : ""}>${escapeHtml(formatMatchOption(match))}</option>`).join("")}
        </optgroup>
      `,
    )
    .join("");
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
