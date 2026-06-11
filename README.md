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

## Google Sheet Path

Use the CSV exports as the first sheet structure:

- `Scores CSV`: leaderboard plus scoring detail rows.
- `Matches CSV`: fixture/result ledger with owners.
- `JSON Snapshot`: canonical state that can be pasted back into the dashboard.

A Google Sheet-backed version should keep the match ledger as the source of truth, then have this page read the published CSV or Apps Script JSON endpoint.
