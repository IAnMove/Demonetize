# Design: push-neon-upgrade-draft-readability

## Approach
Keep the upgrade system data model unchanged. The pass is purely presentation:
- derive card style from existing build archetype tags
- keep existing click handling and keyboard-independent mouse selection
- use CSS grid for horizontal comparison on desktop
- preserve stacked cards on mobile for readability

## Scope Guard
No new upgrade mechanics, no new dependencies, and no render-layer changes.

## Future Extension
If later needed, the same card classes can drive small icons, animated borders, or build-specific preview art.
