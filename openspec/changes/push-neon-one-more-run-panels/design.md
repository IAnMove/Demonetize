# Design: push-neon-one-more-run-panels

## Overview
The change is DOM-overlay only.
It reuses existing record and summary data to compute a single next-target recommendation and a compact set of chase stats.

## UI Model
- Title screen gets:
  - a compact stat strip
  - a next-target card
- Game over and victory get:
  - compact chase stat cards
  - a recommended next goal line
  - stronger retry framing

## Data Model
- Reuse `RunRecords` and `RunSummary`
- Derive:
  - win rate
  - next target string
  - delta cards for score, chain, depth, and pace

## Constraints
- No new persistence required
- Keep the center of the playfield clear during gameplay
- Focus on scan speed, not dense explanation
