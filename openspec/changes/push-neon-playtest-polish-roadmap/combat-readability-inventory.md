# Combat Readability Inventory

This is the Phase 2 working inventory for threat readability. It is intentionally concrete so screenshots can be reviewed against the same language.

## Threat Inventory

### Enemy attacks
- Drone: contact chase pressure; no explicit telegraph, relies on silhouette and movement path.
- Charger: short windup, directional rush lane, contact damage.
- Sentry: aim windup, long direct line shot, narrow lethal lane.
- Artillery: aim windup, predicted lock target, delayed circular impact area.
- Relay: support pulse, nonlethal aura, boosts nearby enemies.
- Overseer: phase shift, beam line, dash chain, phase pulse, exposed-core window.
- Elite variants: bulwark, overclocked, volatile; must tint and intensify the base archetype without changing its threat family.

### Arena threats
- Arena boundary: outer danger ring and boundary-hit feedback.
- Arena purge: wide full-lane grid sweep with warning and active states.
- Boss phase pulse: expanding circular band with warning and active states.
- Spawn warnings: archetype-colored arrival rings before enemies materialize.

### Player and boost effects
- Player shots: primary projectile mesh plus shot trace.
- Arc Splitter: secondary lightning trace between enemies.
- Halo Drone: small orbital shot trace.
- Ricochet Core: boundary bounce spark.
- Starburst Rounds: compact radial kill burst.
- Rail Pierce: forward pierce trace.
- Nova Dash: endpoint blast.
- Afterimage Trail: dash path sparks.
- Gravity Well: pickup-origin pull field.
- Satellite Lattice: cross-pattern orbital fire.
- Comet Bloom: large slow explosive projectile and impact.
- Action cards: Purge, Repair, and Overcore board-wide cast beats.

## Telegraph Families

### Line Shot
Used by sentries and narrow boss beams.
- Shape: thin lane with a bright core, restrained side rails, and directional chevrons.
- Read: origin, direction, width, and firing moment.
- Priority: high, but should stay below boss and purge visual weight.

### Charge Lane
Used by chargers and boss rushes.
- Shape: broader lane with forward chevrons and endpoint reticle.
- Read: body path more than projectile path.
- Priority: high near the player, medium otherwise.

### Area Impact
Used by artillery, comet impacts, volatile bursts, and boss area effects.
- Shape: circular reticle or expanding band at the impact point, with only a faint source trace if needed.
- Read: bounded area and remaining time.
- Priority: high when the area overlaps the player or pickup path.

### Support Aura
Used by relay pulses and supported enemies.
- Shape: low-opacity ring/aura.
- Read: influence zone, not immediate damage.
- Priority: lower than lethal telegraphs.

### Boss Major
Used by Overseer phase attacks and break windows.
- Shape: larger, brighter version of line/charge/area families with arena pulse support.
- Read: phase identity and damage window.
- Priority: highest, but must keep the player silhouette visible.

## First Replacement Notes

- Artillery aim now exposes `lockTarget` to the renderer, so its warning can point to the actual impact area instead of a short generic local lane.
- Late-run screenshot presets should use the debug harness with seeded builds so telegraph changes are comparable across iterations.
