# Delta for UX

## ADDED Requirements

### Requirement: Creator-purge fiction is immediately legible
The system SHALL communicate that the player is preserving authentic creator signals during an automated purge.

#### Scenario: Title screen explains fantasy
- GIVEN the player has reached the title screen
- WHEN they read the primary title and supporting copy
- THEN they can identify the threat as an automated authenticity purge and the player role as a surviving creator-signal

### Requirement: Intro copy is cinematic but brief
The system SHALL present the intro as one short paragraph that can be tuned without changing game logic.

#### Scenario: Intro copy is editable
- GIVEN a designer wants to tune the intro
- WHEN they update the narrative copy source
- THEN the intro text changes without editing state-machine or render-loop logic

#### Scenario: Reduced motion remains readable
- GIVEN the user has reduced-motion preference enabled
- WHEN the intro is shown
- THEN the text remains readable without aggressive perspective, parallax, or fast scrolling

### Requirement: Retheme preserves mechanical clarity
The system SHALL ensure renamed lore terms still communicate gameplay function.

#### Scenario: Upgrade choice remains understandable
- GIVEN the player is between waves
- WHEN upgrade cards are shown with creator-purge names
- THEN each card still describes its mechanical effect clearly enough to choose quickly
