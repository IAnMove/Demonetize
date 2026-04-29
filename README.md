# The Feed: Authenticity Purge

Creator-purge PvE survival prototype for the browser. The current MVP is a solo-first run inside a parody video platform where authentic creator signals fight an automated deletion purge.

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

## Test

```bash
npm test
```

The smoke test checks the app mount point, boot path, and core state transitions before TypeScript validation runs.

## Controls

- `WASD`: move
- `Mouse`: aim
- `LMB`: fire
- `Space` or `RMB`: dash
- `Enter`: skip intro or start from title
- `R`: restart after defeat or victory

## MVP Loop

1. Start the run from the title screen.
2. Survive escalating deletion sweeps, bot swarms, and strike hunters.
3. Collect trust fragments to recover signal.
4. Pick one proof or appeal tool between waves.
5. Break the Algorithm and restore The Feed.

## Project Notes

- Single-player only for the jam MVP
- One arena, one full run loop
- No backend, accounts, multiplayer, webcam, or voice features
- DOM overlays are kept out of the playfield center during active combat

## OpenSpec

The original MVP spec lives in:

- `openspec/changes/boot-neon-overseer-mvp/`

The active retheme plan lives in:

- `openspec/changes/retheme-creator-purge-intro/`
