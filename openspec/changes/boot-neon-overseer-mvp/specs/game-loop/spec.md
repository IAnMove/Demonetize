# Delta for Game Loop

## ADDED Requirements

### Requirement: Instant start
The system SHALL allow the player to begin a run from a single title action.

#### Scenario: Start from title
- GIVEN the game has loaded
- WHEN the player presses Start
- THEN gameplay begins immediately
- AND the player enters the arena without login or setup steps

### Requirement: Complete run lifecycle
The system SHALL support a full run from start to failure or victory.

#### Scenario: Run ends in defeat
- GIVEN the player is in an active run
- WHEN player health reaches zero
- THEN the game enters game-over state
- AND the player can restart quickly

#### Scenario: Run ends in victory
- GIVEN the player reaches the final wave or boss objective
- WHEN the objective is completed
- THEN the game enters victory state
