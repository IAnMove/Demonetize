# Design: push-neon-relay-support

## Runtime Shape
- Relay AI lives in `gameplay/enemies`.
- Support state is stored on enemies, not in render objects.
- Three.js only renders the relay pulse and supported targets.

## Behavior
- Relay kites at medium range.
- It periodically enters an aim window, then emits a support pulse.
- Nearby non-boss enemies gain temporary damage resistance and a slight speed bump.

## UX
- The relay itself shows a larger active field while pulsing.
- Supported enemies get a readable support ring or tint.
- HUD/audio announce that the enemy pack has been reinforced.
