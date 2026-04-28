# Encounter Beat Audit

## Director Changes

- Added named encounter beats at the wave-director layer: `swarm`, `ram-pressure`, `lane-pressure`, `artillery-zone`, `support-net`, `elite-escort`, `boss-vanguard`, `pickup-chase`, and `breather`.
- Each burst is classified from its authored composition, with optional explicit `beatId` support for future hand-authored overrides.
- Spawn order now changes by beat: lane pressure opens with sentries, artillery zones open with artillery, support nets open with relays, and swarms lead with drones.
- Elite assignment now follows beat priority so elites reinforce the current pressure pattern instead of always using the same archetype order.
- Consecutive pressure beats receive a short transition delay; repeated same-beat transitions receive a longer delay.
- Major pressure beats add a minimum recovery pause before the next burst without fully removing active danger.
- Lane and ram pressure spawn positions bias toward readable lane angles instead of fully random rings.

## QA Screenshots

- `.codex-qa/encounter-beat-early-desktop.png`
- `.codex-qa/encounter-beat-mid-desktop.png`
- `.codex-qa/encounter-beat-late-desktop.png`
- `.codex-qa/encounter-beat-late-mobile.png`
