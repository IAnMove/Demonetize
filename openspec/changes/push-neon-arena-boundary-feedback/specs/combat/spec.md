# Delta for Combat

## ADDED Requirements

### Requirement: Arena containment feedback
The system SHALL provide readable feedback when the player pushes into the arena boundary.

#### Scenario: Player reaches arena edge
- GIVEN the player moves or dashes into the arena edge
- WHEN movement is constrained by the arena boundary
- THEN the player remains inside the playable area
- AND the game provides immediate feedback that the edge was hit
