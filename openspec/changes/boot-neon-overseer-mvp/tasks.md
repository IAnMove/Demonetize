# Tasks: boot-neon-overseer-mvp

## Phase 1 - Bootstrap
- [x] 1.1 Scaffold Vite + TypeScript + Three.js project
- [x] 1.2 Add npm scripts for dev, build, preview
- [x] 1.3 Create base folder structure for core, gameplay, render, ui
- [x] 1.4 Implement app boot and basic state machine
- [x] 1.5 Create title overlay with single Start action

## Phase 2 - Core Player Feel
- [x] 2.1 Implement player movement with keyboard
- [x] 2.2 Implement mouse aiming to arena plane
- [x] 2.3 Implement primary fire with cooldown
- [x] 2.4 Implement dash with cooldown
- [x] 2.5 Add camera follow and readable framing
- [x] 2.6 Add player HP and death state

## Phase 3 - Enemies and Waves
- [x] 3.1 Implement enemy drone archetype
- [x] 3.2 Implement enemy charger archetype
- [x] 3.3 Add enemy spawn manager
- [x] 3.4 Add wave progression logic
- [x] 3.5 Add difficulty ramp by wave
- [x] 3.6 Add game over and restart loop

## Phase 4 - Progression
- [x] 4.1 Add orb pickups dropped by enemies
- [x] 4.2 Add between-wave pause and selection state
- [x] 4.3 Implement at least 3 upgrades
- [x] 4.4 Persist chosen upgrades during run
- [x] 4.5 Add simple victory condition or mini-boss wave

## Phase 5 - Juice and UX
- [x] 5.1 Add HUD for HP, wave, and dash cooldown
- [x] 5.2 Add hit flashes, death feedback, and pickup feedback
- [x] 5.3 Add basic particles and emissive materials
- [x] 5.4 Add minimal sound hooks or placeholders
- [x] 5.5 Add controls overlay and restart CTA
- [x] 5.6 Ensure no blocking loading flow after initial start

## Phase 6 - Stability
- [x] 6.1 Add lightweight config and constants files
- [x] 6.2 Add smoke test or sanity checks for boot and state transitions
- [x] 6.3 Verify build works for static hosting
- [x] 6.4 Write README with controls and run commands
