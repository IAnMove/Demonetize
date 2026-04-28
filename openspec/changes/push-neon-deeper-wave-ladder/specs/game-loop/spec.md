# Delta for Game Loop

## ADDED Requirements

### Requirement: Deeper run ladder
The system SHALL support a late-run wave ladder that continues beyond the first major boss breach.

#### Scenario: Boss defeated before final wave
- GIVEN the player defeats a late-run boss before the configured final wave
- WHEN the wave is cleared
- THEN the run continues into harder follow-up waves instead of ending immediately

#### Scenario: Final directive cleared
- GIVEN the player reaches the configured final wave
- WHEN the final objective is completed
- THEN the game enters victory state
