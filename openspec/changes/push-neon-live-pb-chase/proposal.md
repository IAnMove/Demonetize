# Proposal: push-neon-live-pb-chase

## Why
The score loop is stronger when the player can see the personal-best chase during the run, not only on the final panel.

## What Changes
- Add a compact PB chase chip to the in-run HUD.
- Show when there is no PB yet, how many points remain, or how far ahead the current run is.
- Keep the UI DOM-only and non-blocking.

## Success Criteria
- The player can understand the next score target at a glance.
- Breaking PB is visible before the end screen.
- HUD remains compact and readable.
