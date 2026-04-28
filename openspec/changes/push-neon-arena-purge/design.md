# Design: push-neon-arena-purge

## Hazard Model
- The arena owns a small set of fixed purge lanes
- Each purge lane has:
  - lane index
  - phase: warning or active
  - progress
- Warning precedes damage and uses stronger floor feedback than ambient grid visuals

## Encounter Usage
- Chapter 2 may trigger occasional single-lane purge pressure
- Overseer phase 2 may trigger more aggressive or multi-lane purge patterns
- Purges are scheduled in simulation, not in the renderer

## Presentation
- The renderer shows dedicated hazard lanes separate from decorative grid motion
- HUD and announcers call out purge activation
- Audio gives a distinct hazard cue
