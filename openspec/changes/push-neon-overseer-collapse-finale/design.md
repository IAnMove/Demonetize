# Design: push-neon-overseer-collapse-finale

## Overview
The final kill should trigger a short collapse event, not a separate cinematic system.
The collapse is expressed as a frame event plus a slightly longer pre-victory hold.

## Runtime Model
- Session emits `boss-collapse-start` only when the final Overseer dies
- The app uses that event to pick a longer hold before entering victory
- Scene and audio treat the collapse as a distinct spike from normal `boss-defeated`

## Feedback
- HUD announces the collapse as the arena breaking down
- Audio gets a more dramatic one-shot than the normal boss defeat cue
- Scene amplifies arena pulse, camera shake, and burst effects during the collapse

## Constraints
- Keep the collapse short
- Do not add a new gameplay phase after the boss dies
- Do not delay restart or normal failure flow
