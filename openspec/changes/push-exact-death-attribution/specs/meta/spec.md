# Delta for Meta

## ADDED Requirements

### Requirement: Exact death attribution
The system SHALL track the final applied player damage source and use it when explaining a lost run.

#### Scenario: Player dies to overlapping hazards
- GIVEN multiple enemies or hazards are visible near the player
- WHEN one source applies the damage that defeats the player
- THEN the game-over summary identifies that applied damage source
- AND the system only falls back to visual heuristics when no structured source is available

