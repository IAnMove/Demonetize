# OVERSEER: Neon Siege

Neon sci-fi PvE survival prototype for the browser. The current MVP is a solo-first arena run built with Vite, TypeScript, and Three.js, optimized for static hosting and fast restart loops.

## Stack

- Vite
- TypeScript
- Three.js
- HTML/CSS overlays

## Run

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

The Vite config uses a relative `base` so the built output can be served from a plain static host without backend routing.

## Controls

- `WASD`: move
- `Mouse`: aim
- `LMB`: fire
- `Space` or `RMB`: dash
- `Enter`: start from title
- `R`: restart after defeat or victory

## MVP Loop

1. Start the run from the title screen.
2. Survive escalating waves of drones and chargers.
3. Collect orb drops to recover hull.
4. Pick one upgrade between waves.
5. Clear the final wave to secure victory.

## Project Notes

- Single-player only for the jam MVP
- One arena, one full run loop
- No backend, accounts, multiplayer, webcam, or voice features
- DOM overlays are kept out of the playfield center during active combat

## OpenSpec

The active change for this milestone lives in:

- `openspec/changes/boot-neon-overseer-mvp/`
