# Delta for Meta

## ADDED Requirements

### Requirement: Last-run build recap
The system SHALL persist enough last-run build metadata to recap the previous build from the title screen.

#### Scenario: Player returns to title after a run
- GIVEN a run has ended with selected upgrades and action-card usage
- WHEN the player returns to the title screen
- THEN the title screen can show the last run's build profile
- AND older saved records without build metadata still load safely

