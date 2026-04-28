# Design: boot-neon-overseer-mvp

## High-Level Architecture
The game is a lightweight Three.js application with four main layers:
- core: boot, loop, state machine, config
- gameplay: player, enemies, combat, pickups, waves
- render: scene, camera, lights, materials, particles
- ui: HUD, overlays, upgrade selection, game over

Simulation state stays outside the Three.js scene graph.
The renderer acts as a view adapter over gameplay state.
Menus and HUD remain in HTML/CSS overlays rather than inside WebGL.

## Camera / Perspective
Use a readable top-down arena with a slight tilt toward high isometric framing.
Reason: simpler aiming, clearer enemy readability, lower implementation risk than third-person, and better mouse control in a jam scope.

## State Machine
- boot
- title
- playing
- between-waves
- game-over
- victory

## Input Model
- WASD: move
- Mouse position: aim on arena plane
- Left click: primary fire
- Space or right click: dash
- Enter or click: confirm UI actions

Keep physical bindings mapped through a small input action layer so a future coop or rebind change does not leak into gameplay systems.

## Core Systems
- app bootstrap: initializes renderer, scene, camera, DOM overlays, and state machine
- fixed-step simulation loop: updates player, enemies, projectiles, timers, and waves
- render bridge: reads current simulation state and updates meshes, particles, lights, and camera
- UI overlay controller: updates HUD, title, upgrade picker, and restart states

## Entities
- player
- projectile
- orb pickup
- enemy_drone
- enemy_charger
- enemy_boss_simple

Each entity uses lightweight data components or plain objects for state.
No ECS framework is required in the MVP.

## Combat Model
- Player has move, dash, and primary fire
- Dash grants short burst mobility and brief damage avoidance or displacement safety window
- Enemies use simple steering toward player
- Use lightweight custom collision with circles or spheres projected on arena space
- No heavy physics engine in MVP

## Wave Director
A small data-driven wave system controls:
- enemy count
- spawn cadence
- enemy mix
- between-wave pause trigger
- optional final boss or elite wave

Wave data should live in simple config objects so tuning does not require branching logic changes.

## Progression Model
Between selected waves, present 3 upgrade choices from a small curated pool.
Initial upgrade pool:
- faster dash cooldown
- wider shot spread
- bonus projectile chain or pierce
- move speed boost
- emergency shield pulse on low health

Only 3 upgrades need to ship in the MVP, but the structure should support adding more without changing the selection UI flow.

## Rendering Style
- dark arena floor with bright lane or grid accents
- emissive neon enemies and pickups
- moderate bloom or faux glow only if readability remains strong
- light particles for hits, deaths, and pickups
- restrained screen shake
- clear telegraphs before high-threat enemy actions

## Performance Strategy
- object pooling for projectiles and particles
- simple geometry and procedural shapes before custom assets
- one small arena and bounded enemy counts
- optional post-processing behind a single toggle point
- avoid expensive shadows and large textures

## Future Extension Points
The architecture should leave room for a later `add-coop-p2p` change by keeping these boundaries explicit:
- simulation state serializable and renderer-agnostic
- input actions separated from physical devices
- wave events and enemy seeds data-driven
- player state isolated from local-only UI concerns

No networking is implemented in this MVP.
