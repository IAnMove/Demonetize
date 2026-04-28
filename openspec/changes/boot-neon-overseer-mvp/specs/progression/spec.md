# Delta for Progression

## ADDED Requirements

### Requirement: Upgrade choices
The system SHALL offer upgrade choices between selected waves.

#### Scenario: Upgrade selection
- GIVEN a wave has ended
- WHEN the upgrade phase begins
- THEN the player is offered a set of upgrade options
- AND one selected upgrade affects the rest of the run

### Requirement: Enemy drops
The system SHALL reward combat with pickups or resources.

#### Scenario: Enemy defeated
- GIVEN an enemy is destroyed
- WHEN its drop condition is met
- THEN an orb or pickup appears for the player
