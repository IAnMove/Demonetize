# Delta for Performance

## ADDED Requirements

### Requirement: Lightweight runtime
The system SHALL avoid unnecessary heavy systems in the MVP.

#### Scenario: Collision handling
- GIVEN combat interactions are implemented
- WHEN collision checks are required
- THEN the game uses lightweight collision logic appropriate for the arena scale

### Requirement: Lightweight content budget
The system SHALL prefer small assets and reusable effects.

#### Scenario: Visual effects
- GIVEN the game uses particles or glow effects
- WHEN those effects are added
- THEN they remain restrained and do not overwhelm gameplay readability
