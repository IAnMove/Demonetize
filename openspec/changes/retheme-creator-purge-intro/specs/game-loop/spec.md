# Delta for Game Loop

## ADDED Requirements

### Requirement: Skippable intro before title
The system SHALL support a short intro state before the title screen on a fresh app boot.

#### Scenario: First boot shows intro
- GIVEN the app has just booted in a fresh page session
- WHEN initial UI state is resolved
- THEN the intro is shown before the title screen

#### Scenario: Player skips intro
- GIVEN the intro is visible
- WHEN the player presses Enter, Space, Escape, clicks, or taps
- THEN the app transitions to the title screen

#### Scenario: Restart does not replay intro
- GIVEN the player has already reached title or started a run
- WHEN the player restarts after defeat or victory
- THEN the app returns directly to title or playing according to the existing restart flow without replaying the intro
