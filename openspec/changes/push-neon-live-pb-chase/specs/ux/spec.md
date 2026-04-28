# Delta for UX

## ADDED Requirements

### Requirement: Live personal-best chase
The system SHALL show the player's score progress against their personal best during an active run.

#### Scenario: Player has an existing best score
- GIVEN the player has a saved personal best
- WHEN a run is active
- THEN the HUD shows whether the current score is below or above that best score

#### Scenario: Player has no saved best score
- GIVEN the player has no saved personal best
- WHEN a run is active
- THEN the HUD communicates that the current run can set the first personal best
