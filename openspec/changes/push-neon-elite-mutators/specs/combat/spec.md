# Delta for Combat

## ADDED Requirements

### Requirement: Elite combat pressure
The system SHALL make elite enemies materially more dangerous than normal escorts.

#### Scenario: Elite sentry attack
- GIVEN an elite sentry is active
- WHEN it fires
- THEN its attack pattern creates more space-control pressure than a normal sentry

### Requirement: Volatile payoff
The system SHALL make volatile elites dangerous to finish at close range.

#### Scenario: Volatile elite dies nearby
- GIVEN a volatile elite is destroyed near the player
- WHEN its death burst triggers
- THEN the player receives clear feedback and must respect the blast radius
