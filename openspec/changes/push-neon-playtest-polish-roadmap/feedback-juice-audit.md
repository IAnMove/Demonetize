# Feedback Juice Audit

## Scope

This closes Phase 7 against the current browser MVP. The pass reviewed player hits, death, pickups, dash start/end, action-card casts, enemy hit/death, elite bursts, boost procs, boss phase events, boss collapse, and victory.

## Implementation Notes

- Camera shake remains short and event-driven; heavy effects are limited to boss collapse, player death, elite burst, and card-scale moments.
- Particle and decal counts are heavier for rare boss/card events and restrained for repeated procs such as Starburst, Afterimage, and Arc Splitter.
- Audio cues are routed through the existing event bus so repeated hit and proc sounds do not need extra gameplay state.
- No hard hitstop was added. The audit kept feedback in shake, flash, audio, decals, and HUD pulses because freezing the simulation would make lethal telegraphs harder to trust in dense waves.
- Reduced-motion mode now listens to `prefers-reduced-motion`, reduces camera shake and arena pulse intensity, and shortens CSS animation/transition timing.

## QA Evidence

- `.codex-qa/boost-stack-projectile-desktop.png`
- `.codex-qa/boost-stack-dash-desktop.png`
- `.codex-qa/boost-stack-orbital-desktop.png`
- `.codex-qa/boss-spectacle-finale-desktop.png`
- `.codex-qa/post-run-meta-gameover-desktop-clean.png`
- `.codex-qa/post-run-meta-gameover-mobile-es-bottom.png`
