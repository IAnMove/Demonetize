# Design: push-neon-upgrade-pacing-variety

## Upgrade Timing
Use wave gates instead of timers. This keeps behavior deterministic and easy to tune:
- first standard pick after wave 3
- legendary chapter pick after wave 5
- later standard picks after waves 6, 8, and 10

## New Modules
Add stat-only modules to avoid overengineering:
- ChatGPT Router: spread/control utility with lower per-shot damage
- Codex Overclock: high tempo glass-cannon fire rate
- Claude Lattice: safer sustain/precision with slower movement

## Scope Guard
No new projectile behaviors, no backend, no persistence changes, no new dependencies.
