# Boost Balance And Stack Audit

## Isolated Boost Pass

Captured each visual boost from the dev harness with a clean baseline build, one forced wave, and only the target boost installed unless the boost itself is a legendary.

- `arc-splitter`: projectile impact chain is readable, but triple-stack raw damage was too close to a full extra projectile on every hit.
- `halo-drone`: single drone reads clearly and does not hide enemy windups.
- `rail-pierce`: pierce flash reads as a narrow hit confirmation rather than a persistent lane.
- `ricochet-core`: bounce feedback is light enough to coexist with arena edge warnings.
- `starburst-rounds`: kill proc identity is clear; old burst was too loud for repeated kills.
- `nova-dash`: endpoint read is clear; old max-stack burst was too dominant when paired with Afterimage.
- `afterimage-trail`: trail identity is clear; old tick cadence generated too much repeated damage and decal noise.
- `gravity-well`: pickup-triggered field is readable; old decal scale was too wide for late wave overlap.
- `comet-bloom`: legendary shot remains intentionally heavy and readable.
- `satellite-lattice`: crossfire reads as player-owned orbital fire without hiding threat lanes.

## Stack Tuning

Stacked damage boosts now use diminishing returns instead of linear scaling:

- `arc-splitter`: `12 + 9 + 7` damage, radius 4.9.
- `starburst-rounds`: `15 + 11 + 8` damage, radius 2.12.
- `nova-dash`: `30 + 22 + 16` damage, radius 2.45.
- `afterimage-trail`: `12 + 9 + 6` damage, radius 1.08, tick cadence 0.09s.
- `gravity-well`: `8.5 + 5` pull, radius 3.95, duration 1.25s.

`halo-drone`, `rail-pierce`, and `ricochet-core` keep their stack caps because their second stack is utility/readability limited rather than raw damage multiplication.

## Audio And VFX Tuning

- Starburst now maps to the smaller hit cue instead of the combo surge cue to reduce repeated kill audio clutter.
- Starburst, Nova Dash, and Gravity Well use lower camera shake, fewer particles, and lighter ground decals.
- Projectile-heavy builds keep player position and enemy warning lanes visible after the Phase 2 projectile visual budget pass.

## QA Screenshots

Isolated boost screenshots:

- `.codex-qa/boost-alone-arc-splitter.png`
- `.codex-qa/boost-alone-halo-drone.png`
- `.codex-qa/boost-alone-rail-pierce.png`
- `.codex-qa/boost-alone-ricochet-core.png`
- `.codex-qa/boost-alone-starburst-rounds.png`
- `.codex-qa/boost-alone-nova-dash.png`
- `.codex-qa/boost-alone-afterimage-trail.png`
- `.codex-qa/boost-alone-gravity-well.png`
- `.codex-qa/boost-alone-comet-bloom.png`
- `.codex-qa/boost-alone-satellite-lattice.png`

Representative stack screenshots:

- `.codex-qa/boost-stack-projectile-desktop.png`
- `.codex-qa/boost-stack-dash-desktop.png`
- `.codex-qa/boost-stack-orbital-desktop.png`
- `.codex-qa/boost-stack-projectile-mobile.png`
