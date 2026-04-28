# Design: push-neon-arena-breach-finale

## Overview
The arena breach is a render-only finale effect layered on top of the current collapse event.
It should not add a new simulation system or hazard.

## Runtime Model
- Reuse `boss-collapse-start`
- Scene starts a short breach timer when the event arrives
- A breach root renders:
  - a darkened core
  - a hot outer ring
  - several radial crack planes
- The breach fades out naturally during the existing victory hold

## Constraints
- No additional gameplay damage
- No new state in session or app beyond existing collapse flow
- Reuse simple geometry and materials only
