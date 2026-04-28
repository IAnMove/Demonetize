# Delta for Combat

## ADDED Requirements

### Requirement: Readable ranged pressure
The system SHALL telegraph ranged enemy attacks before they deal damage.

#### Scenario: Telegraph before impact
- GIVEN a ranged enemy is preparing an attack
- WHEN the player is threatened
- THEN the arena shows readable advance feedback before damage resolves

### Requirement: Distinct boss escalation feedback
The system SHALL make boss phase shifts visible and audible.

#### Scenario: Boss enters phase two
- GIVEN the final boss changes phase
- WHEN the shift happens
- THEN the player receives clear feedback in combat presentation
