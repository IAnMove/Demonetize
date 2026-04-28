# Proposal: push-neon-runtime-smoothness-budget

## Why
Recent visual and gameplay polish increased runtime load. The game needs a small performance budget pass to protect smoothness on normal laptops and high-DPI screens.

## What Changes
- Add explicit render pixel ratio and fixed-step catch-up budgets.
- Cap high-DPI rendering below the previous max.
- Prevent the fixed-step loop from doing too many catch-up updates after a frame spike.

## Success Criteria
- Rendering stays sharp enough for a neon jam game.
- Frame spikes recover quickly instead of causing long catch-up stutter.
- The change remains dependency-free and static-host friendly.
