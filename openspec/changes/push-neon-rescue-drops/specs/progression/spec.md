# Delta for Progression

## ADDED Requirements

### Requirement: Timed rescue drops
The system SHALL sometimes release a timed rescue target from defeated enemies.

#### Scenario: Rescue expires
- GIVEN a rescue target has spawned
- WHEN the player does not secure it before its timer ends
- THEN that target is counted as lost for the run
