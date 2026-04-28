# Proposal: boot-neon-overseer-mvp

## Why
We need a realistic, polished, low-risk jam game that can be finished quickly and still feel commercial.
A single-player PvE survival loop is the fastest path to a strong playable prototype.

## What Changes
- Add a browser-playable MVP game loop
- Add one neon arena
- Add player movement, aim, dash, and primary fire
- Add enemy spawning and wave progression
- Add pickups and between-wave upgrades
- Add game over, restart, and basic victory condition
- Add minimal UI/HUD and visual juice
- Keep architecture ready for a future coop extension

## Success Criteria
- Player can start a run with one click
- Player understands controls in under 15 seconds
- Core loop is fun with no tutorial video
- A full run lasts roughly 5-8 minutes
- Restart is immediate
- Build is static-host friendly

## Explicit Non-Goals
- Webcam
- Voice interaction
- Multiplayer networking
- Backend services
- Accounts or persistence
