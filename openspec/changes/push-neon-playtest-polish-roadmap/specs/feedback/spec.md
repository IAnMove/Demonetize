# Delta for Feedback

## ADDED Requirements

### Requirement: Moment-to-moment juice
The system SHALL give core player actions short, readable feedback.

#### Scenario: Dash completes
- GIVEN the player performs a dash
- WHEN the dash starts and ends
- THEN visual and audio feedback communicates speed, endpoint, and any boost-triggered effect

#### Scenario: Enemy dies
- GIVEN an enemy is destroyed
- WHEN death feedback plays
- THEN the effect confirms the kill without hiding new threats

### Requirement: Feedback restraint
The system SHALL prevent polish effects from masking lethal information.

#### Scenario: Strong effect overlaps a telegraph
- GIVEN a card cast, explosion, or camera effect is active
- WHEN a lethal enemy warning begins
- THEN the lethal warning remains readable before the attack resolves

### Requirement: Reduced motion support
The system SHALL reduce nonessential screen movement when reduced-motion behavior is requested.

#### Scenario: Reduced motion active
- GIVEN the player environment requests reduced motion
- WHEN camera shake or nonessential motion would play
- THEN the game uses a calmer equivalent feedback style
