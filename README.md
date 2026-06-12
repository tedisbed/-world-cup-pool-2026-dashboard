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
- Loads the shared published scoreboard from `data/state.json` when hosted.

## Publish Score Updates on GitHub Pages

The hosted app reads `data/state.json` as the public source of truth. Browser edits
still save locally, but visitors will see the committed JSON file when they load
the GitHub Pages site.

Recommended update flow:

1. Open the dashboard locally or on GitHub Pages.
2. Unlock admin controls and enter score, award, or knockout updates.
3. Export a `JSON Snapshot`.
4. Replace `data/state.json` with the exported JSON.
5. Commit and push the change to GitHub.
6. Reload the GitHub Pages site after the Pages deploy finishes.

If `data/state.json` cannot be loaded, the app falls back to the browser's saved
local state. If neither source exists, it starts from an empty pool state.

## Google Sheet Path

Use the CSV exports as the first sheet structure:

- `Scores CSV`: leaderboard plus scoring detail rows.
- `Matches CSV`: fixture/result ledger with owners.
- `JSON Snapshot`: canonical state that can be pasted back into the dashboard.

A Google Sheet-backed version should keep the match ledger as the source of truth, then have this page read the published CSV or Apps Script JSON endpoint.
