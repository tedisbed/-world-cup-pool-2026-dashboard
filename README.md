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
- Loads the shared scoreboard from a published Google Sheet CSV.

## Publish Score Updates on GitHub Pages

The hosted app has one public match-data source:

1. The published Google Sheet CSV configured as `googleSheetCsvPath` in
   `app-state.mjs`.
2. An empty state if the Sheet cannot be loaded.

### Google Sheet Source

The site reads this published CSV whenever it opens:

```text
https://docs.google.com/spreadsheets/d/e/2PACX-1vTDvAZcUzudMTWYH5kfzoByxqte0FfSSQBhDen2stoBA2qyqbIRveAzwmp903gBmw/pub?gid=1553990171&single=true&output=csv
```

To update scores or pool inputs, edit the Google Sheet and make sure that tab is
published to the web as CSV. See `docs/google-sheet-template.md` for the row
format.

### Sheet Columns

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
