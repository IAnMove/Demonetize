# Delta for Combat

## ADDED Requirements

### Requirement: Final Overseer phase pulse
The system SHALL give the final Overseer a boss-exclusive arena pulse in phase 2.

#### Scenario: Phase pulse warning
- GIVEN the final Overseer is in phase 2
- WHEN the pulse is scheduled
- THEN the player receives a warning before the ring becomes active

#### Scenario: Pulse ring crosses the player
- GIVEN the pulse ring is active
- WHEN the player overlaps the moving damage band
- THEN the player takes damage from the pulse
