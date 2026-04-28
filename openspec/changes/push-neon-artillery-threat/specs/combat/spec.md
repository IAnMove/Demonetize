# Delta for Combat

## ADDED Requirements

### Requirement: Telegraph before area damage
The system SHALL show a readable warning before an artillery strike deals damage.

#### Scenario: Strike impact
- GIVEN an artillery warning is active
- WHEN the warning expires
- THEN the strike detonates once
- AND the player takes damage only if inside the impact area
