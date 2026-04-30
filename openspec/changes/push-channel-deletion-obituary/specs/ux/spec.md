# Delta for UX

## ADDED Requirements

### Requirement: Channel deletion obituary
The game SHALL show a killed channel's avatar as a brief vertical obituary marker at the death position.

#### Scenario: Non-boss channel is eliminated
- GIVEN a non-boss enemy represents a channel
- WHEN that enemy is killed
- THEN the channel avatar appears upright above the ground near the death point
- AND the avatar fades out without hiding combat telegraphs.

### Requirement: Red inauthentic-content verdict
The game SHALL present the takedown verdict in red with the exact phrase `INAUTHENTIC CONTENT`.

#### Scenario: Channel kill feedback is emitted
- GIVEN a channel has been eliminated
- WHEN visual or HUD kill feedback appears
- THEN the channel name is paired with `INAUTHENTIC CONTENT`
- AND the wording is spelled correctly.
