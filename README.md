# World Cup Pool Dashboard

Static local dashboard for the 2026 World Cup pool.

## Run

From this folder:

```bash
python3 -m http.server 8765
```

Open:

```text
http://localhost:8765
```

## What It Does

- Tracks the draft board from the provided image.
- Preloads all 72 group-stage fixtures.
- Lets you enter final scores and penalty winners.
- Lets you add knockout match rows once the bracket is known.
- Tracks selected-player goals and award winners.
- Autosaves in browser storage.
- Exports JSON snapshots, detailed score CSV, and match CSV.
- Loads the shared published scoreboard from a configured Google Sheet or
  `data/state.json` when hosted.

## Publish Score Updates on GitHub Pages

The hosted app reads published data sources in this order:

1. Any non-empty URLs listed in `data/source-config.json`.
2. The bundled `data/state.json` file.
3. The browser's saved local state.
4. An empty pool state.

Browser edits still save locally. Visitors see the first published source that
can be loaded when they open the GitHub Pages site.

### Option A: Keep Using `data/state.json`

1. Open the dashboard locally or on GitHub Pages.
2. Unlock admin controls and enter score, award, or knockout updates.
3. Export a `JSON Snapshot`.
4. Replace `data/state.json` with the exported JSON.
5. Commit and push the change to GitHub.
6. Reload the GitHub Pages site after the Pages deploy finishes.

If `data/state.json` cannot be loaded, the app falls back to the browser's saved
local state. If neither source exists, it starts from an empty pool state.

### Option B: Use a Published Google Sheet CSV

Edit `data/source-config.json` and set the first source URL to a published CSV:

```json
{
  "sources": [
    {
      "type": "google-sheet-csv",
      "url": "https://docs.google.com/spreadsheets/d/e/YOUR_PUBLISHED_ID/pub?gid=0&single=true&output=csv"
    }
  ]
}
```

In Google Sheets, use **File > Share > Publish to web**, choose the sheet tab
that contains the dashboard state rows, and publish it as CSV. The published
CSV must be public because GitHub Pages cannot use private Google APIs or
secrets.

Sheet columns:

| type | id | homeScore | awayScore | status | wentToPens | penaltyWinner | player | goals | winner | date | stage | group | venue | home | away |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| match | g-a-01 | 2 | 1 | final | false | | | | | | | | | | |
| match_player_goal | g-a-01 | | | | | | Mbappe | 2 | | | | | | | |
| player_goal | Vinicius | | | | | | | 3 | | | | | | | |
| award | goldenBoot | | | | | | | | Vinicius | | | | | | |
| custom_match | custom-r32-1 | 1 | 0 | final | false | | | | | 2026-06-28 | r32 | | Knockout | Spain | France |

Only the columns needed for a row type have to be filled in.

- `match`: updates an existing fixture by `id`.
- `custom_match`: adds a knockout row.
- `match_player_goal`: records selected-player goals for one match.
- `player_goal`: records manual selected-player goal totals by player name.
- `award`: records award winners such as `goldenBall`, `goldenBoot`,
  `goldenGlove`, or `bestYoungPlayer`.

If the published Sheet URL is blank or unavailable, the app automatically tries
`data/state.json`.

### Option C: Use an Apps Script JSON URL

If a Sheet needs multiple tabs or richer logic, publish an Apps Script web app
that returns the same JSON shape as `data/state.json`, then configure it as:

```json
{
  "sources": [
    {
      "type": "json",
      "url": "https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec"
    }
  ]
}
```

The endpoint must allow anonymous `GET` access and return JSON with the
dashboard state shape:

```json
{
  "version": 1,
  "matches": {},
  "customMatches": [],
  "matchPlayerGoals": {},
  "playerGoals": {},
  "awards": {}
}
```

## Google Sheet Path

Use the CSV exports as the first sheet structure:

- `Scores CSV`: leaderboard plus scoring detail rows.
- `Matches CSV`: fixture/result ledger with owners.
- `JSON Snapshot`: canonical state that can be pasted back into the dashboard.

The configured Sheet-backed version can keep the match ledger as the source of
truth, then have this page read the published CSV or Apps Script JSON endpoint.
