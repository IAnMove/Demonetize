# Design: push-neon-ranged-trails

## Approach
Keep enemy ranged combat as lightweight line checks in simulation.
Add view-only trace payload to firing events so render can create visible lanes without changing collision ownership.

## Trace Variants
- `sentry`: narrow amber tracer with a bright core
- `overseer`: wider purge lane with hotter color and longer persistence

## Data Flow
- Enemy fire computes direction and max span
- The frame event carries origin, direction, span, and trace kind
- Scene consumes that event and spawns a pooled beam view

## Constraints
- No persistent enemy projectile entities
- No new physics system
- Traces must fade quickly and preserve arena readability
