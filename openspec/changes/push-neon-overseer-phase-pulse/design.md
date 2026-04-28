# Design: push-neon-overseer-phase-pulse

## Approach
The phase pulse lives in session-level arena hazard logic, not inside a new boss entity family.
Simulation schedules the pulse from the final Overseer phase, while render adapts it into an expanding neon ring.

## Pulse Flow
- `warning`: short telegraph centered on the boss
- `active`: expanding damage ring crosses the arena
- `cooldown`: short gap before the next pulse can schedule

## Combat Rules
- Only the final-wave Overseer phase 2 can schedule the pulse
- The pulse damages the player when they overlap the moving ring band
- The ring should be dodgeable with movement or dash

## UX Rules
- Pulse must have its own announce/notify copy
- Pulse visuals must not be confused with purge lanes
- The active ring should feel hotter and more ritualized than normal hazards
