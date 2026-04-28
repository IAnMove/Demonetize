# Design: push-neon-runtime-smoothness-budget

## Runtime Budgets
Add two central config values:
- `maxPixelRatio`: limits WebGL backbuffer size on high-DPI screens.
- `maxFixedStepsPerFrame`: limits simulation catch-up work per animation frame.

## Tradeoff
Lowering DPR slightly reduces crispness on dense displays, but protects frame time. Dropping extra catch-up after spikes can skip a small amount of simulation time, but avoids visible spiral-of-death stutter.

## Scope Guard
No dynamic quality UI, no profiling dependency, no postprocessing rewrite.
