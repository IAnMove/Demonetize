# Delta for Combat

## ADDED Requirements

### Requirement: Visible ranged fire payoff
The system SHALL display the path of enemy ranged attacks.

#### Scenario: Sentry fires
- GIVEN a sentry attack resolves
- WHEN the shot is emitted
- THEN the player sees a visible firing trace aligned with the attack lane

#### Scenario: Overseer purge fires
- GIVEN the Overseer executes its purge beam
- WHEN the beam resolves
- THEN the player sees a stronger and wider firing trace than a sentry shot
