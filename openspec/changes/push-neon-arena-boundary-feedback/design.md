# Design: push-neon-arena-boundary-feedback

## Approach
Keep boundary response inside player simulation. Compare the intended next player position against the clamped position:
- if clamped, return `boundaryHit`
- session emits `arena-boundary-hit`
- render creates a restrained spark/decal at the player position
- audio reuses an existing compact cue

## Scope Guard
No wall meshes, no rigid bodies, no pushback solver. The MVP remains circle-bounded.
