# Delta for Enemies

## ADDED Requirements

### Requirement: Artillery threat
The system SHALL include an artillery enemy archetype that pressures the player from range.

#### Scenario: Artillery locks a strike
- GIVEN an artillery enemy is active
- WHEN it completes its aiming window
- THEN it schedules a visible strike on the arena floor
