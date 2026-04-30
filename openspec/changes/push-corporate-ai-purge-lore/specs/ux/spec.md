# Delta for UX

## ADDED Requirements

### Requirement: Corporate purge role
The game SHALL present the player as a corrupt corporate deletion AI enforcing an authenticity purge against human creator channels.

#### Scenario: Player reaches the intro and title
- GIVEN the application has loaded
- WHEN the intro and title copy are shown
- THEN the copy frames the player as a platform-contracted AI
- AND the copy keeps a satirical denunciation tone without naming a real company.

### Requirement: Channel identity on enemy removals
The game SHALL make standard enemy deaths read as channel takedowns.

#### Scenario: Enemy is killed
- GIVEN a non-boss enemy is eliminated
- WHEN feedback and audio are emitted
- THEN a deterministic parody channel name can be shown
- AND a robotic "inauthentic content" verdict can play after audio unlock.

### Requirement: Channel avatar readability
The game SHALL use the generated avatar atlas to add channel identity while preserving combat readability.

#### Scenario: Enemies are visible in the arena
- GIVEN non-boss enemies are rendered
- WHEN their channel avatar overlay appears
- THEN telegraphs, health readability, and enemy silhouettes remain visible.
