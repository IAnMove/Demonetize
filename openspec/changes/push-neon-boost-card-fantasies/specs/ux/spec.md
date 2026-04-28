# Delta for UX

## ADDED Requirements

### Requirement: Passive and usable cards are visually distinct
The HUD SHALL make passive boost cards and usable action cards distinct at a glance.

#### Scenario: Player has both passive and usable cards
- GIVEN the player owns at least one passive boost and one usable action card
- WHEN gameplay is active
- THEN passive cards appear on the left side of the HUD and usable action cards remain in the launchable hand
- AND passive cards do not look clickable as action cards

### Requirement: Action cards create a spectacle moment
The system SHALL make launching a usable action card feel like a major board event.

#### Scenario: Usable card is launched
- GIVEN the player launches Purge Protocol, Field Repair, or Overcore Plating
- WHEN the card resolves
- THEN the board plays a dramatic visual effect tied to that card
- AND the game briefly pauses or heavily slows time for the effect beat

### Requirement: Card spectacle remains readable
The action-card spectacle SHALL not hide important player, enemy, or boss state for longer than the effect beat.

#### Scenario: Card effect ends
- GIVEN a usable card effect has started
- WHEN the time stop or heavy time dilation ends
- THEN normal gameplay resumes cleanly with player control, enemy telegraphs, and HUD state readable

### Requirement: Card layouts survive crowded runs
The HUD SHALL keep passive cards, stacked duplicates, usable cards, and core combat UI legible on desktop and mobile.

#### Scenario: Player owns many cards
- GIVEN the player owns several passive boosts, duplicate stacks, and usable cards
- WHEN gameplay is active on desktop or mobile
- THEN card UI elements do not overlap the playfield-critical HUD or each other
