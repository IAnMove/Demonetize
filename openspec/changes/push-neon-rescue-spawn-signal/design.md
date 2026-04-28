# Design: push-neon-rescue-spawn-signal

## Runtime
- Rescue creation emits a `rescue-spawned` frame event.
- The event carries the rescue position only.

## Presentation
- HUD uses a short notification and announcement.
- Scene uses an existing particle burst style with Signal Choir colors.
- Audio reuses the pickup cue to avoid adding a new sound system.
