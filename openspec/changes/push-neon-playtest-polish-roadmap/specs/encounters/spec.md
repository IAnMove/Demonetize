# Delta for Encounters

## ADDED Requirements

### Requirement: Authored encounter beats
The system SHALL compose waves from recognizable encounter beats instead of only flat spawn scaling.

#### Scenario: Pressure spike
- GIVEN a wave has entered its spike beat
- WHEN enemies spawn
- THEN the threat mix creates a clear temporary combat problem for the player to solve

#### Scenario: Breather window
- GIVEN a major pressure spike has ended
- WHEN the next beat begins
- THEN the player receives a short recovery opportunity without fully removing danger

### Requirement: Encounter variety
The system SHALL avoid repeating the same pressure pattern too frequently within a run.

#### Scenario: Consecutive wave planning
- GIVEN the previous wave emphasized one pressure pattern
- WHEN the next wave is selected
- THEN the director prefers a different pattern when available
