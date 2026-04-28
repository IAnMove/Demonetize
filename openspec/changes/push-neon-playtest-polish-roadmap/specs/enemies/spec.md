# Delta for Enemies

## ADDED Requirements

### Requirement: Enemy archetype identity
The system SHALL make each enemy archetype recognizable before it deals damage.

#### Scenario: Enemy enters combat
- GIVEN a normal enemy has spawned
- WHEN it becomes active
- THEN its silhouette, accent color, movement, and windup communicate its archetype

### Requirement: Elite identity
The system SHALL make elite variants recognizable as higher-priority threats before their first attack resolves.

#### Scenario: Elite enters combat
- GIVEN an elite enemy has spawned
- WHEN the player sees it in the arena
- THEN it has distinct visual treatment from the normal version of that archetype

### Requirement: Enemy feedback states
The system SHALL provide readable feedback for enemy windup, attack, damage, and death states.

#### Scenario: Enemy takes damage
- GIVEN an enemy is hit
- WHEN damage feedback plays
- THEN the feedback confirms the hit without obscuring active attack warnings
