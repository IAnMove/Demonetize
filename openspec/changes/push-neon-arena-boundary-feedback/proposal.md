# Proposal: push-neon-arena-boundary-feedback

## Why
The arena boundary should feel like a hard neon containment wall. If the player reaches the edge with no feedback, it can feel like the border is pass-through even when position clamping is active.

## What Changes
- Detect when player movement is clamped by the arena boundary.
- Emit a lightweight boundary-hit event.
- Add small HUD/audio/render feedback for edge contact.

## Success Criteria
- The player receives immediate feedback when pushing into the arena edge.
- The boundary still uses lightweight custom collision.
- The change does not add physics dependencies.
