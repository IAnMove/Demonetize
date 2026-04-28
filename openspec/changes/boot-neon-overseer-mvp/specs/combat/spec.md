# Delta for Combat

## ADDED Requirements

### Requirement: Core player actions
The system SHALL provide movement, dash, and primary fire.

#### Scenario: Dash use
- GIVEN the dash is off cooldown
- WHEN the player activates dash
- THEN the player performs a quick evasive burst
- AND the dash enters cooldown

### Requirement: Readable combat feedback
The system SHALL provide clear feedback when attacks hit or damage is received.

#### Scenario: Enemy hit
- GIVEN a projectile collides with an enemy
- WHEN damage is applied
- THEN the enemy shows visible hit feedback
