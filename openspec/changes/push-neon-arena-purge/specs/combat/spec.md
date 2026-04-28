# Delta for Combat

## ADDED Requirements

### Requirement: Arena purge telegraph
The system SHALL warn the player before an arena purge lane deals damage.

#### Scenario: Purge lane starts
- GIVEN an arena purge is scheduled
- WHEN the warning phase begins
- THEN the threatened lane is visibly telegraphed before the active damage window

### Requirement: Arena hazard escalation
The system SHALL use arena purge pressure to escalate late-run encounters.

#### Scenario: Boss phase purge
- GIVEN the Overseer is in phase two
- WHEN a purge pattern is triggered
- THEN the arena contributes meaningful additional threat
