# Delta for Combat

## ADDED Requirements

### Requirement: Threat-specific telegraphs
The system SHALL use distinct warning language for materially different enemy attack types.

#### Scenario: Line shot warning
- GIVEN an enemy is preparing a direct line attack
- WHEN the windup begins
- THEN the telegraph reads as a directional lane with clear origin, width, and endpoint

#### Scenario: Area warning
- GIVEN an enemy or boss is preparing an area blast
- WHEN the windup begins
- THEN the telegraph reads as a bounded impact area rather than a directional lane

#### Scenario: Boss warning
- GIVEN the Overseer is preparing a major attack
- WHEN the windup begins
- THEN the telegraph is visually stronger than normal enemy warnings without hiding the player

### Requirement: Late-run visual readability
The system SHALL keep player position, lethal threats, and important pickups readable during projectile-heavy runs.

#### Scenario: Boost-heavy fight
- GIVEN the player has several visual boosts active
- WHEN multiple boost effects trigger in the same combat window
- THEN enemy telegraphs, player location, and pickup positions remain visible
