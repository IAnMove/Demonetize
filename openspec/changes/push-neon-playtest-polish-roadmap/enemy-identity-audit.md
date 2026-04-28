# Enemy Identity Audit

## Changes

- Added an attack beacon above enemies during `windup`, `aim`, `dash`, `fire`, and Overseer exposed states.
- Added elite spike markers around elite enemies so bulwark, overclocked, and volatile threats stand apart before their first attack resolves.
- Colored enemy hit, death, elite kill, and elite burst feedback from enemy archetype and mutation metadata.
- Kept the Phase 2 telegraph language intact: sentry lanes stay narrow, charger lanes stay body-path focused, artillery retains target-area reads, and relay aura remains lower priority.

## Archetype Reads

- Drone: compact magenta body with green fins; simple chase pressure.
- Charger: long lime ram silhouette with cyan nose and broad charge lane.
- Sentry: amber/cyan twin-barrel silhouette with thin line-shot telegraph.
- Artillery: pink mortar silhouette with bounded area-impact reticle.
- Relay: teal support chassis with pale aura and low-priority influence ring.
- Overseer: larger crown/spine silhouette reserved for boss-phase work in Phase 6.

## Elite Reads

- Bulwark: cyan-white elite treatment, heavier ring/spike radius.
- Overclocked: amber/cream treatment with faster rotating elite markers.
- Volatile: magenta/amber treatment and colored death-burst feedback.

## QA Screenshots

- `.codex-qa/enemy-identity-mid-desktop.png`
- `.codex-qa/enemy-identity-elite-desktop.png`
- `.codex-qa/enemy-identity-elite-mobile.png`
