# Delta for Enemies

## ADDED Requirements

### Requirement: Wave enemies
The system SHALL spawn enemies in timed waves.

#### Scenario: Start wave
- GIVEN a run is active
- WHEN a new wave begins
- THEN enemies spawn according to wave configuration

### Requirement: Distinct enemy archetypes
The system SHALL include more than one enemy behavior archetype.

#### Scenario: Drone enemy
- GIVEN a drone enemy is active
- WHEN it detects the player
- THEN it pursues and attacks using its configured behavior

#### Scenario: Charger enemy
- GIVEN a charger enemy is active
- WHEN it reaches attack range or trigger conditions
- THEN it performs a burst or rush behavior
