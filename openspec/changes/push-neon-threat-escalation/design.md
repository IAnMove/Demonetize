# Design: push-neon-threat-escalation

## Scope
This change extends the shipped MVP without altering the solo-first architecture.
Simulation state remains outside Three.js objects and UI remains DOM-driven.

## Threat Layer
- Add `sentry` as a ranged pressure archetype
- Sentries keep distance, wind up shots, and project line or zone danger before firing
- Sentry attacks must be readable before impact and punish stagnant play more than raw aggression

## Boss Layer
- The Overseer gains a second phase below a health threshold
- Phase 2 should add a new pattern rather than only scaling numbers
- The phase transition must be visible in HUD, audio, and arena presentation

## Wave Layer
- Wave composition should mix chase pressure, burst pressure, and ranged denial
- Mid-run pacing should spike earlier
- Chapter 2 should feel more hostile through composition, cadence, and boss escalation rather than map complexity

## Build Layer
- Builds should converge more clearly toward:
  - dash-killer
  - glass-cannon
  - spread-control
- Standard upgrades should reinforce these lanes
- Legendary upgrades should visibly alter the player presentation and meaningfully shift play style

## Presentation Layer
- Run-end panels should explain outcome, build identity, and chase state against records
- Audio cues should differentiate:
  - shot
  - dash
  - boss arrival
  - phase shift
  - legendary reward
  - personal-best improvement
- Jam promo assets may be code-authored if they improve submission presentation quickly
