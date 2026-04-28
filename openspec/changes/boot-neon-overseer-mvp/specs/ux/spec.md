# Delta for UX

## ADDED Requirements

### Requirement: Minimal readable HUD
The system SHALL display essential run information.

#### Scenario: Active run HUD
- GIVEN a run is active
- THEN the HUD shows player health, current wave, and key cooldowns

### Requirement: Fast retry
The system SHALL minimize friction after failure.

#### Scenario: Restart after defeat
- GIVEN the game-over screen is visible
- WHEN the player presses Restart
- THEN a new run begins quickly
