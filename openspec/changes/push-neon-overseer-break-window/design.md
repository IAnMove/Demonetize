# Design: push-neon-overseer-break-window

## Overview
The exposed-core window is a short boss-only state triggered after the final Overseer completes its phase pulse in phase 2.
It should not add a second boss system. It should reuse the current Overseer state machine and session-driven arena hazards.

## Runtime Model
- Session continues to own the phase pulse lifecycle
- When an active pulse expires, session may push the Overseer into an `exposed` mode
- The Overseer remains stationary during `exposed`
- Incoming damage is multiplied while `exposed`
- When the timer ends, the boss returns to `recover`, then re-enters normal pattern selection

## UX and Feedback
- HUD boss mode should show the exposed state
- The main state chip should prefer exposed-core wording over generic danger text
- Audio should emit a distinct exposed-core cue
- Scene feedback should make the boss read as broken-open rather than merely flashing

## Constraints
- Only the final Overseer can enter this state
- The exposed window must not bypass the existing pulse or purge systems
- The fight should stay legible with the current one-arena MVP scope
