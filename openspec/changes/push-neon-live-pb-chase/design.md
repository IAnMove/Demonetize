# Design: push-neon-live-pb-chase

## Approach
Use existing local run records:
- derive PB chase label from `runRecords.bestScore`
- pass the label into the HUD snapshot
- color it neutral before PB and system/cyan after PB

## Scope Guard
No new persistence model, no backend, no leaderboard, no new overlay screen.
