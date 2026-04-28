# Delta for Combat

## ADDED Requirements

### Requirement: Final Overseer exposed-core window
The system SHALL give the final Overseer a short vulnerable break window after the phase pulse resolves.

#### Scenario: Pulse finishes
- GIVEN the final Overseer is in phase 2
- WHEN its phase pulse completes
- THEN the boss enters an exposed-core state for a short duration

#### Scenario: Player attacks the exposed core
- GIVEN the Overseer core is exposed
- WHEN the player lands damage during that window
- THEN the boss takes increased damage
