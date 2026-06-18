# Google Sheet Dashboard Source

The hosted dashboard reads match and scoring data from one published Google
Sheet CSV. The configured source is `googleSheetCsvPath` in `app-state.mjs`.

The CSV's first row must be headers. Every data row must have a `type` and an
`id`; rows missing either value are ignored.

## Required Header Row

Copy this header row into row 1:

```csv
type,id,homeScore,awayScore,status,wentToPens,penaltyWinner,player,goals,winner,date,stage,group,venue,home,away
```

The parser is forgiving about header capitalization and punctuation, so
`homeScore`, `Home Score`, and `home_score` all map to the same field. Keeping
the exact headers above makes the sheet easier to compare with this template.

## Row Types

| type | Use | Required cells | Optional cells |
| --- | --- | --- | --- |
| `match` | Update a built-in fixture by match ID. | `type`, `id` | `homeScore`, `awayScore`, `status`, `wentToPens`, `penaltyWinner` |
| `match_player_goal` | Record goals by a selected player in one match. | `type`, `id`, `player`, `goals` | none |
| `player_goal` | Set a selected player's manual tournament goal total. | `type`, `id`, `goals` | none |
| `award` | Set an award winner. | `type`, `id`, `winner` | none |
| `custom_match` | Add a knockout match row once the bracket is known. | `type`, `id`, `home`, `away` | `homeScore`, `awayScore`, `status`, `wentToPens`, `penaltyWinner`, `date`, `stage`, `group`, `venue` |

Supported aliases are also accepted:

- `type`: `record`, `entity`, or `kind`
- `id`: `matchId`, `match_id`, or `key`
- `match_player_goal`: `matchPlayerGoal`
- `player_goal`: `playerGoal`
- `custom_match`: `customMatch`
- `player`: `playerName`, `player_name`, or `field`
- `goals`: `value`
- `winner`: `value`

## Example Rows

```csv
type,id,homeScore,awayScore,status,wentToPens,penaltyWinner,player,goals,winner,date,stage,group,venue,home,away
match,g-a-01,2,1,final,false,,,,,,,,,,
match,g-b-01,1,1,final,true,Canada,,,,,,,,,
match_player_goal,g-a-01,,,,,,Mbappe,2,,,,,,,
player_goal,Vinicius,,,,,,,3,,,,,,,
award,goldenBoot,,,,,,,,Vinicius,,,,,,
custom_match,custom-r32-1,1,0,final,false,,,,,2026-06-28,r32,,Knockout,Spain,France
custom_match,custom-final-1,2,2,final,true,Argentina,,,,2026-07-19,final,,New York/New Jersey,Argentina,France
```

## Match Rows

Use `match` rows for the 72 built-in group-stage fixtures. The `id` must match
one of the fixture IDs in the app, such as `g-a-01`, `g-a-02`, `g-b-01`, and so
on through `g-l-06`.

Only entered match cells are applied:

- Leave `homeScore` and `awayScore` blank until the score is known.
- Use numeric scores, for example `0`, `1`, `2`.
- Use `status` such as `final` when a result should count.
- Use `wentToPens` only when penalties happened.
- Use `penaltyWinner` as the winning team name when `wentToPens` is true.

Blank match fields do not clear an existing value from another row with the same
ID in the same CSV. If you want a clean source of truth, keep one row per match
ID and edit that row.

## Player Goal Rows

There are two ways to enter selected-player goals:

- `match_player_goal`: goals for a selected player in a specific match.
- `player_goal`: manual total goals for a selected player across the tournament.

Selected player names must match the pool draft names used by the app:
`Vinicius`, `Haaland`, `Diaz`, `Yamal`, `Oyarzabal`, `Kane`, `Messi`, `Mbappe`.

For `match_player_goal`, put the match ID in `id`, the player name in `player`,
and the match goals in `goals`.

For `player_goal`, put the player name in `id` and the total in `goals`.

## Award Rows

Use `award` rows with one of these `id` values:

- `goldenBall`
- `goldenBoot`
- `goldenGlove`
- `bestYoungPlayer`

Put the winner name in `winner`. Award values are plain text, but scoring only
applies when the name matches a selected player or a drafted player's team,
depending on the award rule being evaluated.

## Custom Knockout Matches

Use `custom_match` for knockout games that are not part of the built-in
group-stage fixture list. Recommended `stage` values are:

- `r32`
- `r16`
- `qf`
- `sf`
- `final`

If optional cells are blank, the app uses these defaults:

- `date`: blank
- `stage`: `r32`
- `group`: blank
- `venue`: `Knockout`
- `home`: blank
- `away`: blank

Use unique IDs such as `custom-r32-1`, `custom-r16-3`, or `custom-final-1`.
The CSV parser appends every `custom_match` row it sees, so duplicate custom
match IDs can create duplicate rows.

## Publishing the Sheet

1. Create or keep a Google Sheet tab containing the header and rows above.
2. In Google Sheets, choose **File > Share > Publish to web**.
3. Select the specific tab that contains the dashboard state rows.
4. Choose **Comma-separated values (.csv)** and publish.
5. Put that published CSV URL in `googleSheetCsvPath` in `app-state.mjs`.

The published CSV must be anonymously accessible. GitHub Pages cannot read a
private Sheet, a normal edit URL, or a link that requires a Google sign-in.

## Gotchas

- The Sheet is the live source for match results, selected-player goals, awards,
  and custom knockout rows.
- `type` and `id` are required on every row. Rows without both are skipped.
- Boolean true values for `wentToPens` are `true`, `yes`, `y`, or `1`.
  Anything else, including `false`, blank, or `0`, is false.
- Invalid numbers become `0`. Leave score cells blank when the score is unknown.
- Blank cells usually mean "do not set this field." For award winners, a blank
  `winner` clears that award if the row exists.
