# Project Context

## Name
OVERSEER: Neon Siege

## Product Goal
Ship a web-first neon PvE action game for a game jam.
The game must be instantly understandable, fast to load, and fun in under 10 seconds.

## Gameplay Pillars
1. Immediate action
2. Clean readable combat
3. High polish over high scope
4. Solo-first, co-op-ready architecture

## MVP Scope
- Single-player only
- One arena
- One full run loop
- 2-3 enemy archetypes
- 3 player upgrades
- Restartable session

## Non-Goals
- Webcam
- Voice features
- Multiplayer
- Backend
- Accounts
- Online leaderboard
- Heavy procedural generation
- Complex building systems

## Technical Stack
- Vite
- TypeScript
- Three.js
- Static hosting
- Minimal dependencies

## Code Conventions
- Prefer small modules
- Prefer data-driven config over hardcoded branching
- Prefer simple collision and custom lightweight systems over heavy physics
- Separate game state, rendering, UI, and entity logic
- Avoid premature abstraction

## Performance Targets
- Fast startup
- Smooth gameplay on a normal laptop
- Avoid heavy assets and large downloads

## UX Rules
- No login
- Minimal menu friction
- Restart from failure in one click
- Readable HUD
- Clear enemy telegraphs
