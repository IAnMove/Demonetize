# Delta for Performance

## ADDED Requirements

### Requirement: Runtime smoothness budget
The system SHALL protect frame pacing with explicit rendering and loop budgets.

#### Scenario: High-DPI screen
- GIVEN the game runs on a high-DPI display
- WHEN the renderer is initialized or resized
- THEN the WebGL pixel ratio is capped to the configured budget

#### Scenario: Frame spike recovery
- GIVEN a frame takes longer than expected
- WHEN the fixed-step loop catches up
- THEN it limits the number of simulation steps processed in one animation frame
