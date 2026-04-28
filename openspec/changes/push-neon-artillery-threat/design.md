# Design: push-neon-artillery-threat

## Threat Model
The `artillery` enemy is a backline prism that prefers medium-long range. It periodically paints a circular impact zone on the floor near the player's current position.

## Runtime Shape
- Enemy AI remains in `gameplay/enemies`.
- Timed strike warnings and impacts live in `gameplay/session`.
- Three.js only renders artillery visuals and strike telegraphs from snapshots.

## Combat Behavior
- Artillery strafes and kites instead of rushing.
- When a lock is ready, it enters `aim`, captures a target point, and emits an artillery warning event.
- Session schedules a warning circle with fixed radius and delay.
- When the warning expires, the strike detonates once and applies area damage plus knockback.

## Wave Integration
- Introduce artillery into wave 4 onward.
- Bias chapter 2 toward mixed pressure by pairing artillery with rushers and sentries.

## UX
- Show artillery warning circles clearly on the floor.
- Add a short HUD/audio cue when a strike locks in.
