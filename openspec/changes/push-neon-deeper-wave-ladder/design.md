# Design: push-neon-deeper-wave-ladder

## Approach
Reuse existing enemy archetypes and wave director behavior:
- bump `finalWave` to 13
- append two wave plans
- use existing themes to avoid UI/i18n expansion
- add a wave 12 standard draft window

## Risk
Longer runs can reduce restart cadence. Keep waves 12 and 13 dense but not huge so the session target stays near 5-8 minutes.

## Scope Guard
No new enemy classes, no new boss mechanics, no procedural map changes.
