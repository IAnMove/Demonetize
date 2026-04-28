# Delta for Enemies

## ADDED Requirements

### Requirement: Mixed threat archetypes
The system SHALL include a ranged enemy archetype in addition to chase and rush enemies.

#### Scenario: Sentry pressure
- GIVEN a sentry enemy is active
- WHEN the player remains exposed in its firing lane
- THEN the sentry telegraphs and resolves a ranged attack

### Requirement: Boss phase escalation
The system SHALL allow the final boss to change behavior during the encounter.

#### Scenario: Overseer phase shift
- GIVEN the Overseer loses enough health
- WHEN the phase threshold is crossed
- THEN the boss enters a second combat phase with distinct behavior
