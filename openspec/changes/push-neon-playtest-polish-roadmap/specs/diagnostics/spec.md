# Delta for Diagnostics

## ADDED Requirements

### Requirement: Debug playtest controls
The system SHALL provide developer-only controls for quickly forcing representative gameplay states.

#### Scenario: Force a boost build
- GIVEN the game is running in a development environment
- WHEN the developer selects a debug build preset
- THEN the player receives the configured boosts and stacks without needing to draft them manually

#### Scenario: Jump to a wave state
- GIVEN the game is running in a development environment
- WHEN the developer jumps to a named wave preset
- THEN the session moves to that encounter with predictable enemies, pickups, and run context

### Requirement: Repeatable visual QA
The system SHALL support repeatable visual checks for combat readability.

#### Scenario: Capture a chaotic build
- GIVEN a debug preset exists for projectile-heavy late-run combat
- WHEN QA captures desktop and mobile screenshots
- THEN the resulting scenes are comparable across iterations
