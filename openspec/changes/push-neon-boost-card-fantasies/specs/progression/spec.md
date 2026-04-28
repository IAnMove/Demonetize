# Delta for Progression

## ADDED Requirements

### Requirement: Boosts have card identity
The system SHALL represent every obtainable boost as a card with title, description, type, and visual identity.

#### Scenario: Draft boost is presented as a card
- GIVEN the player is choosing a boost
- WHEN a boost option is focused or selected
- THEN the UI shows that boost as a full card alongside the explanation of its effect

### Requirement: Passive boosts persist as cards
The system SHALL keep acquired passive boosts visible as passive cards during gameplay.

#### Scenario: Passive card rail updates after selection
- GIVEN the player selects a passive boost
- WHEN gameplay resumes
- THEN the passive boost appears in a dedicated passive-card rail separate from usable action cards

### Requirement: Duplicate passive boosts stack
The system SHALL visually stack duplicate passive boost cards instead of rendering each duplicate as a separate full card.

#### Scenario: Repeated passive boost is acquired
- GIVEN the player already owns a passive boost
- WHEN the player acquires that same passive boost again
- THEN the passive-card rail shows the duplicate as a stack or count on the existing card

### Requirement: Visual boosts are shippable one at a time
The system SHALL allow each new visual boost to be implemented, tested, and balanced independently.

#### Scenario: New visual boost lands
- GIVEN a visual boost is added to the pool
- WHEN the player drafts and uses that boost in a run
- THEN the boost has its own card, localized copy, gameplay effect, preview chips, and readable board feedback

### Requirement: Proposed visual boost pool
The system SHALL track the planned visual boost candidates as independent additions.

#### Scenario: Visual boost backlog
- GIVEN the visual boost expansion is in progress
- WHEN tasks are selected for implementation
- THEN Arc Splitter, Halo Drone, Ricochet Core, Starburst Rounds, Rail Pierce, Nova Dash, Afterimage Trail, Gravity Well, Satellite Lattice, and Comet Bloom are available as separately scoped tasks
