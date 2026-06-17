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
- Exports JSON snapshots, detailed score CSV, and match CSV.
- Loads the shared published scoreboard from `data/live-state.json`.
- Refreshes World Cup scores from API-Football through a scheduled GitHub
  Action.

## Publish Score Updates on GitHub Pages

The hosted app has one public data source:

1. The generated `data/live-state.json` file.
2. An empty state if the live file cannot be loaded.

### Auto-Refresh API-Football Data

The repo includes a scheduled GitHub Action at
`.github/workflows/update-world-cup-data.yml`. During the tournament window, it
runs every 7 minutes, but only calls API-Football when cached kickoff times show
that a match is near or currently live. It can also be run manually from the
GitHub Actions tab.

Setup:

1. Create a free API-Football account.
2. In GitHub, add a repository secret named `API_FOOTBALL_KEY`.
3. Run **Update World Cup Data** manually once with `refresh_schedule` checked
   to verify the secret and cache kickoff times.

The importer uses API-Football `league=1` and `season=2026`. It imports final
scores, penalty winners, and selected-player goals when goal events are present
in the fixture response. Awards remain manual. The importer has a hard cap of 95
API calls per UTC day, tracked in `data/api-request-budget.json`; if the cap is
hit, the site keeps serving the last good `data/live-state.json`.

### One-Time Google Sheet Backfill

If historical match rows still live in the old Google Sheet, migrate them once:

```bash
node scripts/backfill-from-google-sheet.mjs
```

The script reads the old published Sheet CSV, merges it into
`data/live-state.json`, and preserves API-owned values when both sources have a
result. You can also pass a local CSV:

```bash
node scripts/backfill-from-google-sheet.mjs --csv path/to/export.csv
```

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
