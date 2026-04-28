# Proposal: push-neon-ranged-trails

## Why
Ranged attacks already affect gameplay, but their payoff is too abstract.
We need visible firing traces so sentry shots and Overseer purge beams feel dangerous the instant they happen.

## What Changes
- Add explicit ranged-fire event data for enemy firing lines
- Render short-lived beam traces for sentry and Overseer attacks
- Keep combat simulation lightweight and hitscan-based

## Success Criteria
- The player can see where a ranged enemy attack traveled
- Sentry and Overseer fire feel distinct from each other
- The implementation does not add a heavy projectile simulation path
