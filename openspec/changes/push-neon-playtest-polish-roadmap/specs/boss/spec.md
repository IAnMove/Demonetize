# Delta for Boss

## ADDED Requirements

### Requirement: Overseer phase identity
The Overseer SHALL communicate each phase with distinct visual state and attack cadence.

#### Scenario: Phase changes
- GIVEN the Overseer enters a new phase
- WHEN the transition completes
- THEN the arena and boss presentation clearly communicate the new phase state

### Requirement: Boss break-window clarity
The Overseer SHALL make vulnerability windows clear and satisfying to exploit.

#### Scenario: Break window opens
- GIVEN the player has triggered a boss vulnerability window
- WHEN the window opens
- THEN the boss, arena, audio, and HUD feedback communicate that damage opportunity

### Requirement: Finale payoff
The boss finale SHALL make victory and collapse state obvious.

#### Scenario: Overseer defeated
- GIVEN the Overseer reaches defeat state
- WHEN the finale resolves
- THEN the game presents a clear collapse moment before the victory panel
