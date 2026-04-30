# Proposal: push-exact-death-attribution

## Why
The game-over summary can feel vague when several hazards overlap in the final frame. The previous loss reason logic inferred the likely cause from nearby events and screen state, which was useful but not exact enough for player trust.

## What Changes
- Store the last applied player damage source directly on player state.
- Tag enemy contact, boss beam, boss pulse, arena edge, purge lane, artillery, and elite burst damage at the call site.
- Prefer the structured damage source when building the run summary, falling back to the old heuristics only if needed.

## Success Criteria
- A player death summary reflects the final damaging source instead of the nearest visual hazard.
- Existing game-over delay and ship breakup animation remain unchanged.
- Smoke coverage protects the structured attribution path.

