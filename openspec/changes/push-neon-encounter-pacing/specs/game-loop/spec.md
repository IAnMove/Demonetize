# Delta for Game Loop

## ADDED Requirements

### Requirement: Authored encounter pacing
The system SHALL support authored burst pacing inside a wave.

#### Scenario: Burst spacing
- GIVEN a wave is active
- WHEN one burst completes
- THEN the next burst may be delayed briefly before new enemies deploy
