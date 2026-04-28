# Delta for Progression

## ADDED Requirements

### Requirement: Tuned upgrade cadence
The system SHALL avoid presenting standard upgrades too early in the run.

#### Scenario: Early run pacing
- GIVEN the player starts a new run
- WHEN the first two waves are cleared
- THEN the run continues without forcing a standard upgrade selection

### Requirement: Varied standard draft pool
The system SHALL include standard upgrades that support distinct build fantasies and readable tradeoffs.

#### Scenario: Upgrade draft variety
- GIVEN a standard upgrade draft opens
- WHEN choices are generated
- THEN the pool includes options for tempo, spread/control, sustain, dash, and damage styles
