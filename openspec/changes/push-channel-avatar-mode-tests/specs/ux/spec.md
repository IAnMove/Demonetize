# Delta for UX

## ADDED Requirements

### Requirement: Living channel avatar comparison modes
The DEV runtime SHALL allow quick visual comparison of living-enemy channel-avatar placement.

#### Scenario: Developer tests avatar placement
- GIVEN the game is running in development mode
- WHEN the channel-avatar mode is changed to `Top`, `Floor`, or `Off`
- THEN living enemies update without reloading the page
- AND death obituary markers still show the killed channel avatar.

### Requirement: Expanded avatar variety
The channel identity system SHALL support the second generated avatar atlas.

#### Scenario: Channel identity is assigned
- GIVEN a channel avatar index is generated
- WHEN the index maps beyond the first 100 cells
- THEN the renderer can use the second avatar atlas.
