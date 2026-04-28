# Delta for Meta

## ADDED Requirements

### Requirement: Post-run build recap
The system SHALL summarize the player's build after a run.

#### Scenario: Run ends
- GIVEN the player reaches victory or defeat
- WHEN the post-run panel appears
- THEN the panel summarizes selected passive boosts, stack counts, action cards, and run style

### Requirement: Death and record context
The system SHALL explain important run outcomes when the information is available.

#### Scenario: Player dies
- GIVEN the session can identify the recent lethal threat
- WHEN the game-over panel appears
- THEN the panel communicates a concise death reason

#### Scenario: Near record
- GIVEN the player nearly beats a tracked record
- WHEN the post-run panel appears
- THEN the panel calls out the near-record chase

### Requirement: Short objectives
The system SHALL provide small next-run objectives that encourage replay without adding account progression.

#### Scenario: New objective appears
- GIVEN the post-run panel is shown
- WHEN the game selects a next objective
- THEN the objective points to a concrete run goal such as reaching a wave, trying a build family, or beating a personal metric
