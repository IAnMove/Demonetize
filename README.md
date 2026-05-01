# DEMONETIZED: The Authenticity Purge

Neon PvE roguelite prototype for the browser. TheirTube is a satirical video/content-feed platform where creators believe they own their channels, but all value, data, and monetization belong to the platform. T.O.P.E. is TheirTube's premium moderation AI, hired to clean The Feed by marking inconvenient human channels as inauthentic, extracting their remaining value, and erasing them from the system.

Pitch: a neon roguelite where TheirTube's corporate moderation AI purges human channels, extracts their value, and calls it authenticity.

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
2. Survive escalating authenticity sweeps, bot swarms, and strike hunters.
3. Collect evidence fragments to recover signal.
4. Pick active and passive compliance tools between waves.
5. Break TheirTube's Algorithm and complete the demonetization contract.

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
