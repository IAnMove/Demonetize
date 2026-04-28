# Design: push-neon-elite-mutators

## High-Level Approach
Elite threats stay inside the existing enemy archetypes and state machine.
The simulation adds a light mutation layer on top of spawned escorts rather than creating a separate elite actor family.

## Mutation Set
- `overclocked`: faster pursuit, brighter aggression, higher pressure
- `bulwark`: more health and collision mass, slower but harder to ignore
- `volatile`: heavier death burst and extra payoff on kill

## Wave Injection
Wave plans define an `eliteCount` budget.
Only escort enemies become elite; the Overseer stays the boss anchor.
Chapter 1 keeps zero elite budget. Chapter 2 ramps elite count by wave.

## Combat Rules
- Elite enemies get stronger base stats from their mutation
- Volatile elites trigger a short death burst near the kill point
- Elite sentries fire a wider firing solution than normal sentries
- Elite chargers sustain longer rush pressure than normal chargers

## UX and Readability
- Elite enemies get mutation-specific colors and an elite halo
- Spawn and kill events announce elite presence
- HUD notifications should stay short and readable under pressure

## Rewards
- Elite kills grant more score than normal enemies
- Elite kills drop extra healing orbs so risk has visible payoff
