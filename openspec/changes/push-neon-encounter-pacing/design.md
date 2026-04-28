# Design: push-neon-encounter-pacing

## Runtime Shape
- Wave planning stays data-driven in `waveConfig`.
- `waves.ts` expands burst plans into the existing spawn queue.
- No new gameplay subsystem is introduced.

## Burst Model
Each wave is split into 2-4 authored bursts. A burst defines:
- enemy mix
- optional elite budget for that burst
- a post-burst pause

## Goals
- Early bursts introduce the current threat theme.
- Middle bursts stack mixed pressure.
- Final bursts either release a breather cleanup or a final spike.

## Scope
This is a pacing pass only. It does not add a new enemy or rewrite combat rules.
